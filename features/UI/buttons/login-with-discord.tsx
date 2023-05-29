import axios from "axios";
import { BASE_URL } from "@/constants/constants";
import Image from "next/image";
import { User } from "@/features/admin/users/users-list-item";
import { useEffect, useState } from "react";
import { Account } from "@/pages/api/add-account";
import { getUserDiscordAccount } from "@/utils/user";
import { useWallet } from "@solana/wallet-adapter-react";

/* eslint-disable @next/next/no-img-element */
const LoginWithDiscord = ({ user }: { user?: User }) => {
  const { publicKey } = useWallet();
  const [discordAccount, setDiscordAccount] = useState<Account | null>(null);

  useEffect(() => {
    if (!!discordAccount) return;
    if (!!user?.accounts && user?.accounts?.length > 0) {
      const discordAccount = getUserDiscordAccount(user);
      if (discordAccount) {
        setDiscordAccount(discordAccount);
      }
    }
  }, [discordAccount, user]);

  let href: string;

  switch (process.env.NEXT_PUBLIC_ENV) {
    case "production":
      href =
        "https://discord.com/api/oauth2/authorize?client_id=1084345711786721300&redirect_uri=https%3A%2F%2Fhunting.sodead.xyz%2Fdiscord-redirect&response_type=code&scope=identify%20guilds%20email&response_type=token";
      break;
    case "local":
    default:
      href =
        "https://discord.com/api/oauth2/authorize?client_id=1084345711786721300&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fdiscord-redirect&response_type=code&scope=identify%20guilds%20email&response_type=token";
      break;
  }

  const handleConnectWithDiscord = () => {
    if (!publicKey) return;
    localStorage.setItem("walletAddress", publicKey.toString());
    axios.post(`${BASE_URL}/api/add-account`, {
      noop: true,
    });
    setTimeout(() => {
      window.location.href = href;
    }, 500);
  };

  return (
    <div>
      {!!discordAccount ? (
        <div className="font-bold text-base bg-purple-700 rounded-lg px-4 py-3 flex items-center space-x-3 text-stone-300 max-w-64">
          <Image
            height={20}
            width={26}
            src="/images/discord.svg"
            alt="Discord"
            className="block"
          />
          <div className="truncate">{discordAccount.username}</div>
        </div>
      ) : (
        <button
          className="text-base bg-purple-700 text-stone-300 rounded-md px-4 py-2 inline-flex items-center justify-center uppercase space-x-3"
          onClick={handleConnectWithDiscord}
        >
          <Image
            height={20}
            width={26}
            src="/images/discord.svg"
            alt="Discord"
            className="block text-stone-300"
          />
          <div className="mr-2">Connect with Discord</div>
        </button>
      )}
    </div>
  );
};

export default LoginWithDiscord;
