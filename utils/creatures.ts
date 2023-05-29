import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { Creature } from "@/features/creatures/creature-list";
import { NftEventFromHelius } from "@/pages/api/get-nft-listings-and-sales-by-wallet-address";
import { dayjs, formatDateTimeToUnix } from "@/utils/date-time";

export const getCreatureActiveInstance = (creature: Creature) => {
  return creature.mainCharacterActivityInstances.find(
    ({ isComplete }) => !isComplete
  );
};

export const getCreaturesInActivity = (
  creatures: Creature[],
  activity: Hunt
) => {
  if (!activity) return creatures;
  // sort by mainCharacterActivityInstances where isComplete is false
  return creatures
    .filter(
      (creature) =>
        getCreatureActiveInstance(creature)?.activity?.id === activity.id
    )
    .sort((a, b) => {
      const aActiveInstance = getCreatureActiveInstance(a);
      const bActiveInstance = getCreatureActiveInstance(b);
      if (!aActiveInstance || !bActiveInstance) return 0;

      return (
        new Date(aActiveInstance.startTime).getTime() -
        new Date(bActiveInstance.startTime).getTime()
      );
    });
};

export const getCreaturesNotInActivity = (
  creatures: Creature[],
  activity: Hunt
) => {
  if (!activity) return creatures;
  return creatures.filter(
    (creature) =>
      getCreatureActiveInstance(creature)?.activity?.id !== activity.id
  );
};

export const getCreaturesListedWhileInActivity = (
  listings: NftEventFromHelius[],
  cancelledListings: NftEventFromHelius[],
  creatures: Creature[],
  activity: Hunt
) => {
  const creaturesInActivity = getCreaturesInActivity(creatures, activity);
  if (!creaturesInActivity.length) return [];

  const listingMintAddresses = listings.map(({ nfts }) => nfts[0].mint);

  const listedMainCharacters = listingMintAddresses
    .map((mintAddress: string) => {
      const creature = creaturesInActivity.find(
        (c) => c.token.mintAddress === mintAddress
      );
      return creature;
    })
    .filter((c) => c !== undefined);

  const relevantCreatures = creaturesInActivity.filter((creature) =>
    listedMainCharacters.includes(creature)
  );

  let listedWhileInActivity = [];
  for (const creature of relevantCreatures) {
    const activeInstance = getCreatureActiveInstance(creature);
    if (!activeInstance) continue;
    const listing = listings.find(
      ({ nfts }) => nfts[0].mint === creature.token.mintAddress
    );
    const cancelledListing = cancelledListings.find(
      ({ nfts }) => nfts[0].mint === creature.token.mintAddress
    );
    if (!listing) continue;
    const instanceStartTime = dayjs(activeInstance.startTime);
    const listingTime = dayjs.unix(listing.timestamp);
    if (
      listing &&
      !cancelledListing &&
      instanceStartTime.isBefore(listingTime)
    ) {
      listedWhileInActivity.push(creature);
      continue;
    }
    if (
      listing &&
      cancelledListing &&
      instanceStartTime.isBefore(listingTime) &&
      dayjs.unix(cancelledListing.timestamp).isAfter(listingTime)
    ) {
      listedWhileInActivity.push(creature);
      continue;
    }
  }
  return listedWhileInActivity;
};

export const getCreaturesSoldWhileInActivity = (
  sales: NftEventFromHelius[],
  creatures: Creature[],
  activity: Hunt,
  walletAddress: string
) => {
  const creaturesInActivity = getCreaturesInActivity(creatures, activity);
  if (!creaturesInActivity.length) return [];

  const saleMintAddresses = sales.map(({ nfts }) => nfts[0].mint);

  const soldMainCharacters = saleMintAddresses
    .map((mintAddress: string) => {
      const creature = creaturesInActivity.find(
        (c) => c.token.mintAddress === mintAddress
      );
      return creature;
    })
    .filter((c) => c !== undefined);

  const relevantCreatures = creaturesInActivity.filter((creature) =>
    soldMainCharacters.includes(creature)
  );

  let soldWhileInActivity = [];
  for (const creature of relevantCreatures) {
    const activeInstance = getCreatureActiveInstance(creature);
    if (!activeInstance) continue;
    const sale = sales.find(
      ({ nfts }) => nfts[0].mint === creature.token.mintAddress
    );
    if (!sale) continue;
    const instanceStartTime = dayjs(activeInstance.startTime);
    const saleTime = dayjs.unix(sale.timestamp);
    if (dayjs(instanceStartTime).isBefore(saleTime)) {
      soldWhileInActivity.push(creature);
    }
  }
  return soldWhileInActivity;
};
