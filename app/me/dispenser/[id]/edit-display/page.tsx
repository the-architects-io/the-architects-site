"use client";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import { FormCheckboxWithLabel } from "@/features/UI/forms/form-checkbox-with-label";
import DispenserUi from "@/features/dispensers/dispenser-ui";
import showToast from "@/features/toasts/show-toast";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useCallback, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";

export default function Page({ params }: { params: any }) {
  const [backgroundColor, setBackgroundColor] = useState("#2d2d2d");
  const [textColor, setTextColor] = useState("#b6b6b6");
  const [shouldDisplayRewardsList, setShouldDisplayRewardsList] =
    useState(true);
  const [shouldDisplayName, setShouldDisplayName] = useState(true);
  const [shouldDisplayDescription, setShouldDisplayDescription] =
    useState(true);
  const [claimButtonColor, setClaimButtonColor] = useState("#137e83");
  const [shouldDisplayImage, setShouldDisplayImage] = useState(true);

  if (!params?.id) return <div>Dispenser not found</div>;

  const handleSave = () => {
    showToast({
      primaryMessage: "Updates Saved!",
    });
  };

  return (
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
          backgroundColor={backgroundColor}
          textColor={textColor}
          shouldDisplayRewardsList={shouldDisplayRewardsList}
          shouldDisplayName={shouldDisplayName}
          shouldDisplayDescription={shouldDisplayDescription}
          shouldDisplayImage={shouldDisplayImage}
          claimButtonColor={claimButtonColor}
        />
        <div className="flex flex-col h-screen flex-1 w-full bg-gray-800 p-8 min-w-[340px] overflow-y-auto">
          <div className="flex flex-col items-center mb-8">
            <div className="uppercase text-lg mb-2">Background Color</div>
            <HexColorPicker
              className="mb-4"
              color={backgroundColor}
              onChange={setBackgroundColor}
            />
            <div className="flex items-center">
              <div className="uppercase text-sm mr-2">Hex:</div>
              <HexColorInput
                className="text-gray-800 p-2 rounded w-32 bg-gray-200"
                color={backgroundColor}
                onChange={setBackgroundColor}
              />
            </div>
          </div>
          <div className="flex flex-col items-center mb-8">
            <div className="uppercase text-lg mb-2">Text Color</div>
            <HexColorPicker
              className="mb-4"
              color={textColor}
              onChange={setTextColor}
            />
            <div className="flex items-center">
              <div className="uppercase text-sm mr-2">Hex:</div>
              <HexColorInput
                className="text-gray-800 p-2 rounded w-32 bg-gray-200"
                color={textColor}
                onChange={setTextColor}
              />
            </div>
          </div>
          <div className="flex flex-col items-center mb-8">
            <div className="uppercase text-lg mb-2">Claim Button Color</div>
            <HexColorPicker
              className="mb-4"
              color={claimButtonColor}
              onChange={setClaimButtonColor}
            />
            <div className="flex items-center">
              <div className="uppercase text-sm mr-2">Hex:</div>
              <HexColorInput
                className="text-gray-800 p-2 rounded w-32 bg-gray-200"
                color={claimButtonColor}
                onChange={setClaimButtonColor}
              />
            </div>
          </div>
          <div className="uppercase text-lg mb-2">Details</div>
          <FormCheckboxWithLabel
            label="Display Image"
            name="shouldDisplayImage"
            value={shouldDisplayImage}
            onChange={(e: any) => setShouldDisplayImage(e.target.checked)}
          />
          <FormCheckboxWithLabel
            label="Display Title"
            name="shouldDisplayName"
            value={shouldDisplayName}
            onChange={(e: any) => setShouldDisplayName(e.target.checked)}
          />
          <FormCheckboxWithLabel
            label="Display Description"
            name="shouldDisplayRewardsList"
            value={shouldDisplayDescription}
            onChange={(e: any) => setShouldDisplayDescription(e.target.checked)}
          />
          <FormCheckboxWithLabel
            label="Display Rewards List"
            name="shouldDisplayRewardsList"
            value={shouldDisplayRewardsList}
            onChange={(e: any) => setShouldDisplayRewardsList(e.target.checked)}
          />
          <PrimaryButton className="mt-8" onClick={handleSave}>
            Save
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
