import { client } from "@/graphql/backend-client";
import { REMOVE_CHARACTERS_BY_MINT_ADDRESSES } from "@/graphql/mutations/remove-characters-by-mint-addresses";
import { NextRequest, NextResponse } from "next/server";

type RemoveCharactersResponse = {
  affected_rows: number;
  returning: {
    id: string;
    name: string;
  }[];
};

export async function POST(req: NextRequest) {
  const { mintAddresses, noop } = await req.json();

  if (noop)
    return {
      noop: true,
      endpoint: "remove-characters-by-mint-addresses",
    };

  const {
    delete_characters: deletedCharacters,
  }: { delete_characters: RemoveCharactersResponse } = await client.request({
    document: REMOVE_CHARACTERS_BY_MINT_ADDRESSES,
    variables: {
      mintAddresses,
    },
  });

  return NextResponse.json(
    {
      deletedCharacters,
    },
    { status: 200 }
  );
}
