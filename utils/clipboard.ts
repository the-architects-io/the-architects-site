import showToast from "@/features/toasts/show-toast";

export const copyTextToClipboard = (text: string) => {
  showToast({
    primaryMessage: "Copied to clipboard",
  });

  return navigator.clipboard.writeText(text);
};
