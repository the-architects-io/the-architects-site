"use client";
import { BASE_URL, RPC_ENDPOINT } from "@/constants/constants";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import DriveControls from "@/features/drive/DriveControls";
import DriveFileList from "@/features/drive/DriveFileList";
import DriveInfo from "@/features/drive/DriveInfo";
import { PublicKey } from "@metaplex-foundation/js";
import { ArrowLeft } from "@mui/icons-material";
import { ShdwDrive, StorageAccountV2 } from "@shadow-drive/sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DriveInstancePage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const wallet = useWallet();
  const [shadowDrive, setShadowDrive] = useState<ShdwDrive | null>(null);
  const [storageAccount, setStorageAccount] = useState<StorageAccountV2 | null>(
    null
  );
  const [storedObjectKeys, setStoredObjectKeys] = useState<any[]>([]);
  const [numberOfConcurrentUploads, setNumberOfConcurrentUploads] =
    useState<string>("3");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchStoredObjects = async (drive: ShdwDrive) => {
    setIsLoading(true);
    const storedObjects = await drive.listObjects(new PublicKey(params.id));

    if (!storedObjects) {
      setStoredObjectKeys([]);
      return;
    }

    setStoredObjectKeys(storedObjects.keys);
    setIsLoading(false);
  };

  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
        // Always use mainnet
        const connection = new Connection(RPC_ENDPOINT, "confirmed");

        const drive = await new ShdwDrive(connection, wallet).init();
        setShadowDrive(drive);

        // @ts-ignore
        const account: StorageAccountV2 = await drive.getStorageAccount(
          new PublicKey(params.id)
        ); // returns `account` not `{ account, publicKey }`

        setStorageAccount(account);
        fetchStoredObjects(drive);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.publicKey]);

  return (
    <ContentWrapper className="flex flex-col items-center pt-32 w-full">
      <div className="-mt-8 mb-8 ml-10 self-start uppercase">
        <Link href={`${BASE_URL}/me/drive`} className="flex items-center">
          <ArrowLeft className="mr-2 h-6 w-6" />
          <div>Back to drives</div>
        </Link>
      </div>
      {!!shadowDrive && !!storageAccount && (
        <div className="w-full flex flex-1">
          <DriveFileList
            isLoading={isLoading}
            files={storedObjectKeys}
            driveAddress={params.id}
            shadowDrive={shadowDrive}
            storageAccount={storageAccount}
            refetchFiles={() => fetchStoredObjects(shadowDrive)}
          />
          {/* <SortTable /> */}
          <div className="w-[320px]">
            <DriveInfo
              driveAddress={params.id}
              storageAccount={storageAccount}
              shadowDrive={shadowDrive}
              refetchFiles={() => fetchStoredObjects(shadowDrive)}
            />
            <DriveControls
              shadowDrive={shadowDrive}
              driveAddress={params.id}
              files={storedObjectKeys}
              refetchFiles={() => fetchStoredObjects(shadowDrive)}
            />
          </div>
        </div>
      )}
    </ContentWrapper>
  );
}
