import { Dispenser } from "@/app/blueprint/types";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import showToast from "@/features/toasts/show-toast";
import { ClipboardIcon } from "@heroicons/react/24/outline";

export const ConfigSettingsPanel = ({
  dispenser,
  refetch,
}: {
  dispenser: Dispenser;
  refetch: () => void;
}) => {
  const copyTextToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    showToast({
      primaryMessage: "Copied to clipboard",
    });
  };

  return (
    <>
      <h2 className="text-xl uppercase mb-4">Config</h2>
      <PrimaryButton
        className="flex items-center justify-center"
        onClick={() =>
          copyTextToClipboard(
            `https://preview.the-architects.io/in-portals/dispenser-claim?id=${dispenser.id}`
          )
        }
      >
        <ClipboardIcon className="h-5 w-5 inline-block" />
        <span className="mx-2">Copy Portals Interaction Link</span>
      </PrimaryButton>
    </>
  );
};
