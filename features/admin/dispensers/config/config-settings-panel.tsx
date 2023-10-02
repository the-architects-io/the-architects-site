import { Dispenser } from "@/app/blueprint/types";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import showToast from "@/features/toasts/show-toast";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";

export const ConfigSettingsPanel = ({
  dispenser,
  refetch,
}: {
  dispenser: Dispenser;
  refetch: () => void;
}) => {
  const [cooldownDays, setCooldownDays] = useState(0);
  const [cooldownHours, setCooldownHours] = useState(0);
  const [cooldownMinutes, setCooldownMinutes] = useState(0);
  const [hasCooldown, setHasCooldown] = useState(false);

  const copyTextToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    showToast({
      primaryMessage: "Copied to clipboard",
    });
  };

  useEffect(() => {
    if (!dispenser?.cooldownInMs) {
      setHasCooldown(false);
      return;
    }

    setCooldownDays(Math.floor(dispenser.cooldownInMs / (1000 * 60 * 60 * 24)));
    setCooldownHours(
      Math.floor(
        (dispenser.cooldownInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      )
    );
    setCooldownMinutes(
      Math.floor((dispenser.cooldownInMs % (1000 * 60 * 60)) / (1000 * 60))
    );

    setHasCooldown(true);
  }, [dispenser]);

  return (
    <>
      <h2 className="text-xl uppercase mb-8">Config</h2>
      <div className="flex flex-col items-center justify-center mb-4">
        {!!hasCooldown && (
          <div className="mb-8 flex flex-col">
            <span className="mb-4 uppercase">Payout Cooldown</span>
            <span className="text-4xl text-center">
              {cooldownDays > 0 && <>{cooldownDays}d</>}{" "}
              {cooldownHours > 0 && <>{cooldownHours}h</>}
              {cooldownMinutes > 0 && <>{cooldownMinutes}m</>}
            </span>
          </div>
        )}
      </div>
      <Link href={`/me/dispenser/${dispenser.id}/edit-display`}>
        <PrimaryButton className="flex items-center justify-center mb-4">
          <ClipboardIcon className="h-5 w-5 inline-block" />
          <span className="mx-2">Edit Dispenser Display</span>
        </PrimaryButton>
      </Link>
    </>
  );
};
