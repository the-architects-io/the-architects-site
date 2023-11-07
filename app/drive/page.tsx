"use client";
import { BASE_URL, RPC_ENDPOINT } from "@/constants/constants";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import { getAbbreviatedAddress } from "@/utils/formatting";
import ShadowUpload from "@/utils/shadow-upload";
import { FolderIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { PublicKey } from "@metaplex-foundation/js";
import { ShdwDrive, StorageAccountV2 } from "@shadow-drive/sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { useFormik } from "formik";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function DrivePage() {
  const wallet = useWallet();

  const [shadowDrive, setShadowDrive] = useState<ShdwDrive | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [storageAccounts, setStorageAccounts] = useState<
    { account: StorageAccountV2; publicKey: PublicKey }[]
  >([]);

  const fetchStorageAccounts = async (drive: ShdwDrive) => {
    const accounts = await drive.getStorageAccounts();

    if (accounts.length === 0) return;

    setStorageAccounts(accounts);
    setIsLoading(false);
  };

  const getFormattedSize = (amount: number) => {
    // return largest relevant unit between bytes, kilobytes, megabytes, gigabytes, terabytes
    if (amount < 1000) return `${amount} bytes`;
    if (amount < 1000000) return `${(amount / 1000).toFixed(2)} KB`;
    if (amount < 1000000000) return `${(amount / 1000000).toFixed(2)} MB`;
    if (amount < 1000000000000) return `${(amount / 1000000000).toFixed(2)} GB`;
    return `${(amount / 1000000000000).toFixed(2)} TB`;
  };

  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
        const connection = new Connection(RPC_ENDPOINT, "confirmed");
        const drive = await new ShdwDrive(connection, wallet).init();
        setShadowDrive(drive);
        fetchStorageAccounts(drive);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.publicKey]);

  if (isLoading || !wallet?.publicKey)
    return (
      <ContentWrapper className="w-full flex justify-center pt-64">
        {isLoading && <Spinner />}
        {!isLoading && !wallet?.publicKey && <WalletButton />}
      </ContentWrapper>
    );

  return (
    <div className="min-h-screen">
      <ContentWrapper className="flex flex-col items-center">
        {!!shadowDrive && !!storageAccounts.length ? (
          <div className="flex flex-col mb-8 items-center">
            <h1 className="mb-8 text-2xl text-center">Drives</h1>
            <div className="flex flex-wrap justify-center w-full mx-auto">
              {storageAccounts.map(({ publicKey, account }, i) => (
                <div
                  className="p-2 w-full md:w-1/2 lg:w-1/3"
                  key={publicKey?.toString() || i}
                >
                  <div className="flex flex-col flex-1 h-full space-x-4 p-4 border rounded-md bg-gray-700">
                    <Link href={`${BASE_URL}/drive/${publicKey?.toString()}`}>
                      <div className="flex flex-col items-center justify-between overflow-x-hidden">
                        <FolderIcon className="w-12 h-12 mb-2 mt-2" />
                        <div className="text-xl lg:text-3xl mb-4 truncate">
                          {account?.identifier}
                        </div>
                        <div className="mb-2 flex items-center">
                          {/* convert from bytes */}
                          <div className="text-sm uppercase mr-2">size:</div>
                          <div className="text-lg">
                            {getFormattedSize(Number(account?.storage))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <h1 className="mb-4 text-2xl">No Drives</h1>
          </>
        )}
      </ContentWrapper>
      <div className="absolute bottom-6 right-6">
        <Link href={`${BASE_URL}/drive/create`}>
          <PlusCircleIcon className="w-16 h-16 text-sky-200 hover:text-sky-300 cursor-pointer" />
        </Link>
      </div>
    </div>
  );
}
