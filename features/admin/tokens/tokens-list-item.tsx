import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { TableRow } from "@/features/UI/tables/table-row";
import { getAbbreviatedAddress } from "@/utils/formatting";

import Link from "next/link";

export type Token = {
  id: string;
  createdAt: string;
  decimals: number;
  imageUrl: string;
  mintAddress: string;
  name: string;
  symbol: string;
  items: {
    id: string;
    name: string;
  };
  nftCollection: {
    id: string;
    name: string;
  };
  isFungible: boolean;
};

export const TokensListItem = ({ token }: { token: Token }) => {
  return (
    <TableRow keyId={token.id}>
      <ImageWithFallback
        className="rounded-2xl"
        src={token.imageUrl || ""}
        width={60}
        height={60}
        alt="Store image"
      />
      <div className="my-4 w-1/4 flex items-center space-x-4">
        <div>{token.name}</div>
        <div>(${token.symbol})</div>
      </div>
      <div className="my-4 w-1/4 flex items-center space-x-4">
        <div>{getAbbreviatedAddress(token.mintAddress)}</div>
      </div>
      <div className="flex flex-grow"></div>
      <Link
        className="bg-stone-800 text-stone-300 px-4 py-2 rounded-lg uppercase text-sm"
        href={`/admin/token/${token.id}`}
      >
        Manage
      </Link>
    </TableRow>
  );
};
