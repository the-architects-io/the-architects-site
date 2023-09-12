"use client";

import axios from "axios";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { Field, FieldArray, useFormik, FormikProvider, Formik } from "formik";
import showToast from "@/features/toasts/show-toast";
import SharedHead from "@/features/UI/head";
import {
  Item,
  ItemCollection,
  RewardCollection,
  Token,
  TokenBalance,
} from "@/app/blueprint/types";
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
import { useRouter } from "next/navigation";

type Reward = {
  mint: string;
  isSelected: boolean;
  decimals: number;
  rewardAmount: number;
  payoutChance: number;
  amount: number;
};

export const DispenserRewardForm = ({
  dispenserId,
  setStep,
}: {
  dispenserId: string;
  setStep: (step: number) => void;
}) => {
  const { dispenser, isLoading } = useDispenser(dispenserId);
  const [isFetching, setIsFetching] = useState(false);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      rewards: [] as Reward[],
    },
    onSubmit: async (values) => {
      let allTokens: Token[] = [];
      let allItems: Item[] = [];
      let allItemCollections: ItemCollection[] = [];

      try {
        const { data }: { data: { allTokens: Token[]; addedTokens: Token[] } } =
          await axios.post("/api/add-tokens", {
            mintAddresses: values.rewards
              .filter((reward) => reward.isSelected && reward.rewardAmount > 0)
              .map((reward) => reward.mint),
          });

        allTokens = data?.allTokens;
        console.log({ allTokens });
      } catch (error) {
        console.log({ error });
      }

      console.log({ allTokens });

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
        console.log({ error });
      }

      try {
        const { data }: { data: { addedItemCollections: ItemCollection[] } } =
          await axios.post("/api/add-item-collections", {
            itemCollections: allItems.map((item) => ({
              name: item.name,
              imageUrl: item?.imageUrl,
              itemId: item.id,
              amount:
                values.rewards.find(
                  (reward) => reward.mint == item.token.mintAddress
                )?.rewardAmount || 0,
            })),
          });

        allItemCollections = data?.addedItemCollections;
      } catch (error) {
        console.log({ error });
      }

      try {
        const {
          data,
        }: { data: { addedRewardCollections: RewardCollection[] } } =
          await axios.post("/api/add-reward-collections", {
            dispenserId,
            rewardCollections: allItemCollections.map((itemCollection) => {
              const reward = {
                name: itemCollection.name,
                dispenserId: dispenser?.id,
                itemCollectionId: itemCollection.id,
                itemId: itemCollection.item.id,
                payoutChance:
                  (values.rewards.find(
                    (reward) =>
                      reward.mint == itemCollection.item.token.mintAddress
                  )?.payoutChance || 0) / 100,
              };
              console.log({
                reward,
                rewardPayoutChance: reward.payoutChance,
                payoutChance: values.rewards.find(
                  (reward) =>
                    reward.mint == itemCollection.item.token.mintAddress
                )?.payoutChance,
              });
              return reward;
            }),
          });

        showToast({
          primaryMessage:
            values.rewards.length > 1 ? "Rewards added" : "Reward added",
        });
        router.push(`/me/dispenser/${dispenserId}`);
      } catch (error) {
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
        rewards: tokens.map((token) => ({
          mint: token.mint,
          amount: token.amount,
          rewardAmount: 0,
          payoutChance: 0,
          isSelected: false,
          decimals: token.decimals,
        })),
      });
    } catch (error) {
      console.log({ error });
    } finally {
      setIsFetching(false);
    }
  }, [formik, dispenser?.rewardWalletAddress]);

  useEffect(() => {
    if (!tokens.length && !isFetching) fetchUserBalances();
  }, [tokens, isFetching, fetchUserBalances]);

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
              <div className="text-sm mb-4">
                {dispenser?.rewardWalletAddress}
              </div>
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
            <div className="flex w-full justify-center mb-4">
              <PrimaryButton
                onClick={(e) => {
                  e.preventDefault();
                  fetchUserBalances();
                }}
                disabled={isFetching}
              >
                refresh
              </PrimaryButton>
            </div>
            {isFetching && (
              <div className="flex flex-col items-center justify-center w-full py-16">
                <Spinner />
              </div>
            )}
            {formik.values.rewards?.length > 0 && !isFetching && (
              <>
                <div className="text-xl mt-8 mb-4">Select Rewards</div>

                <div
                  className={classNames([
                    "flex flex-col items-center justify-center w-full overflow-hidden transition-all duration-500",
                  ])}
                >
                  <FormikProvider value={formik}>
                    <FieldArray
                      name="rewards"
                      render={({ replace }) => (
                        <>
                          {formik.values.rewards.map((reward, index) => (
                            <div
                              onClick={() => {
                                replace(index, {
                                  mint: reward.mint,
                                  decimals: reward.decimals,
                                  amount: reward.amount,
                                  rewardAmount: reward.rewardAmount,
                                  isSelected: !reward.isSelected,
                                  payoutChance: reward.payoutChance,
                                });
                              }}
                              className={classNames(
                                "p-4 px-6 border-2 rounded-lg my-2 cursor-pointer w-full",
                                reward.isSelected
                                  ? "border-sky-300"
                                  : "border-gray-600"
                              )}
                              key={index}
                            >
                              <div className="flex justify-between items-center">
                                <div className="text-xl">
                                  {getAbbreviatedAddress(reward.mint)}
                                </div>
                                <div>
                                  <div className="text-xs uppercase text-right">
                                    total
                                  </div>
                                  <div className="text-xl text-right">
                                    {getAmountWithDecimals(
                                      reward.amount,
                                      reward.decimals
                                    )}
                                  </div>
                                </div>
                              </div>

                              {reward.isSelected && (
                                <div
                                  className="flex flex-col items-center w-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <Divider />
                                  <div className="flex flex-col w-full items-end mb-6">
                                    <Field
                                      name={`rewards.${index}.mint`}
                                      value={reward.mint}
                                      className="text-gray-800"
                                      hidden
                                    />
                                    <div className="flex w-full items-center justify-between mb-2">
                                      <div className="text-sm uppercase">
                                        reward amount
                                      </div>
                                      <Field
                                        name={`rewards.${index}.rewardAmount`}
                                        className="text-gray-800 bg-gray-100 p-2 rounded max-w-[100px]"
                                        // TODO: will need to check amount - cost amount already allocated
                                        max={reward.amount}
                                        min={0}
                                        type="number"
                                      />
                                    </div>
                                    <div className="text-gray-300 text-xs">
                                      The amount of this token a user must pay
                                    </div>
                                  </div>
                                  <div className="flex flex-col w-full items-end">
                                    <div className="flex w-full items-center justify-between mb-2">
                                      <div className="text-sm uppercase">
                                        payout chance in percent
                                      </div>
                                      <Field
                                        name={`rewards.${index}.payoutChance`}
                                        className="text-gray-800 bg-gray-100 p-2 rounded max-w-[100px]"
                                        max={100}
                                        min={0}
                                        type="number"
                                      />
                                    </div>
                                    <div className="text-gray-300 text-xs">
                                      The chance a user will receive this token
                                      upoon claiming
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
                <div className="flex flex-col w-full items-center uppercase mb-5 mt-8">
                  <div className="text-sm mb-2">payout chance total</div>
                  <div
                    className={classNames([
                      "text-4xl",
                      formik.values.rewards.reduce(
                        (acc, curr) => acc + curr.payoutChance,
                        0
                      ) !== 100
                        ? "text-red-600"
                        : "text-green-300",
                    ])}
                  >
                    {" "}
                    {formik.values.rewards.reduce(
                      (acc, curr) => acc + curr.payoutChance,
                      0
                    )}{" "}
                    %
                  </div>
                </div>
              </>
            )}
            <SubmitButton
              isSubmitting={formik.isSubmitting}
              onClick={formik.handleSubmit}
              buttonText="Continue"
              className="mt-4"
              disabled={
                formik.values.rewards.every(
                  ({ rewardAmount, isSelected }) =>
                    rewardAmount == 0 || !rewardAmount || !isSelected
                ) ||
                // also check that all payoutChances add up to 100
                formik.values.rewards.reduce(
                  (acc, curr) => acc + curr.payoutChance,
                  0
                ) !== 100
              }
            />
          </div>
        </FormWrapper>
      )}
    ></Formik>
  );
};
