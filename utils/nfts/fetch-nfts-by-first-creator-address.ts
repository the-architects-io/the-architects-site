import { fetchNftsWithMetadata } from "@/utils/nfts/fetch-nfts-with-metadata";
import { Metaplex } from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";

export type Attribute = {
  [key: string]: unknown;
  trait_type?: string | undefined;
  value?: string | undefined;
};

export type ModeledNftMetadata = {
  name: string;
  imageUrl: string;
  mintAddress: string;
  description?: string;
  edition?: number;
  fee?: number;
  traits?: {
    name: string;
    value: string;
  }[];
  url?: string;
  creators?: {
    [key: string]: unknown;
    address?: string | undefined;
    share?: number | undefined;
  }[];
  symbol?: string;
  freezeAuthorityAddress?: string;
  mintAuthorityAddress?: string;
};

interface Props {
  publicKey: PublicKey;
  connection: any;
  setIsLoading?: (isLoading: boolean) => void;
  setHasBeenFetched?: (hasBeenFetched: boolean) => void;
  firstCreatorAddress: string;
  withDetails?: boolean;
}

export const fetchNftsByFirstCreatorAddress = async ({
  publicKey,
  connection,
  setIsLoading,
  setHasBeenFetched,
  firstCreatorAddress,
  withDetails = true,
}: Props): Promise<any[]> => {
  setIsLoading && setIsLoading(true);
  return new Promise(async (resolve, reject) => {
    const metaplex = Metaplex.make(connection);

    try {
      const nftMetasFromMetaplex: any[] = await metaplex
        .nfts()
        .findAllByOwner({ owner: publicKey });

      const nftCollection = nftMetasFromMetaplex.filter(
        ({ creators }: { creators: any }) => {
          return creators?.[0]?.address?.toString() === firstCreatorAddress;
        }
      );

      if (!nftCollection.length) {
        setIsLoading && setIsLoading(false);
        setHasBeenFetched && setHasBeenFetched(true);
        resolve([]);
        return;
      }

      if (!withDetails) {
        setIsLoading && setIsLoading(false);
        setHasBeenFetched && setHasBeenFetched(true);
        resolve(nftCollection);
        return;
      }

      const nftsWithMetadata = await fetchNftsWithMetadata(
        nftCollection,
        metaplex
      );

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
