"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAdmin } from "@/hooks/admin";
import { useRouter } from "next/navigation";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { useFormik } from "formik";
import { useUser } from "@/hooks/user";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import showToast from "@/features/toasts/show-toast";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { NftCollectionsSelectInput } from "@/features/nft-collections/nft-collections-select-input";
import Spinner from "@/features/UI/spinner";

export default function FetchPage() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const { user, setUser } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [hashList, setHashList] = useState<string>("");
  const [nftCollectionId, setNftCollectionId] = useState<string>("");
  const [totalNftsToAdd, setTotalNftsToAdd] = useState<number>(0);
  const [currentNftToAdd, setCurrentNftToAdd] = useState<number>(0);

  const saveCharacterToDb = useCallback(
    async (hashList: string, i: number, total: number) => {
      if (!publicKey || !connection) return;

      let returnData;

      try {
        const { data } = await axios.post("/api/add-characters-from-nfts", {
          hashList,
          nftCollectionId: "a7dfa466-88ba-4b6e-8ce5-1470d9896794", // 3D FunGuyz
        });

        returnData = data;

        console.log({
          i,
          total,
        });
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
      }

      console.log(returnData);
    },
    [publicKey, connection]
  );

  const fetchNftsInCollection = useCallback(
    async (hashList: string) => {
      setHashList(hashList);
      setNftCollectionId(nftCollectionId);
      const jsonHashList = JSON.parse(hashList);
      setTotalNftsToAdd(jsonHashList.length);
      for (const [i, mintAddress] of jsonHashList.entries()) {
        console.log(i, mintAddress);
        setCurrentNftToAdd(i);
        await saveCharacterToDb(`["${mintAddress}"]`, i, jsonHashList.length);
      }
    },
    [nftCollectionId, saveCharacterToDb]
  );

  const formik = useFormik({
    initialValues: {
      hashList: "",
      nftCollectionId: "",
    },
    onSubmit: async ({ hashList }) => {
      setIsSaving(true);
      fetchNftsInCollection(hashList);
      formik.setFieldValue("hashList", "");
    },
  });

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
        <div className="flex flex-col justify-center items-center">
          <Spinner />
          <div className="text-white text-2xl mt-4">
            Adding {currentNftToAdd + 1} of {totalNftsToAdd} NFTs
          </div>
        </div>
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
          <div className="flex w-full justify-center mt-8">
            <SubmitButton
              isSubmitting={formik.isSubmitting || isSaving}
              onClick={formik.handleSubmit}
              disabled={!formik.values.hashList.length}
            />
          </div>
        </>
      )}
    </ContentWrapper>
  );
}
