import { SHDW_DRIVE_BASE_URL } from "@/constants/constants";

export const getShdwDriveUrl = (address: string) => {
  return `${SHDW_DRIVE_BASE_URL}/${address}`;
};
