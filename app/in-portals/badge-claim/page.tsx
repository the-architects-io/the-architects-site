"use client";
import { ENV } from "@/constants/constants";
import Spinner from "@/features/UI/spinner";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import PortalsSdk from "@/utils/portals-sdk-v2";
import { BadgeClaim } from "@/features/in-portals/badge-claim";

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
    <div>
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
