import Lottie from "lottie-react";
import sprout from "@/app/icons/json/sprout.json";

export const SproutIcon = ({ className }: { className?: string }) => {
  return <Lottie animationData={sprout} loop={true} className={className} />;
};
