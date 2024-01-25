"use client";
import { createBlueprintClient } from "@/app/blueprint/client";
import useBlueprint from "@/app/blueprint/hooks/use-blueprint";
import { JobTypeUUIDs, StatusUUIDs } from "@/app/blueprint/types";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { JobIcons } from "@/features/jobs/job-icon";
import { useCluster } from "@/hooks/cluster";
import { useUserData } from "@nhost/nextjs";

export default function Page() {
  const { ws } = useBlueprint();
  const { cluster } = useCluster();
  const user = useUserData();

  const blueprint = createBlueprintClient({ cluster });

  const handleCreateJob = async () => {
    if (!user) return;
    const { success, job } = await blueprint.jobs.createJob({
      statusId: StatusUUIDs.IN_PROGRESS,
      statusText: "Test job started",
      userId: user.id,
      jobTypeId: JobTypeUUIDs.AIRDROP,
      icon: JobIcons.COLLECTION_IMAGE,
      cluster,
    });

    console.log("job", job);
  };

  const handleUpdateJob = async () => {
    if (!user) return;
    const { success, job } = await blueprint.jobs.updateJob({
      id: "d5dd3666-3eb4-434e-b1e8-91b3842f2567",
      statusText: "Test job updated",
    });
  };

  const handleCreateUploadJob = async () => {
    if (!user) return;
    const { job } = await blueprint.jobs.createUploadJob({
      statusText: "Creating SHDW Drive",
      userId: user?.id,
      icon: JobIcons.CREATING_SHADOW_DRIVE,
      cluster,
    });

    console.log("job", job);
  };

  return (
    <ContentWrapper className="flex flex-col items-center justify-center text-stone-300">
      <PrimaryButton className="mb-4" onClick={handleCreateJob}>
        CREATE JOB
      </PrimaryButton>
      <PrimaryButton className="mb-4" onClick={handleUpdateJob}>
        UPDATE JOB
      </PrimaryButton>
      <PrimaryButton className="mb-4" onClick={handleCreateUploadJob}>
        CREATE UPLOAD JOB
      </PrimaryButton>
    </ContentWrapper>
  );
}
