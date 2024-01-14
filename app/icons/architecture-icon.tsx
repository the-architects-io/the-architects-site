import Lottie from "lottie-react";
import architecture from "@/app/icons/json/architecture.json";

export const ArchitectureIcon = ({ className }: { className?: string }) => {
  return (
    <Lottie animationData={architecture} loop={true} className={className} />
  );
};
