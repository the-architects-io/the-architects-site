import { createBlueprintClient } from "@/app/blueprint/client";
import { Airdrop, Job, JobTypeUUIDs, StatusUUIDs } from "@/app/blueprint/types";
import {
  ASSET_SHDW_DRIVE_ADDRESS,
  SHDW_DRIVE_BASE_URL,
} from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { GET_JOB_BY_ID } from "@/graphql/queries/get-job-by-id";
import { useQuery } from "@apollo/client";
import { useUserData } from "@nhost/nextjs";
import axios from "axios";

import { useCallback, useState } from "react";

export const ExecuteAirdrop = ({ airdrop }: { airdrop: Airdrop }) => {
  const user = useUserData();
  const [isDisabled, setIsDisabled] = useState(false);
  const [jobId, setJobId] = useState<string>("");
  const [shouldPoll, setShouldPoll] = useState<boolean>(false);

  const blueprint = createBlueprintClient({ cluster: "devnet" });

  const {
    loading,
    data,
  }: { loading: boolean; data: { jobs_by_pk: Job } | undefined } = useQuery(
    GET_JOB_BY_ID,
    {
      variables: {
        id: jobId,
      },
      skip: !shouldPoll,
      pollInterval: 1000,
      fetchPolicy: "network-only",
    }
  );

  const mintCollectionNft = useCallback(async () => {
    const {
      name,
      symbol,
      description,
      sellerFeeBasisPoints,
      driveAddress,
      id,
    } = airdrop.collection;

    if (
      !name ||
      !symbol ||
      !description ||
      !sellerFeeBasisPoints ||
      !driveAddress ||
      !user
    ) {
      console.log("Missing collection data");
      return;
    }

    let uri = "";

    const { success, job } = await blueprint.jobs.createJob({
      statusId: StatusUUIDs.IN_PROGRESS,
      statusText: "Minting collection NFT",
      userId: user.id,
      jobTypeId: JobTypeUUIDs.AIRDROP,
    });

    if (!success || !job?.id) {
      console.log("Failed to create job");
      return;
    }

    setShouldPoll(true);
    setJobId(job.id);

    const res = await axios.get(
      // `${SHDW_DRIVE_BASE_URL}/${ASSET_SHDW_DRIVE_ADDRESS}/${id}-collection.png`,
      `${SHDW_DRIVE_BASE_URL}/${ASSET_SHDW_DRIVE_ADDRESS}/collection.png`,
      {
        responseType: "arraybuffer",
      }
    );

    const buffer = Buffer.from(res.data, "binary");
    const file = new File([buffer], `${id}-collection.png`, {
      type: "image/png",
    });

    // await blueprint.jobs.updateJob({
    //   id: job.id,
    //   statusText: "Updating collection image",
    // });

    // const { success: imageUploadSuccess } = await blueprint.upload.uploadFile({
    //   file,
    //   fileName: `${id}-collection.png`,
    //   driveAddress,
    // });

    // if (!imageUploadSuccess) {
    //   console.log("Failed to upload image");
    //   return;
    // }

    await blueprint.jobs.updateJob({
      id: job.id,
      statusText: "Uploading collection NFT metadata",
    });

    const jsonFile = new Blob(
      [
        JSON.stringify({
          name,
          symbol,
          description,
          seller_fee_basis_points: sellerFeeBasisPoints,
          // image: `${SHDW_DRIVE_BASE_URL}/${driveAddress}/${id}-collection.json`,
          image: `${SHDW_DRIVE_BASE_URL}/${ASSET_SHDW_DRIVE_ADDRESS}/collection.png`,
        }),
      ],
      {
        type: "application/json",
      }
    );

    try {
      const { url } = await blueprint.upload.uploadJson({
        file: jsonFile,
        fileName: `${id}-collection.json`,
        driveAddress,
      });

      uri = url;
    } catch (error) {
      console.log({ error });
    }

    await blueprint.jobs.updateJob({
      id: job.id,
      statusText: "Minting collection NFT",
    });

    try {
      const { success, mintAddress } = await blueprint.tokens.mintNft({
        name,
        uri,
        sellerFeeBasisPoints,
        isCollection: true,
      });
    } catch (error) {
      console.log({ error });
    }
  }, [airdrop, blueprint, user]);

  const handleExecuteAirdrop = () => {
    setIsDisabled(true);

    mintCollectionNft();
  };

  return (
    <ContentWrapper className="flex flex-col items-center justify-center">
      <div className="h-24">
        {!!data && (
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              <p className="text-lg font-semibold text-center">
                {data?.jobs_by_pk?.statusText}
              </p>
              <p className="text-lg font-semibold text-center">
                {data?.jobs_by_pk?.percentComplete}
              </p>
            </div>
          </div>
        )}
      </div>
      <SubmitButton
        onClick={handleExecuteAirdrop}
        disabled={isDisabled}
        isSubmitting={isDisabled}
      >
        Execute
      </SubmitButton>
    </ContentWrapper>
  );
};
