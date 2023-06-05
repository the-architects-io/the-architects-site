import axios from "axios";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export type NoopResponse = {
  noop: true;
  endpoint: string;
};

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
    return;
  }

  const { data } = await axios.post(
    `https://api.helius.xyz/v0/token-metadata?api-key=${process.env.HELIUS_API_KEY}`,
    {
      mintAccounts: [mintAddress],
    }
  );

  const tokenMetadata: TokenMetadataFromHelius = data?.[0];

  console.log("tokenMetadata: ", tokenMetadata);

  let offChainMetadata;

  if (tokenMetadata?.onChainMetadata?.metadata?.data?.uri) {
    try {
      const { data } = await axios.get(
        tokenMetadata?.onChainMetadata?.metadata?.data?.uri
      );
      offChainMetadata = data;
    } catch (error) {
      console.log("Error fetching off-chain metadata: ", error);
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
    console.log("~~error: ", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
