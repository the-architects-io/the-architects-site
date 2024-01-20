"use client";
import { InviteCount } from "@/app/blueprint/types";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { InviteLeaderboardTable } from "@/features/invites/invite-leaderboard-table";
import { GET_USER_INVITE_COUNTS } from "@/graphql/queries/get-user-invite-counts";
import { useQuery } from "@apollo/client";
import { User } from "@nhost/nextjs";
import { useState } from "react";

export default function Page() {
  const [inviteCounts, setInviteCounts] = useState<InviteCount[]>([]);

  const { loading, data } = useQuery(GET_USER_INVITE_COUNTS, {
    onCompleted: ({ users }) => {
      console.log(users);
      setInviteCounts(
        users.map(
          (
            user: User & {
              invitedUserInvites_aggregate: { aggregate: { count: number } };
            }
          ) => ({
            displayName: user.email,
            inviteCount: user.invitedUserInvites_aggregate.aggregate.count,
          })
        )
      );
    },
  });

  return (
    <ContentWrapper className="flex flex-col items-center justify-center text-stone-300">
      <div className="text-2xl mb-4">Invites Leaderboard</div>
      <InviteLeaderboardTable inviteCounts={inviteCounts} />
    </ContentWrapper>
  );
}
