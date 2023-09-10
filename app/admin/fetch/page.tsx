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
import { Line, Circle } from "rc-progress";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { useUserData } from "@nhost/nextjs";

export default function FetchPage() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const user = useUserData();
  const [isSaving, setIsSaving] = useState(false);
  const [totalNftsToAdd, setTotalNftsToAdd] = useState<number>(0);
  const [currentNftToAdd, setCurrentNftToAdd] = useState<number>(0);
  const [numberOfSuccesses, setNumberOfSuccesses] = useState<number>(0);
  const [numberOfSkips, setNumberOfSkips] = useState<number>(0);
  const [failedAdditions, setFailedAdditions] = useState<string[]>([]);

  const saveCharacterToDb = useCallback(
    async (
      hashList: string,
      i: number,
      total: number,
      nftCollectionId: string
    ) => {
      if (!publicKey || !connection) return;

      let returnData;

      try {
        // const { data } = await axios.post("/api/add-characters-from-nfts", {
        //   hashList,
        //   nftCollectionId,
        // });
        const { data } = await axios.post("/api/add-nfts", {
          hashList,
          nftCollectionId,
        });

        returnData = data;

        console.log({
          i,
          total,
        });
        if (returnData.message.includes("already exists")) {
          setNumberOfSkips((prev) => prev + 1);
        } else {
          setNumberOfSuccesses((prev) => prev + 1);
        }
        if (i + 1 === total) {
          showToast({
            primaryMessage: "Successfully added NFTs to db",
          });
          setIsSaving(false);
          setTotalNftsToAdd(0);
          setCurrentNftToAdd(0);
        }
      } catch (error) {
        console.log(error);
        showToast({
          primaryMessage: "Error adding character to db",
        });
        setFailedAdditions((prev) => [
          ...prev,
          hashList.replace(/"/g, "").replace("[", "").replace("]", ""),
        ]);
        if (i + 1 === total) {
          setIsSaving(false);
          setTotalNftsToAdd(0);
          setCurrentNftToAdd(0);
        }
      }

      console.log(returnData);
    },
    [publicKey, connection]
  );

  const fetchNftsInCollection = useCallback(
    async (hashList: string, nftCollectionId: string) => {
      setHashList(hashList);
      const jsonHashList = JSON.parse(hashList);
      setTotalNftsToAdd(jsonHashList.length);
      for (const [i, mintAddress] of jsonHashList.entries()) {
        console.log(i, mintAddress);
        setCurrentNftToAdd(i);
        await saveCharacterToDb(
          `["${mintAddress}"]`,
          i,
          jsonHashList.length,
          nftCollectionId
        );
      }
    },
    [saveCharacterToDb]
  );

  const clearReport = () => {
    setFailedAdditions([]);
    setNumberOfSuccesses(0);
    setNumberOfSkips(0);
  };

  const formik = useFormik({
    initialValues: {
      hashList: "",
      nftCollectionId: "",
    },
    onSubmit: async ({ hashList, nftCollectionId }) => {
      setIsSaving(true);
      clearReport();
      fetchNftsInCollection(hashList, nftCollectionId);
      formik.setFieldValue("hashList", "");
    },
  });

  const retryFailedAdditions = async (
    failedHashlist: string[],
    nftCollectionId: string
  ) => {
    setIsSaving(true);
    clearReport();
    fetchNftsInCollection(JSON.stringify(failedHashlist), nftCollectionId);
    formik.setFieldValue("hashList", "");
  };

  useEffect(() => {
    if (!user) return;
    if (user && !isAdmin) {
      router.push("/");
      return;
    }
  }, [connection, publicKey, isAdmin, router, user]);

  if (!isAdmin) return null;

  return (
    <ContentWrapper>
      {isSaving ? (
        <Panel className="mb-8">
          <div className="py-4 flex flex-col justify-center items-center">
            <div className="mb-4">
              <Spinner />
            </div>
            <div className="text-2xl mb-8">
              Adding {currentNftToAdd + 1} of {totalNftsToAdd} NFTs
            </div>
            <Line
              className="px-4"
              percent={((currentNftToAdd + 1) / totalNftsToAdd) * 100}
              strokeWidth={2}
              trailWidth={0.04}
              trailColor="#121212"
              // sky-400
              strokeColor="#38bdf8"
            />
            <div className="text-sm text-gray-100 mt-4">
              {Math.floor(((currentNftToAdd + 1) / totalNftsToAdd) * 100)}%
            </div>
            <div className="text-sm text-gray-100 mt-2">
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
            </div>
          </div>
        </Panel>
      ) : (
        <>
          <FormWrapper onSubmit={formik.handleSubmit}>
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
          </FormWrapper>
          <div className="flex w-full justify-center mt-4 mb-12">
            <SubmitButton
              isSubmitting={formik.isSubmitting || isSaving}
              onClick={formik.handleSubmit}
              disabled={
                !formik.values.hashList.length ||
                !formik.values.nftCollectionId.length
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
