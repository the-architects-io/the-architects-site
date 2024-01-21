import { handleError } from "@/utils/errors/log-error";

export async function downloadImageAsFile(url: string, filename: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);

    const blob = await response.blob();
    return new File([blob], filename, { type: "image/png" });
  } catch (error) {
    handleError(error as Error);
  }
}
