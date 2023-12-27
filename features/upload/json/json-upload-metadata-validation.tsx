import { TokenMetadata } from "@/app/blueprint/types";
import {
  CollectionStatsFromCollectionMetadatas,
  getCollectionStatsFromCollectionMetadatas,
} from "@/app/blueprint/utils";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import Spinner from "@/features/UI/spinner";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { useCallback, useEffect, useState } from "react";

export type ValidationIssue = { text: string; index: number };

export const JsonUploadMetadataValidation = ({
  json,
  setJsonBeingUploaded,
}: {
  json: any;
  setJsonBeingUploaded: (json: any) => void;
}) => {
  const [isJsonValid, setIsJsonValid] = useState<boolean | null>(null);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>(
    []
  );
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

    setIsJsonValid(validateJson(json));
  }, [json, setIsJsonValid, validateJson]);

  return (
    <div className="flex w=full justify-center space-y-5">
      {isJsonValid === null && (
        <div className="flex items-center space-x-2">
          <Spinner />
          <div>Validating...</div>
        </div>
      )}
      {isJsonValid === false && (
        <>
          <div className="flex items-center space-x-2">
            <XCircleIcon className="h-6 w-6 text-red-500" />
            <div className="mb-4">Invalid JSON</div>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="mb-2 italic">Validation Issues:</div>
            <div className="flex flex-col space-y-2">
              {validationIssues.map((issue) => {
                return (
                  <div key={issue.index}>
                    <div className="text-gray-100 text-sm">
                      {issue.index + 1}: {issue.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
      {isJsonValid === true && (
        <div className="flex flex-col items-center space-x-2">
          <div className="flex items-center space-x-2">
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
              <SecondaryButton
                onClick={() => {
                  setIsJsonValid(null);
                  setValidationIssues([]);
                  setJsonBeingUploaded(null);
                }}
              >
                Clear JSON
              </SecondaryButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
