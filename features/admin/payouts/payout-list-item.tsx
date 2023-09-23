import { Payout } from "@/app/profile/[id]/page";
import { TableRow } from "@/features/UI/tables/table-row";
import { formatDateTime } from "@/utils/date-time";
import { getAbbreviatedAddress } from "@/utils/formatting";

export const PayoutListItem = ({ payout }: { payout: Payout }) => {
  return (
    <TableRow keyId={payout.id}>
      <div className="flex items-center space-x-12 justify-between w-full">
        <div>{formatDateTime(payout.createdAt)}</div>
        <div className="flex items-center space-x-4">
          <div>{payout.amount}x</div>
          <div>{payout.item.name}</div>
        </div>
        <div className="flex flex-col items-center space-x-4">
          <div>Token:</div>
          <a
            className="underline"
            href={`https://solscan.io/token/${payout.token.mintAddress}`}
            target="_blank"
            rel="noreferrer"
          >
            {getAbbreviatedAddress(payout.token.mintAddress)}
          </a>
        </div>
        {!!payout?.wallet?.address && (
          <div className="flex flex-col items-center space-x-4">
            <div>Wallet:</div>
            <a
              className="underline"
              href={`https://solscan.io/account/${payout.wallet.address}`}
              target="_blank"
              rel="noreferrer"
            >
              {getAbbreviatedAddress(payout.wallet.address)}
            </a>
          </div>
        )}
        <div className="flex flex-col items-center space-x-4">
          <div>Tx:</div>
          <a
            className="underline"
            href={`https://solscan.io/tx/${payout.txAddress}`}
            target="_blank"
            rel="noreferrer"
          >
            {getAbbreviatedAddress(payout.txAddress)}
          </a>
        </div>
      </div>
      <div className="flex flex-grow"></div>
    </TableRow>
  );
};
