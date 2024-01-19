"use client";

import { createBlueprintClient } from "@/app/blueprint/client";
import {
  ARC_TOKEN_MINT_ADDRESS,
  SOL_MINT_ADDRESS,
} from "@/app/blueprint/utils/payments";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import { useCluster } from "@/hooks/cluster";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { useCallback, useState } from "react";

const splTokens = [
  {
    name: "ARC",
    mintAddress: "HJRkFRCfaAQdkCnWucQKtksJXYnCBsY4dTYAT7nKpzTQ",
    decimals: 2,
  },
];

export default function Page() {
  const wallet = useWallet();
  const { cluster } = useCluster();
  const [isLoading, setIsLoading] = useState(false);

  const handleArcPayment = useCallback(async () => {
    setIsLoading(true);
    const blueprint = createBlueprintClient({ cluster });

    const cost = 100;

    try {
      const { txId } = await blueprint.payments.takePayment({
        wallet,
        mintAddress: ARC_TOKEN_MINT_ADDRESS,
        baseAmount: cost * 10 ** splTokens[0].decimals,
        cluster,
      });
      if (txId) {
        showToast({
          primaryMessage: "Payment successful",
          link: {
            url: `https://explorer.solana.com/tx/${txId}?cluster=${cluster}`,
            title: "View transaction",
          },
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [wallet, cluster]);

  const handleSolPayment = useCallback(async () => {
    setIsLoading(true);
    const blueprint = createBlueprintClient({ cluster });

    try {
      const { txId } = await blueprint.payments.takePayment({
        wallet,
        mintAddress: SOL_MINT_ADDRESS,
        baseAmount: 100000000,
        cluster,
      });
      if (txId) {
        showToast({
          primaryMessage: "Payment successful",
          link: {
            url: `https://explorer.solana.com/tx/${txId}?cluster=${cluster}`,
            title: "View transaction",
          },
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [wallet, cluster]);

  return (
    <ContentWrapper>
      <Panel>
        <div className="flex flex-col items-center">
          <div className="text-3xl font-bold mb-8">Payment</div>
          <Image
            src="/images/golden-ticket.png"
            className="mb-8"
            width={300}
            height={300}
            alt="Golden Ticket"
          />
          <div className="flex mb-8">
            <div className="text-2xl tracking-wide mb-2">
              0.1 SOL or 100 $ARC
            </div>
          </div>

          {!!wallet?.publicKey && (
            <div className="flex space-x-4 mb-4">
              {isLoading ? (
                <Spinner />
              ) : (
                <>
                  <SubmitButton
                    onClick={handleSolPayment}
                    isSubmitting={isLoading}
                  >
                    Pay in SOL
                  </SubmitButton>
                  <SubmitButton
                    onClick={handleArcPayment}
                    isSubmitting={isLoading}
                  >
                    Pay in $ARC
                  </SubmitButton>
                </>
              )}
            </div>
          )}
        </div>
      </Panel>
    </ContentWrapper>
  );
}
