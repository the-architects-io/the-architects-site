import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { TableRow } from "@/features/UI/tables/table-row";
import { KeyIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

import Link from "next/link";

export interface Community {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
  nftCollections: {
    id: string;
    name: string;
    imageUrl: string;
  }[];
  nftCollections_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export const CommunitiesListItem = ({
  community,
}: {
  community: Community;
}) => {
  return (
    <TableRow keyId={community?.id}>
      {!!community.imageUrl ? (
        <ImageWithFallback
          className="rounded-2xl"
          src={community.imageUrl || ""}
          width={80}
          height={80}
          alt="Key image"
        />
      ) : (
        <UserGroupIcon className="h-6 w-6" />
      )}
      <div className="my-4 flex items-center space-x-12 w-1/4 whitespace-nowrap">
        <div>{community.name}</div>
      </div>
      <div className="w-1/4">
        Collections: {community.nftCollections_aggregate.aggregate.count}
      </div>
      <div className="flex flex-grow"></div>
      <Link
        className="bg-stone-800 text-stone-300 px-4 py-2 rounded-lg uppercase text-sm"
        href={`/admin/community/${community.id}`}
      >
        Manage
      </Link>
    </TableRow>
  );
};
