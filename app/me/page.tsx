"use client";
import { Wallet } from "@/app/blueprint/types";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Divider } from "@/features/UI/divider";
import { Panel } from "@/features/UI/panel";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
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
import { useEffect, useState } from "react";

export default function Page() {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const { discord } = useProviderLink();
  const user = useUserData();
  const { signOut } = useSignOut();
  const router = useRouter();
  const [userWallets, setUserWallets] = useState<Wallet[]>([]);
  const [unlinkingWalletAddress, setUnlinkingWalletAddress] =
    useState<String>("");

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

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleUnlinkWallet = async (address: string) => {
    setUnlinkingWalletAddress(address);

    try {
      const { data, status } = await axios.post(
        `/api/unbind-wallet-from-user`,
        {
          address,
        }
      );
      console.log({ data });
      if (status === 200) {
        showToast({
          primaryMessage: "Wallet unlinked",
          secondaryMessage: `Wallet ${getAbbreviatedAddress(
            address
          )} has been unlinked from your account.`,
        });
        await refetch();
      }
    } catch (error) {
      console.log({ error });
    }
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
        <PrimaryButton className="mb-4">
          <Link href="/me/dispenser/create">Create Dispenser</Link>
        </PrimaryButton>
        <PrimaryButton>
          <Link href="/me/dispenser">My Dispensers</Link>
        </PrimaryButton>
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
