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

export const mapErrorToResponse = (error: any): MappedErrorResponse => {
  const status =
    error?.response?.status || error?.response?.data?.status || 500;
  console.log({
    statuses: {
      "error?.response?.status": error?.response?.status,
      "error?.response?.data?.status": error?.response?.data?.status,
      status: status,
    },
  });
  const statusText =
    error?.response?.data?.statusText || "Internal Server Error";
  const message = error?.response?.statusText || "Internal Server Error";
  const errorMessage = error?.response?.data?.error;

  return {
    status: status || 500,
    error: { message, errorMessage, status, statusText },
  };
};

export const logMappedError = async (
  error: MappedErrorResponse,
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
