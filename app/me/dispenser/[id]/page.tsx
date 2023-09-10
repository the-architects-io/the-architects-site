"use client";
import { DispenserControlPanel } from "@/features/dispensers/dispenser-control-panel";

export default function DispenserControlPanelPage({ params }: { params: any }) {
  if (!params?.id) return <div>Dispenser not found</div>;

  return (
    <div className="w-full min-h-screen text-stone-300">
      <DispenserControlPanel dispenserId={params?.id} />
    </div>
  );
}
