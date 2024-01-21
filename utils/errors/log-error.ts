import { createBlueprintClient } from "@/app/blueprint/client";
import { MappedErrorResponse } from "@/app/blueprint/types";
import { ENV } from "@/constants/constants";
import { client } from "@/graphql/backend-client";
import { LOG_ERROR } from "@/graphql/mutations/log-error";

export type ErrorInstance = {
  code: number;
  rawError: ErrorInstance;
};

type Params = {
  error: ErrorInstance;
  burnTxAddress?: string;
  walletId?: string;
};

export const logError = async (
  error: MappedErrorResponse | ErrorInstance,
  metadata: any = {}
) => {
  console.error({
    error,
    metadata,
  });
};

export const logErrorDeprecated = async ({
  error,
  burnTxAddress,
  walletId,
}: Params) => {
  const {
    insert_errorInstances_one,
  }: { insert_errorInstances_one: ErrorInstance[] } = await client.request(
    LOG_ERROR,
    {
      ...error,
      burnTxAddress,
      walletId,
    } as ErrorInstance
  );
};

export const handleError = async (error: Error, metadata?: any) => {
  const blueprint = createBlueprintClient({ cluster: "devnet" });

  if (ENV === "production" || ENV === "preview") {
    const { success } = await blueprint.errors.reportError({
      message: error.message,
      metadata: {
        ...metadata,
        stack: error.stack,
        name: error.name,
      },
    });
    if (!success) {
      console.log("Failed to report error to discord bot");
    }
  } else {
    console.log("Skipping sending error to bot in development");
  }

  console.log({
    error,
    metadata,
  });
};
