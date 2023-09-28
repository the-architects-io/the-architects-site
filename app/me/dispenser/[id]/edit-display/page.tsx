"use client";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { FormCheckboxWithLabel } from "@/features/UI/forms/form-checkbox-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import Spinner from "@/features/UI/spinner";
import DispenserUi from "@/features/dispensers/dispenser-ui";
import showToast from "@/features/toasts/show-toast";
import { GET_DISPENSER_DISPLAYS_BY_DISPENSER_ID } from "@/graphql/queries/get-dispenser-displays-by-dispenser-id";
import { useQuery } from "@apollo/client";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import classNames from "classnames";
import { Formik, useFormik } from "formik";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";

const defaultStyles = {
  backgroundColor: "#2d2d2d",
  textColor: "#b6b6b6",
  claimButtonColor: "#7dd3fc",
  claimButtonTextColor: "#000000",
  shouldDisplayRewardsList: true,
  shouldDisplayName: true,
  shouldDisplayDescription: true,
  shouldDisplayImage: true,
  isDirty: false,
};

export default function Page({ params }: { params: any }) {
  const [initialValues, setInitialValues] = useState<any>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  const formik = useFormik({
    initialValues: initialValues || defaultStyles,
    enableReinitialize: true,
    onSubmit: async ({
      backgroundColor,
      textColor,
      shouldDisplayRewardsList,
      shouldDisplayName,
      shouldDisplayDescription,
      claimButtonColor,
      claimButtonTextColor,
      shouldDisplayImage,
    }) => {
      try {
        const { data } = await axios.post("/api/update-dispenser-display", {
          dispenserId: params.id,
          backgroundColor,
          textColor,
          shouldDisplayRewardsList,
          shouldDisplayName,
          shouldDisplayDescription,
          claimButtonColor,
          claimButtonTextColor,
          shouldDisplayImage,
        });
        showToast({
          primaryMessage: "Update successful",
        });
        setInitialValues({
          backgroundColor,
          textColor,
          shouldDisplayRewardsList,
          shouldDisplayName,
          shouldDisplayDescription,
          claimButtonColor,
          claimButtonTextColor,
          shouldDisplayImage,
        });
      } catch (error) {
        console.log(error);
      }
    },
  });

  const { data, loading, error } = useQuery(
    GET_DISPENSER_DISPLAYS_BY_DISPENSER_ID,
    {
      variables: {
        id: params.id,
      },
      onCompleted: ({ dispenser_displays }) => {
        const values = {
          backgroundColor:
            dispenser_displays[0]?.backgroundColor ||
            defaultStyles.backgroundColor,
          textColor:
            dispenser_displays[0]?.textColor || defaultStyles.textColor,
          shouldDisplayRewardsList:
            dispenser_displays[0]?.shouldDisplayRewardsList ||
            defaultStyles.shouldDisplayRewardsList,
          shouldDisplayName:
            dispenser_displays[0]?.shouldDisplayName ||
            defaultStyles.shouldDisplayName,
          shouldDisplayDescription:
            dispenser_displays[0]?.shouldDisplayDescription ||
            defaultStyles.shouldDisplayDescription,
          claimButtonColor:
            dispenser_displays[0]?.claimButtonColor ||
            defaultStyles.claimButtonColor,
          shouldDisplayImage:
            dispenser_displays[0]?.shouldDisplayImage ||
            defaultStyles.shouldDisplayImage,
          claimButtonTextColor:
            dispenser_displays[0]?.claimButtonTextColor ||
            defaultStyles.claimButtonTextColor,
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
            shouldDisplayRewardsList={formik.values.shouldDisplayRewardsList}
            shouldDisplayName={formik.values.shouldDisplayName}
            shouldDisplayDescription={formik.values.shouldDisplayDescription}
            shouldDisplayImage={formik.values.shouldDisplayImage}
            claimButtonColor={formik.values.claimButtonColor}
            claimButtonTextColor={formik.values.claimButtonTextColor}
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
            <div className="flex flex-col items-center mb-8">
              <div className="uppercase text-lg mb-2">Claim Button Color</div>
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
              <div className="uppercase text-lg mb-2">
                Claim Button Text Color
              </div>
              <HexColorPicker
                className="mb-4"
                color={formik.values.claimButtonTextColor}
                onChange={(color) => {
                  formik.setFieldValue("claimButtonTextColor", color);
                }}
              />
              <div className="flex items-center">
                <div className="uppercase text-sm mr-2">Hex:</div>
                <HexColorInput
                  className="text-gray-800 p-2 rounded w-32 bg-gray-200"
                  color={formik.values.claimButtonTextColor}
                  onChange={(color) => {
                    formik.setFieldValue("claimButtonTextColor", color);
                  }}
                />
              </div>
            </div>

            <div className="uppercase text-lg mb-2">Details</div>
            <FormCheckboxWithLabel
              label="Display Image"
              name="shouldDisplayImage"
              value={formik.values.shouldDisplayImage}
              onChange={(e: any) => {
                formik.setFieldValue("shouldDisplayImage", e.target.checked);
              }}
            />
            <FormCheckboxWithLabel
              label="Display Title"
              name="shouldDisplayName"
              value={formik.values.shouldDisplayName}
              onChange={(e: any) => {
                formik.setFieldValue("shouldDisplayName", e.target.checked);
              }}
            />
            <FormCheckboxWithLabel
              label="Display Description"
              name="shouldDisplayRewardsList"
              value={formik.values.shouldDisplayDescription}
              onChange={(e: any) => {
                formik.setFieldValue(
                  "shouldDisplayDescription",
                  e.target.checked
                );
              }}
            />
            <FormCheckboxWithLabel
              label="Display Rewards List"
              name="shouldDisplayRewardsList"
              value={formik.values.shouldDisplayRewardsList}
              onChange={(e: any) => {
                formik.setFieldValue(
                  "shouldDisplayRewardsList",
                  e.target.checked
                );
              }}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
