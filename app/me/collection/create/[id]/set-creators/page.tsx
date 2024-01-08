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
import classNames from "classnames";
import { FieldArray, FormikProvider, useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { isUuid } from "uuidv4";

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
    <ContentWrapper className="flex">
      <div className="flex flex-col items-center mb-16 w-full md:w-[500px]">
        <CreateCollectionCreatorsChecklist creators={formik.values.creators} />
      </div>
      <div className="flex flex-col items-center w-full px-8">
        <div className="text-lg mb-4">Creators</div>
        <p className="text-sm mb-4 max-w-sm italic text-gray-200 text-center">
          The wallets that will receive royalties from the sale of items in this
          collection. You can also drag and drop to reorder the creators in the
          creators array.
        </p>
        <>
          <DndProvider backend={HTML5Backend}>
            <FormikProvider value={formik}>
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
            </FormikProvider>
          </DndProvider>
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
          </PrimaryButton>
        </>
      </div>
      <div className="flex bottom-0 left-0 right-0 fixed w-full justify-center items-center">
        <div className="bg-gray-900 w-full p-8 py-4">
          <SubmitButton
            isSubmitting={formik.isSubmitting}
            className="w-full"
            disabled={!creatorsAreValid(formik.values.creators)}
            onClick={formik.handleSubmit}
          >
            Next - Add Assets
          </SubmitButton>
        </div>
      </div>
    </ContentWrapper>
  );
}
