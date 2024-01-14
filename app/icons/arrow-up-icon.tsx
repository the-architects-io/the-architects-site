import Lottie from "lottie-react";
import arrowUp from "@/app/icons/json/arrow-up.json";

export const ArrowUpIcon = ({ className }: { className?: string }) => {
  return <Lottie animationData={arrowUp} loop={true} className={className} />;
};
