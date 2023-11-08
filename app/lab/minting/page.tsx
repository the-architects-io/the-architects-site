"use client";
import {
  EXECUTION_WALLET_ADDRESS,
  RPC_ENDPOINT,
  RPC_ENDPOINT_DEVNET,
} from "@/constants/constants";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { useAdmin } from "@/hooks/admin";
import {
  MerkleTree,
  findLeafAssetIdPda,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  DigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
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
  DasApiAssetList,
  dasApi,
} from "@metaplex-foundation/digital-asset-standard-api";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";

export default function Page() {
  const { isAdmin } = useAdmin();
  const [umi, setUmi] = useState<Umi | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [merkleTree, setMerkleTree] = useState<
    KeypairSigner | MerkleTree | null
  >(null);
  const [builder, setBuilder] = useState<any>(null);
  const [assets, setAssets] = useState<DasApiAsset[] | null>(null);

  const wallet = useWallet();

  const handleFetch = useCallback(async () => {
    if (!umi || !wallet?.publicKey) return;

    const [assetId, bump] = await findLeafAssetIdPda(umi, {
      merkleTree: publicKey(merkleTree?.publicKey.toString() || ""),
      leafIndex: 0,
    });
    const asset = await umi.rpc.getAsset(assetId);

    setAssets([asset]);
  }, [merkleTree?.publicKey, umi, wallet?.publicKey]);

  const handleCreateUmiClient = useCallback(async () => {
    if (!wallet?.connected) return;

    await wallet.connect();
    const umi = await createUmi(RPC_ENDPOINT)
      .use(mplToolbox())
      .use(mplTokenMetadata())
      .use(dasApi())
      .use(walletAdapterIdentity(wallet));

    setUmi(umi);
  }, [wallet]);

  useEffect(() => {
    if (!umi) {
      handleCreateUmiClient();
    }
  }, [umi, handleCreateUmiClient]);

  if (!isAdmin) return <NotAdminBlocker />;

  return (
    <ContentWrapper>
      <Panel>
        <h1 className="text-center py-4 text-2xl">Minting Lab</h1>
        {!!wallet?.connected ? (
          <>
            <PrimaryButton onClick={handleFetch}>Fetch</PrimaryButton>
            {JSON.stringify(assets, null, 2)}
            <div className="flex flex-col justify-center py-2 w-full">
              {merkleTree ? (
                <div className="flex flex-col w-full justify-center items-center">
                  <div className="bold mb-4">Using tree:</div>
                  <div className="mb-8">{merkleTree.publicKey.toString()}</div>
                  <CnftMintForm
                    umi={umi}
                    merkleTreeAddress={merkleTree.publicKey.toString()}
                  />
                </div>
              ) : (
                <MerkleTreeForm
                  umi={umi}
                  setMerkleTree={setMerkleTree}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
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
