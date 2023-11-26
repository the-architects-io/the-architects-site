import { ENV, RPC_ENDPOINT, RPC_ENDPOINT_DEVNET } from "@/constants/constants";

export const getRpcEndpoint = (
  cluster: "devnet" | "mainnet-beta" = "mainnet-beta"
) => {
  switch (cluster) {
    case "devnet":
      return RPC_ENDPOINT_DEVNET;
    case "mainnet-beta":
      return RPC_ENDPOINT;
  }

  // return RPC_ENDPOINT_DEVNET;

  // switch (ENV) {
  //   case "production":
  //     return RPC_ENDPOINT;
  //   case "preview":
  //   case "local":
  //     return RPC_ENDPOINT_DEVNET;
  // }
};

export const isValidCluster = (cluster: string) => {
  switch (cluster) {
    case "devnet":
    case "mainnet-beta":
      return true;
    default:
      return false;
  }
};
