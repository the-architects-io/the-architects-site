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
