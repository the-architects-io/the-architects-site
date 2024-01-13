import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FetchUpdateAuthorityForm } from "@/features/toolkit/collections/fetch-update-authority-form";
import { SetNewUpdateAuthorityForm } from "@/features/toolkit/collections/set-new-update-authority-form";
import WalletConnector from "@/features/wallets/wallet-connector";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { ExclamationCircleIcon, SignalIcon } from "@heroicons/react/24/outline";
import { useWallet } from "@solana/wallet-adapter-react";
import { useFormik } from "formik";
import { useState } from "react";

export const UpdateAuthorityForm = () => {
  const [collectionAddress, setCollectionAddress] = useState("");
  const [updateAuthorityAddress, setUpdateAuthorityAddress] = useState("");
  const wallet = useWallet();

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    onSubmit: async ({ name }) => {
      console.log(name);
    },
  });

  if (!wallet?.publicKey) {
    return <WalletConnector />;
  }

  return (
    <div>
      <p className="italic mb-8">
        To update the UA of a collection, you must connect with the wallet that
        is the current UA of the collection.
      </p>
      {!!collectionAddress && (
        <div className="flex justify-center space-x-4 mb-4">
          <div>Collection Address:</div>
          <div>{getAbbreviatedAddress(collectionAddress)}</div>
        </div>
      )}
      {!!updateAuthorityAddress ? (
        <>
          <div className="flex justify-center space-x-4 mb-4">
            <div>Update Authority Address:</div>
            <div>{getAbbreviatedAddress(updateAuthorityAddress)}</div>
          </div>
          {updateAuthorityAddress === wallet.publicKey.toString() ? (
            <div className="flex justify-center space-x-4 mb-4">
              <div>Update Authority Address:</div>
              <div>{getAbbreviatedAddress(updateAuthorityAddress)}</div>
              <SetNewUpdateAuthorityForm
                collectionAddress={collectionAddress}
                updateAuthorityAddress={updateAuthorityAddress}
              />
            </div>
          ) : (
            <div className="flex justify-center space-x-2 mb-4">
              <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
              <div className="text-red-500">
                You are not the current UA of this collection.
              </div>
            </div>
          )}
        </>
      ) : (
        <FetchUpdateAuthorityForm
          updateAuthorityAddress={updateAuthorityAddress}
          setUpdateAuthorityAddress={setUpdateAuthorityAddress}
          collectionAddress={collectionAddress}
          setCollectionAddress={setCollectionAddress}
        />
      )}
    </div>
  );
};
