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
    <div
      className="flex flex-col items-center space-y-4 m-2 ma-auto w-full text-center"
      key={airdrop.id}
    >
      <Link
        className="border border-gray-600 rounded-lg cursor-pointer p-4 space-y-2"
        href={url}
      >
        {!!airdrop?.collection?.imageUrl && (
          <Image
            className="mb-4 rounded"
            src={airdrop.collection.imageUrl}
            width={250}
            height={250}
            alt="airdrop image"
          />
        )}
        {!!airdrop?.name ? (
          <div className="text-xl">{airdrop.name}</div>
        ) : (
          <div className="text-xl mb-4">
            <span className="text-gray-400">New Unnamed Airdrop</span>
          </div>
        )}
      </Link>
    </div>
  );
};
