import { NftMetadataJson } from "@/app/blueprint/types";
import { FindNftsByOwnerOutput, Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";
import { CREATOR_ADDRESS, RPC_ENDPOINT } from "constants/constants";

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
}: Props): Promise<any[]> => {
  setIsLoading && setIsLoading(true);
  return new Promise(async (resolve, reject) => {
    const connection = new Connection(RPC_ENDPOINT, "confirmed");
    const metaplex = Metaplex.make(connection);

    console.log("address", publicKey.toString());

    try {
      const nftMetasFromMetaplex: FindNftsByOwnerOutput = await metaplex
        .nfts()
        .findAllByOwner({ owner: publicKey });

      const nftCollection = nftMetasFromMetaplex.filter(
        ({ creators }: { creators: any }) => {
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

      // if (!withMetadata) {
      //   setIsLoading && setIsLoading(false);
      //   setHasBeenFetched && setHasBeenFetched(true);
      //   resolve(
      //     nftCollection.map(({ address, name }) => {
      //       return {
      //         name: name || "",
      //         imageUrl: "",
      //         mintAddress: address.toString(),
      //       };
      //     })
      //   );
      //   return;
      // }

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
