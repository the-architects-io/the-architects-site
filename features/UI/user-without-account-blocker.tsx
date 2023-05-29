import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";

export const UserWithoutAccountBlocker = () => {
  const { publicKey } = useWallet();

  return (
    <ContentWrapperYAxisCenteredContent>
      <ImageWithFallback
        className="mb-8"
        src="/images/sodead-logo.png"
        alt="SoDead Logo"
        width={200}
        height={200}
      />
      <div className="italic">
        {publicKey ? (
          <Link href="/me" className="underline text-red-500">
            Connect to{" "}
            <span className="text-purple-500 uppercase">Discord</span> to
            continue
          </Link>
        ) : (
          <>Connect your wallet to continue</>
        )}
      </div>
    </ContentWrapperYAxisCenteredContent>
  );
};
