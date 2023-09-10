"use client";

import axios from "axios";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import showToast from "@/features/toasts/show-toast";
import SharedHead from "@/features/UI/head";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Dispenser, TokenBalance, Token } from "@/app/blueprint/types";
import { useUserData } from "@nhost/nextjs";
import { useCallback, useEffect, useState } from "react";
import { BASE_URL } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { getAmountWithDecimals } from "@/utils/currency";
import classNames from "classnames";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";

export const DispenserCostForm = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const router = useRouter();
  const user = useUserData();
  const [isFetching, setIsFetching] = useState(false);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);

  const fetchUserBalances = useCallback(async () => {
    if (!publicKey) return;
    setIsFetching(true);
    try {
      const { data: tokens }: { data: TokenBalance[] } = await axios.post(
        `${BASE_URL}/api/get-token-balances-from-helius`,
        {
          walletAddress: publicKey.toString(),
        }
      );
      setTokens(tokens);
    } catch (error) {
      console.log({ error });
    } finally {
      setIsFetching(false);
    }
  }, [publicKey]);

  const formik = useFormik({
    initialValues: {
      selectedTokens: [] as TokenBalance[],
      costs: [] as { mint: string; costAmount: number }[],
    },
    onSubmit: async (values) => {
      if (!publicKey) {
        showToast({
          primaryMessage: "Wallet not connected",
          secondaryMessage: "Please connect your wallet",
        });
        return;
      }

      try {
      } catch (error) {
        showToast({
          primaryMessage: "Error adding dispenser",
        });
        console.log({ error });
      }
    },
  });

  useEffect(() => {
    if (!publicKey) return;
    // fetchUserBalances();
  }, [fetchUserBalances, publicKey]);

  return (
    <FormWrapper onSubmit={formik.handleSubmit} className="px-0">
      <SharedHead title="Admin" />
      <div className="flex flex-col items-center justify-center w-full pt-4">
        <div className="max-w-[600px] whitespace-break-spaces">
          {JSON.stringify(formik.values.selectedTokens.map((token) => token))}
        </div>
        <div className="text-xl mb-4">Select Costs</div>
        {tokens?.map((token) => (
          <div
            className={classNames(
              "flex justify-between flex-wrap items-center w-full p-4 px-6 border-2 rounded-lg my-2 cursor-pointer",
              formik.values.selectedTokens?.find(
                (selectedToken) => selectedToken.mint === token.mint
              )
                ? "border-sky-300"
                : "border-gray-600"
            )}
            key={token.mint}
          >
            <div
              className="flex w-full items-center"
              onClick={() => {
                if (
                  formik.values.selectedTokens?.find(
                    (selectedToken) => selectedToken.mint === token.mint
                  )
                ) {
                  formik.setFieldValue(
                    "selectedTokens",
                    formik.values.selectedTokens?.filter(
                      (selectedToken) => selectedToken.mint !== token.mint
                    )
                  );
                } else {
                  formik.setFieldValue("selectedTokens", [
                    ...(formik.values.selectedTokens || []),
                    token,
                  ]);
                }
              }}
            >
              <div className="text-2xl">
                {getAbbreviatedAddress(token.mint)}
              </div>
              <div className="w-full">
                <div className="text-xs uppercase text-right">total</div>
                <div className="text-right text-lg">
                  {getAmountWithDecimals(token.amount, token.decimals)}
                </div>
              </div>
            </div>
            {formik.values.selectedTokens?.find(
              (selectedToken) => selectedToken.mint === token.mint
            ) && (
              <div className="flex py-4 w-full">
                <FormInputWithLabel
                  label="Cost amount"
                  name="cost"
                  type="number"
                  value={0}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    formik.setFieldValue(
                      "costs",
                      formik.values.costs.map((cost) => {
                        if (cost.mint === token.mint) {
                          return {
                            ...cost,
                            costAmount: Number(event.target.value),
                          };
                        }
                        return cost;
                      })
                    );
                  }}
                />
              </div>
            )}
          </div>
        ))}

        <PrimaryButton onClick={() => fetchUserBalances()}>test</PrimaryButton>
        <SubmitButton
          isSubmitting={formik.isSubmitting}
          onClick={formik.handleSubmit}
          buttonText="Continue"
          disabled={
            !formik.values.selectedTokens?.length || formik.isSubmitting
          }
        />
      </div>
    </FormWrapper>
  );
};
