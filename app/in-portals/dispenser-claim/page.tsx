"use client";
import Spinner from "@/features/UI/spinner";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import PortalsSdk from "@/utils/portals-sdk-v2";
import { BadgeClaim } from "@/features/in-portals/badge-claim";
import { usePathname, useSearchParams } from "next/navigation";
import { ENV } from "@/constants/constants";
import { DispenserClaim } from "@/features/in-portals/dispenser-claim";

export default function DispenserClaimPage({ params }: { params: any }) {
  const pathname = usePathname();
  console.log({ pathname });
  const { publicKey: walletAdapterWalletAddress } = useWallet();
  const [inPortalsWalletAddress, setInPortalsWalletAddress] =
    useState<PublicKey | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [showReloadButton, setShowReloadButton] = useState(false);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

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
    if (!inPortalsWalletAddress) requestPublicKey();
    if (!roomId) requestRoomId();
    setTimeout(() => {
      if (!inPortalsWalletAddress) setShowReloadButton(true);
    }, 15000);
  }, [inPortalsWalletAddress, roomId]);

  // if (!walletAdapterWalletAddress && !inPortalsWalletAddress)
  //   return (
  //     <div className="flex flex-col justify-center items-center w-full min-h-screen text-stone-300">
  //       {ENV === "local" && <WalletMultiButton />}
  //       <Spinner />
  //     </div>
  //   );

  return (
    <>
      {!walletAdapterWalletAddress && !inPortalsWalletAddress ? (
        <div className="flex flex-col justify-center items-center w-full min-h-screen text-stone-300 bg-slate-800">
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
          {!!id && (
            <DispenserClaim
              dispenserId={id || "2d7ac48a-5228-42df-9372-fd9325bc9741"}
              walletAddress={
                ENV === "local"
                  ? walletAdapterWalletAddress || inPortalsWalletAddress
                  : inPortalsWalletAddress
              }
            />
          )}
        </div>
      )}
    </>
  );
}
