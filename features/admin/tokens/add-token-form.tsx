import axios from "axios";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import showToast from "@/features/toasts/show-toast";
import { useState } from "react";
import { TokenMetadata } from "@/pages/api/get-token-metadata-from-helius";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import Spinner from "@/features/UI/spinner";
import Image from "next/image";
import SharedHead from "@/features/UI/head";
import { BASE_URL } from "@/constants/constants";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";

export const AddTokenForm = () => {
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata | null>(
    null
  );
  const [fetcingTokenMetadata, setFetchingTokenMetadata] = useState(false);
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      mintAddress: "",
    },
    onSubmit: async (values) => {
      try {
        await axios.post("/api/add-token", values);
        showToast({
          primaryMessage: "Token added",
        });
        router.push("/admin?tab=tokens");
      } catch (error) {
        showToast({
          primaryMessage: "Error adding token",
        });
      }
    },
  });

  const getTokenMetadata = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    setFetchingTokenMetadata(true);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/get-token-metadata-from-helius`,
        {
          mintAddress: formik.values.mintAddress,
        }
      );
      setTokenMetadata(data);
    } catch (error) {
      console.log(error);
    } finally {
      setFetchingTokenMetadata(false);
    }
  };

  const clearToken = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    setTokenMetadata(null);
    formik.values.mintAddress = "";
  };

  return (
    <FormWrapper onSubmit={formik.handleSubmit}>
      <SharedHead title="SoDead Admin" />

      {!tokenMetadata ? (
        <FormInputWithLabel
          label="Token Mint Address"
          name="mintAddress"
          value={formik.values.mintAddress}
          onChange={formik.handleChange}
        />
      ) : (
        <div className="flex flex-col text-stone-800 items-center w-full">
          {!!tokenMetadata.imageUrl && (
            <div className="bg-stone-800 rounded-xl p-2 mb-4">
              <ImageWithFallback
                src={tokenMetadata.imageUrl}
                width={100}
                height={100}
                alt={tokenMetadata.name}
              />
            </div>
          )}
          <div className="text-2xl">{tokenMetadata.name}</div>
          <div className="text-xl">${tokenMetadata.symbol}</div>
        </div>
      )}

      <div className="flex w-full justify-center space-x-4">
        {!!tokenMetadata ? (
          <>
            <SecondaryButton onClick={(event) => clearToken(event)}>
              Clear Token
            </SecondaryButton>
            <SubmitButton isSubmitting={formik.isSubmitting} />
          </>
        ) : (
          <SecondaryButton onClick={(event) => getTokenMetadata(event)}>
            {fetcingTokenMetadata ? <Spinner /> : "Fetch NFT"}
          </SecondaryButton>
        )}
      </div>
    </FormWrapper>
  );
};
