import { ItemCollection } from "@/features/admin/dispensers/dispensers-list-item";

export type CostCollection = {
  id: string;
  name: string;
  itemCollection: ItemCollection;
};

export const mapCost = (cost: CostCollection) => {
  if (!cost) return null;
  const { name, id } = cost;
  const {
    item,
    name: itemCollectionName,
    imageUrl: itemCollectionImageUrl,
    amount,
  } = cost.itemCollection;
  const { token } = item;
  debugger;
  return {
    name: name || itemCollectionName,
    amount,
    id,
    imageUrl: item?.imageUrl || itemCollectionImageUrl,
    token: {
      id: token.id,
      mintAddress: token.mintAddress,
      name: token.name,
    },
  };
};
