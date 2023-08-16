import { Wallet } from "@/app/api/claim-dispenser/route";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import { ADD_WALLET } from "@/graphql/mutations/add-wallet";
import { GET_WALLET_BY_ADDRESS } from "@/graphql/queries/get-wallet-by-address";
import { GET_WALLETS_BY_USER_ID } from "@/graphql/queries/get-wallets-by-user-id";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { User, useUserData } from "@nhost/nextjs";
import { WalletName } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import classNames from "classnames";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export default function WalletConnector({ className }: { className?: string }) {
  const {
    select,
    wallets: supportedWallets,
    wallet,
    publicKey,
    disconnect,
    connected,
    connecting,
  } = useWallet();

  const user = useUserData();

  const [userWallets, setUserWallets] = useState<Wallet[]>([]);

  const { loading: loadingUserWallets } = useQuery(GET_WALLETS_BY_USER_ID, {
    variables: {
      id: user?.id,
    },
    skip: !user?.id,
    onCompleted: ({ wallets }) => {
      console.log({ wallets });
      setUserWallets(wallets);
    },
  });

  const handleSelectWallet = (name: WalletName) => {
    if (!name || loadingUserWallets) return;
    select(name);
  };

  const linkWalletToUser = useCallback(
    async (user: User) => {
      console.log(user);
      debugger;
      if (!user?.id || !publicKey) return;
      const { data } = await axios.post("/api/link-wallet-to-user", {
        userId: user?.id,
        walletAddress: publicKey?.toString(),
      });
      if (data.error) {
        showToast({
          primaryMessage: "Error linking wallet",
          secondaryMessage: data.error,
        });
        return;
      }
      showToast({
        primaryMessage: "Wallet linked",
        secondaryMessage: "Your wallet has been linked to your account",
      });
    },
    [publicKey]
  );

  useEffect(() => {
    if (connecting) {
      console.log("connecting");
    }
    if (connected) {
      console.log("connected");
      // see if connected wallet is linked to user
      const walletLinkedToUser = !!userWallets.find(
        (userWallet) => userWallet.address === publicKey?.toString()
      );

      if (walletLinkedToUser) {
        showToast({
          primaryMessage: "Wallet already linked",
          secondaryMessage: "This wallet is already linked to your account",
        });
        return;
      }

      if (user) linkWalletToUser(user);
    }
  }, [connected, connecting, linkWalletToUser, publicKey, user, userWallets]);

  if (connecting || loadingUserWallets) {
    return (
      <div className="flex flex-col justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div
      className={classNames([
        "flex flex-col justify-center items-center space-y-4",
        className,
      ])}
    >
      <div>User: {JSON.stringify(user)}</div>
      {supportedWallets.filter((wallet) => wallet.readyState === "Installed")
        .length > 0 ? (
        supportedWallets
          .filter((wallet) => wallet.readyState === "Installed")
          .map((wallet) => (
            <button
              className="flex items-center justify-center space-x-2 border border-sky-200 px-8 py-2 uppercase w-full rounded-xl text-lg"
              key={wallet.adapter.name}
              onClick={() => handleSelectWallet(wallet.adapter.name)}
            >
              <Image
                src={wallet.adapter.icon}
                alt={wallet.adapter.name}
                width={22}
                height={14}
              />
              <div>{wallet.adapter.name}</div>
            </button>
          ))
      ) : (
        <div>No wallets installed</div>
      )}
    </div>
  );
}
