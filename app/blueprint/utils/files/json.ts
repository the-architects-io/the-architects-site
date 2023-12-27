import { CollectionStatsFromCollectionMetadatas } from "@/app/blueprint/types";
import { ShadowFile } from "@shadow-drive/sdk";
import { NextRequest } from "next/server";

export const jsonFileToJson = async (file: File): Promise<any> => {
  const buffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(buffer);
  const jsonString = fileBuffer.toString("utf-8");
  return JSON.parse(jsonString);
};

export const jsonToJSONFile = (json: any, fileName: string): File => {
  const file = new File([JSON.stringify(json)], fileName, {
    type: "application/json",
  });
  return file;
};

export const jsonToShdwFile = (json: any, fileName: string): ShadowFile => {
  return {
    file: Buffer.from(JSON.stringify(json)),
    name: fileName,
  };
};

export const getFileFromRequest = async (req: NextRequest, name = "file") => {
  const formData = await req.formData();
  return formData.get(name) as unknown as File | null;
};

export type NftMetadata = {
  name: string;
  symbol: string;
  description: string;
  seller_fee_basis_points: number;
  image: string;
  external_url: string;
  edition: number;
  collection: {
    name: string;
    family: string;
  };
  attributes: { trait_type: string; value: string }[];
  properties: {
    files: { uri: string; type: string }[];
    category: string;
    creators: { address: string; share: number }[];
  };
};

export const isValidCollectionMetadatas = (json: any): boolean => {
  // TODO: Check if this is working, i think it is not
  const parseJson = () => {
    try {
      return JSON.parse(json);
    } catch (error) {
      return json;
    }
  };

  const collectionMetadatas: NftMetadata[] = parseJson();

  if (!Array.isArray(collectionMetadatas)) {
    return false;
  }

  const isValidMetadata = (collection: any) => {
    const {
      name,
      symbol,
      description,
      seller_fee_basis_points,
      image,
      external_url,
      edition,
      properties,
    } = collection;

    const { creators } = properties;

    if (
      !name ||
      !symbol ||
      !description ||
      !seller_fee_basis_points ||
      !image ||
      !external_url ||
      !edition ||
      !properties ||
      !creators
    ) {
      return false;
    }

    return true;
  };

  const isValid = collectionMetadatas.every(isValidMetadata);

  return isValid;
};

export const getCollectionStatsFromCollectionMetadatas = (
  json: any
): CollectionStatsFromCollectionMetadatas => {
  if (!Array.isArray(json)) {
    return {
      count: 0,
      uniqueTraits: [],
      creators: [],
    };
  }

  return {
    count: (json as []).length,
    creators: (json as [])
      .reduce((acc: any, curr: any) => {
        const { properties } = curr;
        const { creators } = properties;

        const creatorAddresses = creators.map((creator: any) => {
          return creator.address;
        });

        return [...acc, ...creatorAddresses];
      }, [])
      .filter((creatorAddress: any, index: any, array: any) => {
        return array.indexOf(creatorAddress) === index;
      }),
    uniqueTraits: Array.from(
      (json as []).reduce((acc, curr) => {
        const {
          attributes,
        }: { attributes: Array<{ trait_type: string; value: string }> } = curr;

        attributes.forEach(({ trait_type, value }) => {
          acc.add(`${trait_type}:${value}`);
        });

        return acc;
      }, new Set<string>())
    ),
  };
};
