import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { Panel } from "@/features/UI/panel";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useWallet } from "@solana/wallet-adapter-react";
import classNames from "classnames";
import Image from "next/image";

export default function WalletConnector({ className }: { className?: string }) {
  const { select, wallets, wallet, publicKey, disconnect } = useWallet();

  if (!!publicKey && !!wallet) {
    return (
      <div className={classNames(["flex flex-col", className])}>
        <div className="flex flex-col items-center">
          <div className="flex items-center uppercase space-x-2 mb-4 border border-green-500 rounded-xl p-2 px-4 w-full relative">
            <CheckCircleIcon className="w-5 h-5 text-green-500 absolute" />
            <div className="flex w-full items-center justify-center space-x-4 -ml-8">
              <Image
                src={wallet.adapter.icon}
                alt={wallet.adapter.name}
                width={22}
                height={14}
              />
              <div>{getAbbreviatedAddress(publicKey.toString())}</div>
            </div>
          </div>
        </div>

        <PrimaryButton onClick={disconnect}>Disconnect</PrimaryButton>
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
      {wallets.filter((wallet) => wallet.readyState === "Installed").length >
      0 ? (
        wallets
          .filter((wallet) => wallet.readyState === "Installed")
          .map((wallet) => (
            <button
              className="flex items-center justify-center space-x-2 border border-sky-200 px-8 py-2 uppercase w-full rounded-xl text-lg"
              key={wallet.adapter.name}
              onClick={() => select(wallet.adapter.name)}
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
