import { MerkleTree } from "@/app/blueprint/types";
import { BackButton } from "@/features/UI/buttons/back-button";
import {
  formatNumberWithCommas,
  getAbbreviatedAddress,
} from "@/utils/formatting";

export const MerkleTreeDetails = ({ tree }: { tree: MerkleTree }) => {
  return (
    <>
      <div className="flex w-full mb-8 px-4">
        <BackButton />
      </div>
      <div className="flex flex-col items-center space-y-2">
        <div className="text-2xl mb-8">
          {getAbbreviatedAddress(tree.address)}
        </div>
        <div className="flex space-x-4">
          <div>
            {formatNumberWithCommas(tree.currentCapacity)} /{" "}
            {formatNumberWithCommas(tree.maxCapacity)} cNFTs
          </div>
        </div>
        <div className="flex space-x-4">
          <div>
            {Math.floor(
              (tree.currentCapacity / tree.maxCapacity) * 100
            ).toFixed(0)}
            % Remaining
          </div>
        </div>
      </div>
    </>
  );
};
