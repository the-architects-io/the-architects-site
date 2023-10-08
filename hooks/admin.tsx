"use client";
import { ADMIN_WALLETS, ENV } from "@/constants/constants";
import { useUserData } from "@nhost/nextjs";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import React, { ReactNode, useContext, useEffect, useState } from "react";

type AdminContextType = {
  isAdmin: boolean;
  adminToolbarData: any;
  setAdminToolbarData: any;
  shouldForceEnableClaim: boolean;
  setShouldForceEnableClaim: (value: boolean) => void;
};

const AdminContext = React.createContext({} as AdminContextType);
const { Provider } = AdminContext;

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToolbarData, setAdminToolbarData] = useState<any>(null);
  const [shouldForceEnableClaim, setShouldForceEnableClaim] = useState(false);
  const { publicKey } = useWallet();
  const router = useRouter();
  const user = useUserData();

  // useEffect(() => {
  //   if (ENV === "production") {
  //     const handleRouteChange = (url: string) => {
  //       if (url.startsWith("/admin")) {
  //         if (!isAdmin) {
  //           router.push("/");
  //         }
  //       }
  //     };
  //     router.events.on("routeChangeStart", handleRouteChange);
  //     return () => {
  //       router.events.off("routeChangeStart", handleRouteChange);
  //     };
  //   }
  // }, [isAdmin, router]);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    if (publicKey) {
      ADMIN_WALLETS.indexOf(publicKey?.toString()) > -1 && setIsAdmin(true);
    }
    if (user && user.roles.includes("admin")) {
      setIsAdmin(true);
    }
    console.log({ user });
  }, [publicKey, setIsAdmin, user]);

  return (
    <Provider
      value={{
        isAdmin,
        adminToolbarData,
        setAdminToolbarData,
        shouldForceEnableClaim,
        setShouldForceEnableClaim,
      }}
    >
      {children}
    </Provider>
  );
};

export const useAdmin = () => {
  const {
    isAdmin,
    adminToolbarData,
    setAdminToolbarData,
    shouldForceEnableClaim,
    setShouldForceEnableClaim,
  } = useContext(AdminContext);

  return {
    isAdmin,
    adminToolbarData,
    setAdminToolbarData,
    shouldForceEnableClaim,
    setShouldForceEnableClaim,
  };
};
