import ChunkedUploady from "@rpldy/chunked-uploady";
import { ShadowUploadField } from "@/features/upload/shadow-upload/shadow-upload-field";

const ShadowUpload = (params: {
  ownerAddress: string;
  driveAddress: string;
  collectionId: string;
  shouldUnzip: boolean;
  userId: string;
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
      <ShadowUploadField params={params} />
    </ChunkedUploady>
  );
};

export default ShadowUpload;
