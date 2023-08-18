"use client";

import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Divider } from "@/features/UI/divider";
import { Panel } from "@/features/UI/panel";
import WalletConnector from "@/features/wallets/wallet-connector";

export default function Page() {
  return (
    <ContentWrapper>
      <Panel className="flex flex-col items-center mb-8 w-full">
        <h1 className="text-3xl font-bold mb-4">Manage Wallets</h1>
        <p className="italic text-center">
          To link a wallet to your account, connect to the wallet with your
          browser, then select the corresponding wallet from the list below.
        </p>
        <Divider />
        <div className="text-lg uppercase mb-8">Detected Wallets</div>
        <WalletConnector />
      </Panel>
    </ContentWrapper>
  );
}
