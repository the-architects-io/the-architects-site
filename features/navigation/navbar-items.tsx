"use client";

import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import UserMenu from "@/features/UI/menus/user-menu";
import { useAdmin } from "@/hooks/admin";
import { useDebugMode } from "@/hooks/debug-mode";
import { Bars3Icon, BugAntIcon, KeyIcon } from "@heroicons/react/24/outline";
import { useUserData } from "@nhost/nextjs";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import Link from "next/link";

const NavbarItems = () => {
  const { isDebugMode, setIsDebugMode } = useDebugMode();
  const { isAdmin } = useAdmin();
  const user = useUserData();

  return (
    <>
      <Link href="/" className="md:hidden">
        <Image
          className="h-12 w-14 flex-none flex-shrink-0"
          src="/images/architects-logo.webp"
          alt="Logo"
          height={40}
          width={40}
        />
      </Link>
      <div className="space-x-2 md:space-x-8 items-center text-base md:text-xl tracking-wider hidden md:flex">
        <Link href="/" className="flex items-center justify-center flex-none">
          <Image
            className="h-12 hidden md:block mr-2 md:mr-8"
            src="/images/architects-logo.webp"
            alt="Logo"
            height={40}
            width={50}
          />
        </Link>
      </div>
      {!!user?.id ? (
        <UserMenu />
      ) : (
        <Link href="/login">
          <PrimaryButton>Login</PrimaryButton>
        </Link>
      )}

      <button onClick={() => {}} className="md:hidden">
        <Bars3Icon className="w-8 h-8 text-stone-300" />
      </button>
    </>
  );
};

export default NavbarItems;
