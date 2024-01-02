import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Job } from "@/app/blueprint/types";
import { UPDATE_JOB } from "@/graphql/mutations/update-job";

export async function POST(req: NextRequest) {
  const { id, jobTypeId, percentComplete, userId, statusText, statusId } =
    await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  console.log({
    id,
    jobTypeId,
    percentComplete,
    userId,
    statusText,
    statusId,
  });

  try {
    const { update_jobs_by_pk: updatedJob }: { update_jobs_by_pk: Job } =
      await client.request(UPDATE_JOB, {
        id,
        job: {
          ...(percentComplete && { percentComplete }),
          ...(statusText && { statusText }),
          ...(statusId && { statusId }),
          ...(jobTypeId && { jobTypeId }),
          ...(userId && { userId }),
        },
      });

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
