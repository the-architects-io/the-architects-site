import { ContentWrapper } from "@/features/UI/content-wrapper";
import SharedHead from "@/features/UI/head";

export const NotAdminBlocker = () => {
  return (
    <ContentWrapper className="w-full text-center text-stone-300">
      <SharedHead />
      <div>go away 💀</div>
    </ContentWrapper>
  );
};
