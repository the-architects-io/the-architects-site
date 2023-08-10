import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
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
  setTxAddress: (txAddress: string | null) => void;
}

export const DispenserClaimButton = ({
  setIsClaiming,
  walletAddress,
  isEnabledClaim,
  dispenserId,
  isClaimed,
}: Props) => {
  const [errorMessage, setErrorMessage] = useState("");
  const { claimReward } = useDispenser(dispenserId);

  const handleClaimToken = useCallback(async () => {
    if (!walletAddress || !dispenserId) return;
    setIsClaiming(true);
    const { success, message } = await claimReward(walletAddress.toString());
    setIsClaiming(false);
  }, [walletAddress, dispenserId, setIsClaiming, claimReward]);

  return (
    <div className="flex flex-col">
      {!!isClaimed && (
        <div className="text-center text-green-500 font-semibold">
          Already claimed
        </div>
      )}
      {!isClaimed && isEnabledClaim && (
        <PrimaryButton onClick={handleClaimToken}>Claim</PrimaryButton>
      )}
    </div>
  );
};
