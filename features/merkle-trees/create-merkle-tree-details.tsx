import Spinner from "@/features/UI/spinner";

export const CreateMerkleTreeDetails = ({
  tokenCount,
  treeCost,
  treeMaxBufferSize,
  treeMaxDepth,
  treeCanopyDepth,
  treeProofLength,
  isCalculating,
  hasCalcError,
}: {
  tokenCount: number | null;
  treeCost: number | null;
  treeMaxBufferSize: number | null;
  treeMaxDepth: number | null;
  treeCanopyDepth: number | null;
  treeProofLength: number | null;
  isCalculating: boolean;
  hasCalcError: boolean;
}) => {
  if (!tokenCount) {
    return null;
  }

  return (
    <>
      <div className="flex mb-2">
        <div>Estimated cost:</div>
        {!!hasCalcError ? (
          <div className="ml-2 text-red-500">Invalid tree size</div>
        ) : (
          <>
            <div className="ml-2">
              {treeCost && !isCalculating ? `${treeCost} SOL` : <Spinner />}
            </div>
          </>
        )}
      </div>
      {!hasCalcError && !!tokenCount && (
        <div className="flex mb-2">
          <div>Number of cNFTs:</div>
          <>
            <div className="ml-2">
              {tokenCount && !isCalculating ? (
                `${tokenCount} bytes`
              ) : (
                <Spinner />
              )}
            </div>
          </>
        </div>
      )}
      {!hasCalcError && !!treeMaxBufferSize && (
        <div className="flex mb-2">
          <div>Max Buffer Size:</div>
          <>
            <div className="ml-2">
              {treeMaxBufferSize && !isCalculating ? (
                `${treeMaxBufferSize} bytes`
              ) : (
                <Spinner />
              )}
            </div>
          </>
        </div>
      )}
      {!hasCalcError && !!treeMaxDepth && (
        <div className="flex mb-2">
          <div>Max Depth:</div>
          <>
            <div className="ml-2">
              {treeMaxDepth && !isCalculating ? `${treeMaxDepth}` : <Spinner />}
            </div>
          </>
        </div>
      )}
      {!hasCalcError && !!treeCanopyDepth && (
        <div className="flex mb-2">
          <div>Canopy depth:</div>
          <>
            <div className="ml-2">
              {treeCanopyDepth && !isCalculating ? (
                `${treeCanopyDepth}`
              ) : (
                <Spinner />
              )}
            </div>
          </>
        </div>
      )}
      {!hasCalcError && !!treeProofLength && (
        <div className="flex mb-2">
          <div>Proof length:</div>
          <>
            <div className="ml-2">
              {treeProofLength && !isCalculating ? (
                `${treeProofLength}`
              ) : (
                <Spinner />
              )}
            </div>
          </>
        </div>
      )}
    </>
  );
};
