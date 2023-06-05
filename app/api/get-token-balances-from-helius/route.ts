import { NoopResponse } from "@/app/api/add-account/route";
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
  const { walletAddress, mintAddresses, noop } = await req.json();

  if (noop)
    return NextResponse.json(
      {
        noop: true,
        endpoint: "get-token-balances-from-helius",
      },
      { status: 200 }
    );

  if (!walletAddress || !process.env.HELIUS_API_KEY) {
    return NextResponse.json(
      {
        error: "No wallet address or Helius API key found",
      },
      { status: 500 }
    );
  }

  const { data } = await axios.get(
    `https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${process.env.HELIUS_API_KEY}`
  );

  let { tokens: balances }: { tokens: TokenBalance[] } = data;

  if (mintAddresses && mintAddresses.length > 0) {
    balances = balances.filter((balance) =>
      mintAddresses.includes(balance.mint)
    );
  }

  return NextResponse.json(balances, { status: 200 });
}
