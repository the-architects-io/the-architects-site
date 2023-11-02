"use client";
import { RPC_ENDPOINT } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import DriveControls from "@/features/drive/DriveControls";
import DriveFileList from "@/features/drive/DriveFileList";
import DriveInfo from "@/features/drive/DriveInfo";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { PublicKey } from "@metaplex-foundation/js";
import { ShdwDrive, StorageAccountV2 } from "@shadow-drive/sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
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

  const fetchStoredObjects = async (drive: ShdwDrive) => {
    const storedObjects = await drive.listObjects(new PublicKey(params.id));

    if (!storedObjects) {
      setStoredObjectKeys([]);
      return;
    }

    setStoredObjectKeys(storedObjects.keys);
  };

  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
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
    <div className="flex flex-col items-center pt-32 w-full">
      {!!shadowDrive && !!storageAccount && (
        <div className="w-full flex flex-1">
          <DriveFileList
            files={storedObjectKeys}
            driveAddress={params.id}
            shadowDrive={shadowDrive}
            storageAccount={storageAccount}
            refetchFiles={() => fetchStoredObjects(shadowDrive)}
          />
          <div className="w-[300px]">
            <DriveInfo
              driveAddress={params.id}
              storageAccount={storageAccount}
              shadowDrive={shadowDrive}
              refetchFiles={() => fetchStoredObjects(shadowDrive)}
            />
            {/* <DriveControls
              shadowDrive={shadowDrive}
              driveAddress={params.id}
              files={storedObjectKeys}
              refetchFiles={() => fetchStoredObjects(shadowDrive)}
            /> */}
          </div>
        </div>
      )}
    </div>
  );
}
