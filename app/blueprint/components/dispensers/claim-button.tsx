import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import { Payout } from "@/app/profile/[id]/page";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import Spinner from "@/features/UI/spinner";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

const ClaimButton = ({ dispenserId }: { dispenserId: string }) => {
  const { claimReward, isLoading, isClaiming } = useDispenser(dispenserId);
  const { publicKey } = useWallet();
  const [txAddress, setTxAddress] = useState<string>("");
  const [payout, setPayout] = useState<Payout | null>(null);

  const handleClaimReward = async () => {
    if (!publicKey) return;
    const { txAddress, payout } = await claimReward(publicKey.toString());
    if (!txAddress || !payout) {
      console.log("Error claiming reward");
      return;
    }
    setTxAddress(txAddress);
    setPayout(payout);
  };

  return (
    <div className="flex flex-col">
      {txAddress && (
        <div className="py-4">
          <div className="flex flex-col">
            <div className="text-lg uppercase text-center mb-2">Success!</div>
            <a
              href={`https://explorer.solana.com/tx/${txAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Solana Explorer
            </a>
          </div>
        </div>
      )}
      <PrimaryButton onClick={handleClaimReward} disabled={isLoading}>
        {(isLoading || isClaiming) && <Spinner />}
        {!isLoading && !isClaiming && "Claim"}
      </PrimaryButton>
    </div>
  );
};

export default ClaimButton;
