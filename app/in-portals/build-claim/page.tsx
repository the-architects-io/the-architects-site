"use client";
import Spinner from "@/features/UI/spinner";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";
import PortalsSdk from "@/utils/portals-sdk-v2";
import { ENV } from "@/constants/constants";
import { DispenserClaim } from "@/features/in-portals/dispenser-claim";
import { fetchDaoNfts } from "@/utils/nfts/fetch-dao-nfts";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { GET_TOKENS_BY_MINT_ADDRESSES } from "@/graphql/queries/get-tokens-by-mint-addresses";
import { useQuery } from "@apollo/client";
import { ModeledNftMetadata, Token } from "@/app/blueprint/types";

// Deprecated, used for BUILD claim only

export default function DispenserClaimPage({ params }: { params: any }) {
  // const { publicKey: walletAdapterWalletAddress } = useWallet();
  const [inPortalsWalletAddress, setInPortalsWalletAddress] =
    useState<PublicKey | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [showReloadButton, setShowReloadButton] = useState(false);
  const [numberOfDaoNftsHeld, setNumberOfDaoNftsHeld] = useState(0);
  const [isFetchingNfts, setIsFetchingNfts] = useState(false);
  const [hasBeenFetched, setHasBeenFetched] = useState(false);
  const [collectionNfts, setCollectionNfts] = useState<ModeledNftMetadata[]>(
    []
  );
  const [lastClaimTime, setLastClaimTime] = useState<string | undefined>(
    undefined
  );
  const [isFetchingLastClaimTime, setIsFetchingLastClaimTime] = useState(true);

  const { loading } = useQuery(GET_TOKENS_BY_MINT_ADDRESSES, {
    skip: !collectionNfts?.length,
    variables: {
      mintAddresses: collectionNfts?.map((nft) => nft.mintAddress),
    },
    onCompleted: ({ tokens }: { tokens: Token[] }) => {
      console.log({ tokens });
      const lastClaimTimeToken = tokens.reduce((prev, current) => {
        return prev?.lastClaim?.createdAt > current?.lastClaim?.createdAt
          ? prev
          : current;
      });
      setLastClaimTime(lastClaimTimeToken?.lastClaim?.createdAt);
      console.log("lastClaimTimeToken", lastClaimTimeToken);
      setIsFetchingLastClaimTime(false);
    },
  });

  const handleFetchDaoNfts = useCallback(async () => {
    const walletAddress = inPortalsWalletAddress;
    //  || walletAdapterWalletAddress;

    if (!inPortalsWalletAddress) {
      console.error("No wallet address");
      return;
    }
    console.log("handleFetchDaoNfts");
    setIsFetchingNfts(true);
    const nfts = await fetchDaoNfts({
      withMetadata: false,
      publicKey: new PublicKey(inPortalsWalletAddress),
      setHasBeenFetched,
    });

    setCollectionNfts(nfts);
    setIsFetchingNfts(false);
    setHasBeenFetched(true);
    setNumberOfDaoNftsHeld(nfts?.length || 0);
  }, [inPortalsWalletAddress]);

  const requestPublicKey = () => {
    PortalsSdk.requestPublicKey("https://theportal.to", (publicKey: string) => {
      console.log("publicKey", publicKey);
      setInPortalsWalletAddress(new PublicKey(publicKey));
    });
  };

  const requestRoomId = () => {
    PortalsSdk.getRoomId(({ roomId }: { roomId: string }) => {
      console.log("roomId", roomId);
      setRoomId(roomId);
    });
  };

  useEffect(() => {
    if (!inPortalsWalletAddress && ENV !== "local") requestPublicKey();
    if (!roomId && ENV !== "local") requestRoomId();
    console.log({
      hasBeenFetched,
      isFetchingNfts,
      inPortalsWalletAddress,
    });
    if (!hasBeenFetched && !isFetchingNfts && inPortalsWalletAddress)
      handleFetchDaoNfts();

    setTimeout(() => {
      if (!inPortalsWalletAddress && ENV !== "local") setShowReloadButton(true);
    }, 15000);
  }, [
    inPortalsWalletAddress,
    roomId,
    hasBeenFetched,
    isFetchingNfts,
    handleFetchDaoNfts,
  ]);

  if (!inPortalsWalletAddress || loading)
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-stone-300">
        <Spinner />
      </div>
    );

  return (
    <>
      {!inPortalsWalletAddress ? (
        <div className="flex flex-col justify-center items-center w-full min-h-screen text-stone-300 bg-slate-800">
          <div className="absolute top-4 right-4">
            <WalletButton />
          </div>

          <div className="max-w-xs text-center mb-4">
            Please allow your wallet to be connected in the popup above.
          </div>
          <Spinner />
          {showReloadButton && (
            <button
              className="bg-green-500 hover:bg-green-600 text-slate-800 rounded-xl px-16 py-3 border border-green-500 hover:border-green-500 transition-colors duration-300 ease-in-out text-xl font-semibold shadow-green-500 shadow-md mt-16"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center w-full min-h-screen text-stone-300 bg-slate-800">
          {ENV === "local" && (
            <div className="absolute top-4 right-4">
              <WalletButton />
            </div>
          )}
          <DispenserClaim
            lastClaimTime={lastClaimTime}
            isFetching={isFetchingNfts || isFetchingLastClaimTime}
            numberOfDaoNftsHeld={numberOfDaoNftsHeld}
            collectionNfts={collectionNfts}
            dispenserId={"dd078f38-e4d5-47fa-a571-8786029e324e"}
            walletAddress={inPortalsWalletAddress}
          />
        </div>
      )}
    </>
  );
}
