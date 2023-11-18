import { ENV, RPC_ENDPOINT, RPC_ENDPOINT_DEVNET } from "@/constants/constants";

export const getRpcEndpoint = () => {
  return RPC_ENDPOINT;
  // return RPC_ENDPOINT_DEVNET;

  // switch (ENV) {
  //   case "production":
  //     return RPC_ENDPOINT;
  //   case "preview":
  //   case "local":
  //     return RPC_ENDPOINT_DEVNET;
  // }
};
