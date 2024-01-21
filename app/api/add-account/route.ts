// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Account, NoopResponse } from "@/app/blueprint/types";
import { User } from "@/features/admin/users/users-list-item";
import { client } from "@/graphql/backend-client";
import { ADD_ACCOUNT } from "@/graphql/mutations/add-account";
import { UPDATE_USER } from "@/graphql/mutations/update-user";
import { handleError, logErrorDeprecated } from "@/utils/errors/log-error";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export type UserAndAccountResponse = {
  account: Account;
  user: User;
};

type Data =
  | UserAndAccountResponse
  | NoopResponse
  | {
      error: unknown;
    };

export async function POST(req: NextRequest) {
  const {
    accessToken,
    tokenType,
    imageUrl,
    email,
    providerId,
    providerAccountId,
    username,
    userId,
    noop = false,
  } = await req.json();

  if (noop)
    return NextResponse.json(
      {
        noop: true,
        endpoint: "add-account",
      },
      { status: 200 }
    );

  console.log({
    accessToken,
    tokenType,
    imageUrl,
    email,
    providerId,
    providerAccountId,
    username,
    userId,
  });

  if (!imageUrl || !providerId || !providerAccountId || !username) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  const variables = {
    imageUrl,
    email,
    providerId,
    providerAccountId,
    username,
    userId,
    tokenType,
    accessToken,
  };

  try {
    const { insert_accounts_one }: { insert_accounts_one: Account } =
      await client.request({
        document: ADD_ACCOUNT,
        variables,
      });

    const { update_users_by_pk }: { update_users_by_pk: User } =
      await client.request({
        document: UPDATE_USER,
        variables: {
          id: userId,
          setInput: {
            name: username,
            email: email,
            imageUrl: imageUrl,
          },
        },
      });

    console.log("insert_accounts_one: ", insert_accounts_one);

    return NextResponse.json(
      {
        account: insert_accounts_one,
        user: update_users_by_pk,
      },
      { status: 200 }
    );
  } catch (error) {
    handleError(error as Error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
