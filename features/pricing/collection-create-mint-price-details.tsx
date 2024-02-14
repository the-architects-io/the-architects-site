import { Collection } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import { getConcurrentMerkleTreeAccountSize } from "@solana/spl-account-compression";
import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

const SOLANA_TRANSACTION_FEE = 0.000005;

export const CollectionCreateMintPriceDetails = ({
  collection,
}: {
  collection: Collection | null;
}) => {
  const [treeCost, setTreeCost] = useState<number | null>(null);
  const [storageCost, setStorageCost] = useState<number | null>(null);
  const { connection } = useConnection();
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [solPriceInUsd, setSolPriceInUsd] = useState<number | null>(null);

  const calculateTreeCost = useCallback(
    async (collection: Collection) => {
      if (!collection) {
        return null;
      }
      const { maxDepth, maxBufferSize, canopyDepth } = collection;
      if (!maxDepth || !maxBufferSize || !canopyDepth) {
        return null;
      }
      const requiredSpace = getConcurrentMerkleTreeAccountSize(
        maxDepth,
        maxBufferSize,
        canopyDepth
      );
      const costInLamports = await connection.getMinimumBalanceForRentExemption(
        requiredSpace
      );
      const costInSol = costInLamports / LAMPORTS_PER_SOL;
      setTreeCost(costInSol);
    },
    [connection]
  );

  const calculateStorageCost = useCallback(async (collection: Collection) => {
    const storageCostPerGbInUsd = 0.05;

    const { imageSizeInBytes, tokenImagesSizeInBytes } = collection;

    if (!imageSizeInBytes || !tokenImagesSizeInBytes) {
      return null;
    }
    const oneMbInBytes = 1024 * 1024;

    const totalSizeInBytes =
      imageSizeInBytes + tokenImagesSizeInBytes + oneMbInBytes;

    const costInUsd =
      (totalSizeInBytes / 1024 / 1024 / 1024) * storageCostPerGbInUsd;

    const {
      data: { solPriceInUsd, success },
    } = await axios.get(`${BASE_URL}/api/get-sol-price-in-usd`);

    if (!success) {
      return null;
    }

    const costInSol = costInUsd / solPriceInUsd;
    setSolPriceInUsd(solPriceInUsd);
    setStorageCost(costInSol);
  }, []);

  useEffect(() => {
    if (!collection) return;

    if (totalCost && treeCost && storageCost) {
      setFinalPrice(totalCost * 1.15);
    }

    if (
      collection &&
      !treeCost &&
      collection?.maxDepth &&
      collection?.maxBufferSize
    ) {
      calculateTreeCost(collection);
    }

    if (
      collection &&
      !storageCost &&
      collection?.imageSizeInBytes &&
      collection?.tokenImagesSizeInBytes
    ) {
      calculateStorageCost(collection);
    }

    if (treeCost && storageCost && collection?.tokenCount) {
      setTotalCost(
        collection.tokenCount * SOLANA_TRANSACTION_FEE + treeCost + storageCost
      );
    }
  }, [
    calculateStorageCost,
    calculateTreeCost,
    collection,
    connection,
    storageCost,
    totalCost,
    treeCost,
  ]);

  if (!collection) {
    return null;
  }

  return (
    <div className="flex flex-col border border-gray-600 rounded-lg p-4 max-w-md space-y-4 py-6 mb-8">
      <div className="flex flex-col">
        <div className="flex flex-col mb-2">
          <div className="font-bold">Transaction fees</div>
          <div>{collection.tokenCount * SOLANA_TRANSACTION_FEE} SOL</div>
          <div>
            $
            {solPriceInUsd &&
              (
                collection.tokenCount *
                SOLANA_TRANSACTION_FEE *
                solPriceInUsd
              ).toFixed(2)}{" "}
            USD
          </div>
        </div>
        <div className="flex flex-col mb-2">
          <div className="font-bold">Tree cost</div>
          <div>{treeCost} SOL</div>
          <div>
            $
            {treeCost && solPriceInUsd && (treeCost * solPriceInUsd).toFixed(2)}{" "}
            USD
          </div>
        </div>
        <div className="flex flex-col mb-2">
          <div className="font-bold">Asset storage cost</div>
          <div>{storageCost} SOL</div>
          <div>
            $
            {storageCost &&
              solPriceInUsd &&
              (storageCost * solPriceInUsd).toFixed(2)}{" "}
            USD
          </div>
        </div>
        <>
          {!!totalCost && !!finalPrice && (
            <>
              <div className="flex flex-col mb-2">
                <div className="font-bold">Architects fee</div>
                <div>{finalPrice - totalCost} SOL</div>
                <div>
                  $
                  {solPriceInUsd &&
                    ((finalPrice - totalCost) * solPriceInUsd).toFixed(2)}{" "}
                  USD
                </div>
              </div>
              <div className="flex flex-col">
                <div className="font-bold">Total cost</div>
                <div>{finalPrice} SOL</div>
                <div>
                  ${solPriceInUsd && (finalPrice * solPriceInUsd).toFixed(2)}{" "}
                  USD
                </div>
              </div>
            </>
          )}
        </>
      </div>
    </div>
  );
};
