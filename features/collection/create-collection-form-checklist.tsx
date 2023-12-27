import { Creator } from "@/app/blueprint/types";
import { creatorsAreValid } from "@/app/blueprint/utils";
import { SingleImageUploadResponse } from "@/features/upload/single-image/single-image-upload-field-wrapper";
import {
  CheckBadgeIcon,
  ChevronDoubleRightIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export const CreateCollectionFormChecklist = ({
  collectionImage,
  creators,
  collectionName,
  symbol,
  description,
  sellerFeeBasisPoints,
}: {
  collectionImage: SingleImageUploadResponse | null;
  creators: Creator[];
  collectionName?: string;
  symbol?: string;
  description?: string;
  sellerFeeBasisPoints?: number;
}) => {
  return (
    <div className="flex flex-col border border-gray-600 rounded-lg p-4 w-full space-y-4 py-6">
      <div className="flex space-x-3 items-center">
        <div>
          {!!collectionImage ? (
            <CheckBadgeIcon className="h-6 w-6 text-green-500" />
          ) : (
            <XCircleIcon className="h-6 w-6 text-red-500" />
          )}
        </div>
        <div>Collection Image</div>
      </div>
      <div className="flex flex-col">
        <div className="flex space-x-3 items-center mb-3">
          <div>
            {!!collectionName &&
            !!symbol &&
            !!description &&
            !!sellerFeeBasisPoints ? (
              <CheckBadgeIcon className="h-6 w-6 text-green-500" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-red-500" />
            )}
          </div>
          <div>Collection Info</div>
        </div>
        <ul className="px-6 space-y-2">
          <li className="text-sm text-gray-400">
            <ChevronDoubleRightIcon className="h-4 w-4 inline-block mr-1" />
            Name, symbol, description, and seller fee are required
          </li>
        </ul>
      </div>
      <div className="flex flex-col">
        <div className="flex space-x-3 items-center mb-3">
          <div>
            {creatorsAreValid(creators) ? (
              <CheckBadgeIcon className="h-6 w-6 text-green-500" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-red-500" />
            )}
          </div>
          <div>Creators</div>
        </div>
        <ul className="px-6 space-y-2">
          <li className="text-sm text-gray-400">
            <ChevronDoubleRightIcon className="h-4 w-4 inline-block mr-1" />
            At least one creator is required
          </li>
          <li className="text-sm text-gray-400">
            <ChevronDoubleRightIcon className="h-4 w-4 inline-block mr-1" />
            Share total must be 100%
          </li>
        </ul>
      </div>
    </div>
  );
};
