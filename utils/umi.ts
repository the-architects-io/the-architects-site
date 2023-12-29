import { RPC_ENDPOINT, RPC_ENDPOINT_DEVNET } from "@/constants/constants";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

let umiClient: ReturnType<typeof createUmi> | null = null; // Replace ReturnType<typeof createUmi> with the appropriate type if you know it

export function getUmiClient(
  endpoint:
    | typeof RPC_ENDPOINT
    | typeof RPC_ENDPOINT_DEVNET = RPC_ENDPOINT_DEVNET
) {
  if (endpoint !== RPC_ENDPOINT && endpoint !== RPC_ENDPOINT_DEVNET) {
    throw new Error("Invalid endpoint");
  }

  if (!umiClient) {
    umiClient = createUmi(endpoint).use(mplToolbox()).use(mplTokenMetadata());
  }
  return umiClient;
}
