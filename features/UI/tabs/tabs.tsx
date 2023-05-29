import { Tab } from "@/features/UI/tabs/tab";
import { TabsWrapper } from "@/features/UI/tabs/tabs-wrapper";

export interface ITab {
  parent?: string;
  name: string;
  value: string;
}

export const Tabs = ({
  tabs,
  handleSetTab,
  activeTab,
}: {
  tabs: ITab[];
  handleSetTab: (tab: ITab) => void;
  activeTab: ITab;
}) => {
  return (
    <TabsWrapper>
      {tabs.map((tab) => (
        <Tab
          key={tab.value}
          tab={tab}
          handleSetTab={handleSetTab}
          activeTab={activeTab}
        />
      ))}
    </TabsWrapper>
  );
};
