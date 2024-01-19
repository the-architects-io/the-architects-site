import { NftMetadataJson } from "@/app/blueprint/types";
import { getRpcEndpoint } from "@/utils/rpc";
import {
  FindNftsByOwnerOutput,
  Metadata,
  Metaplex,
} from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";
import { CREATOR_ADDRESS } from "constants/constants";

export type ModeledNftMetadata = {
  name: string;
  imageUrl: string;
  mintAddress: string;
};

interface Props {
  publicKey: PublicKey;
  setIsLoading?: (isLoading: boolean) => void;
  setHasBeenFetched?: (hasBeenFetched: boolean) => void;
  withMetadata?: boolean;
  cluster?: "devnet" | "mainnet-beta";
}

const convertImageUrl = (imageUrl: string): string => {
  if (!imageUrl.includes("ipfs")) return imageUrl;

  const urlParts = imageUrl.split("/");
  const ipfsHash = urlParts[4];
  const fileName = urlParts[5];
  const convertedUrl = `https://${ipfsHash}.ipfs.nftstorage.link/${fileName}`;
  return convertedUrl;
};

export const fetchDaoNfts = async ({
  publicKey,
  setIsLoading,
  setHasBeenFetched,
  withMetadata = true,
  cluster = "mainnet-beta",
}: Props): Promise<any[]> => {
  setIsLoading && setIsLoading(true);
  return new Promise(async (resolve, reject) => {
    const connection = new Connection(getRpcEndpoint(cluster));
    const metaplex = Metaplex.make(connection);

    console.log("address", publicKey.toString());

    try {
      const nftMetasFromMetaplex: FindNftsByOwnerOutput = await metaplex
        .nfts()
        .findAllByOwner({ owner: publicKey });

      if (!nftMetasFromMetaplex.length) {
        resolve([]);
        return;
      }

      const { model } = nftMetasFromMetaplex[0];

      const nftCollection = nftMetasFromMetaplex.filter(
        ({ creators }: { creators: Metadata["creators"] }) => {
          console.log({ creators });
          return creators?.[0]?.address?.toString() === CREATOR_ADDRESS;
        }
      );

      console.log({
        nftMetasFromMetaplex,
        nftCollection,
        CREATOR_ADDRESS: CREATOR_ADDRESS,
      });

      if (!nftCollection.length) {
        setIsLoading && setIsLoading(false);
        setHasBeenFetched && setHasBeenFetched(true);
        resolve([]);
        return;
      }

      console.log("====================================");
      console.log("nftCollection", { nftCollection });
      console.log("addresses", {
        addresses: nftCollection.map(({ address }) => address),
      });
      console.log("addressesToString", {
        addressesToString: nftCollection.map(({ address }) =>
          address.toString()
        ),
      });
      console.log("====================================");

      if (!withMetadata) {
        setIsLoading && setIsLoading(false);
        setHasBeenFetched && setHasBeenFetched(true);
        const collection = nftCollection as Metadata[];
        resolve(
          collection.map(({ mintAddress, name }) => {
            return {
              name: name || "",
              imageUrl: "",
              mintAddress: mintAddress.toString(),
            };
          })
        );
        return;
      }

      let nftsWithMetadata: any[] = [];

      for (const nft of nftCollection) {
        // @ts-ignore
        const { json, mint } = await metaplex.nfts().load({ metadata: nft });
        const { name, image: imageUrl } = json as NftMetadataJson;
        const { address: mintAddress } = mint;
        const metadata: ModeledNftMetadata = {
          name,
          imageUrl: convertImageUrl(imageUrl),
          mintAddress: mintAddress.toString(),
        };
        nftsWithMetadata.push(metadata);
      }

      console.log({ nftsWithMetadata });

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
