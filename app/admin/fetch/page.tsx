"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAdmin } from "@/hooks/admin";
import { useRouter } from "next/navigation";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { useFormik } from "formik";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import showToast from "@/features/toasts/show-toast";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { NftCollectionsSelectInput } from "@/features/nft-collections/nft-collections-select-input";
import Spinner from "@/features/UI/spinner";
import { Panel } from "@/features/UI/panel";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { Line } from "rc-progress";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { useUserData } from "@nhost/nextjs";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormCheckboxWithLabel } from "@/features/UI/forms/form-checkbox-with-label";
import { Connection } from "@solana/web3.js";
import { RPC_ENDPOINT } from "@/constants/constants";
import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import { Helius } from "helius-sdk";

type AddCharactersFromNftsResponse = {
  data: {
    success: boolean;
    numberOfTokensSkipped: number;
    numberOfTokensAdded: number;
    numberOfCharactersAdded: number;
    numberOfCharactersSkipped: number;
    numberOfTraitsSkipped: number;
    numberOfTraitsAdded: number;
  };
};

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunked_arr = [];
  for (let i = 0; i < array.length; i += size) {
    const chunk = array.slice(i, i + size);
    chunked_arr.push(chunk);
  }
  return chunked_arr;
}

export default function FetchPage() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const user = useUserData();
  const [isSaving, setIsSaving] = useState(false);
  const [totalNftsToAdd, setTotalNftsToAdd] = useState<number>(0);
  const [numberOfSuccesses, setNumberOfSuccesses] = useState<number>(0);
  const [numberOfSkips, setNumberOfSkips] = useState<number>(0);
  const [failedAdditions, setFailedAdditions] = useState<string[]>([]);
  const [hashList, setHashList] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);

  const clearReport = () => {
    setFailedAdditions([]);
    setNumberOfSuccesses(0);
    setNumberOfSkips(0);
  };

  const formik = useFormik({
    initialValues: {
      hashList: "",
      nftCollectionId: "",
      chunkSize: 200,
      collectionAddress: "",
      creatorAddress: "",
      isManualMode: false,
    },
    onSubmit: async ({
      hashList,
      nftCollectionId,
      isManualMode,
      collectionAddress,
      creatorAddress,
    }) => {
      setIsSaving(true);
      clearReport();
      if (isManualMode) {
        fetchNftsInCollectionByHashlist(hashList, nftCollectionId);
      } else {
        fetchNftsInCollectionByCollectionAddress(
          creatorAddress,
          collectionAddress
        );
      }
      formik.setFieldValue("hashList", "");
    },
  });

  const saveCharactersToDb = useCallback(
    async (hashes: string[], total: number, nftCollectionId: string) => {
      if (!publicKey || !connection) return;

      let returnData;

      try {
        // Send the entire array of hashes
        const response = await fetch("/api/add-characters-from-nfts-stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hashList: JSON.stringify(hashes),
            nftCollectionId,
          }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        if (!response?.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();

        while (true) {
          const { done, value } = await reader.read();

          console.log({ done, value });

          if (done) {
            break;
          }

          try {
            const res = new TextDecoder().decode(value);
            const { progress, numberOfTokensAdded, numberOfTokensSkipped } =
              JSON.parse(res);
            setProgress(progress);
            setNumberOfSuccesses((prev) => prev + numberOfTokensAdded);
            setNumberOfSkips((prev) => prev + numberOfTokensSkipped);
          } catch (e) {
            // Not enough data for a complete JSON object yet, just keep accumulating
          }
        }

        showToast({
          primaryMessage: "Successfully added NFTs to db",
        });
        setIsSaving(false);
        setTotalNftsToAdd(0);
        setProgress(0);
        formik.setFieldValue("hashList", "");
      } catch (error) {
        console.log(error);
        showToast({
          primaryMessage: "Error adding characters to db",
        });
        // setFailedAdditions((prev) => [...prev, ...hashes]);
      }
    },
    [publicKey, connection, formik]
  );

  const fetchNftsInCollectionByCollectionAddress = useCallback(
    async (creatorAddress: string, collectionAddress: string) => {
      if (!publicKey) return;

      const { data }: AddCharactersFromNftsResponse = await axios.post(
        "/api/get-nfts-by-collection-mint-address",
        {
          collectionAddress,
          creatorAddress,
        }
      );
      console.log(data);
    },
    [publicKey]
  );

  const fetchNftsInCollectionByHashlist = useCallback(
    async (hashList: string, nftCollectionId: string) => {
      const jsonHashList = JSON.parse(hashList);

      setTotalNftsToAdd(jsonHashList.length);

      await saveCharactersToDb(
        jsonHashList,
        jsonHashList.length,
        nftCollectionId
      );
    },
    [saveCharactersToDb]
  );

  const retryFailedAdditions = async (
    failedHashlist: string[],
    nftCollectionId: string
  ) => {
    setIsSaving(true);
    clearReport();
    fetchNftsInCollectionByHashlist(
      JSON.stringify(failedHashlist),
      nftCollectionId
    );
    formik.setFieldValue("hashList", "");
  };

  if (!isAdmin) return <NotAdminBlocker />;

  return (
    <ContentWrapper>
      {isSaving ? (
        <Panel className="mb-8">
          <div className="py-4 flex flex-col justify-center items-center">
            <div className="mb-4">
              <Spinner />
            </div>
            <div className="text-2xl mb-8">Adding {totalNftsToAdd} NFTs</div>
            <div className="text-xl mb-4">
              {progress}
              <span className="text-sm">%</span>
            </div>
            <Line
              className="px-4"
              percent={Number(progress)}
              strokeWidth={2}
              trailWidth={0.04}
              trailColor="#121212"
              // sky-400
              strokeColor="#38bdf8"
            />
            {/* <div className="text-sm text-gray-100 mt-4">
              {Math.floor(
                ((currentNftToAdd + 1) / totalNftsToAdd) * 100
              ).toFixed(0)}{" "}
              %
            </div> */}
            {/* <div className="text-sm text-gray-100 mt-2">
              Est. time remaining&nbsp;
              <>
                {(totalNftsToAdd - currentNftToAdd) * 3 >= 60 && (
                  <>
                    {Math.floor(((totalNftsToAdd - currentNftToAdd) * 3) / 60)}{" "}
                    minutes
                  </>
                )}
                {(totalNftsToAdd - currentNftToAdd) * 3 < 60 && (
                  <>
                    {Math.floor((totalNftsToAdd - currentNftToAdd) * 3)} seconds
                  </>
                )}
              </>
            </div> */}
          </div>
        </Panel>
      ) : (
        <>
          <FormWrapper onSubmit={formik.handleSubmit}>
            <div className="py-4 flex w-full">
              <FormCheckboxWithLabel
                label="Manual entry (hashlist)"
                name="isManualMode"
                value={formik.values.isManualMode}
                onChange={(e: any) => {
                  formik.setFieldValue("isManualMode", e.target.checked);
                }}
              />
            </div>
            {formik.values.isManualMode ? (
              <>
                <NftCollectionsSelectInput
                  value={formik.values.nftCollectionId}
                  handleBlur={formik.handleBlur}
                  handleChange={formik.handleChange}
                />
                <FormTextareaWithLabel
                  label="Hashlist"
                  name="hashList"
                  value={formik.values.hashList}
                  onChange={formik.handleChange}
                />
              </>
            ) : (
              <>
                <FormInputWithLabel
                  label="Collection Address"
                  name="collectionAddress"
                  value={formik.values.collectionAddress}
                  onChange={formik.handleChange}
                />
                <FormInputWithLabel
                  label="Creator Address"
                  name="creatorAddress"
                  value={formik.values.creatorAddress}
                  onChange={formik.handleChange}
                />
              </>
            )}
            <div className="w-full flex justify-center">
              <div className="w-32">
                <FormInputWithLabel
                  label="Chunk Size"
                  name="chunkSize"
                  type="number"
                  value={formik.values.chunkSize}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
          </FormWrapper>
          <div className="flex w-full justify-center mt-4 mb-12">
            <SubmitButton
              isSubmitting={formik.isSubmitting || isSaving}
              onClick={formik.handleSubmit}
              disabled={
                false
                // !formik.values.hashList.length ||
                // !formik.values.nftCollectionId.length ||
                // (!formik.values.collectionAddress.length &&
                //   !formik.values.creatorAddress.length) ||
                // !publicKey
              }
            />
          </div>
        </>
      )}
      {numberOfSuccesses + failedAdditions.length + numberOfSkips > 0 && (
        <Panel className="flex flex-col items-center justify-center bg-gray-800 mb-8 text-gray-100 text-lg relative py-6">
          <button className="absolute right-4 top-8 cursor-pointer mr-1">
            <XCircleIcon
              className="cursor-pointer h-6 w-6"
              onClick={clearReport}
            />
          </button>
          <div className="uppercase mb-8 text-2xl">Report</div>
          {numberOfSuccesses > 0 && (
            <div className="mb-2 max-w-xs flex justify-between w-full">
              <div>Added</div>
              <div className="font-bold">{numberOfSuccesses}</div>
            </div>
          )}
          {numberOfSkips > 0 && (
            <div className="mb-2 max-w-xs flex justify-between w-full">
              <div className="mb-2">Skipped (Already exists):</div>
              <div className="font-bold">{numberOfSkips}</div>
            </div>
          )}
          {failedAdditions.length > 0 && (
            <>
              <div className="mb-2 max-w-xs flex justify-between w-full">
                <div>Failed</div>
                <div className="font-bold">{failedAdditions.length}</div>
              </div>
              <div className="flex flex-col justify-center items-center bg-red-700 text-xs">
                {failedAdditions.map((mint) => (
                  <div key={mint}>{mint}</div>
                ))}
                <PrimaryButton
                  onClick={() =>
                    retryFailedAdditions(
                      failedAdditions,
                      formik.values.nftCollectionId
                    )
                  }
                >
                  Retry Failed
                </PrimaryButton>
              </div>
            </>
          )}
          <div className="w-full border-b border-gray-500 mb-2" />
          {numberOfSuccesses + failedAdditions.length + numberOfSkips > 0 && (
            <div className="max-w-xs flex justify-between w-full mt-2">
              <div>Total</div>
              <div className="font-bold">
                {numberOfSuccesses + failedAdditions.length + numberOfSkips}
              </div>
            </div>
          )}
        </Panel>
      )}
    </ContentWrapper>
  );
}
