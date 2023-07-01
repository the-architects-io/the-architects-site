import { DispenserRestriction } from "@/app/blueprint/types";
import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";
import { mapTraitBasedCollection } from "@/app/blueprint/utils/mappers/trait-collection";

export const mapRestrictions = (
  restrictions: Dispenser["restrictionCollections"]
): DispenserRestriction[] | null => {
  if (!restrictions) return null;

  return mapTraitBasedCollection(restrictions);
};
