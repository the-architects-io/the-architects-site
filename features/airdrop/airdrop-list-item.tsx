import { Airdrop } from "@/app/blueprint/types";
import Image from "next/image";
import Link from "next/link";

export const AirdropListItem = ({
  airdrop,
  url,
}: {
  airdrop: Airdrop;
  url: string;
}) => {
  return (
    <div className="w-1/3" key={airdrop.id}>
      <Link
        className="border border-gray-600 rounded-lg cursor-pointer p-4 m-2 flex flex-col items-center self-start"
        href={url}
      >
        {!!airdrop?.collection?.imageUrl && (
          <Image
            className="mb-4 rounded"
            src={airdrop.collection.imageUrl}
            width={350}
            height={350}
            alt="airdrop image"
          />
        )}
        {!!airdrop?.name ? (
          <div className="text-xl mb-4">{airdrop.name}</div>
        ) : (
          <div className="text-xl mb-4">
            <span className="text-gray-400">New Unnamed Airdrop</span>
          </div>
        )}
        {!!airdrop?.collection?.name && (
          <>
            <div>Collection:</div>
            <div>{airdrop.collection.name}</div>
          </>
        )}
      </Link>
    </div>
  );
};
