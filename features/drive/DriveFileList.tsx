import showToast from "@/features/toasts/show-toast";
import { ClipboardIcon, EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PublicKey } from "@metaplex-foundation/js";
import { ShdwDrive, StorageAccountV2 } from "@shadow-drive/sdk";

export default function DriveFileList({
  files,
  driveAddress,
  shadowDrive,
  storageAccount,
  refetchFiles,
}: {
  files: string[];
  driveAddress: string;
  shadowDrive: ShdwDrive | null;
  storageAccount: StorageAccountV2;
  refetchFiles: (arg0: ShdwDrive) => void;
}) {
  const handleCopyToClipboard = (filename: string) => {
    navigator.clipboard.writeText(
      `https://shdw-drive.genesysgo.net/${driveAddress}/${filename}`
    );
    showToast({
      primaryMessage: "Copied to clipboard",
    });
  };

  const handleDeleteFile = async (filename: string) => {
    if (!shadowDrive) return;

    const response = await shadowDrive.deleteFile(
      new PublicKey(driveAddress),
      `https://shdw-drive.genesysgo.net/${driveAddress}/${filename}`
    );
    console.log({ response });

    if (!response?.transaction_signature) {
      showToast({
        primaryMessage: "Error",
        secondaryMessage: `Failed to delete ${filename}`,
      });
      return;
    }

    showToast({
      primaryMessage: "Deleted",
      secondaryMessage: `Drive marked for deletion`,
    });

    refetchFiles(shadowDrive);
  };

  return (
    <div className="mb-8 w-full px-8 pt-2">
      {!!files?.length ? (
        <div className="flex flex-col w-full">
          <div className="border-b border-gray-600"></div>
          {files.map((filename) => (
            <div
              key={filename}
              className="flex justify-between items-center w-full border-b border-gray-600 py-4 px-2"
            >
              <div>{filename}</div>
              <div className="flex space-x-4">
                <div
                  className="cursor-pointer"
                  onClick={() => handleCopyToClipboard(filename)}
                >
                  <ClipboardIcon className="h-6 w-6" />
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => handleDeleteFile(filename)}
                >
                  <TrashIcon className="h-6 w-6" />
                </div>
                <div>
                  <a
                    href={`https://shdw-drive.genesysgo.net/${driveAddress}/${filename}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <EyeIcon className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 italic">This drive is empty</div>
      )}
    </div>
  );
}
