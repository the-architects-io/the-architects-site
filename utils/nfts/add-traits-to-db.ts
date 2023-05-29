import client from "@/graphql/apollo/client";
import { ADD_TRAIT } from "@/graphql/mutations/add-trait";
import { GET_TRAITS_BY_NFT_COLLECTION } from "@/graphql/queries/get-traits-by-nft-collection";
import { Trait } from "@/pages/api/add-creatures-from-nfts";

export const addTraitsToDb = async (nfts: any[], nftCollectionId: string) => {
  const { data } = await client.query({
    query: GET_TRAITS_BY_NFT_COLLECTION,
    variables: {
      // nftCollectionId: "334a2b4f-b0c6-4128-94b5-0123cb1bff0a", // SoDead
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
        // nftCollectionId: "334a2b4f-b0c6-4128-94b5-0123cb1bff0a", // SoDead
        nftCollectionId,
      },
    });
  }
};
