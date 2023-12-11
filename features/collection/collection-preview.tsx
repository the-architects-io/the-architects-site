import { Collection, TokenMetadata } from "@/app/blueprint/types";
import { SHDW_DRIVE_BASE_URL } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import axios from "axios";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type CollectionPreviewToken = {
  name: string;
  imageUrl: string;
};

export const CollectionPreview = ({
  collection,
}: {
  collection: Collection;
}) => {
  const [collectionTokens, setCollectionTokens] = useState<TokenMetadata[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [tokensPerPage, setTokensPerPage] = useState<number>(20);

  const createPreviewTokens = useCallback(async () => {
    const { data } = await axios.get(
      `${SHDW_DRIVE_BASE_URL}/${collection.driveAddress}/collection-metadatas.json`
    );

    const collectionTokens: TokenMetadata[] = data;
    setCollectionTokens(
      collectionTokens.map((token, index) => ({
        ...token,
        index,
      }))
    );
  }, [collection.driveAddress]);

  useEffect(() => {
    if (!collection) return;

    createPreviewTokens();
  }, [collection, createPreviewTokens]);

  return (
    <div className="w-full h-full">
      <div className="flex w-full justify-center mb-4 text-2xl">PREVIEW</div>
      {!!collectionTokens.length ? (
        <>
          <div className="w-full pb-24">
            {collectionTokens
              .slice(
                (currentPage - 1) * tokensPerPage,
                currentPage * tokensPerPage
              )
              .map((token: TokenMetadata) => (
                <div
                  key={token.name}
                  className="flex border border-gray-400 rounded-lg my-4"
                >
                  <div className="flex flex-col items-center justify-center flex-shrink-0 p-4">
                    <Image
                      src={`${SHDW_DRIVE_BASE_URL}/${collection.driveAddress}/${token.index}.png`}
                      alt="token image"
                      className="w-40 h-40 rounded-lg"
                      width={160}
                      height={160}
                    />
                  </div>
                  <div className="flex flex-1 p-4">
                    <div className="text-2xl">
                      <div className="mb-2">{token.name}</div>
                      <p className="text-sm">
                        {token.description?.length
                          ? token.description
                          : "No description"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col min-w-[50%] p-4">
                    <div className="flex flex-wrap -mx-2">
                      {token.attributes.map((attribute) => (
                        <div className="w-1/2" key={attribute.trait_type}>
                          <div className="p-2 m-2 border border-gray-400 rounded-lg">
                            <div className="text-sm">
                              {attribute.trait_type}
                            </div>
                            <div className="text-xl">{attribute.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className="flex items-center justify-center w-full absolute bottom-0 left-0 right-0 bg-gray-900 p-4 space-x-4">
            {!!currentPage && (
              <PrimaryButton
                disabled={currentPage === 1}
                className="text-xl"
                onClick={() => {
                  setCurrentPage(currentPage - 1);
                }}
              >
                Previous Page
              </PrimaryButton>
            )}
            {!!currentPage && (
              <PrimaryButton
                disabled={
                  currentPage * tokensPerPage >= collectionTokens.length
                }
                className="text-xl"
                onClick={() => {
                  setCurrentPage(currentPage + 1);
                }}
              >
                Next Page
              </PrimaryButton>
            )}
          </div>
        </>
      ) : (
        <div className="flex w-full justify-center">
          <div className="text-center">No tokens</div>
        </div>
      )}
    </div>
  );
};
