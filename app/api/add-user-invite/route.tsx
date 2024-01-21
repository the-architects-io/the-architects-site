import { AddUserInviteInput, UploadJob } from "@/app/blueprint/types";
import { client } from "@/graphql/backend-client";
import { ADD_USER_INVITE } from "@/graphql/mutations/add-user-invite";
import { handleError } from "@/utils/errors/log-error";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId, invitedUserId }: AddUserInviteInput = await req.json();

  console.log({ userId, invitedUserId });

  if (!userId || !invitedUserId) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing required fields",
      },
      { status: 400 }
    );
  }

  try {
    const {
      insert_uploadJobs_one,
    }: {
      insert_uploadJobs_one: UploadJob;
    } = await client.request({
      document: ADD_USER_INVITE,
      variables: {
        userId,
        invitedUserId,
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
  } catch (error) {
    handleError(error as Error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create upload job",
      },
      { status: 500 }
    );
  }
}
