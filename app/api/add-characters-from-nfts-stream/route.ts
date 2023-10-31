import {
  AddCharactersResponse,
  AddTokensResponse,
  AddTraitInstancesResponse,
  AddTraitsResponse,
  Token,
} from "@/app/blueprint/types";
import { RPC_ENDPOINT } from "@/constants/constants";
import { client } from "@/graphql/backend-client";
import { ADD_CHARACTERS } from "@/graphql/mutations/add-characters";
import { ADD_TOKENS } from "@/graphql/mutations/add-tokens";
import { ADD_TRAIT_INSTANCES } from "@/graphql/mutations/add-trait-instances";
import { ADD_TRAITS } from "@/graphql/mutations/add-traits";
import { REMOVE_CHARACTERS_BY_MINT_ADDRESSES } from "@/graphql/mutations/remove-characters-by-mint-addresses";
import { REMOVE_TOKENS_BY_MINT_ADDRESSES } from "@/graphql/mutations/remove-tokens-by-mint-addresses";
import { GET_TOKENS_BY_MINT_ADDRESSES } from "@/graphql/queries/get-tokens-by-mint-addresses";
import { fetchNftsWithMetadata } from "@/utils/nfts/fetch-nfts-with-metadata";
import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { NextRequest } from "next/server";

const CHUNK_SIZE = 10;

// Breaks up the array into smaller chunks
function chunkArray(array: any[], chunkSize: number) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

const calculateProgress = (
  currentChunkIndex: number,
  totalChunks: number
): number => {
  // Calculate the progress as a ratio of processed chunks to total chunks
  const progress = ((currentChunkIndex + 1) / totalChunks) * 100;

  // Return the progress rounded to two decimal places
  return Math.round(progress * 100) / 100;
};

// Converts a generator function to a readable stream
function iteratorToStream(iterator: AsyncGenerator) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

const handleHashListChunk = async (
  hashListChunk: string[],
  nftCollectionId: string,
  shouldOverwrite: boolean
) => {
  if (!hashListChunk?.length) {
    throw new Error("Could not resolve hash list");
  }

  const connection = new Connection(RPC_ENDPOINT);
  const metaplex = Metaplex.make(connection);
  const mints = hashListChunk.map((address) => new PublicKey(address));
  const nftMetasFromMetaplex = await metaplex
    .nfts()
    .findAllByMintList({ mints });

  if (!nftMetasFromMetaplex.length) {
    throw new Error("No nfts fetched from metaplex");
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
      mintAddresses: hashListChunk,
    },
  });

  const existingMintAddressesSet = new Set(
    tokens.map((token) => token.mintAddress)
  );

  const nonExistingNftsWithMetadataFiltered = nftsWithMetadata.filter(
    (nft) => !existingMintAddressesSet.has(nft.mintAddress)
  );

  const metadatasToProcess = shouldOverwrite
    ? nftsWithMetadata
    : nonExistingNftsWithMetadataFiltered;

  if (shouldOverwrite) {
    // delete all existing characters for this collection
    await client.request({
      document: REMOVE_CHARACTERS_BY_MINT_ADDRESSES,
      variables: {
        mintAddresses: hashListChunk,
      },
    });

    // delete all existing tokens for this collection
    await client.request({
      document: REMOVE_TOKENS_BY_MINT_ADDRESSES,
      variables: {
        mintAddresses: hashListChunk,
      },
    });
  }

  for (let nft of metadatasToProcess) {
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
          nftCollectionId,
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

  return {
    numberOfTokensAdded: tokensResponse?.insert_tokens?.affected_rows || 0,
    numberOfTokensSkipped:
      hashListChunk.length - tokensResponse?.insert_tokens?.affected_rows || 0,
    numberOfCharactersAdded:
      charactersResponse?.insert_characters?.affected_rows || 0,
    numberOfCharactersSkipped: hashListChunk.length - charactersToInsert.length,
  };
};

// Generator function for processing hashlist and streaming updates
async function* makeProcessingIterator(
  hashList: string,
  nftCollectionId: string,
  shouldOverwrite: boolean
) {
  // Acknowledge the receipt to the client
  yield new TextEncoder().encode("Received hashlist. Starting processing...\n");

  const jsonHashList = JSON.parse(hashList);

  // Split the hashList into manageable chunks
  const chunks = chunkArray(jsonHashList, CHUNK_SIZE);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      const chunkRes = await handleHashListChunk(
        chunk,
        nftCollectionId,
        shouldOverwrite
      );
      const progress = calculateProgress(i, chunks.length);
      yield new TextEncoder().encode(JSON.stringify({ progress, ...chunkRes }));
    } catch (error) {
      // Handle any errors in processing this chunk, maybe retry or log
      yield new TextEncoder().encode(
        `Error processing chunk: ${JSON.stringify(error)}\n`
      );
    }
  }

  yield new TextEncoder().encode("Processing complete.\n");
}

export async function POST(req: NextRequest) {
  const { hashList, nftCollectionId, shouldOverwrite } = await req.json();

  const iterator = makeProcessingIterator(
    hashList,
    nftCollectionId,
    shouldOverwrite
  );
  const stream = iteratorToStream(iterator);

  console.log({
    shouldOverwrite,
  });

  return new Response(stream);
}
