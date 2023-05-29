import { RarityBadge } from "@/features/UI/badges/rarity-badge";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { TableRow } from "@/features/UI/tables/table-row";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { PhotoIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

import Link from "next/link";

export interface NftCollection {
  id: string;
  createdAt: string;
  name: string;
  firstVerifiedCreator: string;
  verifiedCollectionAddress: string;
  imageUrl: string;
  associatedCommunity: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

export const NftCollectionsListItem = ({
  collection,
}: {
  collection: NftCollection;
}) => {
  return (
    <TableRow keyId={collection.id}>
      {!!collection?.imageUrl ? (
        <ImageWithFallback
          className="rounded-2xl"
          src={collection.imageUrl || ""}
          width={50}
          height={50}
          alt="Store image"
        />
      ) : (
        <div className="flex justify-center items-center w-14">
          <PhotoIcon className="h-7 w-7 text-stone-300" />
        </div>
      )}
      <div className="flex items-center space-x-12">
        <div>{collection.name}</div>
        <div className="my-4 w-1/4 flex items-center space-x-12">
          {!!collection.verifiedCollectionAddress && (
            <div>
              {getAbbreviatedAddress(collection.verifiedCollectionAddress)}
            </div>
          )}
          {!!collection.firstVerifiedCreator && (
            <div>{getAbbreviatedAddress(collection.firstVerifiedCreator)}</div>
          )}
        </div>
      </div>
      <div className="flex flex-grow"></div>
      <Link
        className="bg-stone-800 text-stone-300 px-4 py-2 rounded-lg uppercase text-sm my-4"
        href={`/admin/loot-box/${collection.id}`}
      >
        Manage
      </Link>
    </TableRow>
  );
};
