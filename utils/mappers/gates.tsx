import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";
import { mapTraitBasedCollection } from "@/utils/mappers/trait-collection";

export type DispenserGate = {
  id: string;
  trait: {
    name: string;
    id: string;
    value: string;
  };
};

export const mapGates = (
  gates: Dispenser["gateCollections"]
): DispenserGate[] | null => {
  if (!gates) return null;

  return mapTraitBasedCollection(gates);
};
