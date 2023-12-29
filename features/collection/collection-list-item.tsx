import { Collection, UploadJobStatus } from "@/app/blueprint/types";
import { UploadStatus } from "@/features/upload/shadow-upload/upload-status";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

export const CollectionListItem = ({
  collection,
  url,
}: {
  collection: Collection;
  url: string;
}) => {
  return (
    <div
      className="flex flex-col items-center space-y-4 m-2 ma-auto w-full text-center"
      key={collection.id}
    >
      <Link
        className="border border-gray-600 rounded-lg cursor-pointer p-4 space-y-2"
        href={url}
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
        <div className="flex justify-center items-center text-green-500 flex-wrap">
          {collection.creators?.length ? (
            <>
              <CheckBadgeIcon className="h-6 w-6 mr-1" />
              <div className="">Details complete</div>
            </>
          ) : (
            <div className="text-yellow-500">Details in progress</div>
          )}
        </div>
        <div className="flex justify-center items-center text-green-500 flex-wrap">
          {collection?.uploadJob?.status?.name === UploadJobStatus.COMPLETE ? (
            <div className="flex flex-col">
              <div className="flex mb-2">
                <CheckBadgeIcon className="h-6 w-6 mr-1" />
                <div className="text-green-500">Metadata saved</div>
              </div>
              <div className="flex">
                <CheckBadgeIcon className="h-6 w-6 mr-1" />
                <div className="text-green-500">Assets uploaded</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex mb-2">
                <div className="text-yellow-500">Metadata missing</div>
              </div>
              <div className="flex">
                <div className="text-yellow-500">Assets missing</div>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};
