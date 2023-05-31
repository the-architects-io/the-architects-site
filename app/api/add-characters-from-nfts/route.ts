import { client } from "@/graphql/backend-client";
import { ADD_TOKEN } from "@/graphql/mutations/add-token";
import { ADD_CHARACTER } from "@/graphql/mutations/add-character";
import { ADD_TRAIT_INSTANCE } from "@/graphql/mutations/add-trait-instance";
import { Token } from "@/features/admin/tokens/tokens-list-item";
import { GET_TRAIT_BY_NAME } from "@/graphql/queries/get-trait-by-name";
import { GET_CHARACTER_BY_TOKEN_MINT_ADDRESS } from "@/graphql/queries/get-character-by-token-mint-address";
import { NoopResponse } from "@/app/api/add-account/route";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export type Character = {
  id: string;
  name: string;
  imageUrl: string;
  token: {
    id: string;
    mintAddress: string;
  };
  traitInstances: {
    id: string;
    value: string;
    trait: {
      id: string;
      name: string;
    };
  }[];
  traitCombinationHash?: string;
  mainCharacterActivityInstances: {
    id: string;
    startTime: string;
    endTime: string;
    isComplete: boolean;
    activity: {
      id: string;
      startTime: string;
      endTime: string;
    };
  }[];
};

export type Trait = {
  id: string;
  name: string;
  value: string;
};

type CharacterResponse = {
  characters?: Character[];
  success: boolean;
  message: string;
};

type Data =
  | CharacterResponse
  | NoopResponse
  | {
      error: unknown;
    };

export async function POST(req: NextRequest) {
  const { nfts, noop } = await req.json();

  if (noop)
    return NextResponse.json(
      {
        noop: true,
        endpoint: "add-character-from-nfts",
      },
      {
        status: 200,
      }
    );

  console.log({ nfts });

  if (!nfts) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  const response = [];

  for (let nft of nfts) {
    const { mintAddress, imageUrl, symbol, traits, name } = nft;
    try {
      const { characters }: { characters: Character[] } = await client.request({
        document: GET_CHARACTER_BY_TOKEN_MINT_ADDRESS,
        variables: {
          mintAddress,
        },
      });

      const character = characters?.[0];

      if (character) continue;
      // TODO: check if token exists
      const { insert_tokens_one }: { insert_tokens_one: Token } =
        await client.request({
          document: ADD_TOKEN,
          variables: {
            decimals: 0,
            imageUrl,
            mintAddress,
            symbol,
            name,
          },
        });

      const { insert_characters_one }: { insert_characters_one: Character } =
        await client.request({
          document: ADD_CHARACTER,
          variables: {
            name,
            tokenId: insert_tokens_one.id,
            imageUrl,
          },
        });

      // TODO add trait hash
      for (let trait of traits) {
        console.log("```````````trait: ", trait);
        try {
          const { traits }: { traits: Trait[] } = await client.request({
            document: GET_TRAIT_BY_NAME,
            variables: {
              name: trait.name,
            },
          });
          console.log("```````````traits: ", traits);
        } catch (error) {
          console.log("```````````FAIL error: ", error);
          return NextResponse.json({ error }, { status: 500 });
        }

        const traitId = traits[0].id;
        console.log("```````````traitId: ", traitId);
        const {
          insert_traitInstances_one,
        }: { insert_traitInstances_one: Data } = await client.request({
          document: ADD_TRAIT_INSTANCE,
          variables: {
            traitId,
            characterId: insert_characters_one.id,
            value: trait.value,
          },
        });
        console.log(
          "```````````insert_traitInstances_one: ",
          insert_traitInstances_one
        );
      }
      traits.forEach(async (trait: Trait) => {});

      console.log("Token added: ", {
        mintAddress: insert_tokens_one.mintAddress,
        name: insert_tokens_one.name,
        imageUrl: insert_tokens_one.imageUrl,
      });
      console.log("Character added: ", {
        name: insert_characters_one.name,
      });
      response.push(insert_characters_one);
    } catch (error) {
      console.log("```````````FAIL error: ", error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }

  if (!response?.length) {
    return NextResponse.json({
      success: true,
      message: "Character already exists",
    });
  }

  return NextResponse.json(
    { success: true, message: "Character added", chatacter: response },
    { status: 200 }
  );
}
