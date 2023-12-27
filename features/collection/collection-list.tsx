import { Collection } from "@/app/blueprint/types";
import { CollectionListItem } from "@/features/collection/collection-list-item";
import Image from "next/image";
import Link from "next/link";

export const CollectionList = ({
  collections,
  linkBaseUrl,
}: {
  collections: Collection[];
  linkBaseUrl: string;
}) => {
  return (
    <div className="flex flex-wrap">
      {collections.map((collection) => (
        <CollectionListItem
          collection={collection}
          url={`${linkBaseUrl}/${collection.id}`}
          key={collection.id}
        />
      ))}
    </div>
  );
};
