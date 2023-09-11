"use client";

import axios from "axios";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import {
  Field,
  FieldArray,
  useFormik,
  useField,
  Form,
  ErrorMessage,
  FormikProvider,
  Formik,
} from "formik";
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
import { FormInput } from "@/features/UI/forms/form-input";
import { Divider } from "@/features/UI/divider";

export const DispenserCostForm = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const router = useRouter();
  const user = useUserData();
  const [isFetching, setIsFetching] = useState(false);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);

  function MyTextInput({ label, ...props }: any) {
    // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
    // which we can spread on <input> and alse replace ErrorMessage entirely.
    const [field, meta] = useField(props);
    return (
      <>
        <label htmlFor={props.id || props.name}>{label}</label>
        <input className="text-input" {...field} type="text" {...props} />
        {meta.touched && meta.error ? (
          <div className="error">{meta.error}</div>
        ) : null}
      </>
    );
  }

  const formik = useFormik({
    initialValues: {
      costs: [] as {
        mint: string;
        costAmount: number;
        isSelected: boolean;
        decimals: number;
        amount: number;
      }[],
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
      formik.setValues({
        costs: tokens.map((token) => ({
          mint: token.mint,
          amount: token.amount,
          costAmount: 0,
          isSelected: false,
          decimals: token.decimals,
        })),
      });
    } catch (error) {
      console.log({ error });
    } finally {
      setIsFetching(false);
    }
  }, [formik, publicKey]);

  useEffect(() => {
    if (!publicKey) return;
    // fetchUserBalances();
  }, [fetchUserBalances, publicKey]);

  return (
    <Formik
      onSubmit={() => {}}
      initialValues={formik.initialValues}
      render={({ values }) => (
        <FormWrapper onSubmit={formik.handleSubmit} className="px-0">
          <SharedHead title="Admin" />
          <div className="flex flex-col items-center justify-center w-full pt-4">
            <div className="max-w-[600px] whitespace-break-spaces">
              {JSON.stringify(
                formik?.values?.costs?.filter((cost) => cost.isSelected),
                null,
                2
              )}
            </div>
            <div className="text-xl mb-4">Select Costs</div>
            {/* {tokens.length ? (
          <div className="flex flex-col items-center w-full">
            {tokens.map((token, index) => (
              <div
                onClick={() => {
                  const costs = formik.values.costs;
                  const cost = costs[index];
                  if (cost.isSelected) {
                    costs[index] = {
                      ...cost,
                      isSelected: false,
                    };
                  } else {
                    costs[index] = {
                      ...cost,
                      isSelected: true,
                    };
                  }
                  formik.setValues({
                    ...formik.values,
                    costs,
                  });
                }}
                className={classNames(
                  "p-4 px-6 border-2 rounded-lg my-2 cursor-pointer w-full",
                  true ? "border-sky-300" : "border-gray-600"
                )}
                key={index}
              >
                <div className="flex justify-between items-center">
                  <div className="text-xl">
                    {getAbbreviatedAddress(token.mint)}
                  </div>
                  <div>
                    <div className="text-xs uppercase text-right">total</div>
                    <div className="text-xl text-right">
                      {getAmountWithDecimals(token.amount, token.decimals)}
                    </div>
                  </div>
                </div>

                {true && (
                  <div className="flex flex-col items-center w-full">
                    <Divider />
                    <div className="flex flex-col w-full items-end">
                      <Field
                        name={`costs.${index}.mint`}
                        value={token.mint}
                        className="text-gray-800"
                        hidden
                      />
                      <div className="flex w-full items-center justify-between mb-2">
                        <div className="text-sm uppercase">cost amount</div>
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
          </div>
        ) : (
          <></>
        )} */}

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
                          cost.isSelected ? "border-sky-300" : "border-gray-600"
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

            <PrimaryButton onClick={() => fetchUserBalances()}>
              test
            </PrimaryButton>
            <SubmitButton
              isSubmitting={formik.isSubmitting}
              onClick={formik.handleSubmit}
              buttonText="Continue"
              disabled={!formik.values.costs?.length || formik.isSubmitting}
            />
          </div>
        </FormWrapper>
      )}
    ></Formik>
  );
};
