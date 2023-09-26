// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Account, NoopResponse } from "@/app/blueprint/types";
import { User } from "@/features/admin/users/users-list-item";
import { client } from "@/graphql/backend-client";
import { ADD_ACCOUNT } from "@/graphql/mutations/add-account";
import { UPDATE_USER } from "@/graphql/mutations/update-user";
import { logErrorDeprecated } from "@/utils/errors/log-error";
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
  logErrorDeprecated({
    error: {
      code: 2,
      message: "Attempting to save Discord account info",
      rawError: JSON.stringify(req.body),
    },
  });
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

  logErrorDeprecated({
    error: {
      code: 3,
      message: "Attempting to save Discord account info",
      rawError: JSON.stringify(req.body),
    },
  });

  if (!imageUrl || !providerId || !providerAccountId || !username) {
    logErrorDeprecated({
      error: {
        code: 500,
        message: "Could not save Discord account info",
        rawError: JSON.stringify({
          discordUser: req.body,
        }),
      },
    });
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

  logErrorDeprecated({
    error: {
      code: 4,
      message: "Attempting to save Discord account info",
      rawError: JSON.stringify(req.body),
    },
  });

  try {
    const { insert_accounts_one }: { insert_accounts_one: Account } =
      await client.request({
        document: ADD_ACCOUNT,
        variables,
      });

    logErrorDeprecated({
      error: {
        code: 5,
        message: "Attempting to save Discord account info",
        rawError: JSON.stringify(req.body),
      },
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

    logErrorDeprecated({
      error: {
        code: 6,
        message: "Attempting to save Discord account info",
        rawError: JSON.stringify(req.body),
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
    logErrorDeprecated({
      error: {
        code: 500,
        message: "Could not save Discord account info",
        rawError: JSON.stringify({
          error,
          discordUser: req.body,
        }),
      },
    });
    return NextResponse.json({ error }, { status: 500 });
  }
}
