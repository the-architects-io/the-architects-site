import { CreateJobInput, Job } from "@/app/blueprint/types";
import { client } from "@/graphql/backend-client";
import { ADD_JOB } from "@/graphql/mutations/add-job";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    userId,
    statusText,
    statusId,
    percentComplete,
    jobTypeId,
  }: CreateJobInput = await req.json();

  if (!userId || !jobTypeId) {
    return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  }

  try {
    const { insert_jobs_one: job }: { insert_jobs_one: Job } =
      await client.request(ADD_JOB, {
        job: {
          ...(userId && { userId }),
          ...(jobTypeId && { jobTypeId }),
          ...(statusText && { statusText }),
          ...(statusId && { statusId }),
          ...(percentComplete && { percentComplete }),
        },
      });

    console.log({ job });

    if (!job) {
      return NextResponse.json(
        { error: "There was an unexpected error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ job }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "There was an unexpected error" },
      { status: 500 }
    );
  }
}
