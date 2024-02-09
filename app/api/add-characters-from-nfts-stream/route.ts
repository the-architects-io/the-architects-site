import {
  AddCharactersResponse,
  AddTraitInstancesResponse,
  AddTraitsResponse,
  Attribute,
  ModeledNftMetadata,
  Token,
  Trait,
} from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import { client } from "@/graphql/backend-client";
import {
  ADD_CHARACTERS,
  ADD_TRAIT_INSTANCES,
  ADD_TRAITS,
} from "@the-architects/blueprint-graphql";
import { Mint } from "@metaplex-foundation/js";
import { DigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { NextRequest } from "next/server";

const CHUNK_SIZE = 10;

const isAsset = (
  entity: DigitalAsset | Mint | Token
): entity is DigitalAsset => {
  return "mint" in entity && entity.mint ? true : false;
};

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

  // const connection = new Connection(getRpcEndpoint());
  // const metaplex = Metaplex.make(connection);
  // const mints = hashListChunk.map((address) => new PublicKey(address));
  // const nftMetasFromMetaplex = await metaplex
  //   .nfts()
  //   .findAllByMintList({ mints });

  // if (!nftMetasFromMetaplex.length) {
  //   throw new Error("No nfts fetched from metaplex");
  // }

  // const nftsWithMetadata = await fetchNftsWithMetadata(
  //   nftMetasFromMetaplex,
  //   metaplex
  // );
  const nftsWithMetadata: ModeledNftMetadata[] = [];
  const tokensToInsert = [];
  const charactersToInsert = [];
  const traitsToInsert = new Set();
  const traitInstancesToInsert = [];

  // first get the tokens that are already in the db
  // const res = await fetch(`${BASE_URL}/api/get-tokens-by-mint-addresses`, {
  //   method: "POST",
  //   body: JSON.stringify({
  //     mintAddresses: hashListChunk,
  //   }),
  // });

  // const { tokens }: { tokens: Token[] } = await res.json();

  // instead of fetching all tokens we'll let add-tokens handle it
  // and pass back all tokens that were added
  const tokens: Token[] = [];

  const res = await fetch(`${BASE_URL}/api/add-tokens`, {
    method: "POST",
    body: JSON.stringify({
      mintAddresses: hashListChunk,
    }),
  });

  const {
    assets: allTokens,
    addedTokens,
  }: { assets: DigitalAsset[]; addedTokens: Token[] } = await res.json();

  const metadatasToProcess = shouldOverwrite ? allTokens : addedTokens;

  if (shouldOverwrite) {
    const charactersRes = await fetch(
      `${BASE_URL}/api/remove-characters-by-mint-addresses`,
      {
        method: "POST",
        body: JSON.stringify({
          mintAddresses: hashListChunk,
        }),
      }
    );

    const { status: charactersStatus } = await charactersRes.json();

    if (charactersStatus !== 200) {
      throw new Error("Could not remove characters");
    }

    const tokensRes = await fetch(
      `${BASE_URL}/api/remove-tokens-by-mint-addresses`,
      {
        method: "POST",
        body: JSON.stringify({
          mintAddresses: hashListChunk,
        }),
      }
    );

    const { status: tokensStatus } = await tokensRes.json();

    if (tokensStatus !== 200) {
      throw new Error("Could not remove tokens");
    }
  }

  for (let nft of metadatasToProcess) {
    if (!isAsset(nft)) {
      continue;
    }
    const { metadata, publicKey } = nft;
    const { symbol, name, uri } = metadata;

    const { image, attributes } = await fetch(uri).then((res) => res.json());

    const traits =
      attributes
        ?.map(({ trait_type, value }: Attribute) => ({
          name: trait_type || "",
          value: value || "",
        }))
        .filter(({ name, value }: Trait) => name !== "" && value !== "") || [];

    charactersToInsert.push({
      name,
      imageUrl: image,
      mintAddress: publicKey.toString(),
      traits,
    });

    if (!traits?.length) continue;

    for (let trait of traits) {
      traitsToInsert.add(trait.name);
    }
  }

  const mintAddressToTokenId: Record<string, string> = {};
  addedTokens.forEach((token) => {
    if (token.mintAddress && typeof token.id === "string") {
      mintAddressToTokenId[token.mintAddress] = token.id;
    }
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
    if (trait.name && trait.id) {
      traitNameToId[trait.name] = trait.id;
    }
  });

  const charactersResponse: AddCharactersResponse = await client.request({
    document: ADD_CHARACTERS,
    variables: {
      characters: charactersToInsert.map((character) => {
        return {
          ...character,
          tokenId: mintAddressToTokenId[character.mintAddress],
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
    numberOfTokensAdded: addedTokens?.length || 0,
    numberOfTokensSkipped:
      hashListChunk.length - (addedTokens?.length || 0) || 0,
  };
};

// Generator function for processing hashlist and streaming updates
async function* makeProcessingIterator(
  hashList: string,
  nftCollectionId: string,
  shouldOverwrite: boolean
) {
  // Acknowledge the receipt to the client
  // yield new TextEncoder().encode("Received hashlist. Starting processing...\n");

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

// export const runtime = "edge";
// export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { hashList, nftCollectionId, shouldOverwrite } = await req.json();

  const iterator = makeProcessingIterator(
    hashList,
    nftCollectionId,
    shouldOverwrite
  );
  const stream = iteratorToStream(iterator);

  return new Response(stream);
}
