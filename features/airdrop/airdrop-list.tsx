import { Airdrop, Collection } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import { AirdropListItem } from "@/features/airdrop/airdrop-list-item";

export const AirdropList = ({ airdrops }: { airdrops: Airdrop[] }) => {
  return (
    <div className="flex flex-wrap">
      {airdrops.map((airdrop) => (
        <AirdropListItem
          airdrop={airdrop}
          url={`${BASE_URL}/me/airdrop/${airdrop.id}`}
          key={airdrop.id}
        />
      ))}
    </div>
  );
};
