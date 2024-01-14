import Lottie from "lottie-react";
import checkMark from "@/app/icons/json/check-mark.json";

export const CheckMarkIcon = ({ className }: { className?: string }) => {
  return (
    <Lottie animationData={checkMark} loop={false} className={className} />
  );
};
