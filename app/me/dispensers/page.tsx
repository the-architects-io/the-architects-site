import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";

export default function DashboardPage() {
  return (
    <ContentWrapper>
      <Panel className="flex flex-col items-center">
        <h1 className="text-3xl mb-4">My Disensers</h1>
        <PrimaryButton>
          <a href="/me/dispensers/create">Create Dispenser</a>
        </PrimaryButton>
      </Panel>
    </ContentWrapper>
  );
}
