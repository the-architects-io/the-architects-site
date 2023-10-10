import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import showToast from "@/features/toasts/show-toast";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import { useCallback, useState } from "react";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  setIsClaiming: (isClaiming: boolean) => void;
  setWasClaimSucessful?: (wasClaimSucessful: boolean) => void;
  walletAddress: PublicKey | null;
  isEnabledClaim: boolean;
  dispenserId?: string;
  isClaimed: boolean;
  setIsClaimed?: (isClaimed: boolean) => void;
  setTxAddress: (txAddress: string | null) => void;
  mintAddresses?: string[];
  hasBeenFetched?: boolean;
}

export const DispenserClaimButton = ({
  setIsClaiming,
  walletAddress,
  isEnabledClaim,
  dispenserId,
  isClaimed,
  setIsClaimed,
  mintAddresses,
  hasBeenFetched,
}: Props) => {
  const [errorMessage, setErrorMessage] = useState("");
  const { claimReward } = useDispenser(dispenserId);

  const handleClaimToken = useCallback(async () => {
    if (!walletAddress || !dispenserId) return;
    setIsClaiming(true);
    const { success, message } = await claimReward(walletAddress.toString(), {
      mintAddresses,
    });
    if (!success && message) {
      showToast({
        primaryMessage: "Error",
        secondaryMessage: message,
      });
    }
    if (success) {
      setIsClaimed && setIsClaimed(true);
      showToast({
        primaryMessage: "Success",
        secondaryMessage: "Token claimed",
      });
    }
    setIsClaiming(false);
  }, [
    walletAddress,
    dispenserId,
    setIsClaiming,
    claimReward,
    mintAddresses,
    setIsClaimed,
  ]);

  return (
    <div className="flex flex-col">
      {!!isClaimed && (
        <div className="text-center text-sky-300 font-semibold">
          Already claimed
        </div>
      )}
      {/* {!isClaimed && isEnabledClaim && hasBeenFetched && (
        <PrimaryButton onClick={handleClaimToken}>Claim</PrimaryButton>
      )} */}
    </div>
  );
};
