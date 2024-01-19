import { InviteCode, RefreshUploadInput } from "@/app/blueprint/types";
import { client } from "@/graphql/backend-client";
import { ADD_INVITE_CODE } from "@/graphql/mutations/add-invite-code";
import { DELETE_INVITE_CODE } from "@/graphql/mutations/delete-invite-code";
import { GET_INVITE_CODE } from "@/graphql/queries/get-invite-code";
import { GET_INVITE_CODE_BY_USER_ID } from "@/graphql/queries/get-invite-code-by-user-id";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const generateRandomCode = () => {
  // Generate a number between 0 and 999999
  const randomNum = Math.floor(Math.random() * 1000000);

  // Convert to a string with leading zeros if needed
  const sixDigitCode = String(randomNum).padStart(6, "0");

  return sixDigitCode;
};

export async function POST(req: NextRequest) {
  const { userId }: RefreshUploadInput = await req.json();

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing required fields",
      },
      { status: 400 }
    );
  }

  let code = null;
  let codeId = null;
  try {
    const {
      inviteCodes,
    }: {
      inviteCodes: InviteCode[];
    } = await client.request({
      document: GET_INVITE_CODE_BY_USER_ID,
      variables: {
        userId,
      },
    });

    if (inviteCodes.length > 0) {
      code = inviteCodes[0].code;
      codeId = inviteCodes[0].id;
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get invite code",
      },
      { status: 500 }
    );
  }

  if (code) {
    try {
      const {
        delete_inviteCodes_by_pk: deletedInviteCode,
      }: {
        delete_inviteCodes_by_pk: InviteCode;
      } = await client.request({
        document: DELETE_INVITE_CODE,
        variables: {
          id: codeId,
        },
      });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete invite code",
        },
        { status: 500 }
      );
    }
  }

  let newCode = generateRandomCode();

  // Make sure the code is unique in the database
  try {
    const {
      inviteCodes,
    }: {
      inviteCodes: InviteCode[];
    } = await client.request({
      document: GET_INVITE_CODE,
      variables: {
        code: newCode,
      },
    });

    if (inviteCodes.length > 0) {
      while (inviteCodes.length > 0) {
        newCode = generateRandomCode();

        const {
          inviteCodes,
        }: {
          inviteCodes: InviteCode[];
        } = await client.request({
          document: GET_INVITE_CODE,
          variables: {
            code: newCode,
          },
        });
      }
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get invite code",
      },
      { status: 500 }
    );
  }

  try {
    const {
      insert_inviteCodes_one: inviteCode,
    }: {
      insert_inviteCodes_one: InviteCode;
    } = await client.request({
      document: ADD_INVITE_CODE,
      variables: {
        userId,
        code: newCode,
      },
    });

    const { code, createdAt, updatedAt } = inviteCode;

    return NextResponse.json(
      {
        success: true,
        code,
        createdAt,
        updatedAt,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create upload job",
      },
      { status: 500 }
    );
  }
}
