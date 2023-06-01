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
import { GET_TOKEN_BY_MINT_ADDRESS } from "@/graphql/queries/get-token-by-mint-address";
import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { RPC_ENDPOINT } from "@/constants/constants";
import { fetchNftsWithMetadata } from "@/utils/nfts/fetch-nfts-with-metadata";
import { addTraitsToDb } from "@/utils/nfts/add-traits-to-db";

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
  const { hashList, noop, nftCollectionId } = await req.json();

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

  if (!hashList.length || !nftCollectionId) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  const jsonHashList = JSON.parse(hashList);
  console.log("jsonHashList", jsonHashList);
  if (!jsonHashList.length) {
    return NextResponse.json(
      { error: "Could not resolve hash list" },
      { status: 500 }
    );
  }

  const response = [];

  // save traits
  const connection = new Connection(RPC_ENDPOINT);
  const metaplex = Metaplex.make(connection);
  const mints = jsonHashList.map((address: string) => new PublicKey(address));
  const nftMetasFromMetaplex: any[] = await metaplex
    .nfts()
    .findAllByMintList({ mints });

  if (!nftMetasFromMetaplex.length) {
    console.log("No nfts fetched from metaplex");
    return;
  }

  const nftsWithMetadata = await fetchNftsWithMetadata(
    nftMetasFromMetaplex,
    metaplex
  );

  // move to endpoint?
  await addTraitsToDb(nftsWithMetadata, nftCollectionId);
  console.log("traits saved");

  for (let nft of nftsWithMetadata) {
    const { mintAddress, imageUrl, symbol, traits, name } = nft;
    if (!traits?.length) {
      return NextResponse.json(
        { error: "Could not resolve traits" },
        { status: 500 }
      );
    }

    try {
      const { characters }: { characters: Character[] } = await client.request({
        document: GET_CHARACTER_BY_TOKEN_MINT_ADDRESS,
        variables: {
          mintAddress,
        },
      });

      const character = characters?.[0];

      if (character) {
        console.log(`Character ${character.name} already exists, skipping`);
        continue;
      }

      const { tokens }: { tokens: Token[] } = await client.request({
        document: GET_TOKEN_BY_MINT_ADDRESS,
        variables: {
          mintAddress,
        },
      });

      let token = tokens?.[0];

      if (!token) {
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

        token = insert_tokens_one;
      }

      const { insert_characters_one }: { insert_characters_one: Character } =
        await client.request({
          document: ADD_CHARACTER,
          variables: {
            name,
            tokenId: token.id,
            imageUrl,
          },
        });
      console.log(`Character ${name} added`);

      // TODO add trait hash
      for (let trait of traits) {
        console.log("```````````trait: ", trait);
        let traitId;
        try {
          const { traits }: { traits: Trait[] } = await client.request({
            document: GET_TRAIT_BY_NAME,
            variables: {
              name: trait.name,
            },
          });
          console.log("```````````traits: ", traits);
          traitId = traits[0].id;
        } catch (error) {
          console.log("```````````FAIL error: ", error);
          return NextResponse.json({ error }, { status: 500 });
        }

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
        mintAddress: token.mintAddress,
        name: token.name,
        imageUrl: token.imageUrl,
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
