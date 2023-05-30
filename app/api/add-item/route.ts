// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ADD_ITEM } from "@/graphql/mutations/add-item";
import { client } from "@/graphql/backend-client";
import { NoopResponse } from "@/app/api/get-token-metadata-from-helius/route";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export type Item = {
  rarity: {
    id: string;
    name: string;
  };
  costs: {
    amount: number;
    id: string;
    createdAt: string;
    token: {
      id: string;
      name: string;
      mintAddress: string;
    };
    item: {
      id: string;
      name: string;
      imageUrl: string;
    };
  };
  baseStatModifier: {
    id: string;
    name: string;
    effectAmount: number;
    affectedBaseStat: {
      name: string;
      id: string;
      max: number;
      min: number;
    };
  };
  imageUrl: string;
  id: string;
  createdAt: string;
  isConsumable: boolean;
  isCraftable: boolean;
  name: string;

  description: string;
  category: {
    id: string;
    name: string;
    parentCategory: {
      name: string;
      id: string;
    };
    childCategories: {
      id: string;
      name: string;
    };
  };
  itemCollections: {
    name: string;
    id: string;
    imageUrl: string;
  };
  token: {
    id: string;
    mintAddress: string;
  };
};

type Data =
  | Item
  | NoopResponse
  | {
      error: unknown;
    };

export async function POST(req: NextRequest) {
  const {
    imageUrl,
    isConsumable = false,
    isCraftable = false,
    name,
    categoryId,
    description,
    noop,
  } = await req.json();

  if (noop)
    return NextResponse.json({
      noop: true,
      endpoint: "add-item",
      status: 200,
    });

  if (!name) {
    NextResponse.json({ error: "Required fields not set", status: 500 });
    return;
  }

  try {
    const { insert_items_one }: { insert_items_one: Data } =
      await client.request({
        document: ADD_ITEM,
        variables: {
          imageUrl,
          name,
          isConsumable,
          isCraftable,
          categoryId,
          description,
        },
      });

    console.log("insert_items_one: ", insert_items_one);

    return NextResponse.json(insert_items_one, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
