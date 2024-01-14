import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UploadJob } from "@/app/blueprint/types";
import { UPDATE_UPLOAD_JOB } from "@/graphql/mutations/update-upload-job";

export async function POST(req: NextRequest) {
  const {
    id,
    isComplete,
    log,
    percentComplete,
    sizeInBytes,
    statusId,
    statusText,
    driveAddress,
    fileCount,
    icon,
  } = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  console.log({
    id,
    isComplete,
    log,
    percentComplete,
    sizeInBytes,
    statusId,
    statusText,
    driveAddress,
    fileCount,
    icon,
  });

  try {
    const {
      update_uploadJobs_by_pk: updatedJob,
    }: { update_uploadJobs_by_pk: UploadJob } = await client.request(
      UPDATE_UPLOAD_JOB,
      {
        id,
        job: {
          ...(isComplete && { isComplete }),
          ...(log && { log }),
          ...(percentComplete && { percentComplete }),
          ...(sizeInBytes && { sizeInBytes }),
          ...(statusId && { statusId }),
          ...(statusText && { statusText }),
          ...(driveAddress && { driveAddress }),
          ...(fileCount && { fileCount }),
          ...(icon && { icon }),
        },
      }
    );

    console.log({ updatedJob });

    if (!updatedJob) {
      return NextResponse.json(
        { error: "There was an unexpected error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ job: updatedJob }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "There was an unexpected error" },
      { status: 500 }
    );
  }
}
