import { ContentWrapper } from "@/features/UI/content-wrapper";
import { formatDateTime } from "@/utils/date-time";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { ShdwDrive, StorageAccountV2 } from "@shadow-drive/sdk";
import { safeParse } from "secure-json-parse";

export default function DriveInfo({
  driveAddress,
  storageAccount,
  shadowDrive,
  refetchFiles,
}: {
  driveAddress: string;
  storageAccount: StorageAccountV2;
  shadowDrive: ShdwDrive | null;
  refetchFiles: (arg0: ShdwDrive) => void;
}) {
  return (
    <div className="flex flex-col p-2">
      <div className="text-3xl mb-4">{storageAccount.identifier}</div>
      <div className="flex flex-col mb-2">
        <div className="uppercase text-gray-400 text-sm font-bold mr-2">
          Drive Address
        </div>
        <div>{getAbbreviatedAddress(driveAddress)}</div>
      </div>
      <div className="flex flex-col mb-2">
        <div className="uppercase text-gray-400 text-sm font-bold mr-2">
          Marked to Delete
        </div>
        <div>{storageAccount?.toBeDeleted ? "Yes" : "No"}</div>
      </div>
      <div className="flex flex-col mb-2">
        <div className="uppercase text-gray-400 text-sm font-bold mr-2">
          Immutable
        </div>
        <div>{storageAccount?.immutable ? "Yes" : "No"}</div>
      </div>
      <div className="flex flex-col mb-2">
        <div className="uppercase text-gray-400 text-sm font-bold mr-2">
          Created At
        </div>
        <div>
          {formatDateTime(
            String(new Date(storageAccount?.creationTime * 1000))
          )}
        </div>
      </div>
    </div>
  );
}
