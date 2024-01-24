import { createBlueprintClient } from "@/app/blueprint/client";
import {
  Airdrop,
  Job,
  JobTypeUUIDs,
  Recipient,
  StatusUUIDs,
} from "@/app/blueprint/types";
import {
  ARCHITECTS_API_URL,
  ASSET_SHDW_DRIVE_ADDRESS,
  SHDW_DRIVE_BASE_URL,
  SYSTEM_USER_ID,
} from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { JobIcons } from "@/features/jobs/job-icon";
import showToast from "@/features/toasts/show-toast";

import { useCluster } from "@/hooks/cluster";
import { handleError } from "@/utils/errors/log-error";
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
      imageUrl,
      id,
      maxBufferSize,
      maxDepth,
      canopyDepth,
    } = airdrop.collection;

    if (
      !name ||
      !symbol ||
      !description ||
      !sellerFeeBasisPoints ||
      !driveAddress ||
      !user ||
      !maxBufferSize ||
      !maxDepth
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
      icon: JobIcons.COLLECTION_IMAGE,
    });

    const { success: airdropUpdateSuccess } =
      await blueprint.airdrops.updateAirdrop({
        id: airdrop.id,
        jobId: job.id,
        cluster,
      });

    if (!success || !job?.id) {
      console.log("Failed to create job");
      return;
    }

    setShouldPoll(true);
    setJobId(job.id);

    await blueprint.jobs.updateJob({
      id: job.id,
      statusText: "Uploading collection NFT metadata",
      icon: JobIcons.UPLOADING_FILES,
    });

    const jsonFile = new Blob(
      [
        JSON.stringify({
          name,
          symbol,
          description,
          seller_fee_basis_points: sellerFeeBasisPoints,
          image: imageUrl,
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
      blueprint.jobs.updateJob({
        id: job.id,
        statusId: StatusUUIDs.ERROR,
        statusText: "Failed to upload collection NFT metadata",
        icon: JobIcons.ERROR,
      });
      handleError(error as Error);
    }

    await blueprint.jobs.updateJob({
      id: job.id,
      statusText: "Minting collection NFT",
      icon: JobIcons.MINTING_NFTS,
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
      blueprint.jobs.updateJob({
        id: job.id,
        statusId: StatusUUIDs.ERROR,
        statusText: "Failed to mint collection NFT",
        icon: JobIcons.ERROR,
      });
      handleError(error as Error);
    }

    await blueprint.jobs.updateJob({
      id: job.id,
      statusText: "Creating merkle tree",
      icon: JobIcons.CREATING_TREE,
    });

    let treeId;

    try {
      const { success, merkleTreeAddress, id } =
        await blueprint.tokens.createTree({
          maxBufferSize: maxBufferSize,
          maxDepth: maxDepth,
          canopyDepth: canopyDepth,
          collectionId: airdrop.collection.id,
          userId: SYSTEM_USER_ID,
        });

      treeId = id;

      console.log({ merkleTreeAddress });

      if (!success) throw new Error("Error creating Merkle Tree");
    } catch (error) {
      blueprint.jobs.updateJob({
        id: job.id,
        statusId: StatusUUIDs.ERROR,
        statusText: "Failed to create merkle tree",
        icon: JobIcons.ERROR,
      });
      handleError(error as Error);
    }

    try {
      const { success } = await blueprint.collections.updateCollection({
        id,
        collectionNftAddress: collectionNftMintAddress,
        merkleTreeId: treeId,
      });
    } catch (error) {
      handleError(error as Error);
    }

    try {
      const { data, status } = await axios.post(
        `${ARCHITECTS_API_URL}/airdrop-cnfts`,
        {
          airdropId: airdrop.id,
          jobId: job.id,
          cluster,
        }
      );

      if (status === 200) {
        showToast({
          primaryMessage: "Airdrop complete!",
        });
      }

      const {
        recipientWalletAddresses,
        signatures,
      }: {
        metadatas: string[];
        recipientWalletAddresses: string[];
        merkleTreeAddress: string;
        collectionNftAddress: string;
        creators: string[];
        signatures: string[];
      } = data;

      console.log({
        signatureCount: signatures.length,
        recipientCount: recipientWalletAddresses.length,
      });
    } catch (error) {
      handleError(error as Error);
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
