import CountdownTimer from "@/features/countdown/coundown-timer";
import { dayjs, formatDate } from "utils/date-time";

export const LastClaimTimeDetails = ({
  lastClaimTime,
  isEnabledClaim,
  cooldownInHours,
}: {
  lastClaimTime: string | undefined;
  isEnabledClaim: boolean;
  cooldownInHours: number | undefined;
}) => {
  if (cooldownInHours && cooldownInHours > 1000 && !isEnabledClaim) {
    return (
      <div className="flex flex-col text-center text-xl space-x-2 space-y-1">
        <div>You have already claimed this item</div>
      </div>
    );
  }
  return (
    <>
      {!!lastClaimTime && !!cooldownInHours && (
        <div className="flex flex-col text-center text-xl space-x-2 space-y-1">
          <div>Last claim was on</div>
          <div>
            {" "}
            {formatDate(lastClaimTime)} at{" "}
            {dayjs(dayjs(lastClaimTime).toString()).format("h:mm:ss a")}
          </div>
          {!isEnabledClaim && (
            <div className="flex flex-col items-center uppercase bg-stone-700 rounded-2xl pt-8">
              <div className="text-sm">Next claim in</div>
              <CountdownTimer
                endsAt={dayjs(lastClaimTime)
                  .add(cooldownInHours, "hours")
                  .valueOf()}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};
