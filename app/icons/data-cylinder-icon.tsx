import Lottie from "lottie-react";
import dataCylinder from "@/app/icons/json/data-cylinder.json";

export const DataCylinderIcon = ({ className }: { className?: string }) => {
  return (
    <Lottie animationData={dataCylinder} loop={true} className={className} />
  );
};
