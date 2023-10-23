"use client";
import { RPC_ENDPOINT } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import showToast from "@/features/toasts/show-toast";
import { getAbbreviatedAddress } from "@/utils/formatting";
import ShadowUpload from "@/utils/shadow-upload";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PublicKey } from "@metaplex-foundation/js";
import { ShdwDrive, StorageAccountV2 } from "@shadow-drive/sdk";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function StorageAccountPage({
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

  const fetchStoredObjects = async (drive: ShdwDrive) => {
    const storedObjects = await drive.listObjects(new PublicKey(params.id));

    if (!storedObjects) {
      setStoredObjectKeys([]);
      return;
    }

    setStoredObjectKeys(storedObjects.keys);
  };

  const handleDeleteDrive = async () => {
    if (!shadowDrive || !storageAccount) return;

    const response = await shadowDrive.deleteStorageAccount(
      new PublicKey(params.id)
    );

    if (!response?.txid) {
      showToast({
        primaryMessage: "Error",
        secondaryMessage: `Failed to delete drive`,
      });
      return;
    }

    showToast({
      primaryMessage: "Deleted",
      secondaryMessage: `Deleted drive`,
    });
  };

  const handleDeleteFile = async (filename: string) => {
    if (!shadowDrive || !storageAccount) return;

    const response = await shadowDrive.deleteFile(
      new PublicKey(params.id),
      `https://shdw-drive.genesysgo.net/${params.id}/${filename}`
    );
    console.log({ response });

    if (!response?.transaction_signature) {
      showToast({
        primaryMessage: "Error",
        secondaryMessage: `Failed to delete ${filename}`,
      });
      return;
    }

    showToast({
      primaryMessage: "Deleted",
      secondaryMessage: `Drive marked for deletion`,
    });

    fetchStoredObjects(shadowDrive);
  };

  const handleDeleteAllFiles = async () => {
    if (!shadowDrive || !storageAccount) return;

    for (const filename of storedObjectKeys) {
      await shadowDrive.deleteFile(
        new PublicKey(params.id),
        `https://shdw-drive.genesysgo.net/${params.id}/${filename}`
      );
    }

    showToast({
      primaryMessage: "Files deleted",
      secondaryMessage: "All files deleted",
    });

    fetchStoredObjects(shadowDrive);
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

        // upload file
        // const upload = await drive.uploadFile(acc, new File([""], "test.txt"));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.publicKey]);

  return (
    <ContentWrapper className="flex flex-col items-center">
      <h1 className="text-2xl mb-4">{storageAccount?.identifier}</h1>
      <h2 className="text-xl mb-8">
        ({`${getAbbreviatedAddress(params.id)}`})
      </h2>

      <div className="mb-8 w-full max-w-xl">
        {!!storedObjectKeys?.length ? (
          <div className="flex flex-col w-full">
            <div className="border-b border-gray-600"></div>
            {storedObjectKeys.map((filename) => (
              <div
                key={filename}
                className="flex justify-between items-center w-full border-b border-gray-600 py-4 px-2"
              >
                <div>{filename}</div>
                <div className="flex space-x-2">
                  <div
                    className="cursor-pointer"
                    onClick={() => handleDeleteFile(filename)}
                  >
                    <TrashIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <a
                      href={`https://shdw-drive.genesysgo.net/${params.id}/${filename}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <EyeIcon className="h-6 w-6" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 italic">This drive is empty</div>
        )}
      </div>
      {!!shadowDrive && !!storageAccount && (
        <Panel className="flex flex-col justify-center">
          <PrimaryButton className="mb-4" onClick={handleDeleteDrive}>
            Delete drive
          </PrimaryButton>
          <PrimaryButton className="mb-4" onClick={handleDeleteAllFiles}>
            Delete all files
          </PrimaryButton>
          <ShadowUpload
            drive={shadowDrive}
            accountPublicKey={new PublicKey(params.id)}
          />
        </Panel>
      )}
    </ContentWrapper>
  );
}
