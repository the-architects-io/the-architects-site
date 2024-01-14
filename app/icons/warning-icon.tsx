import Lottie from "lottie-react";
import warning from "@/app/icons/json/warning.json";

export const WarningIcon = ({ className }: { className?: string }) => {
  return <Lottie animationData={warning} loop={false} className={className} />;
};
