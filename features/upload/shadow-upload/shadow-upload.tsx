import ChunkedUploady, { UploadyContextType } from "@rpldy/chunked-uploady";
import { ShadowUploadField } from "@/features/upload/shadow-upload/shadow-upload-field";
import { CollectionFileStats, UploadJob } from "@/app/blueprint/types";
import { getChunkedEnhancer } from "@rpldy/chunked-sender";

type ShadowUploadProps = {
  ownerAddress: string;
  driveAddress?: string;
  collectionId: string;
  shouldUnzip: boolean;
  userId: string;
  uploadyInstance: UploadyContextType | null;
  isFileValid: boolean | null;
  setUploadyInstance: (instance: UploadyContextType) => void;
  fileStats: CollectionFileStats | null;
  fileBeingUploaded: File | null;
  setFileBeingUploaded: (file: File) => void;
  setUploadJob: (job: UploadJob) => void;
  setFileStats: (stats: CollectionFileStats) => void;
  onUploadComplete?: (response: any) => void;
  children?: string | JSX.Element | JSX.Element[];
  accept?: string;
  setShadowFileUploadId: (id: string) => void;
  uploadJob: UploadJob | null;
};

const chunkedEnhancer = getChunkedEnhancer({
  chunkSize: 5 * 1024 * 1024,
  chunked: true,
});

const ShadowUpload = (params: ShadowUploadProps) => {
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
      enhancer={chunkedEnhancer}
    >
      <ShadowUploadField
        uploadJob={params.uploadJob}
        setShadowFileUploadId={params.setShadowFileUploadId}
        isFileValid={params.isFileValid}
        uploadyInstance={params.uploadyInstance}
        setUploadyInstance={params.setUploadyInstance}
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
        setUploadJob={params.setUploadJob}
        onUploadComplete={params.onUploadComplete}
      >
        {params.children}
      </ShadowUploadField>
    </ChunkedUploady>
  );
};

export default ShadowUpload;
