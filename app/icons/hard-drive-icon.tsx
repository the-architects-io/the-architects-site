import Lottie from "lottie-react";
import hardDrive from "@/app/icons/json/hard-drive.json";

export const HardDriveIcon = ({ className }: { className?: string }) => {
  return <Lottie animationData={hardDrive} loop={true} className={className} />;
};
