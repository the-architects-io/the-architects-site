import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { Panel } from "@/features/UI/panel";
import showToast from "@/features/toasts/show-toast";
import ShadowUpload from "@/utils/shadow-upload";
import { PublicKey } from "@metaplex-foundation/js";
import { ShdwDrive } from "@shadow-drive/sdk";

export default function DriveControls({
  shadowDrive,
  driveAddress,
  files,
  refetchFiles,
}: {
  shadowDrive: ShdwDrive | null;
  driveAddress: string;
  files: any[];
  refetchFiles: (arg0: ShdwDrive) => void;
}) {
  const handleDeleteDrive = async () => {
    if (!shadowDrive) return;

    const response = await shadowDrive.deleteStorageAccount(
      new PublicKey(driveAddress)
    );

    if (!response?.txid) {
      showToast({
        primaryMessage: "Error",
        secondaryMessage: `Failed to delete drive`,
      });
      return;
    }

    showToast({
      primaryMessage: "Deleted",
      secondaryMessage: `Deleted drive`,
    });
  };

  const handleDeleteAllFiles = async () => {
    if (!shadowDrive) return;

    for (const filename of files) {
      await shadowDrive.deleteFile(
        new PublicKey(driveAddress),
        `https://shdw-drive.genesysgo.net/${driveAddress}/${filename}`
      );
    }

    showToast({
      primaryMessage: "Files deleted",
      secondaryMessage: "All files deleted",
    });

    refetchFiles(shadowDrive);
  };

  if (!shadowDrive) return null;

  return (
    <div className="flex flex-col justify-center px-4">
      <PrimaryButton className="my-4 w-[160px]" onClick={handleDeleteDrive}>
        Delete drive
      </PrimaryButton>
      {/* <PrimaryButton className="mb-4 w-[160px]" onClick={handleDeleteAllFiles}>
        Delete all files
      </PrimaryButton> */}
      <ShadowUpload
        drive={shadowDrive}
        accountPublicKey={new PublicKey(driveAddress)}
        onCompleted={() => refetchFiles(shadowDrive)}
      />
    </div>
  );
}
