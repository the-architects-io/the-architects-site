"use client";
import React, { ReactNode, useContext, useState } from "react";

type SidebarContextType = {
  isOpenSidebar: boolean;
  setIsSidebarOpen: (isOpenSidebar: boolean) => void;
};

const SidebarContext = React.createContext({} as SidebarContextType);
const { Provider } = SidebarContext;

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isOpenSidebar, setIsSidebarOpen] = useState(false);

  return (
    <Provider
      value={{
        isOpenSidebar,
        setIsSidebarOpen,
      }}
    >
      {children}
    </Provider>
  );
};

export const useDebugMode = () => {
  const { isOpenSidebar, setIsSidebarOpen } = useContext(SidebarContext);

  return { isOpenSidebar, setIsSidebarOpen };
};
