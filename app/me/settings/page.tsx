"use client";
import useBlueprint from "@/app/blueprint/hooks/use-blueprint";
import { Wallet } from "@/app/blueprint/types";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Divider } from "@/features/UI/divider";
import { Panel } from "@/features/UI/panel";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import { GET_INVITE_CODE_BY_USER_ID } from "@/graphql/queries/get-invite-code-by-user-id";
import { GET_USER_INVITES_COUNT } from "@/graphql/queries/get-user-invites-count";
import { GET_WALLETS_BY_USER_ID } from "@/graphql/queries/get-wallets-by-user-id";
import { copyTextToClipboard } from "@/utils/clipboard";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { useQuery } from "@apollo/client";
import { ClipboardIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  useAuthenticationStatus,
  useProviderLink,
  useSignOut,
  useUserData,
} from "@nhost/nextjs";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const INVITE_CODE_EXPIRATION_TIME_IN_HOURS = 24;

export default function Page() {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const user = useUserData();
  const { signOut } = useSignOut();
  const router = useRouter();
  const [userWallets, setUserWallets] = useState<Wallet[]>([]);
  const [unlinkingWalletAddress, setUnlinkingWalletAddress] =
    useState<String>("");

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteCodeRefreshTimestamp, setInviteCodeRefreshTimestamp] = useState<
    number | null
  >(null);
  const [inviteCount, setInviteCount] = useState<number>(0);

  const {
    loading,
    data: wallets,
    refetch,
  } = useQuery(GET_WALLETS_BY_USER_ID, {
    variables: {
      id: user?.id,
    },
    skip: !user?.id,
    fetchPolicy: "network-only",
    onCompleted: ({ wallets }) => {
      console.log({ wallets });
      setUserWallets(wallets);
    },
  });

  const { data: inviteCountData } = useQuery(GET_USER_INVITES_COUNT, {
    variables: {
      userId: user?.id,
    },
    skip: !user?.id,
    fetchPolicy: "network-only",
    onCompleted: ({ userInvites_aggregate }) => {
      console.log({ userInvites_aggregate });
      setInviteCount(userInvites_aggregate.aggregate.count);
    },
  });

  const {
    refetch: refetchInviteCode,
    data: inviteCodeData,
    loading: isLoadingInviteCode,
  } = useQuery(GET_INVITE_CODE_BY_USER_ID, {
    variables: {
      userId: user?.id,
    },
    skip: !user?.id,
    fetchPolicy: "network-only",
  });

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleGenerateInviteCode = useCallback(async () => {
    try {
      const { data, status } = await axios.post(`/api/refresh-invite-code`, {
        userId: user?.id,
      });
      if (status === 200) {
        setInviteCode(data.code);
        setInviteCodeRefreshTimestamp(data.createdAt);
      }
    } catch (error) {
      console.log({ error });
    }
  }, [user?.id]);

  const handleUnlinkWallet = async (address: string) => {
    setUnlinkingWalletAddress(address);

    try {
      const { data, status } = await axios.post(
        `/api/unbind-wallet-from-user`,
        {
          address,
        }
      );
    } catch (error) {
      console.log({ error });
    }
  };

  const isExpired = (timestamp: string) => {
    // example timestamp: "2024-01-19T07:37:56.746389+00:00"
    const now = new Date();
    const createdAt = new Date(timestamp);
    const diff = now.getTime() - createdAt.getTime();
    const diffInHours = diff / (1000 * 3600);
    if (diffInHours > INVITE_CODE_EXPIRATION_TIME_IN_HOURS) {
      return true;
    }
    return false;
  };

  const handleCopyCode = () => {
    if (!inviteCode) {
      return;
    }
    copyTextToClipboard(inviteCode);
  };

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, router, isLoading]);

  useEffect(() => {
    if (inviteCodeData?.inviteCodes?.[0]) {
      setInviteCode(inviteCodeData?.inviteCodes?.[0]?.code);
      setInviteCodeRefreshTimestamp(inviteCodeData.inviteCodes?.[0]?.createdAt);
    }
    if (isExpired(inviteCodeData?.inviteCodes?.[0]?.createdAt)) {
      setInviteCode(null);
      handleGenerateInviteCode();
    }
  }, [handleGenerateInviteCode, inviteCodeData, isLoadingInviteCode]);

  if (!isAuthenticated || !user || loading) {
    return (
      <ContentWrapper className="w-full flex justify-center">
        <Spinner />
      </ContentWrapper>
    );
  }

  const { displayName } = user;

  return (
    <ContentWrapper>
      <Panel className="flex flex-col items-center mb-8 w-full">
        {/* {!!user?.avatarUrl ? (
          <Image
            alt="avatar"
            src={user?.avatarUrl}
            width={30}
            height={30}
            className="mb-4"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-stone-700 mb-8" />
        )} */}
        <h1 className="text-3xl font-bold my-4">{displayName}</h1>
        {!!inviteCode && (
          <>
            <Divider />
            <div className="flex flex-col justify-center items-center w-full">
              <div className="uppercase text-sm mb-2 tracking-wider">
                My Invites
              </div>
              <div className="mb-8 text-6xl tracking-widest">{inviteCount}</div>
              <div className="uppercase text-sm mb-2 tracking-wider">
                Invite Code
              </div>
              <div className="mb-4 text-6xl  tracking-widest">{inviteCode}</div>
            </div>
            <PrimaryButton className="mb-4" onClick={handleCopyCode}>
              Copy Code
            </PrimaryButton>
            <p className="italic max-w-xs text-center">
              <div className="mb-2">
                Code will be refreshed every{" "}
                {INVITE_CODE_EXPIRATION_TIME_IN_HOURS} hours.
              </div>
              {!!inviteCodeRefreshTimestamp && (
                <div>
                  Next refresh{" "}
                  {new Date(inviteCodeRefreshTimestamp).toLocaleString()}
                </div>
              )}
            </p>
          </>
        )}
        <Divider />
        <div className="uppercase mb-4">Connected Wallet</div>
        <WalletButton />
        <Divider />
        <div className="uppercase mb-4">Linked Wallets</div>
        <div className="w-2/3 pb-8 space-y-2">
          {!!userWallets?.length && (
            <>
              {userWallets?.map((wallet: Wallet) => (
                <div
                  key={wallet.address}
                  className="border rounded-lg text-center flex items-center justify-center  w-full h-16 px-4"
                >
                  {unlinkingWalletAddress === wallet.address ? (
                    <div className="self-center">
                      <Spinner />
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 text-lg">
                        {getAbbreviatedAddress(wallet.address)}
                      </div>
                      <button
                        className="flex items-center justify-center px-2 hover:text-sky-300"
                        onClick={() => copyTextToClipboard(wallet.address)}
                      >
                        <ClipboardIcon className="h-6 w-6 inline-block" />
                      </button>
                      {userWallets.length > 1 && (
                        <button
                          className="flex items-center justify-center px-2 hover:text-sky-300"
                          onClick={() => handleUnlinkWallet(wallet.address)}
                        >
                          <TrashIcon className="h-6 w-6 inline-block" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
        <PrimaryButton>
          <Link href="/me/manage-wallets">Link wallet</Link>
        </PrimaryButton>
        <Divider />
        <PrimaryButton className="mb-4" onClick={handleSignOut}>
          Sign out
        </PrimaryButton>
      </Panel>
    </ContentWrapper>
  );
}
