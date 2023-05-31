"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { Metaplex } from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";
import { fetchNftsWithMetadata } from "@/utils/nfts/fetch-nfts-with-metadata";
import { addTraitsToDb } from "@/utils/nfts/add-traits-to-db";
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

export default function FetchPage() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const [mintAddress, setMintAddress] = useState("");
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [hashList, setHashList] = useState<string>("");

  const fetchCollection = async (hashList: string) => {
    // get first 10 items from hashList
    // const START = 6000;
    // const END = hashList.length;
    // const selection = hashList.slice(START, END);
    const jsonHashlist = JSON.parse(hashList);
    console.log("jsonHashlist", jsonHashlist);
    debugger;
    if (!jsonHashlist.length) return;
    const selection = jsonHashlist;
    if (!selection.length) return;
    console.log({
      selection: selection.length,
      total: hashList.length,
    });
    if (!publicKey || !connection) return;

    const metaplex = Metaplex.make(connection);

    const mints = selection.map((address: string) => new PublicKey(address));

    const nftMetasFromMetaplex: any[] = await metaplex
      .nfts()
      .findAllByMintList({ mints });

    if (!nftMetasFromMetaplex.length) {
      console.log("No nfts fetched from metaplex");
      return;
    }

    const nftsWithMetadata = await fetchNftsWithMetadata(
      nftMetasFromMetaplex,
      metaplex
    );

    await addTraitsToDb(
      nftsWithMetadata,
      "a7dfa466-88ba-4b6e-8ce5-1470d9896794" // 3D FunGuyz
    );
    console.log({ nftsWithMetadata });
    console.log(nftMetasFromMetaplex.length, nftsWithMetadata.length);

    let returnData;

    try {
      const { data } = await axios.post("/api/add-characters-from-nfts", {
        nfts: nftsWithMetadata,
      });

      returnData = data;

      showToast({
        primaryMessage: data?.message,
      });

      formik.setFieldValue("mintAddress", "");
    } catch (error) {
      console.log(error);
      showToast({
        primaryMessage: "Error adding character to db",
      });
    } finally {
      setIsLoading(false);
    }

    console.log(nftMetasFromMetaplex, nftsWithMetadata, returnData);
  };

  const formik = useFormik({
    initialValues: {
      hashList: "",
    },
    onSubmit: async ({ hashList }) => {
      setIsLoading(true);
      setHashList(hashList);
      await fetchCollection(hashList);
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
      <FormWrapper onSubmit={formik.handleSubmit}>
        <FormTextareaWithLabel
          label="Hashlist"
          name="hashList"
          value={formik.values.hashList}
          onChange={formik.handleChange}
        />
      </FormWrapper>
      <div className="flex w-full justify-center mt-8">
        <SubmitButton
          isSubmitting={formik.isSubmitting || isLoading}
          onClick={formik.handleSubmit}
          disabled={!formik.values.hashList.length}
        />
      </div>
    </ContentWrapper>
  );
}
