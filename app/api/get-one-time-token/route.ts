import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const oneTimeTokensCache: Record<string, any> = {};

export async function POST(req: NextRequest) {
  const token = crypto.randomBytes(32).toString("hex");
  oneTimeTokensCache[token] = true;
  setTimeout(() => delete oneTimeTokensCache[token], 3 * 60 * 1000); // Token expires after 3 minutes.

  return NextResponse.json({ token });
}
