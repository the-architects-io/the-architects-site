"use client";

import { Menu, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useSignOut, useUserData } from "@nhost/nextjs";
import { useWallet } from "@solana/wallet-adapter-react";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { useAdmin } from "@/hooks/admin";
import Link from "next/link";
import { useDebugMode } from "@/hooks/debug-mode";
import {
  ArrowLeftOnRectangleIcon,
  BugAntIcon,
  KeyIcon,
  UserIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";

export default function UserMenu() {
  const user = useUserData();
  const { signOut } = useSignOut();
  const { disconnect, connect, wallet, publicKey } = useWallet();
  const { isDebugMode, setIsDebugMode } = useDebugMode();
  const { isAdmin } = useAdmin();

  return (
    <div className="top-16 text-right">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex w-full justify-center rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-stone-300 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
            {user?.displayName}
            <ChevronDownIcon
              className="ml-2 -mr-1 h-5 w-5 text-sky-200 hover:text-sky-100"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-sky-200 rounded-md bg-black text- shadow-lg ring-1 ring-gray-300 ring-opacity-5 focus:outline-none">
            {isAdmin && (
              <div className="px-1 py-1 ">
                <div className="flex w-full text-xs uppercase text-gray-300 mt-2">
                  Admin
                </div>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/admin"
                      className={`${
                        active ? "bg-sky-300 text-black" : "text-stone-300"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      <KeyIcon className="mr-3 h-5 w-5 text-stone-300 group-hover:text-black" />
                      Admin Panel
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? "bg-sky-300 text-black" : "text-stone-300"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      onClick={() => setIsDebugMode(!isDebugMode)}
                    >
                      <BugAntIcon className="mr-3 h-5 w-5 text-stone-300 group-hover:text-black" />
                      {isDebugMode ? "Disable" : "Enable"} Debug Mode
                    </button>
                  )}
                </Menu.Item>
              </div>
            )}
            <div className="px-1 py-1">
              {!!publicKey ? (
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/me"
                      className={`${
                        active ? "bg-sky-300 text-black" : "text-stone-300"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      <UserIcon className="mr-3 h-5 w-5 text-stone-300 group-hover:text-black" />
                      Profile
                    </Link>
                  )}
                </Menu.Item>
              ) : (
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/me"
                      className={`${
                        active ? "bg-sky-300 text-black" : "text-stone-300"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      Connect
                    </Link>
                  )}
                </Menu.Item>
              )}
            </div>
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => signOut()}
                    className={`${
                      active ? "bg-sky-300 text-black" : "text-stone-300"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-stone-300 group-hover:text-black" />
                    Log Out
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
