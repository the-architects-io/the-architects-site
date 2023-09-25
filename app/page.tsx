"use client";
import { useAuthenticationStatus } from "@nhost/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/me");
    }
  }, [isAuthenticated, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900">
      <Image
        alt="architects-logo"
        src="/images/architects-logo.webp"
        width={300}
        height={300}
      />
    </main>
  );
}
