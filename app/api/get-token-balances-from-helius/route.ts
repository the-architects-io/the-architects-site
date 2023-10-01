import { HeliusToken, NoopResponse, Token } from "@/app/blueprint/types";
import axios from "axios";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export type TokenBalance = {
  tokenAccount: string;
  mint: string;
  amount: number;
  decimals: number;
};

type Data =
  | TokenBalance[]
  | NoopResponse
  | {
      error: unknown;
    };

export async function POST(req: NextRequest) {
  const { walletAddress, mintAddresses, noop, withDetails } = await req.json();

  if (noop)
    return NextResponse.json(
      {
        noop: true,
        endpoint: "get-token-balances-from-helius",
      },
      { status: 200 }
    );

  console.log("walletAddress", walletAddress, withDetails);

  if (!walletAddress?.length || !process.env.HELIUS_API_KEY) {
    return NextResponse.json(
      {
        error: "No wallet address or Helius API key found",
      },
      { status: 500 }
    );
  }

  let url = "";

  switch (process.env.NEXT_PUBLIC_ENV) {
    case "production":
      url = `https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${process.env.HELIUS_API_KEY}`;
      break;
    case "local":
    default:
      url = `https://api-devnet.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${process.env.HELIUS_API_KEY}`;
      break;
  }

  const { data } = await axios.get(url);

  let { tokens: balances }: { tokens: TokenBalance[] } = data;

  console.log({ balances, mintAddresses, walletAddress });

  if (mintAddresses && mintAddresses.length > 0) {
    balances = balances.filter((balance) =>
      mintAddresses.includes(balance.mint)
    );
  }

  console.log("filtered balances", balances);

  balances = balances
    .filter((balance) => balance.amount > 0)
    .filter((balance) => balance.decimals > 0 && balance.amount > 1) // Only SPLs
    .sort((a, b) => b.amount - a.amount);

  console.log("sliced balances", balances.slice(0, 10));

  if (withDetails) {
    const { data: tokenDetails } = await axios.post(
      `https://api.helius.xyz/v0/token-metadata?api-key=${process.env.HELIUS_API_KEY}`,
      {
        mintAccounts: balances.map((balance) => balance.mint).slice(0, 10),
      }
    );

    console.log(
      "tokenDetails",
      tokenDetails.map((token: any) => token?.onChainMetadata)
    );

    balances = balances.map((balance) => {
      const tokenDetail = tokenDetails.find(
        (token: HeliusToken) => token.mint === balance.mint
      );

      if (tokenDetail) {
        return {
          ...balance,
          ...tokenDetail,
        };
      }

      return balance;
    });
  }

  return NextResponse.json(balances, { status: 200 });
}
