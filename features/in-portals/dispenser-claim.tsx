"use client";
import { useQuery } from "@apollo/client";
import { PublicKey } from "@solana/web3.js";

import Image from "next/image";
import { useEffect, useState } from "react";
import Spinner from "@/features/UI/spinner";
import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";
import { GET_DISPENSER_BY_ID } from "@/graphql/queries/get-dispenser-by-id";
import ConfettiBackground from "@/features/animations/confetti-background";
import { DispenserClaimButton } from "@/features/UI/buttons/dispenser-claim-button";
import { fetchNftsByHashList } from "@/utils/nfts/fetch-nfts-by-hash-list";
import { BASE_URL, REWARD_WALLET_ADDRESS } from "@/constants/constants";
import axios from "axios";
import { FaceFrownIcon } from "@heroicons/react/24/outline";

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
}: {
  walletAddress: PublicKey | null;
  dispenserId: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [wasClaimSucessful, setWasClaimSucessful] = useState(false);
  const [isEnabledClaim, setIsEnabledClaim] = useState(false);
  const [dispenser, setDispenser] = useState<Dispenser | null>(null);
  const [isClaimed, setIsClaimed] = useState(false);
  const [txAddress, setTxAddress] = useState<string | null>(null);

  useQuery(GET_DISPENSER_BY_ID, {
    variables: { id: dispenserId },
    skip: !dispenserId,
    onCompleted: async ({ dispensers_by_pk: dispenser }) => {
      if (!dispenser) return;
      try {
        setDispenser(dispenser);
        const { rewardCollections } = dispenser;
        const { mintAddress } = rewardCollections[0].itemCollection.item.token;
        const { data } = await axios.post(
          `${BASE_URL}/api/get-token-balances-from-helius`,
          {
            walletAddress: REWARD_WALLET_ADDRESS?.toString(),
            mintAddresses: [mintAddress],
          }
        );
        const amount = data?.[0]?.amount || 0;
        setIsClaimed(amount === 0);
        setIsEnabledClaim(amount > 0);
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

  if (isClaimed) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-white">
        <FaceFrownIcon className="w-16 h-16 text-white mb-4" />
        <div className="text-6xl mb-2">Sorry!</div>
        <div className="text-2xl mt-4 text-center">
          The NFT has already been claimed.
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
      <div className="text-5xl text-white mb-2">You found it!</div>
      <Image
        src="https://aznyagtolfcupkolhaqtyj47626i6lz6yzzdq57royxn7kvymowa.arweave.net/BluAGm5ZRUepyzghPCef9ryPLz7Gcjh38XYu36q4Y6w?ext=png"
        alt="FunGuyz NFT"
        width="300"
        height="300"
        className="rounded mb-10"
      />
      {!!dispenser && (
        <>
          <DispenserClaimButton
            isClaimed={isClaimed}
            setIsClaimed={setIsClaimed}
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
