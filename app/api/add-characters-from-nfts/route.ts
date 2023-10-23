import { client } from "@/graphql/backend-client";
import { ADD_TOKEN } from "@/graphql/mutations/add-token";
import { ADD_CHARACTER } from "@/graphql/mutations/add-character";
import { ADD_TRAIT_INSTANCE } from "@/graphql/mutations/add-trait-instance";
import { GET_TRAIT_BY_NAME } from "@/graphql/queries/get-trait-by-name";
import { GET_CHARACTER_BY_TOKEN_MINT_ADDRESS } from "@/graphql/queries/get-character-by-token-mint-address";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GET_TOKEN_BY_MINT_ADDRESS } from "@/graphql/queries/get-token-by-mint-address";
import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { ENV, RPC_ENDPOINT } from "@/constants/constants";
import { fetchNftsWithMetadata } from "@/utils/nfts/fetch-nfts-with-metadata";
import { addTraitsToDb } from "@/utils/nfts/add-traits-to-db";
import { Character, NoopResponse, Token, Trait } from "@/app/blueprint/types";

export async function POST(req: NextRequest) {
  const { hashList, noop, nftCollectionId, apiKey } = await req.json();

  if (!process.env.BLUEPRINT_API_KEY) {
    return NextResponse.json(
      {
        error: "API access not configured",
        status: 500,
      },
      { status: 500 }
    );
  }

  const isValidApiKey = process.env.BLUEPRINT_API_KEY === apiKey;

  if (!isValidApiKey) {
    console.log("API access not allowed");
    return NextResponse.json({ error: "API access not allowed", status: 500 });
  }

  // const hostWhitelist = process.env.API_ACCESS_HOST_LIST;
  // const host = req.headers.get("x-forwarded-host") || "";
  // const isValidHost = hostWhitelist.indexOf(host) > -1 || ENV === "local";

  // if (!isValidHost) {
  //   return NextResponse.json(
  //     {
  //       error: `API access not allowed for host: ${host}`,
  //       status: 500,
  //     },
  //     { status: 500 }
  //   );
  // }

  if (noop)
    return NextResponse.json(
      {
        noop: true,
        endpoint: "add-characters-from-nfts",
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

  if (jsonHashList.length === 1) {
    const { characters }: { characters: Character[] } = await client.request({
      document: GET_CHARACTER_BY_TOKEN_MINT_ADDRESS,
      variables: {
        mintAddress: jsonHashList[0],
      },
    });

    const { tokens }: { tokens: Token[] } = await client.request({
      document: GET_TOKEN_BY_MINT_ADDRESS,
      variables: {
        mintAddress: jsonHashList[0],
      },
    });

    let token = tokens?.[0];

    const character = characters?.[0];
    if (character && token) {
      return NextResponse.json(
        {
          message: `Character ${character.name} already exists, skipping`,
        },
        { status: 200 }
      );
    }
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
    return NextResponse.json(
      { error: "Could not resolve nfts" },
      { status: 500 }
    );
  }

  const nftsWithMetadata = await fetchNftsWithMetadata(
    nftMetasFromMetaplex,
    metaplex
  );

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

      const { tokens }: { tokens: Token[] } = await client.request({
        document: GET_TOKEN_BY_MINT_ADDRESS,
        variables: {
          mintAddress,
        },
      });

      let token = tokens?.[0];

      if (character && token) {
        console.log(`Character ${character.name} already exists, skipping`);
        continue;
      }

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
        let traitId;
        try {
          const { traits }: { traits: Trait[] } = await client.request({
            document: GET_TRAIT_BY_NAME,
            variables: {
              name: trait.name,
            },
          });
          traitId = traits[0]?.id;
        } catch (error) {
          console.log("```````````FAIL error: ", error);
          return NextResponse.json({ error }, { status: 500 });
        }
        const {
          insert_traitInstances_one,
        }: { insert_traitInstances_one: any } = await client.request({
          document: ADD_TRAIT_INSTANCE,
          variables: {
            traitId,
            characterId: insert_characters_one.id,
            value: trait.value,
          },
        });
        // console.log(
        //   "```````````insert_traitInstances_one: ",
        //   insert_traitInstances_one
        // );
      }
      traits.forEach(async (trait: Trait) => {});

      // console.log("Token added: ", {
      //   mintAddress: token.mintAddress,
      //   name: token.name,
      //   imageUrl: token.imageUrl,
      // });
      // console.log("Character added: ", {
      //   name: insert_characters_one.name,
      // });
      response.push(insert_characters_one);
    } catch (error) {
      console.log("```````````FAIL error: ", error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }

  if (!response?.length) {
    return NextResponse.json({
      success: false,
      message: "Character already exists",
    });
  }

  return NextResponse.json(
    { success: true, message: "Character added", chatacter: response },
    { status: 200 }
  );
}
