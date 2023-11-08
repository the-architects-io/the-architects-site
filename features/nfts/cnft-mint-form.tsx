import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import {
  MerkleTree,
  mintToCollectionV1,
} from "@metaplex-foundation/mpl-bubblegum";
import { mintV1 } from "@metaplex-foundation/mpl-bubblegum";
import { createNft } from "@metaplex-foundation/mpl-token-metadata";
import {
  KeypairSigner,
  Umi,
  generateSigner,
  none,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";
import { useWallet } from "@solana/wallet-adapter-react";

export default function CnftMintForm({
  umi,
  merkleTreeAddress,
}: {
  umi: Umi | null;
  merkleTreeAddress: string;
}) {
  const wallet = useWallet();
  const handleMintCollectionNft = async () => {
    if (!umi || !merkleTreeAddress || !wallet?.publicKey) return;

    const collectionMint = generateSigner(umi);
    const mintRes = await createNft(umi, {
      mint: collectionMint,
      name: "Test Barrel Collection",
      uri: "https://shdw-drive.genesysgo.net/6V8LykNmNhn9oJ3t5qTSsv7r6FjJ3VUSmmjx6ggG3wa8/test-collection-meta.json",
      sellerFeeBasisPoints: percentAmount(10), // 10%
      isCollection: true,
    }).sendAndConfirm(umi);

    console.log({ mintRes });
  };

  const handleMintCnftsToCollection = async () => {
    if (!umi || !merkleTreeAddress || !wallet?.publicKey) return;

    const collectionMint = publicKey(
      "HAxdBQxAZLqJ5z55T6aYETFXUJmJGH6EVeiD4WFUV3sb"
    );

    await mintToCollectionV1(umi, {
      leafOwner: publicKey(wallet.publicKey),
      merkleTree: publicKey(merkleTreeAddress),
      collectionMint,
      metadata: {
        name: "TEST Dinodawgs Airdrops #0",
        uri: "https://shdw-drive.genesysgo.net/6V8LykNmNhn9oJ3t5qTSsv7r6FjJ3VUSmmjx6ggG3wa8/0-test.json",
        sellerFeeBasisPoints: 1000,
        collection: { key: collectionMint, verified: false },
        creators: [
          {
            address: publicKey("4ionNE2Tc7nB8w6CVLQx2FioNTjbaa5JxYJ7nbDkwxdt"),
            verified: false,
            share: 100,
          },
        ],
      },
    }).sendAndConfirm(umi);
  };

  const handleMintCnfts = async () => {
    if (!umi || !merkleTreeAddress || !wallet?.publicKey) return;

    const mintRes = await mintV1(umi, {
      leafOwner: publicKey(wallet.publicKey),
      merkleTree: publicKey(merkleTreeAddress),
      metadata: {
        name: "My Compressed NFT",
        uri: "https://example.com/my-cnft.json",
        sellerFeeBasisPoints: 500, // 5%
        collection: none(),
        creators: [
          { address: umi.identity.publicKey, verified: false, share: 100 },
        ],
      },
    }).sendAndConfirm(umi);

    console.log({ mintRes });
  };

  if (!umi || !merkleTreeAddress) return null;

  return (
    <div className="flex flex-col justify-center items-center w-full mb-4 space-y-4">
      <PrimaryButton onClick={handleMintCollectionNft}>
        Mint Collection NFT
      </PrimaryButton>
      <PrimaryButton onClick={handleMintCnftsToCollection}>
        Mint cNFTs
      </PrimaryButton>
    </div>
  );
}
