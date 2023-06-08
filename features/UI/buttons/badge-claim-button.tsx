import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  setIsClaiming: (isClaiming: boolean) => void;
  setWasClaimSucessful?: (wasClaimSucessful: boolean) => void;
  walletAddress: PublicKey | null;
  isEnabledClaim: boolean;
  dispenserId?: string;
  setIsClaimed: (isClaimed: boolean) => void;
}

export const BadgeClaimButton = ({
  setIsClaiming,
  setWasClaimSucessful,
  walletAddress,
  isEnabledClaim,
  dispenserId,
  setIsClaimed,
}: Props) => {
  const [errorMessage, setErrorMessage] = useState("");

  const handleClaimToken = useCallback(async () => {
    if (!walletAddress) return;
    setIsClaiming(true);
    try {
      const res = await axios.post("/api/claim-badge", {
        address: walletAddress,
        dispenserId,
      });
      setWasClaimSucessful && setWasClaimSucessful(true);
    } catch (error: any) {
      if (error?.message === "Badge already claimed") {
        setIsClaimed(true);
      }
    } finally {
      setIsClaiming(false);
    }
  }, [
    walletAddress,
    setIsClaiming,
    dispenserId,
    setWasClaimSucessful,
    setIsClaimed,
  ]);

  return (
    <div className="flex flex-col">
      {isEnabledClaim && (
        <button
          className="bg-green-500 hover:bg-green-600 text-slate-800 rounded-xl px-16 py-3 border border-green-500 hover:border-green-500 transition-colors duration-300 ease-in-out text-xl font-semibold shadow-green-500 shadow-md"
          onClick={handleClaimToken}
        >
          Mint Badge
        </button>
      )}
    </div>
  );
};
