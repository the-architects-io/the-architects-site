import { BASE_URL } from "@/constants/constants";
import { getFileFromRequest, jsonFileToJson } from "@/utils/files";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const jsonFile = await getFileFromRequest(req);
  const formData = await req.formData();
  const handoffEndpoint = formData.get("handoffEndpoint") as string | null;

  if (!jsonFile) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const jsonString = await jsonFileToJson(jsonFile);
    console.log(jsonString);
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      {
        error: "Error processing file",
        details: JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}
