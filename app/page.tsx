import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900">
      <Image
        alt="logo"
        src="/images/architects-logo.webp"
        width={300}
        height={300}
      />
    </main>
  );
}
