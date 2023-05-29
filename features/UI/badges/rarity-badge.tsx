export interface Rarity {
  id: string;
  name: string;
}

export const RarityBadge = ({ rarity }: { rarity: Rarity }) => {
  return (
    <div className="bg-stone-300 text-stone-900 p-1 rounded-lg uppercase text-sm border border-stone-500">
      <div>{rarity?.name}</div>
    </div>
  );
};
