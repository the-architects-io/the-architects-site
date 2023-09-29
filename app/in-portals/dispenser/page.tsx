"use client";

import { defaultCustomizations } from "@/app/blueprint/constants";
import DispenserUi from "@/features/dispensers/dispenser-ui";
import { GET_DISPENSER_DISPLAYS_BY_DISPENSER_ID } from "@/graphql/queries/get-dispenser-displays-by-dispenser-id";
import { useQuery } from "@apollo/client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const searchParams = useSearchParams();
  const dispenserId = searchParams.get("id");

  const [shouldDisplayRewards, setShouldDisplayRewards] = useState(true);
  const [shouldDisplayName, setShouldDisplayName] = useState(true);
  const [shouldDisplayDescription, setShouldDisplayDescription] =
    useState(true);
  const [shouldDisplayImage, setShouldDisplayImage] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState(
    defaultCustomizations.backgroundColor
  );
  const [textColor, setTextColor] = useState(defaultCustomizations.textColor);
  const [claimButtonTextColor, setClaimButtonTextColor] = useState(
    defaultCustomizations.claimButtonTextColor
  );
  const [claimButtonColor, setClaimButtonColor] = useState(
    defaultCustomizations.claimButtonColor
  );
  const [imageSize, setImageSize] = useState(120);
  const [nameTextSize, setNameTextSize] = useState(24);
  const [descriptionTextSize, setDescriptionTextSize] = useState(16);
  const [claimButtonTextSize, setClaimButtonTextSize] = useState(16);
  const [claimButtonText, setClaimButtonText] = useState("Claim");

  const { data, loading, error } = useQuery(
    GET_DISPENSER_DISPLAYS_BY_DISPENSER_ID,
    {
      variables: {
        id: dispenserId,
      },
      onCompleted: ({ dispenser_displays }) => {
        console.log({ dispenser_displays });
        if (dispenser_displays.length === 0) {
          return;
        }
        setShouldDisplayRewards(
          dispenser_displays[0]?.shouldDisplayRewards === null
            ? true
            : dispenser_displays[0]?.shouldDisplayRewards
        );
        setShouldDisplayName(
          dispenser_displays[0]?.shouldDisplayName === null
            ? true
            : dispenser_displays[0]?.shouldDisplayName
        );
        setShouldDisplayDescription(
          dispenser_displays[0]?.shouldDisplayDescription === null
            ? true
            : dispenser_displays[0]?.shouldDisplayDescription
        );
        setShouldDisplayImage(
          dispenser_displays[0]?.shouldDisplayImage === null
            ? true
            : dispenser_displays[0]?.shouldDisplayImage
        );
        setBackgroundColor(
          dispenser_displays[0]?.backgroundColor ||
            defaultCustomizations.backgroundColor
        );
        setTextColor(
          dispenser_displays[0]?.textColor || defaultCustomizations.textColor
        );
        setClaimButtonTextColor(
          dispenser_displays[0]?.claimButtonTextColor ||
            defaultCustomizations.claimButtonTextColor
        );
        setClaimButtonColor(
          dispenser_displays[0]?.claimButtonColor ||
            defaultCustomizations.claimButtonColor
        );
        setImageSize(dispenser_displays[0]?.imageSize || 120);
        setNameTextSize(dispenser_displays[0]?.nameTextSize || 24);
        setDescriptionTextSize(
          dispenser_displays[0]?.descriptionTextSize || 16
        );
        setClaimButtonTextSize(
          dispenser_displays[0]?.claimButtonTextSize || 16
        );
        setClaimButtonText(dispenser_displays[0]?.claimButtonText || "Claim");
      },
    }
  );

  return (
    <>
      {!!dispenserId && (
        <DispenserUi
          dispenserId={dispenserId}
          backgroundColor={backgroundColor}
          textColor={textColor}
          shouldDisplayRewards={shouldDisplayRewards}
          shouldDisplayName={shouldDisplayName}
          shouldDisplayDescription={shouldDisplayDescription}
          shouldDisplayImage={shouldDisplayImage}
          claimButtonColor={claimButtonColor}
          claimButtonTextColor={claimButtonTextColor}
          imageSize={imageSize}
          nameTextSize={nameTextSize}
          descriptionTextSize={descriptionTextSize}
          claimButtonTextSize={claimButtonTextSize}
          claimButtonText={claimButtonText}
        />
      )}
    </>
  );
}
