"use client";
import { useQuery } from "@apollo/client";
import { PublicKey } from "@solana/web3.js";

import { useEffect, useState } from "react";
import Spinner from "@/features/UI/spinner";
import { GET_DISPENSER_BY_ID } from "@the-architects/blueprint-graphql";

import ConfettiBackground from "@/features/animations/confetti-background";
import { DispenserClaimButton } from "@/features/UI/buttons/dispenser-claim-button";
import { BASE_URL, BUILD_REWARD_WALLET } from "@/constants/constants";
import axios from "axios";
import { BuildTokenVestingDetails } from "@/features/dispensers/details/build-token-vesting-details";
import { Dispenser, ModeledNftMetadata } from "@/app/blueprint/types";
import { useUserData } from "@nhost/nextjs";
import { handleError } from "@/utils/errors/log-error";

export interface ITokenClaim {
  id: string;
  walletId: string;
  tokenClaimSourceId: string;
  createdAt: string;
  userId: string;
  txAddress: string;
  claimTime: string;
}

export const DispenserClaim = ({
  walletAddress,
  dispenserId,
  numberOfDaoNftsHeld,
  isFetching,
  lastClaimTime,
  collectionNfts,
}: {
  walletAddress: PublicKey | null;
  dispenserId: string;
  numberOfDaoNftsHeld?: number;
  isFetching?: boolean;
  lastClaimTime?: string;
  collectionNfts?: ModeledNftMetadata[];
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [wasClaimSucessful, setWasClaimSucessful] = useState(false);
  const [isEnabledClaim, setIsEnabledClaim] = useState(false);
  const [dispenser, setDispenser] = useState<Dispenser | null>(null);
  const [isDispenserEmpty, setIsDispenserEmpty] = useState(false);
  const [txAddress, setTxAddress] = useState<string | null>(null);
  const [inStockAmount, setInStockAmount] = useState(0);
  const [hasBeenFetched, setHasBeenFetched] = useState(false);
  const user = useUserData();

  const setupDispenser = async (dispenser: Dispenser) => {
    const { rewardCollections } = dispenser;
    const { mintAddress } = rewardCollections[0].itemCollection.item.token;
    const { data } = await axios.post(
      `${BASE_URL}/api/get-token-balances-from-helius`,
      {
        walletAddress: BUILD_REWARD_WALLET,
        mintAddresses: [mintAddress],
        cluster: "mainnet",
      }
    );
    const amount = data?.[0]?.amount || 0;
    console.log({ data });
    setInStockAmount(amount);
    setIsDispenserEmpty(amount === 0);
    setHasBeenFetched(true);
    if (amount === 0) setIsEnabledClaim(false);
  };

  useQuery(GET_DISPENSER_BY_ID, {
    variables: { id: dispenserId },
    skip: !dispenserId,
    onCompleted: async ({ dispensers_by_pk: dispenser }) => {
      if (!dispenser) return;
      try {
        setDispenser(dispenser);
        setupDispenser(dispenser);
      } catch (error) {
        handleError(error as Error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    console.log({
      isFetching,
      numberOfDaoNftsHeld,
      lastClaimTime,
      collectionNfts,
      dispenser,
    });

    if (wasClaimSucessful) {
      setIsEnabledClaim(false);
    }
  }, [
    collectionNfts,
    dispenser,
    isFetching,
    lastClaimTime,
    numberOfDaoNftsHeld,
    wasClaimSucessful,
  ]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-white">
        <Spinner />
      </div>
    );
  }

  if (isClaiming) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-white">
        <Spinner />
        <div className="text-4xl uppercase animate-pulse mt-4">
          Transferring
        </div>
      </div>
    );
  }

  if (wasClaimSucessful) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-white">
        <div className="-mt-16">
          <ConfettiBackground />
        </div>
        <div className="text-6xl uppercase flex flex-col items-center justify-center space-y-2 font-bold tracking-wider text-center leading-normal mb-4">
          Transfer
          <br /> Successful!
          <a
            href={`https://solscan.io/tx/${txAddress}`}
            target="_blank"
            rel="noreferrer"
            className="underline text-sm pt-8"
          >
            View transaction
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen">
      {!!dispenser && (
        <>
          {/* <>
            <div>inStockAmount: {inStockAmount}</div>
            <div>wasClaimSucessful: {wasClaimSucessful.toString()}</div>
            <div>isEnabledClaim: {isEnabledClaim.toString()}</div>
          </> */}
          <BuildTokenVestingDetails
            walletAddress={walletAddress}
            numberOfDaoNftsHeld={numberOfDaoNftsHeld || 0}
            lastClaimTime={lastClaimTime}
            hasBeenFetched={hasBeenFetched}
            tokenClaimSource={dispenser}
            isEnabledClaim={isEnabledClaim}
            isLoading={isLoading || !!isFetching}
            setIsEnabledClaim={setIsEnabledClaim}
          />
          <DispenserClaimButton
            isClaimed={isClaimed}
            setIsClaimed={setIsClaimed}
            dispenserId={dispenser?.id}
            walletAddress={walletAddress}
            setIsClaiming={setIsClaiming}
            setWasClaimSucessful={setWasClaimSucessful}
            hasBeenFetched={hasBeenFetched}
            isEnabledClaim={isEnabledClaim}
            setTxAddress={setTxAddress}
            mintAddresses={collectionNfts?.map((nft) => nft.mintAddress)}
          />
        </>
      )}
    </div>
  );
};
