import { Creature } from "@/features/creatures/creature-list";

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
