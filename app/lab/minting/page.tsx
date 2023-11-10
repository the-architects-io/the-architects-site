"use client";

import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { useAdmin } from "@/hooks/admin";
import { MerkleTree } from "@metaplex-foundation/mpl-bubblegum";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { KeypairSigner, publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { Umi } from "@metaplex-foundation/umi/dist/types/Umi";
import { useCallback, useEffect, useState } from "react";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletButton from "@/features/UI/buttons/wallet-button";
import MerkleTreeForm from "@/features/nfts/merkle-tree-form";
import CnftMintForm from "@/features/nfts/cnft-mint-form";
import {
  DasApiAsset,
  dasApi,
} from "@metaplex-foundation/digital-asset-standard-api";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ShdwDrive } from "@shadow-drive/sdk";
import { Connection } from "@solana/web3.js";
import NftCollectionForm from "@/features/nfts/nft-collection-form";
import { getRpcEndpoint } from "@/utils/rpc";
import { LOCAL_OR_REMOTE } from "@/app/blueprint/types";

const { LOCAL, REMOTE } = LOCAL_OR_REMOTE;

export default function Page() {
  const { isAdmin } = useAdmin();
  const [umi, setUmi] = useState<Umi | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [merkleTree, setMerkleTree] = useState<
    KeypairSigner | MerkleTree | null
  >(null);
  const [drive, setDrive] = useState<ShdwDrive | null>(null);

  const [assets, setAssets] = useState<DasApiAsset[] | null>(null);
  const wallet = useWallet();

  const handleCreateUmiClient = useCallback(async () => {
    await wallet?.connect();

    const umi = await createUmi(getRpcEndpoint())
      .use(mplToolbox())
      .use(mplTokenMetadata())
      .use(dasApi())
      .use(walletAdapterIdentity(wallet));

    setUmi(umi);
  }, [wallet]);

  const handleCreateDriveClient = useCallback(async () => {
    await wallet?.connect();

    const connection = new Connection(getRpcEndpoint(), "confirmed");
    const drive = await new ShdwDrive(connection, wallet).init();
    setDrive(drive);
  }, [wallet]);

  useEffect(() => {
    if (!wallet?.publicKey) return;

    if (!umi) {
      handleCreateUmiClient();
    }
    if (!drive) {
      handleCreateDriveClient();
    }
  }, [umi, handleCreateUmiClient, drive, wallet, handleCreateDriveClient]);

  if (!isAdmin) return <NotAdminBlocker />;

  if (!wallet?.publicKey)
    return (
      <ContentWrapper className="flex flex-col justify-center items-center w-full mb-4 space-y-4">
        <WalletButton />
      </ContentWrapper>
    );

  return (
    <ContentWrapper>
      <Panel>
        <h1 className="text-center py-4 text-2xl">Minting Lab</h1>
        {!!wallet?.connected ? (
          <>
            <div className="flex flex-col justify-center py-2 w-full">
              {merkleTree ? (
                <div className="flex flex-col w-full justify-center items-center">
                  <div className="bold mb-4">Using tree:</div>
                  <div className="mb-8">{merkleTree.publicKey.toString()}</div>
                  {/* <NftCollectionForm
                    creatorAddress={wallet.publicKey.toString()}
                    setCreatorAddress={() => {}}
                    drive={drive}
                    umi={umi}
                    merkleTreeAddress={merkleTree.publicKey.toString()}
                    setCollectionNftAddress={() => {}}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    setStep={() => {}}
                    setSellerFeeBasisPoints=""
                    setCollectionNftAddress=""
                    setCreatorAddress=""
                  /> */}
                </div>
              ) : (
                <MerkleTreeForm
                  umi={umi}
                  setMerkleTree={setMerkleTree}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  localOrRemote={REMOTE}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex justify-center w-full py-4">
            <WalletButton />
          </div>
        )}
      </Panel>
    </ContentWrapper>
  );
}
