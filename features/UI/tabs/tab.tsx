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
        "text-center py-2 text-gray-100 px-3 cursor-pointer text-xm uppercase",
        tab.value === activeTab.value
          ? "bg-gray-300 text-gray-800 font-bold"
          : "hover:bg-gray-900",
      ])}
      onClick={() => handleSetTab(tab)}
    >
      {tab.name}
    </button>
  );
};
