import { Collection } from "@/app/blueprint/types";
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
      className="flex flex-col items-center space-y-4 m-2 ma-auto w-full"
      key={collection.id}
    >
      <Link
        className="border border-gray-600 rounded-lg cursor-pointer p-4"
        href={url}
      >
        {!!collection.imageUrl && (
          <Image
            src={collection.imageUrl}
            width={200}
            height={200}
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
      </Link>
    </div>
  );
};
