import { Collection, UploadJobStatus } from "@/app/blueprint/types";
import { UploadStatus } from "@/features/upload/shadow-upload/upload-status";
import {
  CheckBadgeIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

export const CollectionListItem = ({
  collection,
  url,
  shouldShowStats,
  children,
  onClick,
}: {
  collection: Collection;
  url?: string;
  shouldShowStats?: boolean;
  children?: React.ReactNode;
  onClick?: (ags: any) => void;
}) => {
  return (
    <div
      className="flex flex-col items-center space-y-4 m-2 text-center"
      key={collection.id}
    >
      <Link
        className="border border-gray-600 rounded-lg cursor-pointer p-4 space-y-2"
        href={url || ""}
        onClick={onClick}
      >
        {!!collection.imageUrl && (
          <Image
            className="mb-4 rounded"
            src={collection.imageUrl}
            width={250}
            height={250}
            alt="Collection image"
          />
        )}
        <div className="text-xl">
          {collection.name?.startsWith("new-collection-") ? (
            <span className="text-gray-400">New Unnamed Collection</span>
          ) : (
            collection.name
          )}
        </div>
        {!!collection.symbol && (
          <div className="text-sm">({collection.symbol})</div>
        )}
        {shouldShowStats && (
          <>
            <div className="flex justify-center items-center flex-wrap">
              {collection.name &&
              collection.symbol &&
              collection.description &&
              collection.imageUrl ? (
                <>
                  <CheckBadgeIcon className="text-green-500 h-6 w-6 mr-1" />
                  <div className="text-green-500">Details added</div>
                </>
              ) : (
                <>
                  <InformationCircleIcon className="text-yellow-500 h-6 w-6 mr-1" />
                  <div className="text-yellow-500">Details in progress</div>
                </>
              )}
            </div>
            <div className="flex justify-center items-center flex-wrap">
              {collection.creators?.length ? (
                <>
                  <CheckBadgeIcon className="h-6 w-6 mr-1 text-green-500" />
                  <div className="text-green-500">Creators added</div>
                </>
              ) : (
                <>
                  <InformationCircleIcon className="h-6 w-6 mr-1 text-yellow-500" />
                  <div className="text-yellow-500">Creators missing</div>
                </>
              )}
            </div>
            <div className="flex justify-center items-center text-green-500 flex-wrap">
              {collection?.uploadJob?.status?.name ===
              UploadJobStatus.COMPLETE ? (
                <div className="flex flex-col">
                  <div className="flex mb-2 text-green-500">
                    <CheckBadgeIcon className="h-6 w-6 mr-1" />
                    <div>Metadata saved</div>
                  </div>
                  <div className="flex text-green-500">
                    <CheckBadgeIcon className="h-6 w-6 mr-1" />
                    <div>Assets uploaded</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-yellow-500">
                  <div className="flex mb-2">
                    <InformationCircleIcon className="h-6 w-6 mr-1" />
                    <div>Metadata missing</div>
                  </div>
                  <div className="flex">
                    <InformationCircleIcon className="h-6 w-6 mr-1" />
                    <div>Assets missing</div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        {!!children && <div className="py-2">{children}</div>}
      </Link>
    </div>
  );
};
