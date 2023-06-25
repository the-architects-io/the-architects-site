import { ADD_TRAIT } from "@/graphql/mutations/add-trait";
import { GET_TRAITS_BY_NFT_COLLECTION } from "@/graphql/queries/get-traits-by-nft-collection";

export const addTraitsToDb = async (nfts: any[], nftCollectionId: string) => {
  throw new Error("Not implemented");
  // const { data } = await client.query({
  //   query: GET_TRAITS_BY_NFT_COLLECTION,
  //   variables: {
  //     nftCollectionId,
  //   },
  // });

  // const { traits: traitsFromDb } = data;

  // let traitsFromNfts = nfts.map(({ traits }) => traits).flat();
  // const traitNamesFromNfts = traitsFromNfts.map(
  //   (trait: { name: string }) => trait.name
  // );
  // const traitNamesFromDb = traitsFromDb.map(
  //   (trait: { name: string }) => trait.name
  // );

  // const traitNamesNotInDb = traitNamesFromNfts.filter(
  //   (traitName) => !traitNamesFromDb.includes(traitName)
  // );

  // console.log({
  //   traitNamesFromNfts,
  //   traitNamesFromDb,
  //   traitNamesNotInDb,
  // });

  // for (const name of traitNamesNotInDb) {
  //   await client.mutate({
  //     mutation: ADD_TRAIT,
  //     variables: {
  //       name,
  //       nftCollectionId,
  //     },
  //   });
  //   console.log(`Added trait ${name} to db`);
  // }
};
