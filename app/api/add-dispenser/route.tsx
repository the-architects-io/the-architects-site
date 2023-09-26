// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADD_DISPENSER } from "@/graphql/mutations/add-dispenser";
import { Dispenser, NoopResponse } from "@/app/blueprint/types";
import { ENV } from "@/constants/constants";

type Data =
  | Dispenser
  | NoopResponse
  | {
      error: unknown;
    };

export async function POST(req: NextRequest) {
  const { imageUrl, name, description, noop, ownerId, apiKey } =
    await req.json();

  if (!process.env.API_ACCESS_HOST_LIST) {
    return NextResponse.json(
      {
        error: "API access not configured",
        status: 500,
      },
      { status: 500 }
    );
  }

  const hostWhitelist = process.env.API_ACCESS_HOST_LIST;
  const host = req.headers.get("x-forwarded-host") || "";
  const isValidHost = hostWhitelist.indexOf(host) > -1 || ENV === "local";

  console.log("/api/add-dispenser", {});

  if (!isValidHost) {
    return NextResponse.json(
      {
        error: `API access not allowed for host: ${host}`,
        status: 500,
      },
      { status: 500 }
    );
  }

  if (apiKey !== process.env.BLUEPRINT_API_KEY) {
    return NextResponse.json(
      {
        error: "Invalid API key",
        status: 500,
      },
      { status: 500 }
    );
  }

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
        ownerId,
      },
    });

    console.log("dispenser: ", dispenser);

    return NextResponse.json(dispenser, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
