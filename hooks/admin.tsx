"use client";
import { ADMIN_WALLETS, ENV } from "@/constants/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import React, { ReactNode, useContext, useEffect, useState } from "react";

type AdminContextType = {
  isAdmin: boolean;
};

const AdminContext = React.createContext({} as AdminContextType);
const { Provider } = AdminContext;

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { publicKey } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (ENV === "production") {
      const handleRouteChange = (url: string) => {
        if (url.startsWith("/admin")) {
          if (!isAdmin) {
            router.push("/");
          }
        }
      };
      // router.events.on("routeChangeStart", handleRouteChange);
      // return () => {
      //   router.events.off("routeChangeStart", handleRouteChange);
      // };
    }
  }, [isAdmin, router]);

  useEffect(() => {
    if (publicKey) {
      ADMIN_WALLETS.indexOf(publicKey.toString()) > -1 && setIsAdmin(true);
    }
  }, [publicKey, setIsAdmin]);

  return (
    <Provider
      value={{
        isAdmin,
      }}
    >
      {children}
    </Provider>
  );
};

export const useAdmin = () => {
  const { isAdmin } = useContext(AdminContext);

  return { isAdmin };
};
