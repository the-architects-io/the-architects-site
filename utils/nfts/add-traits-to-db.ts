import client from "@/graphql/apollo/client";
import { ADD_TRAIT } from "@/graphql/mutations/add-trait";
import { GET_TRAITS_BY_NFT_COLLECTION } from "@/graphql/queries/get-traits-by-nft-collection";

export const addTraitsToDb = async (nfts: any[], nftCollectionId: string) => {
  const { data } = await client.query({
    query: GET_TRAITS_BY_NFT_COLLECTION,
    variables: {
      nftCollectionId,
    },
  });

  const { traits: traitsFromDb } = data;

  let collectionTraits = nfts.map(({ traits }) => traits).flat();

  let collectionTraitsNotInDb: { name: string }[] = [];

  for (const trait of collectionTraits) {
    const { name } = trait;

    const traitFromDb = traitsFromDb.find(
      (traitFromDb: { name: string }) => traitFromDb.name === name
    );

    if (!traitFromDb) {
      collectionTraitsNotInDb.push(trait);
    }
  }

  // get unique names
  collectionTraitsNotInDb = collectionTraitsNotInDb.filter(
    (thing, index, self) =>
      index === self.findIndex((t) => t.name === thing.name)
  );

  for (const trait of collectionTraitsNotInDb) {
    const { name } = trait;

    await client.mutate({
      mutation: ADD_TRAIT,
      variables: {
        name,
        nftCollectionId,
      },
    });
  }
};
