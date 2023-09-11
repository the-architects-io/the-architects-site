"use client";

import axios from "axios";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { Field, FieldArray, useFormik, FormikProvider, Formik } from "formik";
import showToast from "@/features/toasts/show-toast";
import SharedHead from "@/features/UI/head";
import { TokenBalance } from "@/app/blueprint/types";
import { useCallback, useEffect, useState } from "react";
import { BASE_URL } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { getAmountWithDecimals } from "@/utils/currency";
import classNames from "classnames";
import { Divider } from "@/features/UI/divider";
import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import Spinner from "@/features/UI/spinner";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import { FormCheckboxWithLabel } from "@/features/UI/forms/form-checkbox-with-label";

export const DispenserCostForm = ({ dispenserId }: { dispenserId: string }) => {
  const { dispenser, isLoading } = useDispenser(dispenserId);
  const [isFetching, setIsFetching] = useState(false);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);

  const formik = useFormik({
    initialValues: {
      costs: [] as {
        mint: string;
        costAmount: number;
        isSelected: boolean;
        decimals: number;
        amount: number;
      }[],
      isFree: false,
    },
    onSubmit: async (values) => {
      try {
        // add cost
      } catch (error) {
        showToast({
          primaryMessage: "Error adding cost",
        });
        console.log({ error });
      }
    },
  });

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(dispenser?.rewardWalletAddress || "");
    showToast({
      primaryMessage: "Address copied to clipboard",
    });
  };

  const fetchUserBalances = useCallback(async () => {
    setIsFetching(true);
    try {
      const { data: tokens }: { data: TokenBalance[] } = await axios.post(
        `${BASE_URL}/api/get-token-balances-from-helius`,
        {
          walletAddress: dispenser?.rewardWalletAddress,
        }
      );
      setTokens(tokens);
      formik.setValues({
        costs: tokens.map((token) => ({
          mint: token.mint,
          amount: token.amount,
          costAmount: 0,
          isSelected: false,
          decimals: token.decimals,
        })),
        isFree: false,
      });
    } catch (error) {
      console.log({ error });
    } finally {
      setIsFetching(false);
    }
  }, [formik, dispenser?.rewardWalletAddress]);

  if (!dispenser?.id || isLoading)
    return (
      <div className="flex flex-col items-center justify-center w-full py-8">
        <Spinner />
      </div>
    );

  return (
    <Formik
      onSubmit={() => {}}
      initialValues={formik.initialValues}
      render={({ values }) => (
        <FormWrapper onSubmit={formik.handleSubmit} className="px-0">
          <SharedHead title="Admin" />
          <div className="flex flex-col items-center justify-center w-full">
            <div className="text-center mb-8 px-6">
              <div className="mb-8">
                An on chain wallet has been created for this dispenser. Please
                send the tokens you would like to use in this dispenser to this
                address:
              </div>
              <div className="mb-4">{dispenser?.rewardWalletAddress}</div>
              <div className="flex justify-center w-full mb-8 space-x-4">
                <SecondaryButton>
                  <a
                    href={`https://explorer.solana.com/address/${dispenser?.rewardWalletAddress}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    view on explorer
                  </a>
                </SecondaryButton>
                <SecondaryButton onClick={handleCopyAddress}>
                  Copy
                </SecondaryButton>
              </div>
              Once you have sent the tokens, click the refresh button below to
              see the updated balances.
            </div>
            <div className="flex justify-center w-full p-2 mb-4">
              <FormCheckboxWithLabel
                label="No cost"
                name="isFree"
                value={formik.values.isFree}
                onChange={formik.handleChange}
              />
            </div>
            {!formik.values.isFree && (
              <div className="flex w-full justify-center">
                <PrimaryButton onClick={() => fetchUserBalances()}>
                  refresh
                </PrimaryButton>
              </div>
            )}
            {formik.values.costs?.length > 0 && (
              <>
                <div className="text-xl mt-8 mb-4">Select Costs</div>
                {isFetching && (
                  <div className="flex flex-col items-center justify-center w-full py-16">
                    <Spinner />
                  </div>
                )}
                {!isFetching && (
                  <div
                    className={classNames([
                      "flex flex-col items-center justify-center w-full overflow-hidden transition-all duration-500",
                      formik.values.isFree ? "max-h-[0px]" : "max-h-[600px]",
                    ])}
                  >
                    <FormikProvider value={formik}>
                      <FieldArray
                        name="costs"
                        render={({ insert, remove, push, replace }) => (
                          <>
                            {formik.values.costs.map((cost, index) => (
                              <div
                                onClick={() => {
                                  replace(index, {
                                    mint: cost.mint,
                                    decimals: cost.decimals,
                                    amount: cost.amount,
                                    costAmount: cost.costAmount,
                                    isSelected: !cost.isSelected,
                                  });
                                }}
                                className={classNames(
                                  "p-4 px-6 border-2 rounded-lg my-2 cursor-pointer w-full",
                                  cost.isSelected
                                    ? "border-sky-300"
                                    : "border-gray-600"
                                )}
                                key={index}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="text-xl">
                                    {getAbbreviatedAddress(cost.mint)}
                                  </div>
                                  <div>
                                    <div className="text-xs uppercase text-right">
                                      total
                                    </div>
                                    <div className="text-xl text-right">
                                      {getAmountWithDecimals(
                                        cost.amount,
                                        cost.decimals
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {cost.isSelected && (
                                  <div className="flex flex-col items-center w-full">
                                    <Divider />
                                    <div className="flex flex-col w-full items-end">
                                      <Field
                                        name={`costs.${index}.mint`}
                                        value={cost.mint}
                                        className="text-gray-800"
                                        hidden
                                      />
                                      <div className="flex w-full items-center justify-between mb-2">
                                        <div className="text-sm uppercase">
                                          cost amount
                                        </div>
                                        <Field
                                          name={`costs.${index}.costAmount`}
                                          className="text-gray-800 bg-gray-100 p-2 rounded max-w-[100px]"
                                          onClick={(e: any) => {
                                            e.stopPropagation();
                                          }}
                                        />
                                      </div>
                                      <div className="text-gray-300 text-xs">
                                        The amount of this token a user must pay
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </>
                        )}
                      />
                    </FormikProvider>
                  </div>
                )}
              </>
            )}
            <SubmitButton
              isSubmitting={formik.isSubmitting}
              onClick={formik.handleSubmit}
              buttonText="Continue"
              className="mt-4"
              disabled={
                !formik.values.isFree &&
                formik.values.costs.every(
                  ({ costAmount, isSelected }) =>
                    costAmount == 0 || !costAmount || !isSelected
                )
              }
            />
          </div>
        </FormWrapper>
      )}
    ></Formik>
  );
};
