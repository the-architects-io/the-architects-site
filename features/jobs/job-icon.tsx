import React, { useState, useEffect } from "react";
import { ArrowUpIcon } from "@/app/icons/arrow-up-icon";
import { ArchitectureIcon } from "@/app/icons/architecture-icon";
import { CheckMarkIcon } from "@/app/icons/check-mark-icon";
import { DataCylinderIcon } from "@/app/icons/data-cylinder-icon";
import { HardDriveIcon } from "@/app/icons/hard-drive-icon";
import { WarningIcon } from "@/app/icons/warning-icon";
import { SproutIcon } from "@/app/icons/sprout-icon";
import { ImageIcon } from "@/app/icons/image-icon";

export const JobIcons = {
  CREATING_SHADOW_DRIVE: "CREATING_SHADOW_DRIVE",
  EXTRACTING_FILES: "EXTRACTING_FILES",
  UPLOADING_FILES: "UPLOADING_FILES",
  ERROR: "ERROR",
  SUCCESS: "SUCCESS",
  MINTING_NFTS: "MINTING_NFTS",
  COLLECTION_IMAGE: "COLLECTION_IMAGE",
  CREATING_TREE: "CREATING_TREE",
} as const;

export type JobIconType = (typeof JobIcons)[keyof typeof JobIcons];

const transitionDuration = 500; // Duration in milliseconds

export const JobIcon = ({
  icon,
  className,
}: {
  icon: JobIconType;
  className?: string;
}) => {
  const [currentIcon, setCurrentIcon] = useState<JobIconType>(icon);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (icon !== currentIcon) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIcon(icon);
        setIsTransitioning(false);
      }, transitionDuration / 2);
    }
  }, [icon, currentIcon]);

  const renderIcon = (iconType: JobIconType) => {
    switch (iconType) {
      case JobIcons.CREATING_SHADOW_DRIVE:
        return <HardDriveIcon />;
      case JobIcons.EXTRACTING_FILES:
        return <DataCylinderIcon />;
      case JobIcons.UPLOADING_FILES:
        return <ArrowUpIcon />;
      case JobIcons.ERROR:
        return <WarningIcon />;
      case JobIcons.SUCCESS:
        return <CheckMarkIcon />;
      case JobIcons.MINTING_NFTS:
        return <ArchitectureIcon />;
      case JobIcons.COLLECTION_IMAGE:
        return <ImageIcon />;
      case JobIcons.CREATING_TREE:
        return <SproutIcon />;
      default:
        return null;
    }
  };

  return (
    <div className={`${className} relative h-32 w-32`}>
      <div
        className={`transition-opacity duration-${transitionDuration} ${
          isTransitioning ? "opacity-0" : "opacity-100"
        } absolute`}
      >
        {renderIcon(currentIcon)}
      </div>
    </div>
  );
};
