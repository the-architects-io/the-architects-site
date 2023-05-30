import { User } from "@/features/admin/users/users-list-item";
import { GET_USER_BY_WALLET_ADDRESS } from "@/graphql/queries/get-user-by-wallet-address";
import { useLazyQuery, useQuery } from "@apollo/client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import React, { ReactNode, useContext, useEffect, useState } from "react";

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  loadingUser: boolean;
};

const UserContext = React.createContext({} as UserContextType);
const { Provider } = UserContext;

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { publicKey } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const [getUser, { loading: loadingUser }] = useLazyQuery(
    GET_USER_BY_WALLET_ADDRESS,
    {
      variables: {
        address: publicKey?.toString(),
        skip: !publicKey,
      },
      fetchPolicy: "network-only",
      onCompleted: ({ users }) => {
        const user = users?.[0];
        if (user) setUser(user);
      },
    }
  );

  useEffect(() => {
    if (publicKey && !user) {
      getUser();
      return;
    }
    // if (ENV === "production") {
    //   const handleRouteChange = (url: string) => {
    //     if (!user?.accounts?.length) {
    //       router.push("/me");
    //     }
    //   };
    //   router.events.on("routeChangeStart", handleRouteChange);
    //   return () => {
    //     router.events.off("routeChangeStart", handleRouteChange);
    //   };
    // }
  }, [user, router, publicKey, getUser]);

  return (
    <Provider
      value={{
        user,
        setUser,
        loadingUser,
      }}
    >
      {children}
    </Provider>
  );
};

export const useUser = () => {
  const { user, setUser, loadingUser } = useContext(UserContext);

  return { user, setUser, loadingUser };
};
