import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { TableRow } from "@/features/UI/tables/table-row";
import { CheckCircleIcon, MinusCircleIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";

import Link from "next/link";

export interface Item {
  id: string;
  name: string;
  imageUrl: string;
  isConsumable: boolean;
  isCraftable: boolean;
  createdAt: string;
  category: {
    id: string;
    name: string;
  };
  baseStatModifier: {
    id: string;
    name: string;
    effectAmount: number;
    createdAt: string;
    affectedBaseStat: {
      id: string;
      name: string;
    };
  };
}

export const ItemsListItem = ({ item }: { item: Item }) => {
  return (
    <TableRow keyId={item.id}>
      <ImageWithFallback
        src={item.imageUrl}
        height={60}
        width={60}
        className="w-12"
        alt={item.name}
      />
      <div className="my-4 flex items-center space-x-12">
        <div className="w-[156px] truncate">{item.name}</div>
        <div className="flex items-center space-x-2">
          {item.isConsumable ? (
            <CheckCircleIcon className="text-green-700 h-5 w-5" />
          ) : (
            <MinusCircleIcon className="text-red-700 h-5 w-5" />
          )}
          <div>Consumable</div>
        </div>

        <div className="flex items-center space-x-2">
          {item.isCraftable ? (
            <CheckCircleIcon className="text-green-700 h-5 w-5" />
          ) : (
            <MinusCircleIcon className="text-red-700 h-5 w-5" />
          )}
          <div>Craftable</div>
        </div>
      </div>
      {!!item?.category?.name && (
        <div className="flex justify-center w-full italic">
          {<div className="flex">{item.category.name}</div>}
        </div>
      )}
      {!!item.baseStatModifier && (
        <div className="my-4 w-1/4 flex items-center space-x-4">
          <div>Affected Stat:</div>
          <div
            className={classNames({
              "text-green-700": item.baseStatModifier.effectAmount > 0,
              "text-red-700": item.baseStatModifier.effectAmount < 0,
            })}
          >
            {item.baseStatModifier.affectedBaseStat.name}{" "}
            {item.baseStatModifier.effectAmount > 0 ? "+" : "-"}
            {`${item.baseStatModifier.effectAmount}`}
          </div>
        </div>
      )}
      <div className="flex flex-grow"></div>
      <Link
        className="bg-stone-800 text-stone-300 px-4 py-2 rounded-lg uppercase text-sm"
        href={`/admin/item/${item.id}`}
      >
        Manage
      </Link>
    </TableRow>
  );
};
