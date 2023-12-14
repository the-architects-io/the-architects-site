import { CreateUploadJobInput, UploadJob } from "@/app/blueprint/types";
import { client } from "@/graphql/backend-client";
import { ADD_UPLOAD_JOB } from "@/graphql/mutations/add-upload-job";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { sizeInBytes, userId }: CreateUploadJobInput = await req.json();

  console.log({ sizeInBytes, userId });

  if (!sizeInBytes || !userId) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing required fields",
      },
      { status: 400 }
    );
  }

  const {
    insert_uploadJobs_one,
  }: {
    insert_uploadJobs_one: UploadJob;
  } = await client.request({
    document: ADD_UPLOAD_JOB,
    variables: {
      job: {
        sizeInBytes,
        userId,
        isComplete: false,
      },
    },
  });

  return NextResponse.json(
    {
      success: true,
      job: insert_uploadJobs_one,
    },
    {
      status: 200,
    }
  );
}
