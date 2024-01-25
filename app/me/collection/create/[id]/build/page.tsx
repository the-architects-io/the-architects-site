import { ContentWrapper } from "@/features/UI/content-wrapper";
import Link from "next/link";

export default function SelectMethodPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  return (
    <ContentWrapper className="flex flex-col md:flex-row items-center justify-center text-stone-300">
      BUILD COLLECTION PAGE
    </ContentWrapper>
  );
}
