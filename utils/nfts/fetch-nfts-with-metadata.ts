import { Trait } from "@/pages/api/add-creatures-from-nfts";

export type Attribute = {
  trait_type: string;
  value: string;
};

export type ModeledNftMetadata = {
  traits?: Trait[];
  description: string;
  edition: number;
  url: string;
  name: string;
  imageUrl: string;
  mintAddress: string;
  creators: string[];
  fee: number;
  symbol: string;
  freezeAuthorityAddress: string;
  mintAuthorityAddress: string;
};

export const fetchNftsWithMetadata = async (
  nfts: any[],
  metaplex: any
): Promise<ModeledNftMetadata[]> => {
  return new Promise(async (resolve, reject) => {
    let nftsWithMetadata: ModeledNftMetadata[] = [];

    console.log("fetching nfts", nfts);

    // @ts-ignore
    for (const [i, nft] of nfts.entries()) {
      console.log("nft", nft?.mintAddress?.toString());
      console.log("i", i);
      if (!nft) {
        console.log("No nft for", { i, nft });
        continue;
      }

      const nftWithMetadata = await metaplex.nfts().load({ metadata: nft });

      console.log("nftWithMetadata", nftWithMetadata);

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
