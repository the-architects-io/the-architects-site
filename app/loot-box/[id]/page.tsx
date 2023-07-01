"use client";

import { ContentWrapper } from "@/features/UI/content-wrapper";
import useDispenser from "@/hooks/blueprint/use-dispenser";

export default function LootBoxPage({ params }: { params: any }) {
  const { dispenser, cost } = useDispenser(params.id);

  if (!dispenser) return null;

  return (
    <ContentWrapper>
      <h1>{dispenser.name}</h1>
      {cost && JSON.stringify(cost)}
    </ContentWrapper>
  );
}
