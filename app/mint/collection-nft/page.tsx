import NftCollectionForm from "@/features/nfts/nft-collection-form";
import { Umi } from "@metaplex-foundation/umi";
import { ShdwDrive } from "@shadow-drive/sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

export default function Page() {
  const { publicKey } = useWallet();

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
  const [creatorAddress, setCreatorAddress] = useState<string | null>(
    "4ionNE2Tc7nB8w6CVLQx2FioNTjbaa5JxYJ7nbDkwxdt"
  );
  const [sellerFeeBasisPoints, setSellerFeeBasisPoints] = useState<
    number | null
  >(null);

  return (
    <div>
      <div className="text-3xl">Mint Collection NFT</div>
      {!!publicKey && (
        <NftCollectionForm
          setCollectionNftAddress={setCollectionNftAddress}
          setSellerFeeBasisPoints={setSellerFeeBasisPoints}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
          umi={umi}
          drive={drive}
        />
      )}
    </div>
  );
}
