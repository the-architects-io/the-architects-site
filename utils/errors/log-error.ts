import { MappedErrorResponse } from "@/app/blueprint/types";
import { client } from "@/graphql/backend-client";
import { LOG_ERROR } from "@/graphql/mutations/log-error";

export type ErrorInstance = {
  code: number;
  message: string;
  rawError: string;
};

type Params = {
  error: ErrorInstance;
  burnTxAddress?: string;
  walletId?: string;
};

export const logError = async (error: MappedErrorResponse, metadata?: any) => {
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
