import classNames from "classnames";
import { ITab } from "@/features/UI/tabs/tabs";

export const Tab = ({
  tab,
  activeTab,
  handleSetTab,
}: {
  tab: ITab;
  activeTab: ITab;
  handleSetTab: (tab: ITab) => void;
}) => {
  return (
    <button
      key={tab.value}
      className={classNames([
        "text-center py-3 hover:bg-stone-900 hover:text-stone-300 px-4 rounded-xl cursor-pointer",
        tab.value === activeTab.value
          ? "bg-stone-900 text-stone-300"
          : "text-stone-900",
      ])}
      onClick={() => handleSetTab(tab)}
    >
      {tab.name}
    </button>
  );
};
