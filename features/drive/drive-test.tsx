"use client";
import { ASSET_SHDW_DRIVE_ADDRESS, RPC_ENDPOINT } from "@/constants/constants";
import { PublicKey } from "@metaplex-foundation/js";
import { ShadowFile, ShdwDrive } from "@shadow-drive/sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { useEffect, useState } from "react";

export default function DriveTest() {
  const wallet = useWallet();
  const [drive, setDrive] = useState<ShdwDrive | null>(null);

  const uploadJson = async () => {
    if (!drive) return;

    const gameData = {
      score: 4500,
      level: 5,
      // ... other game state data ...
    };

    const gameDataBuffer = Buffer.from(JSON.stringify(gameData));

    const acctPubKey = new PublicKey(ASSET_SHDW_DRIVE_ADDRESS);

    // const fileToUpload: ShadowFile = {
    //   name: "gameData.json",
    //   file: gameDataBuffer,
    // };

    const fileToUpload = new File([gameDataBuffer], "gameData.json", {
      type: "application/json",
    });

    const uploadFile = await drive.uploadFile(acctPubKey, fileToUpload);
    console.log(uploadFile);
  };

  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
        // Always use mainnet
        const connection = new Connection(RPC_ENDPOINT, "confirmed");
        const drive = await new ShdwDrive(connection, wallet).init();

        setDrive(drive);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.publicKey]);

  return <button onClick={uploadJson}>upload json</button>;
}
