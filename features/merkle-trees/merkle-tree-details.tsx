import { MerkleTree } from "@/app/blueprint/types";
import { BackButton } from "@/features/UI/buttons/back-button";
import {
  formatNumberWithCommas,
  getAbbreviatedAddress,
} from "@/utils/formatting";
import { ClipboardIcon } from "@heroicons/react/24/outline";

export const MerkleTreeDetails = ({ tree }: { tree: MerkleTree }) => {
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <div className="flex w-full mb-8 px-4">
        <BackButton />
      </div>
      <div className="flex flex-col items-center space-y-2">
        <div className="text-2xl mb-8 flex space-x-4">
          <div>{getAbbreviatedAddress(tree.address)}</div>
          <div
            className="cursor-pointer w-3"
            onClick={() => handleCopyToClipboard(tree.address)}
          >
            <ClipboardIcon
              height="1.5rem"
              width="1.5rem"
              className="h-6 w-6 flex-none hover:text-sky-200"
            />
          </div>
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
