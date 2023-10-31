import { Trait } from "@/app/blueprint/types";
import { client } from "@/graphql/backend-client";
import { ADD_TRAIT } from "@/graphql/mutations/add-trait";
import { GET_TRAITS_BY_NFT_COLLECTION } from "@/graphql/queries/get-traits-by-nft-collection";

export const addTraitsToDb = async (nfts: any[], nftCollectionId: string) => {
  const { traits: traitsFromDb }: { traits: Trait[] } = await client.request({
    document: GET_TRAITS_BY_NFT_COLLECTION,
    variables: {
      nftCollectionId,
    },
  });

  let traitsFromNfts = nfts.map(({ traits }) => traits).flat();
  const traitNamesFromNfts = traitsFromNfts.map(
    (trait: { name: string }) => trait.name
  );
  const traitNamesFromDb = traitsFromDb.map(
    (trait: { name: string }) => trait.name
  );

  const traitNamesNotInDb = traitNamesFromNfts.filter(
    (traitName) => !traitNamesFromDb.includes(traitName)
  );

  console.log({
    traitNamesFromNfts,
    traitNamesFromDb,
    traitNamesNotInDb,
  });

  for (const name of traitNamesNotInDb) {
    const { insert_traits_one: trait }: { insert_traits_one: Trait } =
      await client.request({
        document: ADD_TRAIT,
        variables: {
          name,
          nftCollectionId,
        },
      });
    console.log(`Added trait ${trait?.name} to db`);
  }
};
