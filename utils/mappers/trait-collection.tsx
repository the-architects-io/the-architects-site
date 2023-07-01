import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";
import { DispenserGate } from "@/utils/mappers/gates";
import { DispenserRestriction } from "@/utils/mappers/restrictions";

export type TraitBasedCollection = {
  id: string;
  traitCollection: {
    trait: {
      name: string;
      id: string;
    };
    value: string;
    id: string;
    name: string;
  };
};

export const mapTraitBasedCollection = (
  traitBasedCollection: TraitBasedCollection[]
): DispenserGate[] | DispenserRestriction[] => {
  return traitBasedCollection.map(({ id, traitCollection }) => {
    return {
      id,
      trait: { ...traitCollection.trait, value: traitCollection.value },
    };
  });
};
