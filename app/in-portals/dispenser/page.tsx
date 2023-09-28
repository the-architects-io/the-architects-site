"use client";

import DispenserUi from "@/features/dispensers/dispenser-ui";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const searchParams = useSearchParams();
  const dispenserId = searchParams.get("id");

  return (
    <>
      {!!dispenserId && (
        <DispenserUi dispenserId={dispenserId} backgroundColor="#f00" />
      )}
    </>
  );
}
