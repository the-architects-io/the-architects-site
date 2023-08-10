import { Metaplex } from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";
import { CREATOR_ADDRESS } from "constants/constants";

export type ModeledNftMetadata = {
  name: string;
  imageUrl: string;
  mintAddress: string;
};

type NftMetadataJson = {
  name: string;
  image: string;
};

interface Props {
  publicKey: PublicKey;
  connection: any;
  setIsLoading?: (isLoading: boolean) => void;
  setHasBeenFetched?: (hasBeenFetched: boolean) => void;
}

export const fetchDaoNfts = async ({
  publicKey,
  connection,
  setIsLoading,
  setHasBeenFetched,
}: Props): Promise<any[]> => {
  setIsLoading && setIsLoading(true);
  return new Promise(async (resolve, reject) => {
    const metaplex = Metaplex.make(connection);

    console.log("address", publicKey.toString());

    try {
      const nftMetasFromMetaplex: any[] = await metaplex
        .nfts()
        .findAllByOwner({ owner: publicKey });

      const nftCollection = nftMetasFromMetaplex.filter(
        ({ creators }: { creators: any }) => {
          return creators?.[0]?.address?.toString() === CREATOR_ADDRESS;
        }
      );

      if (!nftCollection.length) {
        setIsLoading && setIsLoading(false);
        setHasBeenFetched && setHasBeenFetched(true);
        resolve([]);
        return;
      }

      let nftsWithMetadata: any[] = [];

      for (const nft of nftCollection) {
        const { json, mint } = await metaplex.nfts().load({ metadata: nft });
        const { name, image: imageUrl } = json as NftMetadataJson;
        const { address: mintAddress } = mint;
        const metadata: ModeledNftMetadata = {
          name,
          imageUrl,
          mintAddress: mintAddress.toString(),
        };
        nftsWithMetadata.push(metadata);
      }

      debugger;

      resolve(nftsWithMetadata);
    } catch (error) {
      console.log("fetchDaoNfts error", error);
      console.error({ error });
      reject(error);
    } finally {
      setIsLoading && setIsLoading(false);
      setHasBeenFetched && setHasBeenFetched(true);
    }
  });
};
