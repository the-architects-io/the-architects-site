import { Character } from "@/app/blueprint/types";

export const getTraitsFromTraitInstances = (
  traitInstances: Character["traitInstances"]
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
