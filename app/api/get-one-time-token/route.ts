import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const oneTimeTokensCache: Record<string, any> = {};

export async function POST(req: NextRequest) {
  const token = crypto.randomBytes(32).toString("hex");
  oneTimeTokensCache[token] = true;
  setTimeout(() => delete oneTimeTokensCache[token], 0.5 * 60 * 1000); // Token expires after 30 seconds.

  return NextResponse.json({ token });
}
