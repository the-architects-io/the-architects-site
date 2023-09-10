import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";

export default function DashboardPage() {
  return (
    <ContentWrapper>
      <Panel className="flex flex-col items-center">
        <h1 className="text-3xl mb-4">Dashboard</h1>
        <PrimaryButton>
          <a href="/me/dispensers">My Dispensers</a>
        </PrimaryButton>
      </Panel>
    </ContentWrapper>
  );
}
