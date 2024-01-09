import { createBlueprintClient } from "@/app/blueprint/client";
import {
  Airdrop,
  Job,
  JobTypeUUIDs,
  Recipient,
  StatusUUIDs,
} from "@/app/blueprint/types";
import {
  ASSET_SHDW_DRIVE_ADDRESS,
  SHDW_DRIVE_BASE_URL,
  SYSTEM_USER_ID,
} from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { GET_JOB_BY_ID } from "@/graphql/queries/get-job-by-id";
import { useCluster } from "@/hooks/cluster";
import { useQuery } from "@apollo/client";
import { useUserData } from "@nhost/nextjs";
import axios from "axios";

import { useCallback, useState } from "react";

export const ExecuteAirdrop = ({
  airdrop,
  setJobId,
}: {
  airdrop: Airdrop;
  setJobId: (jobId: string) => void;
}) => {
  const user = useUserData();
  const [isDisabled, setIsDisabled] = useState(false);
  const [shouldPoll, setShouldPoll] = useState<boolean>(false);
  const { cluster } = useCluster();

  const blueprint = createBlueprintClient({ cluster });

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

    const { success: airdropUpdateSuccess } =
      await blueprint.airdrops.updateAirdrop({
        id: airdrop.id,
        jobId: job.id,
      });

    if (!success || !job?.id) {
      console.log("Failed to create job");
      return;
    }

    setShouldPoll(true);
    setJobId(job.id);

    const res = await axios.get(
      `${SHDW_DRIVE_BASE_URL}/${ASSET_SHDW_DRIVE_ADDRESS}/${id}-collection.png`,
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
          image: `${SHDW_DRIVE_BASE_URL}/${driveAddress}/${id}-collection.json`,
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

    let collectionNftMintAddress;

    try {
      const { success, mintAddress } = await blueprint.tokens.mintNft({
        name,
        uri,
        sellerFeeBasisPoints,
        isCollection: true,
      });
      collectionNftMintAddress = mintAddress;
    } catch (error) {
      console.log({ error });
    }

    await blueprint.jobs.updateJob({
      id: job.id,
      statusText: "Creating merkle tree",
    });

    const maxDepth = 14;
    const maxBufferSize = 64;

    let treeId;

    try {
      const { success, merkleTreeAddress, id } =
        await blueprint.tokens.createTree({
          maxBufferSize,
          maxDepth,
          collectionId: airdrop.collection.id,
          userId: SYSTEM_USER_ID,
        });

      treeId = id;

      console.log({ merkleTreeAddress });

      if (!success) throw new Error("Error creating Merkle Tree");
    } catch (error) {
      console.log({ error });
    }

    try {
      const { success } = await blueprint.collections.updateCollection({
        id,
        collectionNftAddress: collectionNftMintAddress,
        merkleTreeId: treeId,
      });
    } catch (error) {
      console.log({ error });
    }

    try {
      const { data } = await axios.post(
        `http://164.90.244.66/api/airdrop-cnfts`,
        {
          airdropId: airdrop.id,
          jobId: job.id,
          cluster,
        }
      );

      const {
        airdrops_by_pk,
        airdrop_recipients,
      }: { airdrops_by_pk: Airdrop; airdrop_recipients: Recipient[] } = data;
    } catch (error) {
      console.log({ error });
    }
  }, [
    airdrop.collection,
    airdrop.id,
    blueprint.airdrops,
    blueprint.collections,
    blueprint.jobs,
    blueprint.tokens,
    blueprint.upload,
    cluster,
    setJobId,
    user,
  ]);

  const handleExecuteAirdrop = () => {
    setIsDisabled(true);

    mintCollectionNft();
  };

  return (
    <ContentWrapper className="flex flex-col items-center justify-center">
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
