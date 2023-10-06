"use client";

import { defaultCustomizations } from "@/app/blueprint/constants";
import {
  DispenseTokensApiResponse,
  RewardDisplayTypes,
} from "@/app/blueprint/types";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import ConfettiBackground from "@/features/animations/confetti-background";
import DispenserUi from "@/features/dispensers/dispenser-ui";
import { GET_DISPENSER_DISPLAYS_BY_DISPENSER_ID } from "@/graphql/queries/get-dispenser-displays-by-dispenser-id";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { useQuery } from "@apollo/client";
import { isPublicKey } from "@metaplex-foundation/umi";
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
  const [rewardDisplayType, setRewardDisplayType] = useState(
    RewardDisplayTypes.LIST
  );
  const [claimButtonText, setClaimButtonText] = useState("Claim");
  const [dispensedInfo, setDispensedInfo] =
    useState<DispenseTokensApiResponse | null>(null);
  const [amountString, setAmountString] = useState("");
  const [dispensedName, setDispensedName] = useState("");

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
        setRewardDisplayType(
          dispenser_displays[0]?.rewardDisplayType || "list"
        );
      },
    }
  );

  useEffect(() => {
    if (dispensedInfo) {
      console.log({ dispensedInfo });
      const amountString =
        dispensedInfo?.amount > 0 ? `${dispensedInfo?.amount}x of` : "a";
      setAmountString(amountString);
      const dispensedNameString = isPublicKey(dispensedInfo?.token?.name)
        ? getAbbreviatedAddress(dispensedInfo?.token?.name)
        : dispensedInfo?.token?.name;
      setDispensedName(dispensedNameString);
    }
  }, [dispensedInfo, dispensedName, setAmountString, setDispensedName]);

  return (
    <>
      {!!dispensedInfo && (
        <div className="flex flex-col items-center justify-center w-full min-w-screen min-h-screen">
          <div className="-mt-16">
            <ConfettiBackground />
          </div>
          <div className="text-7xl mb-8">Success!</div>
          {(!!dispensedInfo?.token?.imageUrl ||
            dispensedInfo?.item?.imageUrl) && (
            <ImageWithFallback
              src={
                dispensedInfo?.token?.imageUrl || dispensedInfo?.item?.imageUrl
              }
              alt={dispensedInfo?.token?.name || dispensedInfo?.item?.name}
              className="w-48 h-48 mb-8"
            />
          )}
          <div className="text-4xl">
            You got {amountString} {dispensedName}!
          </div>
          <a
            href={`https://solscan.io/tx/${dispensedInfo.txHash}?cluster=devnet}`}
            target="_blank"
            rel="noreferrer"
            className="underline uppercase pt-8 text-lg"
          >
            View transaction
          </a>
        </div>
      )}
      {!!dispenserId && !dispensedInfo && (
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
          setDispensedInfo={setDispensedInfo}
          rewardDisplayType={rewardDisplayType}
        />
      )}
    </>
  );
}
