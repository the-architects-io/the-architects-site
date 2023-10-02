import { Payout } from "@/app/profile/[id]/page";
import { Panel } from "@/features/UI/panel";
import { getAbbreviatedAddress, round } from "@/utils/formatting";
import { isPublicKey } from "@metaplex-foundation/umi";
import { useEffect, useState } from "react";

export const AggregatePayoutStats = ({ payouts }: { payouts: Payout[] }) => {
  const [rewardsWithCounts, setRewardsWithCounts] = useState<any[]>([]);

  useEffect(() => {
    const uniqueRewards = payouts
      .map((payout) => payout.token)
      .filter(
        (token, index, self) =>
          self.findIndex((t) => t?.id === token?.id) === index
      );

    // sort by count
    const uniqueRewardsWithCount = uniqueRewards
      .map((reward) => ({
        ...reward,
        count: payouts.filter((payout) => payout.token?.id === reward?.id)
          .length,
      }))
      .sort((a, b) => b.count - a.count);

    setRewardsWithCounts(uniqueRewardsWithCount);
    console.log({ payouts, uniqueRewards, uniqueRewardsWithCount });
  }, [payouts]);

  return (
    <>
      <div className="flex flex-col items-center space-x-4 w-full mb-8">
        <div className="flex space-x-4 text-xl mb-4 text-gray-100 uppercase">
          <div>Total Payouts:</div>
          <div>{payouts.length}</div>
        </div>
        <Panel>
          <div className="uppercase mb-2 text-center">Payouts Breakdown</div>
          <div className="flex flex-col mx-auto w-full justify-center space-y-2">
            {rewardsWithCounts.map((reward) => (
              <div
                className="flex items-center justify-center space-x-4"
                key={reward.id}
              >
                <div>
                  {isPublicKey(reward.name)
                    ? getAbbreviatedAddress(reward.name)
                    : reward.name}
                  :
                </div>
                <div>{reward.count}</div>
                <div>{round((reward.count / payouts.length) * 100, 2)}%</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
};
