"use client";
import { defaultCustomizations } from "@/app/blueprint/constants";
import { RewardDisplayType } from "@/app/blueprint/types";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { FormCheckboxWithLabel } from "@/features/UI/forms/form-checkbox-with-label";
import { FormInput } from "@/features/UI/forms/form-input";
import { SelectInputWithLabel } from "@/features/UI/forms/select-input-with-label";
import Spinner from "@/features/UI/spinner";
import DispenserUi from "@/features/dispensers/dispenser-ui";
import showToast from "@/features/toasts/show-toast";
import { GET_DISPENSER_DISPLAYS_BY_DISPENSER_ID } from "@/graphql/queries/get-dispenser-displays-by-dispenser-id";
import { GET_DISPENSER_REWARD_DISPLAY_TYPES } from "@/graphql/queries/get-dispenser-reward-display-types";
import { useQuery } from "@apollo/client";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import classNames from "classnames";
import { Formik, useFormik } from "formik";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";

export default function Page({ params }: { params: any }) {
  const [initialValues, setInitialValues] = useState<any>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  const [rewardDisplayTypes, setRewardDisplayTypes] = useState<
    RewardDisplayType[]
  >([]);

  const formik = useFormik({
    initialValues: initialValues || defaultCustomizations,
    enableReinitialize: true,
    onSubmit: async ({
      backgroundColor,
      textColor,
      shouldDisplayRewards,
      shouldDisplayName,
      shouldDisplayDescription,
      claimButtonColor,
      claimButtonTextColor,
      imageSize,
      shouldDisplayImage,
      nameTextSize,
      descriptionTextSize,
      claimButtonTextSize,
      claimButtonText = "Claim",
      rewardDisplayType,
    }) => {
      try {
        const { data } = await axios.post("/api/update-dispenser-display", {
          dispenserId: params.id,
          backgroundColor,
          textColor,
          shouldDisplayRewards,
          shouldDisplayName,
          shouldDisplayDescription,
          claimButtonColor,
          claimButtonTextColor,
          imageSize,
          shouldDisplayImage,
          nameTextSize,
          descriptionTextSize,
          claimButtonTextSize,
          claimButtonText,
          rewardDisplayType,
        });
        showToast({
          primaryMessage: "Update successful",
        });
        setInitialValues({
          backgroundColor,
          textColor,
          shouldDisplayRewards,
          shouldDisplayName,
          shouldDisplayDescription,
          claimButtonColor,
          claimButtonTextColor,
          imageSize,
          shouldDisplayImage,
          nameTextSize,
          descriptionTextSize,
          claimButtonTextSize,
          claimButtonText,
          rewardDisplayType,
        });
      } catch (error) {
        console.log(error);
      }
    },
  });

  useQuery(GET_DISPENSER_REWARD_DISPLAY_TYPES, {
    onCompleted: ({ rewardDisplayTypes }) => {
      if (rewardDisplayTypes.length > 0) {
        setRewardDisplayTypes(rewardDisplayTypes);
      }
    },
  });

  const { data, loading, error } = useQuery(
    GET_DISPENSER_DISPLAYS_BY_DISPENSER_ID,
    {
      fetchPolicy: "network-only",
      variables: {
        id: params.id,
      },
      onCompleted: ({ dispenser_displays }) => {
        console.log({ dispenser_displays });
        if (dispenser_displays.length === 0) {
          setInitialValues(defaultCustomizations);
          return;
        }
        const values = {
          shouldDisplayRewards:
            dispenser_displays[0]?.shouldDisplayRewards === null
              ? true
              : dispenser_displays[0]?.shouldDisplayRewards,
          shouldDisplayName:
            dispenser_displays[0]?.shouldDisplayName === null
              ? true
              : dispenser_displays[0]?.shouldDisplayName,
          shouldDisplayDescription:
            dispenser_displays[0]?.shouldDisplayDescription === null
              ? true
              : dispenser_displays[0]?.shouldDisplayDescription,
          shouldDisplayImage:
            dispenser_displays[0]?.shouldDisplayImage === null
              ? true
              : dispenser_displays[0]?.shouldDisplayImage,
          backgroundColor:
            dispenser_displays[0]?.backgroundColor ||
            defaultCustomizations.backgroundColor,
          textColor:
            dispenser_displays[0]?.textColor || defaultCustomizations.textColor,
          claimButtonTextColor:
            dispenser_displays[0]?.claimButtonTextColor ||
            defaultCustomizations.claimButtonTextColor,
          claimButtonColor:
            dispenser_displays[0]?.claimButtonColor ||
            defaultCustomizations.claimButtonColor,
          imageSize: dispenser_displays[0]?.imageSize || 120,
          nameTextSize: dispenser_displays[0]?.nameTextSize || 24,
          descriptionTextSize: dispenser_displays[0]?.descriptionTextSize || 16,
          claimButtonTextSize: dispenser_displays[0]?.claimButtonTextSize || 16,
          claimButtonText: dispenser_displays[0]?.claimButtonText || "Claim",
          rewardDisplayType:
            dispenser_displays[0]?.rewardDisplayType ||
            rewardDisplayTypes[0]?.id,
        };
        setInitialValues(values);
      },
    }
  );

  useEffect(() => {
    if (!initialValues) return;
    const isDirty = Object.keys(formik.values).some((key) => {
      return formik.values[key] !== initialValues[key];
    });
    console.log(isDirty);
    if (isDirty) {
      setIsFormDirty(true);
    } else {
      setIsFormDirty(false);
    }
  }, [formik.values, initialValues]);

  if (!params?.id) return <div>Dispenser not found</div>;

  if (loading)
    return (
      <ContentWrapper className="flex flex-col items-center">
        <div className="pt-48">
          <Spinner />
        </div>
      </ContentWrapper>
    );

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="absolute top-0 bottom-0 left-0 right-0 z-50">
        <div className="flex h-full flex-1 w-full">
          <Link href={`/me/dispenser/${params.id}`}>
            <SecondaryButton className="absolute top-8 left-8 flex items-center">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </SecondaryButton>
          </Link>

          <DispenserUi
            dispenserId={params.id}
            backgroundColor={formik.values.backgroundColor}
            textColor={formik.values.textColor}
            shouldDisplayRewards={formik.values.shouldDisplayRewards}
            shouldDisplayName={formik.values.shouldDisplayName}
            shouldDisplayDescription={formik.values.shouldDisplayDescription}
            shouldDisplayImage={formik.values.shouldDisplayImage}
            claimButtonColor={formik.values.claimButtonColor}
            claimButtonTextColor={formik.values.claimButtonTextColor}
            imageSize={formik.values.imageSize}
            nameTextSize={formik.values.nameTextSize}
            descriptionTextSize={formik.values.descriptionTextSize}
            claimButtonTextSize={formik.values.claimButtonTextSize}
            claimButtonText={formik.values.claimButtonText}
            rewardDisplayType={formik.values.rewardDisplayType}
            isBeingEdited={true}
          >
            <div
              className={classNames([
                "fixed flex w-full justify-center transition-all duration-500 ease-in-out pointer-events-none",
                isFormDirty ? "bottom-0" : "-bottom-32",
              ])}
            >
              <div className="bg-gray-800 p-4 px-8 rounded-t-lg pointer-events-auto shadow-lg">
                <div className="uppercase text-sm text-center mb-4 text-gray-300">
                  Save changes?
                </div>
                <div className="flex items-center">
                  <SubmitButton
                    className="mr-4"
                    onClick={formik.handleSubmit}
                    disabled={!isFormDirty}
                    isSubmitting={formik.isSubmitting}
                  >
                    Save
                  </SubmitButton>
                  <SecondaryButton
                    onClick={(e) => {
                      e.preventDefault();
                      formik.resetForm({ values: initialValues });
                    }}
                  >
                    Revert
                  </SecondaryButton>
                </div>
              </div>
            </div>
          </DispenserUi>

          <div className="flex flex-col h-screen flex-1 w-full bg-gray-800 p-8 min-w-[340px] overflow-y-auto">
            <div className="flex flex-col items-center mb-8">
              <div className="uppercase text-lg mb-2">Background Color</div>
              <HexColorPicker
                className="mb-4"
                color={formik.values.backgroundColor}
                onChange={(color) => {
                  formik.setFieldValue("backgroundColor", color);
                }}
              />
              <div className="flex items-center">
                <div className="uppercase text-sm mr-2">Hex:</div>
                <HexColorInput
                  className="text-gray-800 p-2 rounded w-32 bg-gray-200"
                  color={formik.values.backgroundColor}
                  onChange={(color) => {
                    formik.setFieldValue("backgroundColor", color);
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col items-center mb-8">
              <div className="uppercase text-lg mb-2">Text Color</div>
              <HexColorPicker
                className="mb-4"
                color={formik.values.textColor}
                onChange={(color) => {
                  formik.setFieldValue("textColor", color);
                }}
              />

              <div className="flex items-center">
                <div className="uppercase text-sm mr-2">Hex:</div>
                <HexColorInput
                  className="text-gray-800 p-2 rounded w-32 bg-gray-200"
                  color={formik.values.textColor}
                  onChange={(color) => {
                    formik.setFieldValue("textColor", color);
                  }}
                />
              </div>
            </div>

            <div className="my-2">
              <div className="mb-2">
                <FormCheckboxWithLabel
                  label="Image"
                  name="shouldDisplayImage"
                  value={formik.values.shouldDisplayImage}
                  onChange={(e: any) => {
                    formik.setFieldValue(
                      "shouldDisplayImage",
                      e.target.checked
                    );
                  }}
                />
              </div>
              {!!formik.values.shouldDisplayImage && (
                <div className="flex items-center mb-2">
                  <div className="mr-2">Size:</div>
                  <input
                    type="range"
                    name="imageSize"
                    min={0}
                    max={600}
                    value={formik.values.imageSize}
                    onChange={formik.handleChange}
                  />
                </div>
              )}
            </div>
            <div className="my-2">
              <div className="mb-2">
                <FormCheckboxWithLabel
                  label="Name"
                  name="shouldDisplayName"
                  value={formik.values.shouldDisplayName}
                  onChange={(e: any) => {
                    formik.setFieldValue("shouldDisplayName", e.target.checked);
                  }}
                />
              </div>
              {!!formik.values.shouldDisplayName && (
                <div className="flex items-center mb-2">
                  <div className="mr-2">Size:</div>
                  <input
                    type="range"
                    name="nameTextSize"
                    min={28}
                    max={160}
                    value={formik.values.nameTextSize}
                    onChange={formik.handleChange}
                  />
                </div>
              )}
            </div>
            <div className="my-2">
              <div className="mb-2">
                <FormCheckboxWithLabel
                  label="Description"
                  name="shouldDisplayRewards"
                  value={formik.values.shouldDisplayDescription}
                  onChange={(e: any) => {
                    formik.setFieldValue(
                      "shouldDisplayDescription",
                      e.target.checked
                    );
                  }}
                />
              </div>
              {!!formik.values.shouldDisplayDescription && (
                <div className="flex items-center mb-2">
                  <div className="mr-2">Size:</div>
                  <input
                    type="range"
                    name="descriptionTextSize"
                    min={20}
                    max={160}
                    value={formik.values.descriptionTextSize}
                    onChange={formik.handleChange}
                  />
                </div>
              )}
            </div>
            <div className="my-2">
              <div className="mb-2">
                <FormCheckboxWithLabel
                  label="Rewards List"
                  name="shouldDisplayRewards"
                  value={formik.values.shouldDisplayRewards}
                  onChange={(e: any) => {
                    formik.setFieldValue(
                      "shouldDisplayRewards",
                      e.target.checked
                    );
                  }}
                />
              </div>
            </div>
            {!!formik.values.shouldDisplayRewards && (
              <SelectInputWithLabel
                value={formik.values.rewardDisplayType}
                label="Reward Display Type"
                name="rewardDisplayType"
                options={rewardDisplayTypes.map((type) => ({
                  label: type.label,
                  value: type.name,
                }))}
                onChange={(ev) => {
                  formik.setFieldValue("rewardDisplayType", ev.target.value);
                }}
                onBlur={formik.handleBlur}
                placeholder="Select a reward display type"
                hideLabel={false}
              />
            )}

            <div className="text-2xl uppercase mb-4 pt-8">Claim Button</div>
            <div className="flex flex-col items-center mb-8">
              <div className="uppercase text-lg mb-2">Button Color</div>
              <HexColorPicker
                className="mb-4"
                color={formik.values.claimButtonColor}
                onChange={(color) => {
                  formik.setFieldValue("claimButtonColor", color);
                }}
              />
              <div className="flex items-center">
                <div className="uppercase text-sm mr-2">Hex:</div>
                <HexColorInput
                  className="text-gray-800 p-2 rounded w-32 bg-gray-200"
                  color={formik.values.claimButtonColor}
                  onChange={(color) => {
                    formik.setFieldValue("claimButtonColor", color);
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col items-center mb-8">
              <div className="uppercase text-lg mb-2">Button Text Color</div>
              <HexColorPicker
                className="mb-4"
                color={formik.values.claimButtonTextColor}
                onChange={(color) => {
                  formik.setFieldValue("claimButtonTextColor", color);
                }}
              />
              <div className="flex items-center mb-6">
                <div className="uppercase text-sm mr-2">Hex:</div>
                <HexColorInput
                  className="text-gray-800 p-2 rounded w-32 bg-gray-200"
                  color={formik.values.claimButtonTextColor}
                  onChange={(color) => {
                    formik.setFieldValue("claimButtonTextColor", color);
                  }}
                />
              </div>
              <div className="flex items-center mb-6">
                <div className="mr-2">Button size:</div>
                <input
                  type="range"
                  name="claimButtonTextSize"
                  min={0}
                  max={250}
                  value={formik.values.claimButtonTextSize}
                  onChange={formik.handleChange}
                />
              </div>
              <div className="flex items-center mb-2">
                <div className="mr-4">Text:</div>
                <FormInput
                  name="claimButtonText"
                  value={formik.values.claimButtonText}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
