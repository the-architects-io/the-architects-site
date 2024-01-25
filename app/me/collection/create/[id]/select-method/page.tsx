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
    <ContentWrapper className="flex flex-col md:flex-row items-center justify-center text-stone-300 mt-24">
      <Link
        href={`/me/collection/create/${params.id}/upload-metadatas`}
        className="w-full md:w-1/2 px-12 cursor-pointer"
      >
        <div className="border border-stone-300 rounded-lg p-4 h-64 w-full flex flex-col items-center justify-center">
          <div className="text-lg">Upload assets and metadata JSONs</div>
        </div>
      </Link>
      <Link
        href={`/me/collection/create/${params.id}/build`}
        className="w-full md:w-1/2 px-12 cursor-pointer"
      >
        <div className="border border-stone-300 rounded-lg p-4 h-64 w-full flex flex-col items-center justify-center">
          <div className="text-lg">Build cNFTs</div>
        </div>
      </Link>
    </ContentWrapper>
  );
}
