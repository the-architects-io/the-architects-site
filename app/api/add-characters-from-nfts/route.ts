import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { RPC_ENDPOINT } from "@/constants/constants";
import { fetchNftsWithMetadata } from "@/utils/nfts/fetch-nfts-with-metadata";
import { ADD_TOKENS } from "@/graphql/mutations/add-tokens";
import {
  AddCharactersResponse,
  AddTokensResponse,
  AddTraitInstancesResponse,
  AddTraitsResponse,
  Character,
  Token,
  Trait,
  TraitInstance,
} from "@/app/blueprint/types";
import { ADD_TRAITS } from "@/graphql/mutations/add-traits";
import { ADD_TRAIT_INSTANCES } from "@/graphql/mutations/add-trait-instances";
import { ADD_CHARACTERS } from "@/graphql/mutations/add-characters";
import { GET_TOKENS_BY_MINT_ADDRESSES } from "@/graphql/queries/get-tokens-by-mint-addresses";

export async function POST(req: NextRequest) {
  const { hashList, noop } = await req.json();

  if (noop)
    return NextResponse.json(
      {
        noop: true,
        endpoint: "add-character-from-nfts",
      },
      { status: 200 }
    );

  const jsonHashList: string[] = JSON.parse(hashList);
  if (!jsonHashList.length) {
    return NextResponse.json(
      { error: "Could not resolve hash list" },
      { status: 500 }
    );
  }

  const connection = new Connection(RPC_ENDPOINT);
  const metaplex = Metaplex.make(connection);
  const mints = jsonHashList.map((address) => new PublicKey(address));
  const nftMetasFromMetaplex = await metaplex
    .nfts()
    .findAllByMintList({ mints });

  if (!nftMetasFromMetaplex.length) {
    return NextResponse.json(
      { error: "No nfts fetched from metaplex" },
      { status: 500 }
    );
  }

  const nftsWithMetadata = await fetchNftsWithMetadata(
    nftMetasFromMetaplex,
    metaplex
  );

  const tokensToInsert = [];
  const charactersToInsert = [];
  const traitsToInsert = new Set();
  const traitInstancesToInsert = [];

  // first get the tokens that are already in the db
  const { tokens }: { tokens: Token[] } = await client.request({
    document: GET_TOKENS_BY_MINT_ADDRESSES,
    variables: {
      mintAddresses: jsonHashList,
    },
  });

  const existingMintAddressesSet = new Set(
    tokens.map((token) => token.mintAddress)
  );

  const nonExistingNftsWithMetadataFiltered = nftsWithMetadata.filter(
    (nft) => !existingMintAddressesSet.has(nft.mintAddress)
  );

  for (let nft of nonExistingNftsWithMetadataFiltered) {
    const { mintAddress, imageUrl, symbol, name, traits } = nft;

    tokensToInsert.push({
      decimals: 0,
      imageUrl,
      mintAddress,
      symbol,
      name,
    });
    charactersToInsert.push({
      name,
      imageUrl,
      tokenId: mintAddress,
    });

    if (!traits?.length) continue;

    for (let trait of traits) {
      traitsToInsert.add(trait.name);
    }
  }

  // then filter out the ones that are already in the db
  const existingMintAddresses = tokens.map((token: Token) => token.mintAddress);

  const tokensToAdd = tokensToInsert.filter(
    (token) => !existingMintAddresses.includes(token.mintAddress)
  );

  const tokensResponse: AddTokensResponse = await client.request({
    document: ADD_TOKENS,
    variables: {
      tokens: tokensToInsert,
    },
  });

  const mintAddressToTokenId: Record<string, string> = {};
  tokensResponse?.insert_tokens?.returning.forEach((token) => {
    mintAddressToTokenId[token.mintAddress] = token.id;
  });

  const traitsResponse: AddTraitsResponse = await client.request({
    document: ADD_TRAITS,
    variables: {
      traits: Array.from(traitsToInsert).map((traitName) => ({
        name: traitName,
      })),
    },
  });

  const traitNameToId: Record<string, string> = {};
  traitsResponse?.insert_traits?.returning.forEach((trait) => {
    traitNameToId[trait.name] = trait.id;
  });

  const charactersResponse: AddCharactersResponse = await client.request({
    document: ADD_CHARACTERS,
    variables: {
      characters: charactersToInsert.map((character) => {
        return {
          ...character,
          tokenId: mintAddressToTokenId[character.tokenId],
        };
      }),
    },
  });

  for (let nft of nftsWithMetadata) {
    const { traits, mintAddress } = nft;
    if (!traits?.length) continue;

    for (let trait of traits) {
      traitInstancesToInsert.push({
        value: trait.value,
        traitId: traitNameToId[trait.name],
      });
    }
  }

  const traitInstancesResponse: AddTraitInstancesResponse =
    await client.request({
      document: ADD_TRAIT_INSTANCES,
      variables: {
        traitInstances: traitInstancesToInsert,
      },
    });

  return NextResponse.json(
    {
      success: true,
      numberOfTokensSkipped: existingMintAddressesSet.size,
      numberOfTokensAdded: tokensToAdd.length,
      numberOfCharactersAdded:
        nftsWithMetadata.length - existingMintAddressesSet.size,
      numberOfCharactersSkipped: existingMintAddressesSet.size,
      numberOfTraitsSkipped: traitsResponse?.insert_traits?.affected_rows || 0,
      numberOfTraitsAdded: traitsResponse?.insert_traits?.affected_rows || 0,
      numberOfTraitInstancesAdded:
        traitInstancesResponse?.insert_traitInstances?.affected_rows || 0,
    },
    { status: 200 }
  );
}
