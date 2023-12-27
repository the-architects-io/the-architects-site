import ChunkedUploady from "@rpldy/chunked-uploady";
import { ShadowUploadField } from "@/features/upload/shadow-upload/shadow-upload-field";
import { CollectionFileStats } from "@/app/blueprint/types";

const ShadowUpload = (params: {
  ownerAddress: string;
  driveAddress?: string;
  collectionId: string;
  shouldUnzip: boolean;
  userId: string;
  fileStats: CollectionFileStats | null;
  fileBeingUploaded: File | null;
  setFileBeingUploaded: (file: File) => void;
  setUploadJobId: (id: string) => void;
  setFileStats: (stats: CollectionFileStats) => void;
  onUploadComplete?: (response: any) => void;
  children?: string | JSX.Element | JSX.Element[];
  accept?: string;
}) => {
  return (
    <ChunkedUploady
      multiple
      accept={params?.accept || "*/*"}
      destination={{
        url: `http://164.90.244.66/api/upload`,
      }}
      autoUpload={false}
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
        fileBeingUploaded={params.fileBeingUploaded}
        setFileBeingUploaded={params.setFileBeingUploaded}
        fileStats={params.fileStats}
        setFileStats={params.setFileStats}
        setUploadJobId={params.setUploadJobId}
        onUploadComplete={params.onUploadComplete}
      >
        {params.children}
      </ShadowUploadField>
    </ChunkedUploady>
  );
};

export default ShadowUpload;
