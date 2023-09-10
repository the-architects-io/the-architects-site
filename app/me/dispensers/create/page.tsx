import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import { AddDispenserForm } from "@/features/dispensers/add-dispenser-form";

export default function DashboardPage() {
  return (
    <ContentWrapper>
      <Panel className="flex flex-col items-center">
        <h1 className="text-3xl my-4 text-gray-100">Create Dispenser</h1>
        <AddDispenserForm />
      </Panel>
    </ContentWrapper>
  );
}
