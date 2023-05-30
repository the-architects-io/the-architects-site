"use client";

import { Panel } from "@/features/UI/panel";
import {
  BugAntIcon,
  HandRaisedIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { useDebugMode } from "@/hooks/debug-mode";
import Link from "next/link";
import axios from "axios";
import showToast from "@/features/toasts/show-toast";
import { useState } from "react";
import { ErrorInstance } from "@/utils/log-error";
import { useUser } from "@/hooks/user";

export const ToolsList = () => {
  const { isDebugMode, setIsDebugMode } = useDebugMode();
  const [isPoking, setIsPoking] = useState(false);
  const [end, setEnd] = useState(2000);
  const { user } = useUser();
  const [isLoggingTestError, setIsLoggingTestError] = useState(false);

  const logTestError = async () => {
    setIsLoggingTestError(true);
    await axios.post("/api/test-error", {
      error: {
        code: 500,
        message: "test error",
        rawError: JSON.stringify({ test: "test" }),
      } as ErrorInstance,
      walletId: user?.primaryWallet?.id || user?.wallets?.[0]?.id,
      burnTxAddress: "test",
    });
    showToast({ primaryMessage: "Test error logged" });
    setIsLoggingTestError(false);
  };

  const pokeEndpoints = async ({
    shouldFetchConcurrently,
  }: {
    shouldFetchConcurrently: boolean;
  }) => {
    setIsPoking(true);
    const { data } = await axios.post("/api/poke-endpoints", {
      shouldFetchConcurrently,
    });
    showToast({ primaryMessage: data?.message || "Endpoints poked" });
    setIsPoking(false);
  };

  return (
    <Panel className="space-y-4">
      <div className="flex items-center px-4">
        <div className="mr-2"># of hashes to fetch:</div>
        <input
          type="text"
          className="p-3 rounded-2xl bg-gray-900 flex items-center justify-center w-full text-stone-300 text-xl"
          placeholder="End"
          value={end}
          onChange={(event) => {
            setEnd(Number((event.target as HTMLInputElement).value));
          }}
        />
      </div>
      <button
        onClick={() => setIsDebugMode(!isDebugMode)}
        className="p-3 rounded-2xl bg-gray-900 flex items-center justify-center w-full text-stone-300 text-xl"
      >
        <BugAntIcon className="w-6 h-6 mr-2" />
        <div>{isDebugMode ? "Disable" : "Enable"} Debug Mode</div>
      </button>
      <button
        onClick={logTestError}
        className="p-3 rounded-2xl bg-gray-900 flex items-center justify-center w-full text-stone-300 text-xl"
      >
        {isLoggingTestError ? "Logging..." : "Log test error"}
      </button>
      <Link
        href="/admin/fetch"
        className="p-3 rounded-2xl bg-gray-900 flex items-center justify-center w-full text-stone-300 text-xl"
      >
        <PlusCircleIcon className="w-6 h-6 mr-2" />
        Add creature
      </Link>
      <button
        onClick={() => pokeEndpoints({ shouldFetchConcurrently: true })}
        className="p-3 rounded-2xl bg-gray-900 flex items-center justify-center w-full text-stone-300 text-xl"
        disabled={isPoking}
      >
        <HandRaisedIcon className="w-6 h-6 mr-2" />
        {isPoking ? "Poking..." : "Poke endpoints (Concurrently)"}
      </button>
      <button
        onClick={() => pokeEndpoints({ shouldFetchConcurrently: false })}
        className="p-3 rounded-2xl bg-gray-900 flex items-center justify-center w-full text-stone-300 text-xl"
        disabled={isPoking}
      >
        <HandRaisedIcon className="w-6 h-6 mr-2" />
        {isPoking ? "Poking..." : "Poke endpoints (Sequentially)"}
      </button>
    </Panel>
  );
};
