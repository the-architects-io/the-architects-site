"use client";
import { useQuery } from "@apollo/client";
import { PublicKey } from "@solana/web3.js";

import Image from "next/image";
import { useEffect, useState } from "react";
import Spinner from "@/features/UI/spinner";
import { BadgeClaimButton } from "@/features/UI/buttons/badge-claim-button";
import { GET_WALLET_BY_ADDRESS } from "@/graphql/queries/get-wallet-by-address";
import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";
import { GET_DISPENSER_BY_ID } from "@/graphql/queries/get-dispenser-by-id";
import ConfettiBackground from "@/features/animations/confetti-background";

export interface ITokenClaim {
  id: string;
  walletId: string;
  tokenClaimSourceId: string;
  createdAt: string;
  userId: string;
  txAddress: string;
  claimTime: string;
}

export const BadgeClaim = ({
  walletAddress,
  dispenserId,
}: {
  walletAddress: PublicKey | null;
  dispenserId: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [wasClaimSucessful, setWasClaimSucessful] = useState(false);
  const [isEnabledClaim, setIsEnabledClaim] = useState(false);
  const [userHasBeenFetched, setUserHasBeenFetched] = useState(false);
  const [dispenser, setDispenser] = useState<Dispenser | null>(null);

  const { loading: isFetchingDispenser } = useQuery(GET_DISPENSER_BY_ID, {
    variables: { id: dispenserId },
    skip: !dispenserId,
    onCompleted: ({ dispensers_by_pk }) => {
      if (!dispensers_by_pk) return;
      setDispenser(dispensers_by_pk);
    },
  });

  // const { loading: isFetchingUser } = useQuery(GET_WALLET_BY_ADDRESS, {
  //   variables: { address: walletAddress?.toString() },
  //   skip: !walletAddress,
  //   onCompleted: (data) => {
  //     console.log("GET_WALLET_BY_ADDRESS", data);
  //     setUserHasBeenFetched(true);
  //   },
  // });

  useEffect(() => {
    if (isClaiming || isFetchingDispenser) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }

    if (isFetchingDispenser || wasClaimSucessful) {
      setIsEnabledClaim(false);
    } else {
      setIsEnabledClaim(true);
    }
  }, [isClaiming, isFetchingDispenser, wasClaimSucessful]);

  if (isClaiming) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-stone-300">
        <Spinner />
        <div className="text-4xl uppercase animate-pulse mt-4">Claiming</div>
      </div>
    );
  }

  if (wasClaimSucessful) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-stone-300">
        <div className="-mt-16">
          <ConfettiBackground />
        </div>
        <div className="text-6xl uppercase flex flex-col items-center justify-center space-y-2 font-bold tracking-wider text-center leading-normal">
          Claim
          <br /> Successful!
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen text-stone-300">
      <div className="-mt-10">
        <Image
          src={dispenser?.imageUrl || ""}
          alt="Portals badge"
          width="200"
          height="500"
          className="rounded mb-8"
        />
      </div>
      {!!dispenser && (
        <>
          <BadgeClaimButton
            dispenserId={dispenser?.id}
            walletAddress={walletAddress}
            setIsClaiming={setIsClaiming}
            setWasClaimSucessful={setWasClaimSucessful}
            isEnabledClaim={isEnabledClaim}
          />
        </>
      )}
    </div>
  );
};
