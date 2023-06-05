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
}

export const BadgeClaimButton = ({
  setIsClaiming,
  setWasClaimSucessful,
  walletAddress,
  isEnabledClaim,
  dispenserId,
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
    } catch (e) {
      setErrorMessage(
        "There was an error claiming your token. Please try again later."
      );
    } finally {
      setIsClaiming(false);
    }
  }, [walletAddress, setIsClaiming, dispenserId, setWasClaimSucessful]);

  return (
    <div className="flex flex-col">
      {!!errorMessage.length && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{errorMessage}!!!</span>
        </div>
      )}
      {isEnabledClaim && (
        <PrimaryButton onClick={handleClaimToken}>Claim</PrimaryButton>
      )}
    </div>
  );
};
