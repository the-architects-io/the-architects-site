import { Creature } from "@/app/api/add-creatures-from-nfts/route";

export const getTraitsFromTraitInstances = (
  traitInstances: Creature["traitInstances"]
) => {
  return traitInstances.map(({ id, value, trait }) => {
    console.log({ id, trait, value });
    return {
      id,
      name: trait.name,
      value,
    };
  });
};
