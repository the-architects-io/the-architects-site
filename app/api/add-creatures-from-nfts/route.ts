import { client } from "@/graphql/backend-client";
import { ADD_TOKEN } from "@/graphql/mutations/add-token";
import { ADD_CREATURE } from "@/graphql/mutations/add-creature";
import { ADD_TRAIT_INSTANCE } from "@/graphql/mutations/add-trait-instance";
import { Token } from "@/features/admin/tokens/tokens-list-item";
import { GET_TRAIT_BY_NAME } from "@/graphql/queries/get-trait-by-name";
import { GET_CREATURE_BY_TOKEN_MINT_ADDRESS } from "@/graphql/queries/get-creature-by-token-mint-address";
import { NoopResponse } from "@/app/api/add-account/route";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export type Creature = {
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

type CreaturesResponse = {
  creatures?: Creature[];
  success: boolean;
  message: string;
};

type Data =
  | CreaturesResponse
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
        endpoint: "add-creatures-from-nfts",
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
      const { sodead_creatures }: { sodead_creatures: Creature[] } =
        await client.request({
          document: GET_CREATURE_BY_TOKEN_MINT_ADDRESS,
          variables: {
            mintAddress,
          },
        });

      const creature = sodead_creatures?.[0];

      if (creature) continue;

      const { insert_sodead_tokens_one }: { insert_sodead_tokens_one: Token } =
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

      const {
        insert_sodead_creatures_one,
      }: { insert_sodead_creatures_one: Creature } = await client.request({
        document: ADD_CREATURE,
        variables: {
          name,
          tokenId: insert_sodead_tokens_one.id,
          imageUrl,
          creatureCategoryId: "28ea2cc8-7fbc-4599-a93d-73a34f00ddfe", // Vampire
        },
      });

      // TODO add trait hash
      traits.forEach(async (trait: Trait) => {
        console.log("```````````trait: ", trait);
        const { sodead_traits }: { sodead_traits: Trait[] } =
          await client.request({
            document: GET_TRAIT_BY_NAME,
            variables: {
              name: trait.name,
            },
          });
        console.log("```````````sodead_traits: ", sodead_traits);

        const traitId = sodead_traits[0].id;
        console.log("```````````traitId: ", traitId);
        const {
          insert_sodead_traitInstances_one,
        }: { insert_sodead_traitInstances_one: Data } = await client.request({
          document: ADD_TRAIT_INSTANCE,
          variables: {
            traitId,
            creatureId: insert_sodead_creatures_one.id,
            value: trait.value,
          },
        });
        console.log(
          "```````````insert_sodead_traitInstances_one: ",
          insert_sodead_traitInstances_one
        );
      });

      console.log("Token added: ", {
        mintAddress: insert_sodead_tokens_one.mintAddress,
        name: insert_sodead_tokens_one.name,
        imageUrl: insert_sodead_tokens_one.imageUrl,
      });
      console.log("Creature added: ", {
        name: insert_sodead_creatures_one.name,
      });
      response.push(insert_sodead_creatures_one);
    } catch (error) {
      console.log("```````````FAIL error: ", error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }

  if (!response?.length) {
    return NextResponse.json({
      success: true,
      message: "Creature already exists",
    });
  }

  return NextResponse.json(
    { success: true, message: "Creature added", creatures: response },
    { status: 200 }
  );
}
