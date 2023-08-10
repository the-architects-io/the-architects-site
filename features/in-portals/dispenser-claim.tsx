"use client";
import { useQuery } from "@apollo/client";
import { PublicKey } from "@solana/web3.js";

import { useEffect, useState } from "react";
import Spinner from "@/features/UI/spinner";
import {
  Dispenser,
  TokenClaimPayoutStrategies,
} from "@/features/admin/dispensers/dispensers-list-item";
import { GET_DISPENSER_BY_ID } from "@/graphql/queries/get-dispenser-by-id";
import ConfettiBackground from "@/features/animations/confetti-background";
import { DispenserClaimButton } from "@/features/UI/buttons/dispenser-claim-button";
import { BASE_URL, REWARD_WALLET_ADDRESS } from "@/constants/constants";
import axios from "axios";
import { BuildTokenVestingDetails } from "@/features/dispensers/details/build-token-vesting-details";

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
}: {
  walletAddress: PublicKey | null;
  dispenserId: string;
  numberOfDaoNftsHeld?: number;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [wasClaimSucessful, setWasClaimSucessful] = useState(false);
  const [isEnabledClaim, setIsEnabledClaim] = useState(false);
  const [dispenser, setDispenser] = useState<Dispenser | null>(null);
  const [isDispenserEmpty, setIsDispenserEmpty] = useState(false);
  const [txAddress, setTxAddress] = useState<string | null>(null);

  const setupDispenser = async (
    dispenser: Dispenser,
    isBuildVestingDispenser = false
  ) => {
    if (isBuildVestingDispenser) {
      dispenser = {
        ...dispenser,
        tokenClaimPayoutStrategy:
          TokenClaimPayoutStrategies.VESTING_BUILD_TOKEN,
      };
    }
    const { rewardCollections } = dispenser;
    const { mintAddress } = rewardCollections[0].itemCollection.item.token;
    const { data } = await axios.post(
      `${BASE_URL}/api/get-token-balances-from-helius`,
      {
        walletAddress: REWARD_WALLET_ADDRESS,
        mintAddresses: [mintAddress],
      }
    );
    const amount = data?.[0]?.amount || 0;
    setIsDispenserEmpty(amount === 0);
    setIsEnabledClaim(amount > 0);
  };

  const setupBuildVestingDispenser = async (dispenser: Dispenser) => {
    const { rewardCollections } = dispenser;
    const { mintAddress } = rewardCollections[0].itemCollection.item.token;
    const { data } = await axios.post(
      `${BASE_URL}/api/get-token-balances-from-helius`,
      {
        walletAddress: REWARD_WALLET_ADDRESS,
        mintAddresses: [mintAddress],
      }
    );
    const amount = data?.[0]?.amount || 0;
    setIsDispenserEmpty(amount === 0);
    // setIsEnabledClaim(amount > 0);
    setIsEnabledClaim(true);
  };

  useQuery(GET_DISPENSER_BY_ID, {
    variables: { id: dispenserId },
    skip: !dispenserId,
    onCompleted: async ({ dispensers_by_pk: dispenser }) => {
      if (!dispenser) return;
      try {
        setDispenser(dispenser);
        if (dispenserId === "dd078f38-e4d5-47fa-a571-8786029e324e") {
          // is BUILD dispenser, use vesting strategy
          console.log("BUILD dispenser, use vesting strategy");
          setIsEnabledClaim(true);
          setupBuildVestingDispenser(dispenser);
          return;
        }
        setupDispenser(dispenser);
      } catch (error) {
        console.log({ error });
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    if (wasClaimSucessful) {
      setIsEnabledClaim(false);
    }
  }, [wasClaimSucessful]);

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
            href={`https://explorer.solana.com/tx/${txAddress}`}
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
          <BuildTokenVestingDetails
            walletAddress={walletAddress}
            numberOfDaoNftsHeld={numberOfDaoNftsHeld || 0}
            lastClaimTime={undefined}
            hasBeenFetched={true}
            tokenClaimSource={dispenser}
            isEnabledClaim={isEnabledClaim}
            isLoading={false}
          />
          <DispenserClaimButton
            isClaimed={false}
            dispenserId={dispenser?.id}
            walletAddress={walletAddress}
            setIsClaiming={setIsClaiming}
            setWasClaimSucessful={setWasClaimSucessful}
            isEnabledClaim={isEnabledClaim}
            setTxAddress={setTxAddress}
          />
        </>
      )}
    </div>
  );
};
