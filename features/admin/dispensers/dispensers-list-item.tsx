import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { TableRow } from "@/features/UI/tables/table-row";
import { UserGroupIcon } from "@heroicons/react/24/outline";

import Link from "next/link";

export type HashListCollection = {
  id: string;
  name: string;
  amount: number;
  hashList: {
    id: string;
    name: string;
    rawHashList: string;
  };
};

export type ItemCollection = {
  amount: number;
  id: string;
  name: string;
  imageUrl: string;
  item: {
    id: string;
    name: string;
    imageUrl: string;
    token: {
      id: string;
      mintAddress: string;
    };
  };
};

export type Dispenser = {
  costCollections: {
    id: string;
    name: string;
    itemCollection: ItemCollection;
  }[];
  rewardCollections: {
    childRewardCollections?: {
      id: string;
      name: string;
      hashListCollection: HashListCollection;
      itemCollection: ItemCollection;
    }[];
    hashListCollection: HashListCollection;
    payoutChance: number;
    itemCollection: ItemCollection;
    id: string;
    name: string;
  }[];
  restrictionCollections: {
    id: string;
    traitCollection: {
      trait: {
        name: string;
        id: string;
      };
      id: string;
      name: string;
    };
    hashListCollection: {
      name: string;
      hashList: {
        id: string;
        name: string;
      };
    };
  }[];
  gateCollections: {
    traitCollection: {
      id: string;
      name: string;
      trait: {
        id: string;
        name: string;
      };
    };
  }[];
  updatedAt: string;
  createdAt: string;
  description: string;
  id: string;
  name: string;
  isEnabled: boolean;
  imageUrl: string;
  rarity: {
    name: string;
    id: string;
  };
};

export const DispensersListItem = ({ dispenser }: { dispenser: Dispenser }) => {
  return (
    <TableRow keyId={dispenser?.id}>
      {!!dispenser.imageUrl ? (
        <ImageWithFallback
          className="rounded-2xl"
          src={dispenser.imageUrl || ""}
          width={80}
          height={80}
          alt="Dispenser image"
        />
      ) : (
        <UserGroupIcon className="h-6 w-6" />
      )}
      <div className="my-4 flex items-center space-x-12 w-1/4 whitespace-nowrap">
        <div>{dispenser.name}</div>
      </div>
      <div className="flex flex-grow"></div>
      <Link
        className="bg-stone-800 text-stone-300 px-4 py-2 rounded-lg uppercase text-sm"
        href={`/admin/dispenser/${dispenser.id}`}
      >
        Manage
      </Link>
    </TableRow>
  );
};
