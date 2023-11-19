"use client";
import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { DispenserControlPanel } from "@/features/dispensers/dispenser-control-panel";
import { useAdmin } from "@/hooks/admin";
import { useUserData } from "@nhost/nextjs";

export default function DispenserDetailsPage({ params }: { params: any }) {
  const user = useUserData();
  const { isAdmin } = useAdmin();
  const { dispenser } = useDispenser(params?.id);

  if (!params?.id)
    return (
      <ContentWrapper className="text-center">
        <div>Dispenser not found</div>
      </ContentWrapper>
    );

  if (!isAdmin && dispenser?.owner?.id !== user?.id) {
    return (
      <ContentWrapper className="text-center">Not authorized</ContentWrapper>
    );
  }

  return (
    <div className="w-full h-full min-h-screen text-stone-300">
      <DispenserControlPanel dispenserId={params?.id} />
    </div>
  );
}
