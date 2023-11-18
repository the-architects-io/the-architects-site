"use client";
import { LOCAL_OR_REMOTE } from "@/app/blueprint/types";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import MerkleTreeForm from "@/features/nfts/merkle-tree-form";
import NftCollectionForm from "@/features/nfts/nft-collection-form";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useAdmin } from "@/hooks/admin";
import { getRpcEndpoint } from "@/utils/rpc";
import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { MerkleTree } from "@metaplex-foundation/mpl-bubblegum";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { KeypairSigner, isPublicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { Umi } from "@metaplex-foundation/umi/dist/types/Umi";
import { ShdwDrive } from "@shadow-drive/sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import { Connection } from "@solana/web3.js";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { useFormik } from "formik";
import showToast from "@/features/toasts/show-toast";
import CnftMintForm from "@/features/nfts/cnft-mint-form";
import { Panel } from "@/features/UI/panel";
import { getAbbreviatedAddress } from "@/utils/formatting";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import { copyTextToClipboard } from "@/utils/clipboard";

const { LOCAL, REMOTE } = LOCAL_OR_REMOTE;

export default function AirdropPage() {
  const { isAdmin } = useAdmin();
  const wallet = useWallet();

  const [step, setStep] = useState(0);
  const [merkleTree, setMerkleTree] = useState<
    KeypairSigner | MerkleTree | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [umi, setUmi] = useState<Umi | null>(null);
  const [hasInitializedUmiClient, setHasInitializedUmiClient] =
    useState<boolean>(false);
  const [drive, setDrive] = useState<ShdwDrive | null>(null);
  const [hasInitializedDriveClient, setHasCreatedDriveClient] =
    useState<boolean>(false);
  const [collectionNftAddress, setCollectionNftAddress] = useState<
    string | null
  >(null);

  const [sellerFeeBasisPoints, setSellerFeeBasisPoints] = useState<
    number | null
  >(null);

  const creatorAddress = "4ionNE2Tc7nB8w6CVLQx2FioNTjbaa5JxYJ7nbDkwxdt";

  const formik = useFormik({
    initialValues: {
      existingCollectionNftAddress: "",
    },
    onSubmit: async ({
      existingCollectionNftAddress: collectionNftAddress,
    }) => {
      console.log({
        umi,
        merkleTree,
        drive,
        wallet,
      });
      if (!umi || !merkleTree || !drive || !wallet?.publicKey) return;

      if (!collectionNftAddress || !isPublicKey(collectionNftAddress)) {
        showToast({
          primaryMessage: "Invalid NFT address",
        });
        return;
      }

      const connection = new Connection(getRpcEndpoint());
      const metaplex = Metaplex.make(connection);
      const { json } = await metaplex
        .nfts()
        .findByMint({ mintAddress: new PublicKey(collectionNftAddress) });

      setCollectionNftAddress(collectionNftAddress);
      if (
        !json?.seller_fee_basis_points ||
        isNaN(json?.seller_fee_basis_points)
      ) {
        showToast({
          primaryMessage: "Invalid seller fee basis points",
        });
        return;
      }
      setSellerFeeBasisPoints(json.seller_fee_basis_points);
      setStep(step + 1);
    },
  });

  const handleCreateUmiClient = useCallback(async () => {
    await wallet?.connect();

    setHasInitializedUmiClient(true);

    const umi = await createUmi(getRpcEndpoint())
      .use(mplToolbox())
      .use(mplTokenMetadata())
      .use(dasApi())
      .use(walletAdapterIdentity(wallet));

    setUmi(umi);
  }, [wallet]);

  const handleCreateDriveClient = useCallback(async () => {
    await wallet?.connect();

    setHasCreatedDriveClient(true);

    const connection = new Connection(getRpcEndpoint());
    const drive = await new ShdwDrive(connection, wallet).init();

    setDrive(drive);
  }, [wallet]);

  useEffect(() => {
    if (!isAdmin) return;

    if (!umi && !hasInitializedUmiClient) {
      handleCreateUmiClient();
    }

    if (!drive && !hasInitializedDriveClient) {
      handleCreateDriveClient();
    }

    if (merkleTree && step === 0) {
      setStep(step + 1);
    }
  }, [
    drive,
    handleCreateDriveClient,
    handleCreateUmiClient,
    setHasCreatedDriveClient,
    isAdmin,
    merkleTree,
    step,
    umi,
    hasInitializedUmiClient,
    hasInitializedDriveClient,
  ]);

  if (!isAdmin) return <NotAdminBlocker />;
  if (!wallet?.publicKey)
    return (
      <ContentWrapper>
        <WalletButton />
      </ContentWrapper>
    );

  return (
    <ContentWrapper className="flex flex-col items-center">
      <div className="text-2xl mb-4">Airdrop</div>
      <Panel className="text-lg mb-8 space-y-2">
        <div className="flex justify-between">
          <div className="flex space-x-2">
            <div>Cluster:</div>
            <div>
              {getRpcEndpoint().includes("devnet") ? "Devnet" : "Mainnet"}
            </div>
          </div>
        </div>
        {merkleTree && (
          <>
            <div className="flex justify-between">
              <div className="flex space-x-2">
                <div>Merkle Tree Address:</div>
                <div>
                  {getAbbreviatedAddress(merkleTree.publicKey.toString())}
                </div>
              </div>

              <ClipboardIcon
                className="h-6 w-6 cursor-pointer"
                onClick={() =>
                  copyTextToClipboard(merkleTree.publicKey.toString())
                }
              />
            </div>
            <div className="flex justify-between">
              <div className="flex space-x-2">
                <div>Max depth:</div>
                <div>
                  {/* @ts-ignore */}
                  {merkleTree?.treeHeader?.maxDepth}
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="flex space-x-2">
                <div>Max buffer size:</div>
                <div>
                  {/* @ts-ignore */}
                  {merkleTree?.treeHeader?.maxBufferSize}
                </div>
              </div>
            </div>
          </>
        )}
        {collectionNftAddress && (
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <div>Collection NFT Address:</div>
              <div>{getAbbreviatedAddress(collectionNftAddress)}</div>
            </div>
            <ClipboardIcon
              className="h-6 w-6 cursor-pointer"
              onClick={() => copyTextToClipboard(collectionNftAddress)}
            />
          </div>
        )}
        {creatorAddress && (
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <div>Creator Address:</div>
              <div>{getAbbreviatedAddress(creatorAddress)}</div>
            </div>
            <ClipboardIcon
              className="h-6 w-6 cursor-pointer"
              onClick={() => copyTextToClipboard(creatorAddress)}
            />
          </div>
        )}
        {sellerFeeBasisPoints && (
          <div className="flex space-x-2">
            <div>Seller Fee Basis Points:</div>
            <div>{sellerFeeBasisPoints}</div>
            <div>({sellerFeeBasisPoints / 100}%)</div>
          </div>
        )}
      </Panel>
      {step === 0 && (
        <div className="text-center">
          <div className="text-3xl mb-2">Step 1</div>
          <div className="text-xl mb-4">Create or Select Tree</div>
          <MerkleTreeForm
            umi={umi}
            setMerkleTree={setMerkleTree}
            setIsLoading={setIsLoading}
            isLoading={isLoading}
            localOrRemote={REMOTE}
          />
        </div>
      )}
      {step === 1 && (
        <>
          {merkleTree ? (
            <div>
              <div className="text-3xl mb-2 text-center">Step 2</div>
              <div className="text-xl mb-4 text-center">
                Create or Select Collection NFT
              </div>
              <>
                <FormInputWithLabel
                  label="Existing Collection NFT Address"
                  name="existingCollectionNftAddress"
                  value={formik.values.existingCollectionNftAddress}
                  onChange={formik.handleChange}
                />
                <div className="flex py-4 w-full justify-center">
                  <SubmitButton
                    disabled={isLoading}
                    isSubmitting={formik.isSubmitting}
                    onClick={formik.handleSubmit}
                  >
                    Select NFT
                  </SubmitButton>
                </div>
              </>
              <div className="py-8 text-4xl text-center">- OR -</div>
              {creatorAddress && (
                <NftCollectionForm
                  setCollectionNftAddress={setCollectionNftAddress}
                  setSellerFeeBasisPoints={setSellerFeeBasisPoints}
                  setIsLoading={setIsLoading}
                  isLoading={isLoading}
                  umi={umi}
                  drive={drive}
                  setStep={setStep}
                  step={step}
                />
              )}
            </div>
          ) : (
            <>
              <div>No tree selected</div>
              <PrimaryButton onClick={() => setStep(step - 1)}>
                Go Back
              </PrimaryButton>
            </>
          )}
        </>
      )}
      {step === 2 && (
        <>
          {merkleTree &&
          collectionNftAddress &&
          creatorAddress &&
          sellerFeeBasisPoints ? (
            <>
              <div className="text-xl mb-4">Mint cNFTs to Collection</div>
              <CnftMintForm
                umi={umi}
                merkleTreeAddress={merkleTree.publicKey.toString()}
                collectionNftAddress={collectionNftAddress}
                creatorAddress={creatorAddress}
                isLocalOrRemote={REMOTE}
                sellerFeeBasisPoints={sellerFeeBasisPoints}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
              />
            </>
          ) : (
            <>
              <div className="mb-8">Missing required data</div>
              <PrimaryButton onClick={() => setStep(step - 1)}>
                Go Back
              </PrimaryButton>
            </>
          )}
        </>
      )}
    </ContentWrapper>
  );
}
