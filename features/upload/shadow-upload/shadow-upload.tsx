import ChunkedUploady from "@rpldy/chunked-uploady";
import { ShadowUploadField } from "@/features/upload/shadow-upload/shadow-upload-field";

const ShadowUpload = (params: {
  ownerAddress: string;
  driveAddress?: string;
  collectionId: string;
  shouldUnzip: boolean;
  userId: string;
  setUploadJobId: (id: string) => void;
}) => {
  return (
    <ChunkedUploady
      multiple
      destination={{
        url: `http://164.90.244.66/api/upload`,
      }}
      autoUpload={true}
      chunkSize={5 * 1024 * 1024}
      chunked
    >
      <ShadowUploadField
        params={{
          ownerAddress: params.ownerAddress,
          driveAddress: params.driveAddress,
          collectionId: params.collectionId,
          shouldUnzip: params.shouldUnzip,
          userId: params.userId,
        }}
        setUploadJobId={params.setUploadJobId}
      />
    </ChunkedUploady>
  );
};

export default ShadowUpload;
