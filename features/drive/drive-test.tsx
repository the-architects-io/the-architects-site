"use client";
import { RPC_ENDPOINT } from "@/constants/constants";
import { ShdwDrive } from "@shadow-drive/sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { useEffect, useState } from "react";

export default function DriveTest() {
  const wallet = useWallet();
  const [shadowDrive, setShadowDrive] = useState<ShdwDrive | null>(null);

  const createDrive = async () => {
    if (!shadowDrive) return;
    const { shdw_bucket, transaction_signature: tx } =
      await shadowDrive.createStorageAccount("text-drive", "1GB");
  };

  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
        const connection = new Connection(RPC_ENDPOINT, "confirmed");
        const drive = await new ShdwDrive(connection, wallet).init();
        setShadowDrive(drive);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.publicKey]);

  return <button onClick={createDrive}>Create Drive</button>;
}
