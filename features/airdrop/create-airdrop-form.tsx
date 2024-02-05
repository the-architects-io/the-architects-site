import { createBlueprintClient } from "@/app/blueprint/client";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import showToast from "@/features/toasts/show-toast";
import { GET_AIRDROP_BY_ID } from "@the-architects/blueprint-graphql";

import { useCluster } from "@/hooks/cluster";
import { handleError } from "@/utils/errors/log-error";
import { useQuery } from "@apollo/client";

import { useFormik } from "formik";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function CreateAirdropForm({
  airdropId,
}: {
  airdropId: string;
}) {
  const router = useRouter();
  const [files, setFiles] = useState<FileList | null>(null);
  const { cluster } = useCluster();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileInputTrigger = () => {
    if (!fileInputRef?.current) return;
    fileInputRef?.current.click();
  };

  const { data } = useQuery(GET_AIRDROP_BY_ID, {
    variables: {
      id: airdropId,
    },
  });

  const validateAirdropRecipientsFile = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(false);
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const contents = e.target?.result;
        if (!contents) {
          resolve(false);
          return;
        }
        try {
          const parsedContents = JSON.parse(contents.toString());
          const isValid =
            Array.isArray(parsedContents) &&
            parsedContents.every((item) => typeof item === "string");
          resolve(isValid);
        } catch (error) {
          handleError(error as Error);
          resolve(false);
        }
      };

      reader.onerror = () => {
        resolve(false);
      };

      reader.readAsText(file);
    });
  };

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      startTime: "",
      shouldKickoffManually: true,
    },
    onSubmit: async ({ name, startTime, shouldKickoffManually }) => {
      setIsLoading(true);
      if (!files?.length) {
        showToast({ primaryMessage: "No recipients file selected" });
        return;
      }

      const isValid = validateAirdropRecipientsFile(files[0]);

      if (!isValid) {
        showToast({
          primaryMessage: "Invalid recipients file",
          secondaryMessage: "The file must be a valid JSON array of strings",
        });
        clearFileInput();
        setIsLoading(false);
        return;
      }

      const blueprint = createBlueprintClient({
        cluster,
      });

      const { success: updateAirdropSuccess, airdrop } =
        await blueprint.airdrops.updateAirdrop({
          id: airdropId,
          name,
          startTime,
          shouldKickoffManually,
          isReadyToDrop: true,
        });

      const recipients = await files[0].text();

      const { success: addRecipientsSuccess, addedReipientsCount } =
        await blueprint.airdrops.addAirdropRecipients({
          airdropId,
          recipients,
        });

      if (!updateAirdropSuccess || !addRecipientsSuccess) {
        showToast({
          primaryMessage: "Error creating airdrop",
        });
        setIsLoading(false);
        return;
      }

      showToast({
        primaryMessage: "Airdrop created",
        secondaryMessage: `${addedReipientsCount} recipients added`,
      });

      router.push(`/me/airdrop/${airdrop.id}`);
    },
  });

  useEffect(() => {}, [files]);

  const handleClearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      setFiles(null); // Now set files to null
    }
  };

  return (
    <div>
      <Image
        className="mb-8 rounded mx-auto mt-4"
        src={data?.airdrops_by_pk?.collection?.imageUrl}
        width={300}
        height={300}
        alt="airdrop image"
      />
      <FormInputWithLabel
        name="name"
        label="Drop Name"
        placeholder="Name"
        className="mb-4"
        onChange={formik.handleChange}
        value={formik.values.name}
      />
      {/* <FormCheckboxWithLabel
        className="pb-2"
        label="Start airdrop manually"
        name="shouldKickoffManually"
        value={formik.values.shouldKickoffManually}
        onChange={(e: any) => {
          formik.setFieldValue("shouldKickoffManually", e.target.checked);
        }}
      />
      {!formik.values.shouldKickoffManually && (
        <FormInputWithLabel
          name="startTime"
          label="Start Time"
          placeholder="Start Time"
          className="mb-4"
          type="datetime-local"
          onChange={formik.handleChange}
          value={formik.values.startTime}
        />
      )} */}
      <div className="flex flex-col justify-center items-center mb-4 w-full">
        <p className="text-gray-400 text-sm max-w-sm">
          The Recipients JSON file should be an array of recipient wallet
          addresses, with each address being a string. Wallets that should
          receive more than one NFT should be included in the array one time for
          each NFT they should receive. For example:
          <br />
          <pre>
            {`
  [
    "wallet1", 
    "wallet2", 
    "wallet2", 
    "wallet3"
  ]
              `}
          </pre>
        </p>
        {!!files?.length ? (
          <div className="flex justify-center items-center w-full max-w-sm space-x-4">
            <div className="text-gray-100 text-lg truncate">
              {files[0].name}
            </div>
            <PrimaryButton onClick={handleClearFileInput}>Clear</PrimaryButton>
          </div>
        ) : (
          <div className="w-full mx-auto">
            <div className="w-full flex justify-center">
              <PrimaryButton onClick={handleFileInputTrigger}>
                Select Recipients JSON File
              </PrimaryButton>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          className="hidden"
          multiple
          type="file"
          accept=".json"
          onChange={(e) => {
            setFiles(e.target.files);
            // e.target.value = "";
          }}
        />
      </div>
      <div className="flex w-full justify-center mb-4">
        <SubmitButton
          disabled={!formik.values.name || !files?.length}
          isSubmitting={formik.isSubmitting || isLoading}
          onClick={formik.submitForm}
        />
      </div>
    </div>
  );
}
