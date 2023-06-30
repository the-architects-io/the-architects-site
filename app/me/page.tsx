"use client";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Divider } from "@/features/UI/divider";
import { Panel } from "@/features/UI/panel";
import Spinner from "@/features/UI/spinner";
import WalletConnector from "@/features/wallets/wallet-connector";
import useDispenser from "@/hooks/blueprint/use-dispenser";
import {
  useAuthenticationStatus,
  useProviderLink,
  useSignOut,
  useUserData,
} from "@nhost/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const { discord } = useProviderLink();
  const { dispenser, cost } = useDispenser(
    "e9f9f8cf-1c31-4601-8129-c774b42c4ba3"
  );

  const user = useUserData();
  const { signOut } = useSignOut();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, router, isLoading]);

  if (!isAuthenticated || !user) {
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
        <Image
          alt="avatar"
          src={user?.avatarUrl}
          width={30}
          height={30}
          className="mb-4"
        />
        <h1 className="text-3xl font-bold mb-4">{displayName}</h1>
        {/* <div className="mb-4 break-all">{JSON.stringify(user)}</div> */}
        {/* <a
          href={discord}
          className="bg-purple-700 text-white p-2 px-4 rounded-lg mb-4 uppercase"
        >
          Sign in with Discord
        </a> */}
        <Divider />
        <div className="text-lg uppercase mb-8">Wallet</div>
        <WalletConnector className="w-full mb-4" />
        <Divider />
        <PrimaryButton onClick={handleSignOut}>Sign out</PrimaryButton>
      </Panel>
    </ContentWrapper>
  );
}
