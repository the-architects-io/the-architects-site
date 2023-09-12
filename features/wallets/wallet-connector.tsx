import { Wallet } from "@/app/blueprint/types";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import { GET_WALLETS_BY_USER_ID } from "@/graphql/queries/get-wallets-by-user-id";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { useQuery } from "@apollo/client";
import { PublicKey } from "@metaplex-foundation/js";
import { User, useUserData } from "@nhost/nextjs";
import { WalletName } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import classNames from "classnames";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
    connect,
  } = useWallet();

  const user = useUserData();
  const router = useRouter();
  const [cachedUserAddress, setCachedUserAddress] = useState<string | null>(
    null
  );
  const [cachedAdaptor, setCachedAdaptor] = useState<string | null>(null);
  const [userWallets, setUserWallets] = useState<Wallet[]>([]);
  const [isLinkingWallet, setIsLinkingWallet] = useState(false);
  const [isWalletSelected, setIsWalletSelected] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [pubKey, setPubKey] = useState<PublicKey | null>(null);
  const [shouldShowRestart, setShouldShowRestart] = useState(false);

  const { loading: loadingUserWallets, refetch } = useQuery(
    GET_WALLETS_BY_USER_ID,
    {
      variables: {
        id: user?.id,
      },
      skip: !user?.id,
      onCompleted: ({ wallets }) => {
        console.log({ wallets });
        setUserWallets(wallets);
      },
    }
  );

  const handleSelectWallet = (name: WalletName) => {
    if (!name || loadingUserWallets) return;
    select(name);
    connect();
    setIsWalletSelected(true);
  };

  const linkWalletToUser = useCallback(
    async (user: User) => {
      console.log(user);
      setIsLinkingWallet(true);
      if (!user?.id || !publicKey) return;
      const { data, status } = await axios.post("/api/link-wallet-to-user", {
        userId: user?.id,
        walletAddress: publicKey?.toString(),
      });

      if (status === 200) {
        showToast({
          primaryMessage: "Wallet linked",
          secondaryMessage: `Wallet ${getAbbreviatedAddress(
            publicKey
          )} has been linked to your account`,
        });
        refetch();
        router.push("/me");
        setIsLinkingWallet(false);
        return;
      }

      if (data.error) {
        showToast({
          primaryMessage: "Error linking wallet",
          secondaryMessage: data.error,
        });
        setIsLinkingWallet(false);
        return;
      }
    },
    [publicKey, refetch, router]
  );

  useEffect(() => {
    if (connecting) {
      console.log("connecting");
      setIsLinkingWallet(true);
    }

    if (publicKey && isInitialLoad && wallet?.adapter?.name) {
      setCachedUserAddress(publicKey?.toString());
      setCachedAdaptor(wallet?.adapter?.name);

      setIsInitialLoad(false);
    }

    // @ts-ignore
    const provider = window?.phantom?.solana;

    if (provider) {
      provider.on("accountChanged", () => {
        console.log("connected!!!");
      });
    }

    if (connected && publicKey && isWalletSelected && !isLinkingWallet) {
      console.log("connected");
      const walletLinkedToUser = !!userWallets.find(
        (userWallet) => userWallet.address === publicKey?.toString()
      );

      if (walletLinkedToUser) {
        showToast({
          primaryMessage: "Wallet already linked",
          secondaryMessage: `Wallet ${getAbbreviatedAddress(
            publicKey.toString()
          )} is already linked to your account`,
        });
        setShouldShowRestart(true);
        setIsWalletSelected(false);
        return;
      }

      if (user && !isLinkingWallet) {
        linkWalletToUser(user);
        setIsWalletSelected(false);
      }
    }
  }, [
    connecting,
    connected,
    isWalletSelected,
    isLinkingWallet,
    userWallets,
    user,
    linkWalletToUser,
    publicKey,
    isInitialLoad,
    cachedUserAddress,
    wallet?.adapter?.name,
    setShouldShowRestart,
  ]);

  if (connecting || loadingUserWallets || isLinkingWallet) {
    return (
      <div className="flex flex-col justify-center items-center">
        <Spinner />
      </div>
    );
  }

  if (shouldShowRestart) {
    return (
      <div className="flex flex-col justify-center items-center">
        <PrimaryButton onClick={() => setShouldShowRestart(false)}>
          Select a different wallet
        </PrimaryButton>
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
