"use client";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import Spinner from "@/features/UI/spinner";
import {
  useAuthenticated,
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
        <h1 className="text-3xl font-bold mb-4">{displayName}</h1>
        <Image alt="avatar" src={user?.avatarUrl} width={30} height={30} />
        <div className="mb-4 break-all">{JSON.stringify(user)}</div>
        <a
          href={discord}
          className="bg-purple-700 text-white p-2 px-4 rounded-lg mb-4 uppercase"
        >
          Sign in with Discord
        </a>
        <PrimaryButton onClick={handleSignOut}>Sign out</PrimaryButton>
      </Panel>
    </ContentWrapper>
  );
}
