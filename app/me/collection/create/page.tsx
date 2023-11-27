"use client";
import { createBlueprintClient } from "@/app/blueprint/client";
import {
  ASSET_SHDW_DRIVE_ADDRESS,
  BASE_URL,
  RPC_ENDPOINT,
} from "@/constants/constants";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import Uploady, {
  useBatchAddListener,
  useBatchFinalizeListener,
} from "@rpldy/uploady";
import CreateCollectionForm from "@/features/nft-collections/create-collection-form";
import { PublicKey } from "@metaplex-foundation/js";
import { ShadowFile, ShdwDrive } from "@shadow-drive/sdk";

import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import UploadButton from "@rpldy/upload-button";
import UploadPreview, {
  PreviewItem,
  PreviewMethods,
  getUploadPreviewForBatchItemsMethod,
} from "@rpldy/upload-preview";
import Image from "next/image";
import { XCircleIcon } from "@heroicons/react/24/solid";

const UploadField = ({
  type,
  Preview,
  params,
  batchId,
}: {
  type: string;
  Preview: any;
  params: any;
  batchId: any;
}) => {
  useBatchFinalizeListener((batch) => {
    if (batch.id === batchId) {
      //can deal here with batch finished
      console.log("BATCH FINALIZED", batchId);
    }
  });

  return (
    <div>
      <UploadButton params={{ ...params, uploadType: type }}>
        <>Upload {type}</>
      </UploadButton>

      <div>
        <h3>Previews for {type}</h3>
        <div className="class h-8 w-8">
          <Preview rememberPreviousBatches />
        </div>
      </div>
    </div>
  );
};

const createUploadFieldForType = (type: string) => {
  const useTypedBatchMethod = (cb: (batch: any, options: any) => void) => {
    useBatchAddListener((batch, options) => {
      if (options?.params?.uploadType === type) {
        cb(batch, options);
      }
    });
  };

  const TypedUploadPreview =
    getUploadPreviewForBatchItemsMethod(useTypedBatchMethod);

  const TypedUploadField = (props: any) => {
    const [batchId, setBatch] = useState(null);

    useTypedBatchMethod((batch) => {
      setBatch(batch.id);
    });

    return (
      <UploadField
        {...props}
        type={type}
        Preview={TypedUploadPreview}
        batchId={batchId}
      />
    );
  };

  return TypedUploadField;
};

export default function CreateCollectionPage() {
  const wallet = useWallet();
  const router = useRouter();
  const [airdropId, setAirdropId] = useState<string | null>(null);
  const [sellerFeeBasisPoints, setSellerFeeBasisPoints] = useState<
    number | null
  >(null);
  const [collectionNftAddress, setCollectionNftAddress] = useState<
    string | null
  >(null);

  const [image, setImage] = useState<File | null>(null);
  const [collectionImages, setCollectionImages] = useState<FileList | null>(
    null
  );
  const [metadatasJson, setMetadatasJson] = useState<File | null>(null);
  const [selectedCollectionImagePreview, setSelectedCollectionImagePreview] =
    useState<PreviewItem | null>(null);

  const collectionImagePreview = useRef<PreviewMethods>({} as PreviewMethods);

  const saveMetadatas = async () => {
    // if (!wallet.publicKey) return;
    // if (!metadatasJson) return;
    // const blueprint = createBlueprintClient({
    //   cluster: "devnet",
    // });
    // const { url } = await blueprint.uploadJson({
    //   json: metadatasJson,
    //   fileName: `metadatas.json`,
    //   driveAddress: ASSET_SHDW_DRIVE_ADDRESS,
    // });
    // console.log({ url });
  };

  const handleClearCollectionPreviewImage = () => {
    collectionImagePreview.current.clear();
    setSelectedCollectionImagePreview(null);
  };

  const saveImages = async () => {
    if (!wallet.publicKey) return;
    if (!collectionImages) return;

    const blueprint = createBlueprintClient({
      cluster: "devnet",
    });

    const files: ShadowFile[] = [];

    for (let i = 0; i < collectionImages.length; i++) {
      const file = collectionImages[i];
      const { url } = await blueprint.uploadFile({
        file,
        fileName: `${i}.png`,
        driveAddress: ASSET_SHDW_DRIVE_ADDRESS,
      });
      files.push({
        name: `${i}.png`,
        file: Buffer.from(await file.arrayBuffer()),
      });
    }

    const connection = new Connection(RPC_ENDPOINT, "confirmed");
    const drive = await new ShdwDrive(connection, wallet).init();

    const res = await drive.uploadMultipleFiles(
      new PublicKey(ASSET_SHDW_DRIVE_ADDRESS),
      files
    );

    // const { urls } = await blueprint.uploadFiles({
    //   files,
    //   driveAddress: ASSET_SHDW_DRIVE_ADDRESS,
    // });

    // console.log({ urls });
  };

  if (!wallet.publicKey) {
    return (
      <ContentWrapper>
        <div className="flex flex-col items-center pt-8">
          <p className="text-gray-100 text-lg mb-8">
            Please connect your wallet to continue.
          </p>
          <WalletButton />
        </div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <Uploady destination={{ url: `${BASE_URL}/api/blueprint` }}>
        <div className="w-full flex">
          <div className="flex flex-col items-center mb-16 w-full md:w-[500px]">
            <div className="pb-8 flex flex-col items-center w-full">
              <UploadPreview
                previewMethodsRef={collectionImagePreview}
                onPreviewsChanged={(previews) => {
                  console.log({ previews });
                  if (previews.length > 0) {
                    setSelectedCollectionImagePreview(previews[0]);
                  }
                }}
                PreviewComponent={({ url }: { url: string }) => (
                  <div className="relative border border-gray-600 p-2 rounded-lg mb-2">
                    <Image
                      src={url}
                      alt="Collection Image"
                      width={240}
                      height={240}
                    />
                    <button
                      onClick={() => handleClearCollectionPreviewImage()}
                      className="absolute -mt-4 -mr-4 top-0 right-0"
                    >
                      <XCircleIcon className="h-10 w-10 text-gray-100 bg-black rounded-full" />
                    </button>
                  </div>
                )}
              />

              {!selectedCollectionImagePreview && (
                <UploadButton
                  className="underline border border-gray-600 rounded-lg py-12 px-4 w-full"
                  params={{
                    action: "UPLOAD_FILE",
                    driveAddress: ASSET_SHDW_DRIVE_ADDRESS,
                    fileName: "collection.png",
                  }}
                >
                  Add Collection Image
                </UploadButton>
              )}
            </div>
            <CreateCollectionForm
              driveAddress={ASSET_SHDW_DRIVE_ADDRESS}
              setSellerFeeBasisPoints={setSellerFeeBasisPoints}
              setCollectionNftAddress={setCollectionNftAddress}
            />
          </div>
          <div className="flex flex-col items-center mb-16 w-full px-8">
            <div className="flex flex-col justify-center w-full mb-4 space-y-16">
              {/* <div className="pb-16 flex flex-col border-b items-center">
              <label htmlFor="metadatas">Collection Metadatas</label>
              <input
                name="metadatas"
                type="file"
                className="pb-4 mt-8"
                onChange={(e) => {
                  e.preventDefault();
                  setMetadatasJson(
                    !!e.target.files?.[0] ? e.target.files[0] : null
                  );
                }}
              />
              <button onClick={saveMetadatas}>Save Metadatas</button>
            </div>
            <div className="pb-16 flex flex-col border-b items-center">
              <label htmlFor="collection-images">Collection Images</label>
              <input
                multiple
                name="collection-images"
                type="file"
                className="pb-4 mt-8"
                onChange={(e) => {
                  e.preventDefault();
                  setCollectionImages(!!e.target.files ? e.target.files : null);
                }}
              />
              <button onClick={saveImages}>Save Images</button>
            </div> */}
            </div>
          </div>
        </div>
      </Uploady>
    </ContentWrapper>
  );
}
