"use client";
import axios from "axios";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { Field, FieldArray, useFormik, FormikProvider, Formik } from "formik";
import showToast from "@/features/toasts/show-toast";
import SharedHead from "@/features/UI/head";
import {
  CostCollection,
  Item,
  ItemCollection,
  Token,
  TokenBalance,
} from "@/app/blueprint/types";
import { useCallback, useState } from "react";
import { BASE_URL } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { fromBaseUnit } from "@/utils/currency";
import classNames from "classnames";
import { Divider } from "@/features/UI/divider";
import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import Spinner from "@/features/UI/spinner";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import { FormCheckboxWithLabel } from "@/features/UI/forms/form-checkbox-with-label";
import { handleError } from "@/utils/errors/log-error";

export const DispenserCostForm = ({
  dispenserId,
  setStep,
}: {
  dispenserId: string;
  setStep: (step: number) => void;
}) => {
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
      let allTokens: Token[] = [];
      let allItems: Item[] = [];
      let allItemCollections: ItemCollection[] = [];

      try {
        const { data }: { data: { allTokens: Token[]; addedTokens: Token[] } } =
          await axios.post("/api/add-tokens", {
            mintAddresses: values.costs
              .filter((cost) => cost.costAmount > 0 && cost.isSelected)
              .map((cost) => cost.mint),
          });

        allTokens = data?.allTokens;
        console.log(data?.allTokens);
      } catch (error) {
        handleError(error as Error);
      }

      try {
        const { data }: { data: { allItems: Item[]; addedItems: Item[] } } =
          await axios.post("/api/add-items", {
            items: allTokens.map((token) => ({
              name: token.name,
              imageUrl: token?.imageUrl,
              tokenId: token.id,
            })),
          });

        allItems = data?.allItems;
      } catch (error) {
        handleError(error as Error);
      }

      try {
        const { data }: { data: { addedItemCollections: ItemCollection[] } } =
          await axios.post("/api/add-item-collections", {
            itemCollections: allItems.map((item) => ({
              name: item.name,
              imageUrl: item?.imageUrl,
              itemId: item.id,
              amount:
                values.costs.find((cost) => cost.mint == item.token.mintAddress)
                  ?.costAmount || 0,
            })),
          });

        allItemCollections = data?.addedItemCollections;
      } catch (error) {
        handleError(error as Error);
      }

      try {
        const { data }: { data: { addedCostCollections: CostCollection[] } } =
          await axios.post("/api/add-cost-collections", {
            dispenserId,
            costCollections: allItemCollections.map((itemCollection) => ({
              name: itemCollection.name,
              dispenserId: dispenser?.id,
              itemCollectionId: itemCollection.id,
              itemId: itemCollection.item.id,
            })),
          });

        showToast({
          primaryMessage:
            values.costs.length > 1 ? "Costs added" : "Cost added",
        });
        setStep(2);
      } catch (error) {
        handleError(error as Error);
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
      handleError(error as Error);
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
    <>
      <h1 className="text-3xl my-4 text-gray-100">Add Costs</h1>
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
                  send the tokens you would like to use in this dispenser to
                  this address:
                </div>
                <div className="text-sm mb-4">
                  {dispenser?.rewardWalletAddress}
                </div>
                <div
                  className="flex justify-center w-full mb-8 space-x-4"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <SecondaryButton>
                    <a
                      href={`https://solscan.io/account/${dispenser?.rewardWalletAddress}?cluster=devnet`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  </SecondaryButton>
                  <SecondaryButton
                    onClick={(e) => {
                      e.preventDefault();
                      handleCopyAddress();
                    }}
                  >
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
                  <PrimaryButton
                    onClick={(e) => {
                      e.preventDefault();
                      fetchUserBalances();
                    }}
                  >
                    refresh
                  </PrimaryButton>
                </div>
              )}
              {isFetching && (
                <div className="flex flex-col items-center justify-center w-full py-16">
                  <Spinner />
                </div>
              )}
              {formik.values.costs?.length > 0 && !isFetching && (
                <>
                  <div className="text-xl mt-8 mb-4">Select Costs</div>

                  <div
                    className={classNames([
                      "flex flex-col items-center justify-center w-full transition-all duration-500",
                      formik.values.isFree
                        ? "max-h-[0px] overflow-hidden"
                        : "max-h-[600px] overflow-y-auto",
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
                                      {fromBaseUnit(cost.amount, cost.decimals)}
                                    </div>
                                  </div>
                                </div>

                                {cost.isSelected && (
                                  <div
                                    className="flex flex-col items-center w-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  >
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
                                          max={cost.amount}
                                          min={0}
                                          type="number"
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
    </>
  );
};
