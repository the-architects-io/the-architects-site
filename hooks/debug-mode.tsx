import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";
import React, { ReactNode, useContext, useEffect, useState } from "react";

type DebugModeContextType = {
  isDebugMode: boolean;
  setIsDebugMode: (isDebugMode: boolean) => void;
};

const DebugModeContext = React.createContext({} as DebugModeContextType);
const { Provider } = DebugModeContext;

export const DebugModeProvider = ({ children }: { children: ReactNode }) => {
  const [isDebugMode, setIsDebugMode] = useState(false);

  return (
    <Provider
      value={{
        isDebugMode,
        setIsDebugMode,
      }}
    >
      {children}
    </Provider>
  );
};

export const useDebugMode = () => {
  const { isDebugMode, setIsDebugMode } = useContext(DebugModeContext);

  return { isDebugMode, setIsDebugMode };
};
