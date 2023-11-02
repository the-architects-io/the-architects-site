import { Attribute, ModeledNftMetadata, Trait } from "@/app/blueprint/types";

export const fetchNftsWithMetadata = async (
  nfts: any[],
  metaplex: any
): Promise<ModeledNftMetadata[]> => {
  return new Promise(async (resolve, reject) => {
    let nftsWithMetadata: ModeledNftMetadata[] = [];

    // @ts-ignore
    for (const [i, nft] of nfts.entries()) {
      if (!nft) {
        console.log("No nft for", { i, nft });
        continue;
      }

      const nftWithMetadata = await metaplex.nfts().load({ metadata: nft });

      const traitInstances =
        nftWithMetadata.json?.attributes
          ?.map(({ trait_type, value }: Attribute) => ({
            name: trait_type || "",
            value: value || "",
          }))
          .filter(({ name, value }: Trait) => name !== "" && value !== "") ||
        [];

      const metadata: ModeledNftMetadata = {
        traits: traitInstances,
        description: nftWithMetadata?.json?.description,
        edition: nftWithMetadata?.json?.edition as number,
        url: nftWithMetadata?.json?.external_url,
        name: nftWithMetadata?.name || nftWithMetadata?.json?.name,
        imageUrl: nftWithMetadata?.json?.image,
        mintAddress: nftWithMetadata?.mint?.address?.toString() || "",
        creators: nftWithMetadata?.json?.properties?.creators,
        fee: nftWithMetadata?.json?.properties
          ?.seller_fee_basis_points as number,
        symbol: nftWithMetadata?.json?.symbol,
        freezeAuthorityAddress:
          nftWithMetadata?.mint.freezeAuthorityAddress?.toString(),
        mintAuthorityAddress:
          nftWithMetadata?.mint.mintAuthorityAddress?.toString(),
      };
      nftsWithMetadata.push(metadata);
    }

    resolve(nftsWithMetadata);
  });
};
