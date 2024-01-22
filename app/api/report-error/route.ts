import { ARCHITECTS_API_URL } from "@/constants/constants";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { error, metadata } = await req.json();

  console.log({
    error,
    metadata,
  });

  const { data } = await axios.post(`${ARCHITECTS_API_URL}/report-error`, {
    error,
    metadata,
  });

  return NextResponse.json(
    {
      ...data,
      error,
      metadata,
    },
    { status: 200 }
  );
}
