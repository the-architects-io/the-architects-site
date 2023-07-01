import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";
import { mapTraitBasedCollection } from "@/utils/mappers/trait-collection";

export type DispenserRestriction = {
  id: string;
  trait: {
    name: string;
    id: string;
    value: string;
  };
};

export const mapRestrictions = (
  restrictions: Dispenser["restrictionCollections"]
): DispenserRestriction[] | null => {
  if (!restrictions) return null;

  return mapTraitBasedCollection(restrictions);
};
