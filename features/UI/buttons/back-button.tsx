import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";

export const BackButton = () => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center space-x-2 hover:underline"
    >
      <ArrowLeftIcon className="h-4 w-4 " />
      <div>Back</div>
    </button>
  );
};
