"use client";
import { createBlueprintClient } from "@/app/blueprint/client";
import { Collection, Creator } from "@/app/blueprint/types";
import { creatorsAreValid } from "@/app/blueprint/utils";
import { BASE_URL } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { DndCard } from "@/features/UI/dnd-card";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { SelectInputWithLabel } from "@/features/UI/forms/select-input-with-label";
import Spinner from "@/features/UI/spinner";
import { CreateCollectionCreatorsChecklist } from "@/features/collection/create-collection-creators-checklist";
import showToast from "@/features/toasts/show-toast";
import { GET_COLLECTION_BY_ID } from "@/graphql/queries/get-collection-by-id";
import { useCluster } from "@/hooks/cluster";
import { isValidPublicKey } from "@/utils/rpc";
import { useQuery } from "@apollo/client";
import {
  CheckBadgeIcon,
  PlusIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useUserData } from "@nhost/nextjs";
import { FieldArray, FormikProvider, useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { isUuid } from "uuidv4";
import {
  getConcurrentMerkleTreeAccountSize,
  ALL_DEPTH_SIZE_PAIRS,
} from "@solana/spl-account-compression";
import {
  allDepthSizes,
  defaultDepthPair,
  getMinimumMaxBufferSizeAndMaxDepthForCapacity,
  largestDepth,
} from "@/app/blueprint/utils/merkle-trees";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";

export enum TreeCreationMethod {
  CHEAPEST = "CHEAPEST",
  TRADABLE = "TRADABLE",
}

const treeCreationMethodOptions = [
  {
    value: TreeCreationMethod.CHEAPEST,
    label: "Cheapest",
  },
  {
    value: TreeCreationMethod.TRADABLE,
    label: "Trading Platform Friendly",
  },
];

type TreeOptions = {
  maxDepth: number;
  maxBufferSize: number;
  canopyDepth: number;
};

export default function SetCreatorsPage({
  params,
}: {
  params: { id: string };
}) {
  const user = useUserData();
  const [creators, setCreators] = useState<Creator[] | null>(null);
  const [collectionId, setCollectionId] = useState<string | null>(params?.id);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const router = useRouter();
  const { cluster } = useCluster();
  const { connection } = useConnection();
  const [treeCost, setTreeCost] = useState<number | null>(null);
  const [treeMaxDepth, setTreeMaxDepth] = useState<number | null>(null);
  const [treeMaxBufferSize, setTreeMaxBufferSize] = useState<number | null>(
    null
  );
  const [treeCanopyDepth, setTreeCanopyDepth] = useState<number | null>(null);
  const [tokenCount, setTokenCount] = useState<number>(100);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [hasCalcError, setHasCalcError] = useState<boolean>(false);

  function calculateSpaceRequired(options: TreeOptions): number {
    return getConcurrentMerkleTreeAccountSize(
      options.maxDepth,
      options.maxBufferSize,
      options.canopyDepth
    );
  }

  const findBestTreeCost = useCallback(
    async (
      creatorsCount: number,
      tokenCount: number
    ): Promise<{
      maxDepth: number;
      maxBufferSize: number;
      canopyDepth: number;
      cost: number;
    }> => {
      if (tokenCount <= 0 || tokenCount > 1073741824) {
        throw new Error("Invalid tokenCount");
      }

      const maxProofLength =
        creatorsCount > 1 ? 5 : creatorsCount === 1 ? 8 : 12;
      const maxCanopyDepth = 17;

      const { maxDepth: minDepth, maxBufferSize: minBufferSize } =
        getMinimumMaxBufferSizeAndMaxDepthForCapacity(tokenCount);

      let bestConfig = {
        maxDepth: 0,
        maxBufferSize: 0,
        canopyDepth: 0,
        requiredSpace: Number.MAX_VALUE,
      };

      for (const pair of ALL_DEPTH_SIZE_PAIRS) {
        if (pair.maxDepth >= minDepth && pair.maxBufferSize >= minBufferSize) {
          for (
            let canopyDepth = 0;
            canopyDepth <= Math.min(pair.maxDepth, maxCanopyDepth);
            canopyDepth++
          ) {
            const effectiveDepth = pair.maxDepth - canopyDepth;
            if (effectiveDepth <= maxProofLength) {
              const requiredSpace = getConcurrentMerkleTreeAccountSize(
                pair.maxDepth,
                pair.maxBufferSize,
                canopyDepth
              );

              if (
                requiredSpace < bestConfig.requiredSpace &&
                requiredSpace >= tokenCount
              ) {
                // Prefer smaller requiredSpace
                bestConfig = {
                  maxDepth: pair.maxDepth,
                  maxBufferSize: pair.maxBufferSize,
                  canopyDepth,
                  requiredSpace,
                };
              }
            }
          }
        }
      }

      if (bestConfig.requiredSpace < Number.MAX_VALUE) {
        const cost =
          (await connection.getMinimumBalanceForRentExemption(
            bestConfig.requiredSpace
          )) / LAMPORTS_PER_SOL;
        return { ...bestConfig, cost };
      } else {
        throw new Error(
          "No valid configuration found for the given tokenCount"
        );
      }
    },
    [connection]
  );

  const { loading } = useQuery(GET_COLLECTION_BY_ID, {
    skip: !params?.id || !isUuid(params?.id) || !user?.id,
    variables: { id: params?.id },
    onCompleted: ({
      collections_by_pk: collection,
    }: {
      collections_by_pk: Collection;
    }) => {
      if (!collection || collection.owner.id !== user?.id) {
        router.push(`${BASE_URL}/me/collection`);
      } else {
        setCollectionId(collection.id);
        setCreators(collection.creators);
      }
    },
  });

  const formik = useFormik({
    initialValues: {
      creators: [{ address: "", share: 0, sortOrder: 0, id: 0 }] as Creator[],
      treeCreationMethod: TreeCreationMethod.CHEAPEST,
    },

    onSubmit: async ({ creators }) => {
      if (!collectionId) return;
      setIsSaving(true);

      const blueprint = createBlueprintClient({
        cluster,
      });

      const { success } = await blueprint.collections.updateCollection({
        id: collectionId,
        creators,
      });

      if (!success) {
        showToast({
          primaryMessage: "There was a problem",
        });
        setIsSaving(false);
        return;
      }

      router.push(
        `${BASE_URL}/me/collection/create/${collectionId}/upload-assets`
      );
    },
  });

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      formik.setFieldValue(
        "creators",
        formik.values.creators.map((creator, index) => {
          if (index === dragIndex) {
            return { ...creator, sortOrder: hoverIndex };
          }
          if (index === hoverIndex) {
            return { ...creator, sortOrder: dragIndex };
          }
          return creator;
        })
      );
    },
    [formik]
  );

  const handleAddCreator = useCallback(() => {
    formik.setFieldValue("creators", [
      ...formik.values.creators,
      {
        address: "",
        share: 0,
        sortOrder: formik.values.creators.length,
        id: formik.values.creators.length,
      },
    ]);
  }, [formik]);

  const findCheapestTreeCost = useCallback(
    async (creatorsCount: number, tokenCount: number): Promise<number> => {
      const { maxBufferSize, maxDepth } =
        getMinimumMaxBufferSizeAndMaxDepthForCapacity(tokenCount);
      const requiredSpace = calculateSpaceRequired({
        maxDepth,
        maxBufferSize,
        canopyDepth: 0,
      });
      const cost = await connection.getMinimumBalanceForRentExemption(
        requiredSpace
      );
      setTreeCanopyDepth(0);
      setTreeMaxDepth(maxDepth);
      setTreeMaxBufferSize(maxBufferSize);
      debugger;

      return cost / LAMPORTS_PER_SOL;
    },
    [connection]
  );

  useEffect(() => {
    console.log(tokenCount);
    const creatorCount = formik.values.creators.length;

    if (tokenCount <= 0) {
      setIsCalculating(false);
      return;
    }

    const calculateCost = async () => {
      try {
        setIsCalculating(true);
        setHasCalcError(false);
        let cost;
        let canopyDepth = 0;
        let maxDepth = 0;
        let maxBufferSize = 0;

        if (formik.values.treeCreationMethod === TreeCreationMethod.CHEAPEST) {
          cost = await findCheapestTreeCost(creatorCount, tokenCount);
        } else if (
          formik.values.treeCreationMethod === TreeCreationMethod.TRADABLE
        ) {
          const result = await findBestTreeCost(creatorCount, tokenCount);
          cost = result.cost;
          canopyDepth = result.canopyDepth;
          maxDepth = result.maxDepth;
          maxBufferSize = result.maxBufferSize;
          setTreeCanopyDepth(canopyDepth);
          setTreeMaxDepth(maxDepth);
          setTreeMaxBufferSize(maxBufferSize);
        }

        if (!cost) {
          setHasCalcError(true);
          return;
        }

        setTreeCost(cost);
      } catch (error) {
        console.error(error);
        setHasCalcError(true);
      } finally {
        setIsCalculating(false);
      }
    };

    calculateCost();
  }, [
    creators,
    findBestTreeCost,
    findCheapestTreeCost,
    formik.values.creators.length,
    formik.values.treeCreationMethod,
    tokenCount,
  ]);

  useEffect(() => {
    if (creators?.length && formik.values.creators.length === 0) {
      formik.setFieldValue(
        "creators",
        creators.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      );
    }
  }, [creators, formik, formik.values.creators.length]);

  if (loading) {
    return (
      <ContentWrapper className="flex flex-col justify-center items-center">
        <Spinner />
      </ContentWrapper>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <FormikProvider value={formik}>
        <ContentWrapper className="flex">
          <div className="flex flex-col items-center mb-16 w-full md:w-[500px]">
            <CreateCollectionCreatorsChecklist
              creators={formik.values.creators}
            />
          </div>
          <div className="flex flex-col items-center w-full px-8">
            <div className="text-lg mb-4">Creators</div>
            <p className="text-sm mb-4 max-w-sm italic text-gray-200 text-center">
              The wallets that will receive royalties from the sale of items in
              this collection. You can also drag and drop to reorder the
              creators in the creators array.
            </p>
            <>
              <FieldArray
                name="creators"
                render={(arrayHelpers) => (
                  <div className="bg-black w-full">
                    {formik.values.creators
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((creator, index) => (
                        <DndCard
                          className="mb-4"
                          key={creator.id}
                          id={creator.id}
                          index={index}
                          moveCard={moveCard}
                        >
                          <div className="relative w-full flex">
                            <div className="flex flex-1 mr-4">
                              <FormInputWithLabel
                                label="Creator Address"
                                name={`creators.${index}.address`}
                                placeholder="Creator Address"
                                onChange={formik.handleChange}
                                value={creator.address}
                              />
                              {isValidPublicKey(creator.address) ? (
                                <CheckBadgeIcon className="h-6 w-6 text-green-500 self-end ml-2 mb-1.5" />
                              ) : (
                                <XCircleIcon className="h-6 w-6 text-red-500 self-end ml-2 mb-1.5" />
                              )}
                            </div>
                            <div className="w-24 mr-8">
                              <FormInputWithLabel
                                label="Share (in %)"
                                name={`creators.${index}.share`}
                                placeholder="Share"
                                type="number"
                                min={0}
                                max={100}
                                onChange={formik.handleChange}
                                value={creator.share}
                              />
                            </div>
                            {formik.values.creators.length > 1 && (
                              <button
                                className=" absolute -top-2 -right-2.5 cursor-pointer"
                                type="button"
                                onClick={() => arrayHelpers.remove(index)}
                              >
                                <XMarkIcon className="h-6 w-6 text-gray-100" />
                              </button>
                            )}
                          </div>
                        </DndCard>
                      ))}
                  </div>
                )}
              />
              <PrimaryButton
                className="text-gray-100 mt-4"
                onClick={handleAddCreator}
                disabled={
                  !(
                    formik.values.creators.every(
                      (c) => !!c.address && isValidPublicKey(c.address)
                    ) && formik.values.creators.every((c) => c.share)
                  )
                }
              >
                <PlusIcon className="h-6 w-6" />
                Add Creator
              </PrimaryButton>
            </>
            <div className="flex flex-col items-center mb-16 w-full md:w-[500px] mt-16">
              <div className="text-lg mb-4">Merkle Tree</div>

              <SelectInputWithLabel
                value={formik.values.treeCreationMethod}
                label="Tree Creation Method"
                name="treeCreationMethod"
                options={treeCreationMethodOptions}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Select tree creation method"
                hideLabel={false}
              />
              <FormInputWithLabel
                label="Number of tokens"
                name="tokenCount"
                placeholder="Number of tokens"
                type="number"
                min={0}
                onChange={(e) => {
                  setTokenCount(parseInt(e.target.value));
                }}
                value={tokenCount}
              />
              <div className="flex mt-8">
                <div>Estimated cost:</div>
                {!!hasCalcError ? (
                  <div className="ml-2 text-red-500">Invalid tree size</div>
                ) : (
                  <>
                    <div className="ml-2">
                      {treeCost && !isCalculating ? (
                        `${treeCost} SOL`
                      ) : (
                        <Spinner />
                      )}
                    </div>
                  </>
                )}
              </div>
              {!hasCalcError && !!treeMaxBufferSize && (
                <div className="flex mt-8">
                  <div>Max Buffer Size:</div>
                  <>
                    <div className="ml-2">
                      {treeMaxBufferSize && !isCalculating ? (
                        `${treeMaxBufferSize} bytes`
                      ) : (
                        <Spinner />
                      )}
                    </div>
                  </>
                </div>
              )}
              {!hasCalcError && !!treeMaxDepth && (
                <div className="flex mt-8">
                  <div>Max Depth:</div>
                  <>
                    <div className="ml-2">
                      {treeMaxDepth && !isCalculating ? (
                        `${treeMaxDepth} bytes`
                      ) : (
                        <Spinner />
                      )}
                    </div>
                  </>
                </div>
              )}
              {!hasCalcError && !!treeCanopyDepth && (
                <div className="flex mt-8">
                  <div>Canopy depth:</div>
                  <>
                    <div className="ml-2">
                      {treeCanopyDepth && !isCalculating ? (
                        `${treeCanopyDepth} bytes`
                      ) : (
                        <Spinner />
                      )}
                    </div>
                  </>
                </div>
              )}
            </div>
          </div>
          <div className="flex bottom-0 left-0 right-0 fixed w-full justify-center items-center">
            <div className="bg-gray-900 w-full p-8 py-4">
              <SubmitButton
                isSubmitting={formik.isSubmitting || isSaving}
                className="w-full"
                disabled={!creatorsAreValid(formik.values.creators)}
                onClick={formik.handleSubmit}
              >
                Next - Add Assets
              </SubmitButton>
            </div>
          </div>
        </ContentWrapper>
      </FormikProvider>
    </DndProvider>
  );
}
