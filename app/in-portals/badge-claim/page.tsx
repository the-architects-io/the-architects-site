"use client";
import Spinner from "@/features/UI/spinner";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import PortalsSdk from "@/utils/portals-sdk-v2";
import { BadgeClaim } from "@/features/in-portals/badge-claim";
import localFont from "next/font/local";
import { usePathname } from "next/navigation";
import { ENV } from "@/constants/constants";

const graphik = localFont({
  src: [
    {
      path: "./fonts/GraphikRegular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/GraphikRegularItalic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/GraphikSemibold.otf",
      weight: "600",
      style: "semibold",
    },
    {
      path: "./fonts/GraphikBold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/GraphikBoldItalic.otf",
      weight: "700",
      style: "italic",
    },
  ],
});

export default function BadgeClaimPage({ params }: { params: any }) {
  const pathname = usePathname();
  console.log({ pathname });
  const { publicKey: walletAdapterWalletAddress } = useWallet();
  const [inPortalsWalletAddress, setInPortalsWalletAddress] =
    useState<PublicKey | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [showReloadButton, setShowReloadButton] = useState(false);

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
    <div className={graphik.className}>
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
          <BadgeClaim
            dispenserId={"9851135d-7c7a-41f1-91ad-cc6a56ab565c"}
            walletAddress={
              ENV === "local"
                ? walletAdapterWalletAddress || inPortalsWalletAddress
                : inPortalsWalletAddress
            }
          />
        </div>
      )}
    </div>
  );
}
