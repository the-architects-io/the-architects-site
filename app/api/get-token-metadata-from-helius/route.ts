import { NoopResponse } from "@/app/blueprint/types";
import { handleError } from "@/utils/errors/log-error";
import axios from "axios";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

type TokenMetadataFromHelius = {
  account: string;
  onChainAccountInfo: {
    accountInfo: {
      key: string;
      data: {
        parsed: {
          info: {
            decimals: number;
          };
        };
      };
    };
  };
  onChainMetadata: {
    metadata: {
      data: {
        name: string;
        symbol: string;
        uri: string;
      };
    };
  };
  legacyMetadata: {
    name: string;
    symbol: string;
    decimals: number;
    address: string;
    logoURI: string;
  };
};

export type TokenMetadata = {
  imageUrl: string;
  decimals: number;
  name: string;
  symbol: string;
};

type Data =
  | TokenMetadata
  | NoopResponse
  | {
      error: unknown;
    };

export async function POST(req: NextRequest) {
  const { mintAddress, noop } = await req.json();
  console.log({ mintAddress, noop }, process.env.HELIUS_API_KEY);

  if (noop)
    return NextResponse.json(
      {
        noop: true,
        endpoint: "get-token-metadata-from-helius",
      },
      { status: 200 }
    );

  if (!mintAddress || !process.env.HELIUS_API_KEY) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  let metadata;
  try {
    const { data } = await axios.post(
      `https://api.helius.xyz/v0/token-metadata?api-key=${process.env.HELIUS_API_KEY}`,
      {
        mintAccounts: [mintAddress],
      }
    );
    metadata = data?.[0];
  } catch (error) {
    handleError(error as Error);
    return NextResponse.json(
      { error: "Error fetching token metadata from Helius" },
      { status: 500 }
    );
  }

  const tokenMetadata: TokenMetadataFromHelius = metadata;

  console.log("tokenMetadata: ", tokenMetadata);

  let offChainMetadata;

  if (tokenMetadata?.onChainMetadata?.metadata?.data?.uri) {
    try {
      const { data } = await axios.get(
        tokenMetadata?.onChainMetadata?.metadata?.data?.uri
      );
      offChainMetadata = data;
    } catch (error) {
      handleError(error as Error);
    }
  }

  try {
    const metadata = {
      imageUrl:
        offChainMetadata?.image || tokenMetadata?.legacyMetadata?.logoURI,
      name:
        tokenMetadata?.onChainMetadata?.metadata?.data?.name ||
        tokenMetadata?.legacyMetadata?.name,
      symbol:
        tokenMetadata?.onChainMetadata?.metadata?.data?.symbol ||
        tokenMetadata?.legacyMetadata?.symbol,
      decimals:
        tokenMetadata?.onChainAccountInfo?.accountInfo?.data?.parsed?.info
          ?.decimals ||
        tokenMetadata?.legacyMetadata?.decimals ||
        0,
    };

    console.log("~~metadata: ", metadata);

    return NextResponse.json(metadata, { status: 200 });
  } catch (error) {
    handleError(error as Error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
