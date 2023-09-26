export const CLUSTER: string =
  process.env.NEXT_PUBLIC_CLUSTER || "mainnet-beta";
export const RPC_ENDPOINT: string = process.env.NEXT_PUBLIC_RPC_ENDPOINT || "";
export const RPC_ENDPOINT_DEVNET: string =
  process.env.NEXT_PUBLIC_RPC_ENDPOINT_DEVNET || "";
export const GRAPHQL_API_ENDPOINT: string =
  process.env.NEXT_PUBLIC_GRAPHQL_API_ENDPOINT || "";
export const ADMIN_WALLETS = process.env.NEXT_PUBLIC_ADMIN_WALLETS || "[]";
export const ENV = process.env.NEXT_PUBLIC_ENV || "local";
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";
export const BURNING_WALLET_ADDRESS =
  process.env.NEXT_PUBLIC_BURNING_WALLET_ADDRESS || "";
export const COLLECTION_WALLET_ADDRESS =
  process.env.NEXT_PUBLIC_COLLECTION_WALLET_ADDRESS || "";
export const PLATFORM_TOKEN_MINT_ADDRESS =
  process.env.NEXT_PUBLIC_PLATFORM_TOKEN_MINT_ADDRESS || "";
export const REWARD_TOKEN_MINT_ADDRESS =
  process.env.NEXT_PUBLIC_REWARD_TOKEN_MINT_ADDRESS || "";
export const REWARD_WALLET_ADDRESS =
  process.env.NEXT_PUBLIC_REWARD_WALLET_ADDRESS || "";
export const NHOST_SUBDOMAIN =
  process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || "nmsqqirmpjgdbtloninj";
export const NHOST_REGION = process.env.NEXT_PUBLIC_NHOST_REGION || "us-east-1";
export const DISPENSER_PROGRAM_ID =
  process.env.NEXT_PUBLIC_DISPENSER_PROGRAM_ID;
export const CREATOR_ADDRESS = process.env.NEXT_PUBLIC_CREATOR_ADDRESS;
export const BUILD_REWARD_WALLET = process.env.NEXT_PUBLIC_BUILD_REWARD_WALLET;
