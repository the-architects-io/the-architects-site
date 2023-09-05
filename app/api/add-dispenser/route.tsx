// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADD_DISPENSER } from "@/graphql/mutations/add-dispenser";
import { Dispenser, NoopResponse } from "@/app/blueprint/types";

type Data =
  | Dispenser
  | NoopResponse
  | {
      error: unknown;
    };

export async function POST(req: NextRequest) {
  const { imageUrl, name, description, noop } = await req.json();

  if (noop)
    return NextResponse.json({
      noop: true,
      endpoint: "add-dispenser",
      status: 200,
    });

  if (!name) {
    return NextResponse.json({ error: "Required fields not set", status: 500 });
  }

  try {
    const {
      insert_dispensers_one: dispenser,
    }: { insert_dispensers_one: Data } = await client.request({
      document: ADD_DISPENSER,
      variables: {
        imageUrl,
        name,
        description,
      },
    });

    console.log("dispenser: ", dispenser);

    return NextResponse.json(dispenser, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
