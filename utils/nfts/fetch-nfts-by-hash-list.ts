import { Trait } from "@/features/admin/traits/traits-list-item";
import { ModeledNftMetadata } from "@/utils/nfts/fetch-nfts-by-first-creator-address";
import { Metaplex } from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";

type NftMetadataJson = {
  name: string;
  image: string;
};

interface Props {
  publicKey: PublicKey;
  connection: any;
  setIsLoading?: (isLoading: boolean) => void;
  setHasBeenFetched?: (hasBeenFetched: boolean) => void;
  hashList: string[];
  withDetails?: boolean;
}

export const fetchNftsByHashList = async ({
  publicKey,
  connection,
  setIsLoading,
  setHasBeenFetched,
  hashList,
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
        (nft) => hashList.indexOf(nft.mintAddress.toString()) > -1
      );

      console.log("nftCollection", nftCollection);

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
