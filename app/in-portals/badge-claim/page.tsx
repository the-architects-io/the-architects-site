"use client";
import { ENV } from "@/constants/constants";
import Spinner from "@/features/UI/spinner";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import PortalsSdk from "@/utils/portals-sdk-v2";
import { BadgeClaim } from "@/features/in-portals/badge-claim";
import localFont from "next/font/local";

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
  const { publicKey: walletAdapterWalletAddress } = useWallet();
  const [inPortalsWalletAddress, setInPortalsWalletAddress] =
    useState<PublicKey | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    PortalsSdk.requestPublicKey("https://theportal.to", (publicKey: string) => {
      console.log("publicKey", publicKey);
      setInPortalsWalletAddress(new PublicKey(publicKey));
    });
    PortalsSdk.getRoomId(({ roomId }: { roomId: string }) => {
      console.log("roomId", roomId);
      setRoomId(roomId);
    });
  }, []);

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
        <div className="flex flex-col justify-center items-center w-full min-h-screen text-stone-300">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center w-full min-h-screen text-stone-300 bg-slate-800">
          <BadgeClaim
            dispenserId={"9851135d-7c7a-41f1-91ad-cc6a56ab565c"}
            walletAddress={walletAdapterWalletAddress || inPortalsWalletAddress}
          />
        </div>
      )}
    </div>
  );
}
