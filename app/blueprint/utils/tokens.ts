import { Creator } from "@/app/blueprint/types";
import { isValidPublicKey } from "@/utils/rpc";

export const creatorsAreValid = (creators: Creator[]) => {
  const shareCount = creators.reduce((acc, curr) => acc + curr.share, 0);
  const sharesEqual100 = shareCount === 100;

  return (
    creators.every((c) => !!c.address && isValidPublicKey(c.address)) &&
    creators.every((c) => c.share) &&
    sharesEqual100
  );
};
