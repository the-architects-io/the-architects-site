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
        // if first tab, add rounded left
        "text-center py-2 text-gray-100 px-6 cursor-pointer text-xm uppercase rounded-lg",
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
