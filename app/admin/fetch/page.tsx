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
import { BASE_URL, RPC_ENDPOINT } from "@/constants/constants";
import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import { Helius } from "helius-sdk";
import Image from "next/image";
import { useLazyQuery, useQuery } from "@apollo/client";
import { GET_NFT_COLLECTION_BY_MINT_ADDRESS } from "@/graphql/queries/get-nft-collection-by-mint-address";
import { NftCollection } from "@/features/admin/nft-collections/nfts-collection-list-item";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import Stopwatch from "@/features/stopwatch/stopwatch";

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
  const [collectionInfo, setCollectionInfo] = useState<any>(null);
  const [
    isFetchingCollectionMintAddresses,
    setIsFetchingCollectionMintAddresses,
  ] = useState<boolean>(false);
  const [isFetchingCollectionInfo, setIsFetchingCollectionInfo] =
    useState<boolean>(false);
  const [existingNftCollection, setExistingNftCollection] =
    useState<NftCollection | null>(null);
  const [shouldStartStopwatch, setShouldStartStopwatch] =
    useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const clearReport = () => {
    setFailedAdditions([]);
    setNumberOfSuccesses(0);
    setNumberOfSkips(0);
  };

  const formik = useFormik({
    initialValues: {
      hashList: "",
      nftCollectionId: "",
      collectionAddress: "",
      isManualMode: false,
      shouldOverwrite: false,
    },
    onSubmit: async ({
      hashList,
      nftCollectionId,
      isManualMode,
      collectionAddress,
      shouldOverwrite,
    }) => {
      clearReport();
      if (isManualMode) {
        fetchNftsInCollectionByHashlist(
          hashList,
          nftCollectionId,
          shouldOverwrite
        );
      } else {
        const existingCollection = await fetchExistingNftCollection(
          collectionAddress
        );
        if (existingCollection) {
          setExistingNftCollection(existingCollection);
          formik.setFieldValue("nftCollectionId", existingCollection.id);
          return;
        }
        fetchCollectionInfo(collectionAddress, shouldOverwrite);
      }
      formik.setFieldValue("hashList", "");
    },
  });

  const { loading: isFetchingExistingCollection } = useQuery(
    GET_NFT_COLLECTION_BY_MINT_ADDRESS,
    {
      variables: {
        mintAddress: formik.values.collectionAddress,
      },
      skip: !formik.values.collectionAddress,
      onCompleted: (data) => {
        setExistingNftCollection(data?.nftCollection);
      },
    }
  );

  const saveCharactersToDb = useCallback(
    async (
      hashes: string[],
      total: number,
      nftCollectionId: string,
      shouldOverwrite: boolean
    ) => {
      if (!publicKey || !connection) return;

      let returnData;

      try {
        setShouldStartStopwatch(true);
        // Send the entire array of hashes
        const response = await fetch("/api/add-characters-from-nfts-stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hashList: JSON.stringify(hashes),
            nftCollectionId,
            shouldOverwrite,
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
            console.log({ res });

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
        setShouldStartStopwatch(false);
      } catch (error) {
        console.log(error);
        showToast({
          primaryMessage: "Error adding characters to db",
        });
      }
    },
    [publicKey, connection, formik]
  );

  const fetchExistingNftCollection = async (collectionAddress: string) => {
    if (!collectionAddress) return;

    const { data } = await axios.post(
      `${BASE_URL}/api/get-nft-collection-by-mint-address`,
      { mintAddress: collectionAddress }
    );

    if (!data?.nftCollection?.id) {
      return null;
    }

    return data.nftCollection;
  };

  const fetchCollectionInfo = useCallback(
    async (collectionAddress: string, shouldOverwrite: boolean) => {
      setIsFetchingCollectionInfo(true);

      // first search for existing collection
      const { data: existingNftCollectionData } = await axios.post(
        `${BASE_URL}/api/get-nft-collection-by-mint-address`,
        { mintAddress: collectionAddress }
      );

      if (existingNftCollectionData?.nftCollection?.id) {
        setExistingNftCollection(existingNftCollectionData.nftCollection);
        formik.setFieldValue("nftCollectionId", existingNftCollectionData.id);
        return;
      }

      // if not found, fetch from on chain
      const { data } = await axios.post(
        `${BASE_URL}/api/get-collection-info-by-mint-address`,
        { collectionAddress }
      );

      // then save to db
      const { data: nftCollectionData } = await axios.post(
        `${BASE_URL}/api/add-nft-collection`,
        {
          name: data?.name,
          symbol: data?.symbol,
          mintAddress: collectionAddress,
          imageUrl: data?.image,
        }
      );

      formik.setFieldValue("nftCollectionId", nftCollectionData?.id);

      if (!data?.name) {
        showToast({
          primaryMessage: "Error fetching collection info",
        });
        return;
      }

      setCollectionInfo(data);
      setIsFetchingCollectionInfo(false);
    },
    [formik]
  );

  const fetchNftsInCollectionByHashlist = useCallback(
    async (
      hashList: string,
      nftCollectionId: string,
      shouldOverwrite: boolean
    ) => {
      const jsonHashList = JSON.parse(hashList);

      setIsSaving(true);

      setTotalNftsToAdd(jsonHashList.length);

      await saveCharactersToDb(
        jsonHashList,
        jsonHashList.length,
        nftCollectionId,
        shouldOverwrite
      );

      setIsSaving(false);
      setIsComplete(true);
    },
    [saveCharactersToDb]
  );

  const fetchCollectionNftMintAddresses = useCallback(
    async (collectionAddress: string, shouldOverwrite: boolean) => {
      if (!publicKey) return;

      setIsFetchingCollectionMintAddresses(true);

      try {
        const response = await fetch(
          "/api/get-nfts-by-collection-mint-address",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              collectionAddress,
              mintAddressesOnly: true,
            }),
          }
        );

        if (!response.body) {
          console.error("The response does not contain a readable stream.");
          return;
        }

        const reader = response.body.getReader();
        let decoder = new TextDecoder();
        let receivedData = "";

        const mintAddressess: string[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          receivedData += decoder.decode(value, { stream: true });

          // Try to parse the accumulated data
          let startIdx = receivedData.indexOf("[");
          let endIdx = receivedData.lastIndexOf("]");

          if (startIdx !== -1 && endIdx !== -1) {
            const jsonData = receivedData.slice(startIdx, endIdx + 1);
            try {
              const parsedData = JSON.parse(jsonData);
              console.log(parsedData); // Handle or store this data as required

              mintAddressess.push(...parsedData);

              // Clear the processed data
              receivedData = receivedData.slice(endIdx + 1);
            } catch (error) {
              // If there's an error, it's likely because the complete JSON hasn't been received yet.
              // Just continue and wait for more data.
            }
          }
        }

        // The stream has been completely read.
        showToast({
          primaryMessage: "Successfully fetched collection",
          secondaryMessage: `Saving ${mintAddressess.length} NFTs to db...`,
        });

        console.log({
          mintAddressess,
          nftCollectionId: formik.values.nftCollectionId,
        });

        fetchNftsInCollectionByHashlist(
          JSON.stringify(mintAddressess),
          formik.values.nftCollectionId,
          shouldOverwrite
        );
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      }
    },
    [fetchNftsInCollectionByHashlist, publicKey, formik]
  );

  if (!isAdmin) return <NotAdminBlocker />;

  return (
    <ContentWrapper>
      {existingNftCollection && !isSaving && !isComplete && (
        <div className="flex flex-col items-center justify-center">
          <div className="mb-2 text-lg">
            This collection already exists in the db.
          </div>
          <div className="mb-8 text-lg">
            Are you sure you want to overwrite it?
          </div>
          <div className="flex space-x-4">
            <PrimaryButton
              onClick={() =>
                fetchCollectionNftMintAddresses(
                  formik.values.collectionAddress,
                  true
                )
              }
            >
              {isFetchingCollectionMintAddresses ? (
                <Spinner />
              ) : (
                "Save to Blueprint"
              )}
            </PrimaryButton>
            <SecondaryButton onClick={() => setExistingNftCollection(null)}>
              Cancel
            </SecondaryButton>
          </div>
        </div>
      )}
      {collectionInfo && !isSaving && !existingNftCollection && (
        <div className="flex flex-col items-center justify-center">
          <Image
            src={collectionInfo.image}
            width={300}
            height={300}
            className="mb-12 rounded"
            alt="Collection Image"
          />
          <div className="flex mb-16">
            <div className="text-5xl">{collectionInfo.name}</div>
          </div>
          {!isComplete && (
            <PrimaryButton
              onClick={() =>
                fetchCollectionNftMintAddresses(
                  collectionInfo.mintAddress,
                  true
                )
              }
            >
              {isFetchingCollectionMintAddresses ? (
                <Spinner />
              ) : (
                "Save to Blueprint"
              )}
            </PrimaryButton>
          )}
        </div>
      )}
      {isSaving || isFetchingCollectionInfo ? (
        <Panel className="mb-8">
          <div className="py-4 flex flex-col justify-center items-center">
            <div className="mb-4 w-full flex flex-col justify-center items-center">
              <Spinner />
              {isFetchingCollectionInfo && (
                <div className="text-xl mt-4">Fetching collection info</div>
              )}
            </div>
            {isSaving && (
              <>
                <div className="text-2xl mb-8">
                  Adding {totalNftsToAdd} NFTs
                </div>
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
              </>
            )}
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
          {!collectionInfo && !existingNftCollection && (
            <>
              <FormWrapper onSubmit={formik.handleSubmit}>
                <div className="py-4 w-full space-y-2">
                  <FormCheckboxWithLabel
                    label="Manual entry (hashlist)"
                    name="isManualMode"
                    value={formik.values.isManualMode}
                    onChange={(e: any) => {
                      formik.setFieldValue("isManualMode", e.target.checked);
                    }}
                  />
                  <FormCheckboxWithLabel
                    label="Overwrite existing db records"
                    name="shouldOverwrite"
                    value={formik.values.shouldOverwrite}
                    onChange={(e: any) => {
                      formik.setFieldValue("shouldOverwrite", e.target.checked);
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
                  </>
                )}
              </FormWrapper>
              <div className="flex w-full justify-center mt-4 mb-12">
                <SubmitButton
                  isSubmitting={formik.isSubmitting || isSaving}
                  onClick={formik.handleSubmit}
                  buttonText={
                    formik.values.isManualMode
                      ? "Save collection"
                      : "Find collection"
                  }
                  disabled={
                    false
                    // !formik.values.hashList.length ||
                    // !formik.values.nftCollectionId.length ||
                    // !formik.values.collectionAddress.length ||
                    // !publicKey
                  }
                />
              </div>
            </>
          )}
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
          {
            <div className="mb-4 max-w-xs flex justify-between w-full">
              <div className="mb-2">Time Elapsed</div>
              <Stopwatch start={shouldStartStopwatch} />
            </div>
          }
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
