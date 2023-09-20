import { nftStorageUploader } from "@metaplex-foundation/umi-uploader-nft-storage";

import { RPC_ENDPOINT } from "@/constants/constants";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createBundlrUploader } from "@metaplex-foundation/umi-uploader-bundlr";

let umiClient: ReturnType<typeof createUmi> | null = null; // Replace ReturnType<typeof createUmi> with the appropriate type if you know it

export function getUmiClient() {
  if (!umiClient) {
    umiClient = createUmi(RPC_ENDPOINT)
      .use(
        nftStorageUploader({
          token: process.env.NFT_STORAGE_API_KEY || "",
        })
      )
      .use(mplToolbox())
      .use(mplTokenMetadata());
  }
  return umiClient;
}
