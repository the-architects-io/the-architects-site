"use client";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import { getAbbreviatedAddress } from "@/utils/formatting";
import ShadowUpload from "@/utils/shadow-upload";
import { PublicKey } from "@metaplex-foundation/js";
import { ShdwDrive, StorageAccountV2 } from "@shadow-drive/sdk";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function StorageAccountPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [shadowDrive, setShadowDrive] = useState<ShdwDrive | null>(null);
  const [storageAccount, setStorageAccount] = useState<StorageAccountV2 | null>(
    null
  );
  const [storedObjectKeys, setStoredObjectKeys] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
        const drive = await new ShdwDrive(connection, wallet).init();
        setShadowDrive(drive);

        // @ts-ignore
        const account: StorageAccountV2 = await drive.getStorageAccount(
          new PublicKey(params.id)
        ); // returns `account` not `{ account, publicKey }`
        setStorageAccount(account);

        const storedObjects = await drive.listObjects(new PublicKey(params.id));
        if (!storedObjects) return;

        console.log({ storedObjects });

        setStoredObjectKeys(storedObjects.keys);

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

      <div className="mb-8">
        {!!storedObjectKeys?.length ? (
          JSON.stringify(storedObjectKeys, null, 2)
        ) : (
          <div>This drive is empty.</div>
        )}
      </div>
      {!!shadowDrive && !!storageAccount && (
        <Panel className="pt-0">
          <ShadowUpload
            drive={shadowDrive}
            accountPublicKey={new PublicKey(params.id)}
          />
        </Panel>
      )}
    </ContentWrapper>
  );
}
