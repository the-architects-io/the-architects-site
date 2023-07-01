import { CostCollection } from "@/app/blueprint/types";

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
