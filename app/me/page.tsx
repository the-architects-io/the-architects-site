"use client";
import { Wallet } from "@/app/api/claim-badge/route";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Divider } from "@/features/UI/divider";
import { Panel } from "@/features/UI/panel";
import Spinner from "@/features/UI/spinner";
import WalletConnector from "@/features/wallets/wallet-connector";
import { GET_WALLETS_BY_USER_ID } from "@/graphql/queries/get-wallets-by-user-id";
import { copyTextToClipboard } from "@/utils/clipboard";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { useQuery } from "@apollo/client";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import {
  useAuthenticationStatus,
  useProviderLink,
  useSignOut,
  useUserData,
} from "@nhost/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const { discord } = useProviderLink();
  const user = useUserData();
  const { signOut } = useSignOut();
  const router = useRouter();
  const [userWallets, setUserWallets] = useState<Wallet[]>([]);

  const { loading, data: wallets } = useQuery(GET_WALLETS_BY_USER_ID, {
    variables: {
      id: user?.id,
    },
    skip: !user?.id,
    onCompleted: ({ wallets }) => {
      console.log({ wallets });
      setUserWallets(wallets);
    },
  });

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, router, isLoading]);

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
        {!!user?.avatarUrl ? (
          <Image
            alt="avatar"
            src={user?.avatarUrl}
            width={30}
            height={30}
            className="mb-4"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-stone-700 mb-8" />
        )}
        <h1 className="text-3xl font-bold mb-4">{displayName}</h1>
        {/* <a
          href={discord}
          className="bg-purple-700 text-white p-2 px-4 rounded-lg mb-4 uppercase"
        >
          Sign in with Discord
        </a> */}
        <Divider />
        <div className="text-lg uppercase mb-4">Wallets</div>
        <div className="w-2/3 pb-8 space-y-2">
          {!!userWallets?.length && (
            <>
              {userWallets?.map((wallet: Wallet) => (
                <div
                  key={wallet.address}
                  className="p-4 border rounded-lg text-center flex items-center w-full"
                >
                  <div className="flex-1">
                    {getAbbreviatedAddress(wallet.address)}
                  </div>
                  <SecondaryButton
                    className="flex items-center justify-center px-2"
                    onClick={() => copyTextToClipboard(wallet.address)}
                  >
                    <ClipboardIcon className="h-5 w-5 inline-block" />
                  </SecondaryButton>
                </div>
              ))}
            </>
          )}
        </div>
        <PrimaryButton>
          <Link href="/me/manage-wallets">Link wallet</Link>
        </PrimaryButton>
        <Divider />
        <PrimaryButton onClick={handleSignOut}>Sign out</PrimaryButton>
      </Panel>
    </ContentWrapper>
  );
}
