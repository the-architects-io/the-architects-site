import { Collection, Creator } from "@/app/blueprint/types";
import { client } from "@/graphql/backend-client";
import { ADD_CREATORS } from "@/graphql/mutations/add-creators";
import { UPDATE_COLLECTION } from "@/graphql/mutations/update-collection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    imageUrl,
    id,
    name,
    symbol,
    description,
    sellerFeeBasisPoints,
    creators,
    driveAddress,
    isReadyToMint,
  } = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  // todo: NEED TO BE ABLE TO CREATE NEW DRIVE FOR COLLECTION

  console.log({ creators });

  if (creators.length > 1) {
    let addedCreators;
    try {
      const {
        insert_creators,
      }: { insert_creators: { returning: { id: string }[] } } =
        await client.request(ADD_CREATORS, {
          creators: creators.map((creator: Creator) => ({
            ...creator,
            collectionId: id,
          })),
        });
      addedCreators = insert_creators.returning;
    } catch (error) {
      return NextResponse.json(
        { error: "Error adding creators" },
        { status: 500 }
      );
    }
  }

  let updatedCollection;
  try {
    const {
      update_collections_by_pk,
    }: { update_collections_by_pk: Collection } = await client.request(
      UPDATE_COLLECTION,
      {
        id,
        collection: {
          ...(imageUrl && { imageUrl }),
          ...(name && { name }),
          ...(symbol && { symbol }),
          ...(description && { description }),
          ...(sellerFeeBasisPoints && { sellerFeeBasisPoints }),
          ...(isReadyToMint && { isReadyToMint }),
          ...(driveAddress && { driveAddress }),
        },
      }
    );
    updatedCollection = update_collections_by_pk;
  } catch (error) {
    console.log("error", error);
    return NextResponse.json(
      { error: "Error updating collection" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Collection updated", updatedCollection },
    { status: 200 }
  );
}
