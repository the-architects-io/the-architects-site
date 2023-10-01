import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { getAbbreviatedAddress, round } from "@/utils/formatting";
import { isPublicKey } from "@metaplex-foundation/umi";
import classNames from "classnames";

export const RewardsCardList = ({
  dispenserId,
  inStockMintAddresses,
  className,
}: {
  dispenserId: string;
  inStockMintAddresses?: string[];
  className?: string;
}) => {
  const { rewards, collectionWallet, dispenser } = useDispenser(dispenserId);

  return (
    <div className="max-w-[1024px] mx-auto">
      <div className="flex flex-wrap w-full px-4">
        {!!rewards &&
          rewards
            .sort((a, b) => (a.payoutSortOrder || 0) - (b.payoutSortOrder || 0))
            .map(
              ({
                imageUrl,
                token,
                id,
                payoutChance,
                amount,
                name,
                payoutSortOrder,
              }) => (
                <div
                  className={classNames([
                    "flex flex-col items-center flex-1 max-w-[280px] mx-4 border-2 border-gray-700 p-2 py-4 rounded-lg",
                    {
                      "w-full": rewards.length === 1,
                      "w-1/2": rewards.length === 2,
                      "w-1/3": rewards.length === 3,
                      "w-1/4": rewards.length === 4,
                      "w-1/5": rewards.length === 5,
                      "w-1/6": rewards.length === 6,
                    },
                  ])}
                  key={id}
                >
                  <div className="rounded-lg mb-4">
                    <ImageWithFallback
                      src={imageUrl || ""}
                      alt=""
                      width="140"
                      height="140"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="text-2xl text-center">
                    {isPublicKey(name) ? getAbbreviatedAddress(name) : name}
                  </div>
                  <div className="text-4xl my-2 text-center">x{amount}</div>
                  <div className="text-base">
                    {typeof payoutSortOrder === "number" &&
                    payoutSortOrder > -1 ? (
                      <div>Payout order: {payoutSortOrder}</div>
                    ) : (
                      <div>
                        {!!payoutChance && round(payoutChance * 100, 2)}% Chance
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
      </div>
    </div>
  );
};
