import { CollectionStatsFromCollectionMetadatas } from "@/app/blueprint/types";
import {
  CheckBadgeIcon,
  ChevronDoubleRightIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export const CreateCollectionMetadataUploadChecklist = ({
  metadataStats,
}: {
  metadataStats: CollectionStatsFromCollectionMetadatas | null;
}) => {
  const [metadatasAreValid, setMetadatasAreValid] = useState<boolean>(false);

  useEffect(() => {
    if (metadataStats) {
      setMetadatasAreValid(metadataStats.validCount === metadataStats.count);
    } else {
      setMetadatasAreValid(false);
    }
  }, [metadataStats?.count, metadataStats?.validCount, metadataStats]);

  return (
    <div className="flex flex-col border border-gray-600 rounded-lg p-4 w-full space-y-4 py-6">
      <div className="flex flex-col">
        <div className="flex space-x-3 items-center mb-3">
          <div>
            {metadatasAreValid ? (
              <CheckBadgeIcon className="h-6 w-6 text-green-500" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-red-500" />
            )}
          </div>
          <div>Token Metadatas JSON</div>
        </div>
        <ul className="px-6 space-y-2">
          <li className="text-sm text-gray-400">
            <ChevronDoubleRightIcon className="h-4 w-4 inline-block mr-1" />
            Total metadatas count must be equal to the number of tokens being
            created.
          </li>
          <li className="text-sm text-gray-400">
            <ChevronDoubleRightIcon className="h-4 w-4 inline-block mr-1" />
            Metadatas should follow the Metaplex standard for token metadata.{" "}
            <a href="#" className="underline">
              Learn more
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};
