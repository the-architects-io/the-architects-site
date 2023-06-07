import { Payout } from "@/app/profile/[id]/page";
import { round } from "@/utils/formatting";
import { useEffect, useState } from "react";

export const AggregatePayoutStats = ({ payouts }: { payouts: Payout[] }) => {
  const [rewardsWithCounts, setRewardsWithCounts] = useState<any[]>([]);

  useEffect(() => {
    const uniqueRewardItems = payouts
      .map((payout) => payout.item)
      .filter(
        (item, index, self) => self.findIndex((t) => t.id === item.id) === index
      );

    // sort by count
    const uniqueRewardItemsWithCount = uniqueRewardItems
      .map((item) => {
        const count = payouts.filter(
          (payout) => payout.item.id === item.id
        ).length;
        return { ...item, count };
      })
      .sort((a, b) => b.count - a.count);
    setRewardsWithCounts(uniqueRewardItemsWithCount);
    console.log({ payouts, uniqueRewardItems, uniqueRewardItemsWithCount });
  }, [payouts]);

  return (
    <>
      <div className="flex flex-col items-center space-x-4 w-full mb-8">
        <div className="flex space-x-4 mb-2 text-lg">
          <div>Total Payouts:</div>
          <div>{payouts.length}</div>
        </div>
        <div className="flex flex-wrap mx-auto w-full justify-center">
          {rewardsWithCounts.map((reward) => (
            <div
              className="flex items-center justify-center space-x-4 w-1/2"
              key={reward.id}
            >
              <div>{reward.name}:</div>
              <div>{reward.count}</div>
              <div>{round((reward.count / payouts.length) * 100, 2)}%</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
