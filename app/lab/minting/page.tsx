"use client";
import { RPC_ENDPOINT_DEVNET } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { TokenMintingForm } from "@/features/dispensers/token-minting-form";
import { useAdmin } from "@/hooks/admin";
import {
  createTree,
  fetchMerkleTree,
} from "@metaplex-foundation/mpl-bubblegum";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { KeypairSigner, generateSigner } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { nftStorageUploader } from "@metaplex-foundation/umi-uploader-nft-storage";
import { Umi } from "@metaplex-foundation/umi/dist/types/Umi";
import { useCallback, useEffect, useState } from "react";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { useWallet } from "@solana/wallet-adapter-react";
import showToast from "@/features/toasts/show-toast";
import { getAbbreviatedAddress } from "@/utils/formatting";
import Spinner from "@/features/UI/spinner";

export default function Page() {
  const { isAdmin } = useAdmin();
  const [umi, setUmi] = useState<Umi | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [merkleTree, setMerkleTree] = useState<KeypairSigner | null>(null);
  const [builder, setBuilder] = useState<any>(null);
  const wallet = useWallet();

  const handleCreateUmiClient = useCallback(async () => {
    if (!wallet?.connected) return;

    await wallet.connect();
    const umi = await createUmi(RPC_ENDPOINT_DEVNET)
      .use(mplToolbox())
      .use(mplTokenMetadata())
      .use(walletAdapterIdentity(wallet));

    setUmi(umi);
  }, [wallet]);

  const handleFetchTree = useCallback(async () => {
    if (!umi || !merkleTree) return;
    // const merkleTreeAccount = await fetchMerkleTree(umi, merkleTreePubKey);
  }, [merkleTree, umi]);

  const handleCreateTree = useCallback(async () => {
    if (!umi) return;

    setIsLoading(true);

    try {
      const merkleTree = generateSigner(umi);
      const builder = await createTree(umi, {
        merkleTree,
        maxDepth: 14,
        maxBufferSize: 64,
      });
      await builder.sendAndConfirm(umi);
      showToast({
        primaryMessage: "Merkle Tree Created",
      });
      setBuilder(builder);
      setMerkleTree(merkleTree);
    } catch (error) {
      showToast({
        primaryMessage: "Error creating Merkle Tree",
      });
    } finally {
      setIsLoading(false);
    }
  }, [umi]);

  useEffect(() => {
    if (!umi) {
      handleCreateUmiClient();
    }
  }, [umi, handleCreateUmiClient, handleCreateTree]);

  if (!isAdmin) return <NotAdminBlocker />;

  return (
    <ContentWrapper>
      <Panel>
        <h1 className="text-center py-4 text-2xl">Minting Lab</h1>
        {!!wallet?.connected && (
          <>
            <div className="flex justify-center py-2 w-full">
              {merkleTree ? (
                <div className="flex flex-col w-full justify-center items-center">
                  <div className="bold">Tree created:</div>
                  <div>{merkleTree.publicKey.toString()}</div>
                </div>
              ) : (
                <PrimaryButton onClick={handleCreateTree}>
                  {isLoading ? <Spinner /> : "Create Merkle Tree"}
                </PrimaryButton>
              )}
            </div>
            {/* <TokenMintingForm /> */}
          </>
        )}
      </Panel>
    </ContentWrapper>
  );
}
