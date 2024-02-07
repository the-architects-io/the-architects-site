"use client";
import { createBlueprintClient } from "@/app/blueprint/client";
import { Token } from "@/app/blueprint/types";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import showToast from "@/features/toasts/show-toast";
import { useCluster } from "@/hooks/cluster";
import { gql, useQuery } from "@apollo/client";
import { useFormik } from "formik";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const GET_PREMINT_TOKENS_BY_COLLECTION_ID = gql`
  query GET_PREMINT_TOKENS_BY_COLLECTION_ID($id: uuid!) {
    tokens(where: { collectionId: { _eq: $id } }) {
      amountToMint
      animation_url
      attributes
      cluster
      collection {
        id
      }
      createdAt
      creators
      description
      external_url
      id
      image
      isPremint
      name
      properties
      seller_fee_basis_points
      symbol
      updatedAt
    }
  }
`;

export default function BuildCollectionPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const { cluster } = useCluster();
  const router = useRouter();
  const [isSavingCollection, setIsSavingCollection] = useState(false);

  const { data: tokenData } = useQuery(GET_PREMINT_TOKENS_BY_COLLECTION_ID, {
    variables: {
      id: params.id,
    },
    fetchPolicy: "no-cache",
  });

  const formik = useFormik({
    initialValues: {
      tokens:
        tokenData?.tokens?.map(
          (token: Token) =>
            ({
              id: token.id,
              amountToMint: token.amountToMint,
            } as Token)
        ) || [],
    },
    onSubmit: async (values) => {
      setIsSavingCollection(true);

      const blueprint = createBlueprintClient({
        cluster,
      });

      const { success: successOne } =
        await blueprint.collections.updateCollection({
          id: params.id,
          tokenCount: values.tokens.reduce(
            (acc: number, token: Token) =>
              acc + (Number(token?.amountToMint) || 0),
            0
          ),
        });

      const { success: successTwo, tokens } =
        await blueprint.tokens.updateTokens({
          tokens: values.tokens,
        });

      if (!successOne || !successTwo) {
        setIsSavingCollection(false);
        showToast({
          primaryMessage: "Error saving",
        });
        return;
      }

      router.push(`/me/collection/create/${params.id}/select-creators`);
    },
  });

  useEffect(() => {
    if (!tokenData?.tokens?.length) return;
    if (formik.values.tokens.length) return;

    formik.setValues({
      tokens:
        tokenData?.tokens?.map(
          (token: Token) =>
            ({
              id: token.id,
              amountToMint: token.amountToMint,
            } as Token)
        ) || [],
    });
  }, [formik, tokenData]);

  return (
    <ContentWrapper className="flex flex-col items-center justify-center text-stone-300">
      {!!tokenData?.tokens?.length && !!formik.values.tokens.length && (
        <div className="flex flex-col w-full">
          <>
            {tokenData.tokens.map((token: Token) => {
              return (
                <div
                  key={token.id}
                  className="flex items-center border border-sky-600 rounded p-4 mb-4 w-full"
                >
                  <Image
                    src={token.image}
                    alt={token.name}
                    height={150}
                    width={150}
                    className="w-24 h-24 rounded-lg mr-8"
                  />
                  <div className="mr-4">{token.name}</div>
                  <div className="mr-4">{token.symbol}</div>
                  <div className="flex flex-grow"></div>
                  <div className="w-48">
                    <FormInputWithLabel
                      label="Amount to mint"
                      type="number"
                      name={`amountToMint`}
                      value={
                        formik.values.tokens.find(
                          (t: Token) => t.id === token.id
                        )?.amountToMint
                      }
                      onChange={(e) => {
                        formik.setFieldValue(
                          `tokens[${formik.values.tokens.findIndex(
                            (t: Token) => t.id === token.id
                          )}].amountToMint`,
                          e.target.value
                        );
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </>
        </div>
      )}
      <Link href={`/me/collection/create/${params.id}/build/add`}>
        <PrimaryButton className="my-8">Add cNFT</PrimaryButton>
      </Link>
      <div className="flex bottom-0 left-0 right-0 fixed w-full justify-center items-center">
        <div className="bg-gray-900 w-full p-8 py-4">
          <SubmitButton
            isSubmitting={isSavingCollection}
            className="w-full"
            disabled={
              !formik.values.tokens.length ||
              formik.values.tokens.some(
                (t: Token) => !t.amountToMint || t.amountToMint < 1
              )
            }
            onClick={formik.handleSubmit}
          >
            Next - Add Creators
          </SubmitButton>
        </div>
      </div>
    </ContentWrapper>
  );
}
