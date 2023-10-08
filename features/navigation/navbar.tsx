"use client";
import NavbarItems from "@/features/navigation/navbar-items";
import { usePathname } from "next/navigation";
import React from "react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  return (
    <>
      {pathname.includes("in-portals") || pathname.includes("edit-display") ? (
        <div />
      ) : (
        <div className="-mb-20 h-20 md:h-16 md:-mb-16 bg-gray-900 shadow-2xl z-100 top-0 w-full fixed">
          <div className="flex h-full w-full items-center justify-between gap-4 py-2 max-w-6xl mx-auto px-4">
            <NavbarItems />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
