"use client";

import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import ClusterMenu from "@/features/UI/menus/cluster-menu";
import UserMenu from "@/features/UI/menus/user-menu";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useUserData } from "@nhost/nextjs";
import Image from "next/image";
import Link from "next/link";

const NavbarItems = () => {
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
        <Link
          href="/"
          className="flex items-center justify-center flex-none mr-8"
        >
          <Image
            className="h-12 hidden md:block mr-2 md:mr-8"
            src="/images/architects-logo.webp"
            alt="Logo"
            height={40}
            width={50}
          />
        </Link>
        {!!user?.id && (
          <>
            <Link
              href="/me/collection"
              className="hover:text-stone-200 uppercase text-sm tracking-widest"
            >
              Collections
            </Link>
            <Link
              href="/me/airdrop"
              className="hover:text-stone-200 uppercase text-sm tracking-widest"
            >
              Airdrops
            </Link>
            <Link
              href="/me/mint"
              className="hover:text-stone-200 uppercase text-sm tracking-widest"
            >
              Mints
            </Link>
            <Link
              href="/me/drive"
              className="hover:text-stone-200 uppercase text-sm tracking-widest"
            >
              Drive
            </Link>
          </>
        )}
      </div>
      {!!user?.id ? (
        <div className="space-x-2 flex">
          <ClusterMenu />
          <UserMenu />
        </div>
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
