"use client";
import { createBlueprintClient } from "@/app/blueprint/client";
import {
  Collection,
  Job,
  StatusUUIDs,
  Token,
  UploadJob,
} from "@/app/blueprint/types";
import {
  ARCHITECTS_API_URL,
  EXECUTION_WALLET_ADDRESS,
} from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { JobIcons } from "@/features/jobs/job-icon";
import { JobStatus } from "@/features/jobs/job-status";
import showToast from "@/features/toasts/show-toast";
import { useCluster } from "@/hooks/cluster";
import { handleError } from "@/utils/errors/log-error";
import { gql, useQuery } from "@apollo/client";
import { useUserData } from "@nhost/nextjs";
import { GET_COLLECTION_BY_ID } from "@the-architects/blueprint-graphql";
import axios from "axios";
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
      imageSizeInBytes
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
  const [collection, setCollection] = useState<Collection | null>(null);
  const [driveAddress, setDriveAddress] = useState<string | null>(null);
  const [job, setJob] = useState<UploadJob | null>(null);
  const user = useUserData();

  const { data: tokenData } = useQuery(GET_PREMINT_TOKENS_BY_COLLECTION_ID, {
    variables: {
      id: params.id,
    },
    fetchPolicy: "no-cache",
  });

  const { loading, data: collectionData } = useQuery(GET_COLLECTION_BY_ID, {
    variables: {
      id: params?.id,
    },
    skip: !params?.id,
    fetchPolicy: "no-cache",
    onCompleted: ({
      collections_by_pk: collection,
    }: {
      collections_by_pk: Collection;
    }) => {
      console.log({ collection });
      setCollection(collection);
    },
  });

  const formik = useFormik({
    initialValues: {
      tokens:
        tokenData?.tokens?.map(
          (token: Token) =>
            ({
              id: token.id,
              amountToMint: token.amountToMint,
              imageSizeInBytes: token.imageSizeInBytes,
            } as Token)
        ) || [],
    },
    onSubmit: async (values) => {
      if (!user?.id) {
        return;
      }
      setIsSavingCollection(true);

      const blueprint = createBlueprintClient({
        cluster,
      });

      if (!collection?.id) {
        showToast({
          primaryMessage: "Collection not found",
        });
        setIsSavingCollection(false);
        return;
      }

      const collectionImageSizeInBytes = collection.imageSizeInBytes || 0;
      const tokenImageSizesInBytes = tokenData.tokens.reduce(
        (acc: number, token: Token) =>
          acc + (Number(token?.imageSizeInBytes) || 0),
        0
      );

      const { job } = await blueprint.jobs.createUploadJob({
        statusText: "Creating SHDW Drive",
        userId: user?.id,
        icon: JobIcons.CREATING_SHADOW_DRIVE,
        cluster,
      });

      setJob(job);

      const sizeInKb =
        Math.ceil(
          (collectionImageSizeInBytes + tokenImageSizesInBytes) / 1024
        ) + 1000;

      console.log({
        sizeInKb,
        collectionImageSizeInBytes,
        tokenImageSizesInBytes,
      });
      debugger;

      let driveAddress: string | null = null;

      const maxRetries = 2;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const { data, status } = await axios.post(
            `${ARCHITECTS_API_URL}/create-drive`,
            {
              name: params.id,
              sizeInKb,
              ownerAddress: EXECUTION_WALLET_ADDRESS,
            }
          );

          if (status !== 200) {
            throw new Error("Failed to create drive");
          }

          const { address, txSig } = data;

          console.log({ address, txSig });

          setDriveAddress(address);
          driveAddress = address;
          debugger;

          break;
        } catch (error) {
          if (attempt === maxRetries) {
            console.log({ error });
            showToast({
              primaryMessage: "Failed to create drive",
            });
            handleError(error as Error);
            throw error;
          }
          console.error(`Attempt ${attempt} failed: ${error}`);
        }
      }

      if (!driveAddress) {
        setIsSavingCollection(false);
        showToast({
          primaryMessage: "Failed to create drive",
        });
        blueprint.jobs.updateUploadJob({
          id: job.id,
          statusId: StatusUUIDs.ERROR,
          statusText: "Failed to create drive.",
          cluster,
        });
        return;
      }

      if (!collection.imageUrl?.length) {
        blueprint.jobs.updateUploadJob({
          id: job.id,
          statusId: StatusUUIDs.ERROR,
          statusText: "Collection image is missing",
          cluster,
        });
        return;
      }

      blueprint.jobs.updateUploadJob({
        id: job.id,
        statusId: StatusUUIDs.IN_PROGRESS,
        statusText: "Uploading files to SHDW Drive",
        cluster,
      });

      for (const token of tokenData.tokens as Token[]) {
        console.log({ token });
        debugger;
        if (!token.image || !token.id) {
          blueprint.jobs.updateUploadJob({
            id: job.id,
            statusId: StatusUUIDs.ERROR,
            statusText: "Token image is missing",
            cluster,
          });
          return;
        }

        const file = await blueprint.files.createFileFromUrl({
          url: token.image,
          fileName: token.id,
        });

        if (!file) {
          blueprint.jobs.updateUploadJob({
            id: job.id,
            statusId: StatusUUIDs.ERROR,
            statusText: "Failed to fetch token image",
            cluster,
          });
          return;
        }

        console.log({ file, driveAddress, token });
        debugger;

        const { success, url } = await blueprint.upload.uploadFile({
          driveAddress,
          file,
          fileName: token.id,
        });

        token.image = url;

        if (!success) {
          blueprint.jobs.updateUploadJob({
            id: job.id,
            statusId: StatusUUIDs.ERROR,
            statusText: "Failed to upload token image",
            cluster,
          });
          return;
        }
      }

      const { success: successOne } =
        await blueprint.collections.updateCollection({
          id: params.id,
          driveAddress,
          tokenCount: values.tokens.reduce(
            (acc: number, token: Token) =>
              acc + (Number(token?.amountToMint) || 0),
            0
          ),
        });

      debugger;

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
      {!!job ? (
        <ContentWrapperYAxisCenteredContent>
          <JobStatus collectionId={params.id} jobId={job.id} setJob={setJob} />
        </ContentWrapperYAxisCenteredContent>
      ) : (
        <>
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
        </>
      )}
    </ContentWrapper>
  );
}
