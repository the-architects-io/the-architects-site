import { Character } from "@/app/api/add-character-from-nfts/route";

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
