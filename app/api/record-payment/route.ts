import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    mintAddress,
    baseAmount,
    payerAddress,
    txId
  } = await req.json();

  if (
    !process.env.EXECUTION_WALLET_PRIVATE_KEY ||
    !process.env.NEXT_PUBLIC_ASSET_SHDW_DRIVE_ADDRESS
  ) {
    return NextResponse.json(
      {
        error: "Configuration error",
      },
      { status: 500 }
    );
  }
}