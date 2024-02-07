import { createBlueprintClient } from "@/app/blueprint/client";
import { CollectionBuildSourceUUIDs } from "@/app/blueprint/types";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import showToast from "@/features/toasts/show-toast";
import { useCluster } from "@/hooks/cluster";
import Link from "next/link";
import { useRouter } from "next/router";

export default function SelectMethodPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const { cluster } = useCluster();
  const router = useRouter();

  const { METADATA_JSONS, PREMINT_TOKENS } = CollectionBuildSourceUUIDs;

  type CollectionBuildSourceIdType =
    | (typeof CollectionBuildSourceUUIDs)["METADATA_JSONS"]
    | (typeof CollectionBuildSourceUUIDs)["PREMINT_TOKENS"];

  const handleSetMethod = async (
    collectionBuildSourceId: CollectionBuildSourceIdType
  ) => {
    const blueprint = createBlueprintClient({
      cluster,
    });

    const { success } = await blueprint.collections.updateCollection({
      id: params.id,
      collectionBuildSourceId,
    });

    if (!success) {
      showToast({
        primaryMessage: "There was an error updating the collection",
      });
      return;
    }

    switch (collectionBuildSourceId) {
      case METADATA_JSONS:
        router.push(`/me/collection/create/${params.id}/upload-metadatas`);
        break;
      case PREMINT_TOKENS:
        router.push(`/me/collection/create/${params.id}/build`);
    }
  };

  return (
    <ContentWrapper className="flex flex-col md:flex-row items-center justify-center text-stone-300 mt-24">
      <button
        onClick={() => handleSetMethod(METADATA_JSONS)}
        className="w-full md:w-1/2 px-12 cursor-pointer"
      >
        <div className="border border-stone-300 rounded-lg p-4 h-64 w-full flex flex-col items-center justify-center">
          <div className="text-lg">Upload assets and metadata JSONs</div>
        </div>
      </button>
      <button
        onClick={() => handleSetMethod(PREMINT_TOKENS)}
        className="w-full md:w-1/2 px-12 cursor-pointer"
      >
        <div className="border border-stone-300 rounded-lg p-4 h-64 w-full flex flex-col items-center justify-center">
          <div className="text-lg">Build cNFTs</div>
        </div>
      </button>
    </ContentWrapper>
  );
}
