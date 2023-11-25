import { useState } from "react";
import {
  BlueprintClientOptions,
  createBlueprintClient,
} from "@/app/blueprint/client";

// Assuming your API methods return a Promise of a specific type, you can define those types here.
// For example:
// interface CreateAirdropResponse { ... }

const useBlueprint = (options: BlueprintClientOptions) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Instantiate the client
  const client = createBlueprintClient(options);

  // Higher-order function to wrap client methods
  const wrapMethod =
    <T,>(method: (...args: any[]) => Promise<T>) =>
    async (...args: any[]): Promise<T> => {
      try {
        setLoading(true);
        return await method(...args);
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    };

  // Dynamically create the hook's return object
  const wrappedMethods = Object.keys(client).reduce((acc, methodName) => {
    const method = (client as any)[methodName] as (
      ...args: any[]
    ) => Promise<any>;
    acc[methodName] = wrapMethod(method);
    return acc;
  }, {} as Record<string, (...args: any[]) => Promise<any>>);

  return {
    ...wrappedMethods,
    loading,
    error,
  };
};

export default useBlueprint;
