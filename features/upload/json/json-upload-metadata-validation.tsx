import {
  CollectionStatsFromCollectionMetadatas,
  TokenMetadata,
  ValidationIssue,
} from "@/app/blueprint/types";
import { getCollectionStatsFromCollectionMetadatas } from "@/app/blueprint/utils";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import Spinner from "@/features/UI/spinner";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { UploadyContextType } from "@rpldy/uploady";
import classNames from "classnames";
import { useCallback, useEffect, useState } from "react";

export const JsonUploadMetadataValidation = ({
  json,
  isMetadataValid,
  setIsMetadataValid,
  setJsonBeingUploaded,
  setMetadataStas,
  uploadyInstance,
}: {
  json: any;
  isMetadataValid: boolean | null;
  setIsMetadataValid: (isValid: boolean | null) => void;
  setJsonBeingUploaded: (json: any) => void;
  setMetadataStas: (
    stats: CollectionStatsFromCollectionMetadatas | null
  ) => void;
  uploadyInstance: UploadyContextType | null;
}) => {
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>(
    []
  );
  const [shouldShowValidationIssues, setShouldShowValidationIssues] =
    useState(false);
  const [collectionStats, setCollectionStats] =
    useState<CollectionStatsFromCollectionMetadatas | null>(null);

  useEffect(() => {
    if (!json) return;

    const stats = getCollectionStatsFromCollectionMetadatas(json);
    setCollectionStats(stats);
  }, [json, setCollectionStats]);

  const addValidationIssue = useCallback(
    (issue: ValidationIssue) => {
      setValidationIssues((prev) => [...prev, issue]);
    },
    [setValidationIssues]
  );

  const validateTokenMetadata = useCallback(
    (tokenMetadata: TokenMetadata, i: number) => {
      if (!tokenMetadata) {
        addValidationIssue({
          text: "Token metadata is empty",
          index: i,
        });
        return false;
      }
      if (!tokenMetadata.name) {
        addValidationIssue({
          text: "Token metadata name is empty",
          index: i,
        });
        return false;
      }
      if (!tokenMetadata.symbol) {
        addValidationIssue({
          text: "Token metadata symbol is empty",
          index: i,
        });
        return false;
      }
      if (!tokenMetadata.description) {
        addValidationIssue({
          text: "Token metadata description is empty",
          index: i,
        });
        return false;
      }
      // allow for tokenMetadata.seller_fee_basis_points to be 0
      if (tokenMetadata.seller_fee_basis_points === undefined) {
        addValidationIssue({
          text: "Token metadata seller_fee_basis_points is empty",
          index: i,
        });
        return false;
      }
      if (!tokenMetadata.image) {
        addValidationIssue({
          text: "Token metadata image is empty",
          index: i,
        });
        return false;
      }

      return true;
    },
    [addValidationIssue]
  );

  const validateJson = useCallback(
    (json: any) => {
      if (!json) return false;
      if (!Array.isArray(json)) return false;
      if (json.length === 0) return false;

      return json.every((tokenMetadata: TokenMetadata, i) => {
        return validateTokenMetadata(tokenMetadata, i);
      });
    },
    [validateTokenMetadata]
  );

  useEffect(() => {
    if (!json) return;

    setIsMetadataValid(validateJson(json));
    setMetadataStas({
      uniqueTraits: collectionStats?.uniqueTraits || [],
      creators: collectionStats?.creators || [],
      count: json.length,
      validCount:
        (json?.filter &&
          json?.filter((tokenMetadata: TokenMetadata, i: number) => {
            return validateTokenMetadata(tokenMetadata, i);
          })?.length) ||
        0,
    });
  }, [
    collectionStats?.creators,
    collectionStats?.uniqueTraits,
    json,
    setIsMetadataValid,
    setMetadataStas,
    validateJson,
    validateTokenMetadata,
  ]);

  const handleClearFile = () => {
    setIsMetadataValid(null);
    setValidationIssues([]);
    setJsonBeingUploaded(null);
    setMetadataStas(null);
    uploadyInstance?.clearPending();
  };

  return (
    <div className="flex w-full h-full justify-center space-y-5">
      {isMetadataValid === null && (
        <div className="flex items-center space-x-2">
          <Spinner />
          <div>Validating...</div>
        </div>
      )}
      {isMetadataValid === false && (
        <div
          className={classNames([
            "flex flex-col items-center space-x-2",
            shouldShowValidationIssues ? "" : "mt-24",
          ])}
        >
          <div className="flex items-center jusfity-center space-x-2">
            <XCircleIcon className="h-6 w-6 text-red-500" />
            <div>Invalid JSON</div>
          </div>
          <div className="mt-4 flex space-x-4">
            <SecondaryButton onClick={handleClearFile}>
              Clear JSON
            </SecondaryButton>
            <SecondaryButton
              onClick={() => {
                setShouldShowValidationIssues((prev) => !prev);
              }}
            >
              {shouldShowValidationIssues
                ? "Hide Validation Issues"
                : "Show Validation Issues"}
            </SecondaryButton>
          </div>
          {!!validationIssues.length && shouldShowValidationIssues && (
            <div className="flex flex-col space-y-2 mt-6 overflow-y-auto">
              {validationIssues.map((issue) => {
                return (
                  <div key={issue.index}>
                    <div className="text-gray-100">
                      {issue.index + 1}: {issue.text}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {isMetadataValid === true && (
        <div className="flex flex-col items-center space-x-2">
          <div className="flex items-center justify-center h-full space-x-2">
            <CheckBadgeIcon className="h-6 w-6 text-green-500" />
            <div>JSON is Valid</div>
          </div>
          {!!collectionStats && (
            <div className="flex flex-col space-y-2 mt-4">
              <div className="flex flex-col space-y-2 mb-4">
                <div className="flex flex-col space-y-2 text-center">
                  <div className="text-gray-100 text-sm">
                    Total tokens: {collectionStats.count}
                  </div>
                  <div className="text-gray-100 text-sm">
                    Uniquie traits across collection:{" "}
                    {collectionStats.uniqueTraits.length}
                  </div>
                  <div className="text-gray-100 text-sm">
                    Creators in metadata: {collectionStats.creators.length}
                  </div>
                </div>
              </div>
              <SecondaryButton onClick={handleClearFile}>
                Clear JSON
              </SecondaryButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
