import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DispenserDisplay } from "@/app/blueprint/types";
import { UPDATE_DISPENSER_DISPLAY } from "@/graphql/mutations/update-dispenser-display";
import { GET_DISPENSER_DISPLAYS_BY_DISPENSER_ID } from "@/graphql/queries/get-dispenser-displays-by-dispenser-id";
import { ADD_DISPENSER_DISPLAY } from "@/graphql/mutations/add-dispenser-display";
import { handleError } from "@/utils/errors/log-error";

export async function POST(req: NextRequest) {
  const {
    dispenserId,
    backgroundColor,
    textColor,
    shouldDisplayRewards,
    shouldDisplayName,
    shouldDisplayDescription,
    claimButtonColor,
    claimButtonTextColor,
    shouldDisplayImage,
    imageSize,
    nameTextSize,
    descriptionTextSize,
    claimButtonTextSize,
    claimButtonText,
    rewardDisplayType,
    noop,
    cardWidth,
  } = await req.json();

  console.log("=== UPDATE DISPENSER DISPLAY PARAMS ===");
  console.log({
    dispenserId,
    backgroundColor,
    textColor,
    shouldDisplayRewards,
    shouldDisplayName,
    shouldDisplayDescription,
    claimButtonColor,
    claimButtonTextColor,
    shouldDisplayImage,
    imageSize,
    nameTextSize,
    descriptionTextSize,
    claimButtonTextSize,
    claimButtonText,
    rewardDisplayType,
    noop,
    cardWidth,
  });

  if (noop)
    return NextResponse.json(
      {
        noop: true,
        endpoint: "update-dispenser-rewards",
      },
      { status: 200 }
    );

  if (!dispenserId) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  // lookup existing dispenser display
  let dispenserDisplay: DispenserDisplay | null = null;
  try {
    const {
      dispenser_displays,
    }: {
      dispenser_displays: DispenserDisplay[];
    } = await client.request(GET_DISPENSER_DISPLAYS_BY_DISPENSER_ID, {
      id: dispenserId,
    });

    if (dispenser_displays.length > 0) {
      dispenserDisplay = dispenser_displays[0];
    }

    console.log("=== FOUND DISPENSER DISPLAY ===");
    console.log({ dispenser_displays });
  } catch (error) {
    handleError(error as Error);
    return NextResponse.json(
      { error: "Error getting dispenser display" },
      { status: 500 }
    );
  }

  const display = {
    backgroundColor,
    textColor,
    shouldDisplayRewards,
    shouldDisplayName,
    shouldDisplayDescription,
    claimButtonColor,
    claimButtonTextColor,
    shouldDisplayImage,
    imageSize,
    nameTextSize,
    descriptionTextSize,
    claimButtonTextSize,
    claimButtonText,
    rewardDisplayType,
    cardWidth,
  };

  if (dispenserDisplay) {
    console.log("=== UPDATING ===");
    try {
      const {
        update_dispenser_displays_by_pk,
      }: {
        update_dispenser_displays_by_pk: DispenserDisplay;
      } = await client.request(UPDATE_DISPENSER_DISPLAY, {
        id: dispenserDisplay.id,
        display,
      });

      if (update_dispenser_displays_by_pk) {
        dispenserDisplay = update_dispenser_displays_by_pk;
      }

      console.log("=== UPDATED DISPENSER DISPLAY ===");
      console.log({ update_dispenser_displays_by_pk });
    } catch (error) {
      handleError(error as Error);
      return NextResponse.json(
        { error: "Error updating dispenser display" },
        { status: 500 }
      );
    }
  } else {
    console.log("=== CREATING ===");
    try {
      const {
        insert_dispenser_displays_one,
      }: {
        insert_dispenser_displays_one: DispenserDisplay;
      } = await client.request(ADD_DISPENSER_DISPLAY, {
        display: {
          ...display,
          dispenserId,
        },
      });

      dispenserDisplay = insert_dispenser_displays_one;
    } catch (error) {
      handleError(error as Error);
      return NextResponse.json(
        { error: "Error creating dispenser display" },
        { status: 500 }
      );
    }
  }

  console.log("=== DISPENSER DISPLAY RETURN ===");
  console.log({ dispenserDisplay });

  return NextResponse.json(dispenserDisplay, { status: 200 });
}
