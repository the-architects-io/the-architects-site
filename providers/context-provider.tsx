"use client";
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material";
import { deepPurple, pink } from "@mui/material/colors";

import { WalletModalProvider as AntDesignWalletModalProvider } from "@solana/wallet-adapter-ant-design";
import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import { WalletDialogProvider as MaterialUIWalletDialogProvider } from "@solana/wallet-adapter-material-ui";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider as ReactUIWalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { CLUSTER, RPC_ENDPOINT } from "@/constants/constants";
import { SnackbarProvider, useSnackbar } from "notistack";
import { FC, ReactNode, useCallback, useMemo } from "react";
import {
  AutoConnectProvider,
  useAutoConnect,
} from "@/providers/auto-connect-provider";
import showToast from "@/features/toasts/show-toast";
import { NhostClient, NhostProvider } from "@nhost/nextjs";
import { NhostApolloProvider } from "@nhost/react-apollo";
require("@solana/wallet-adapter-react-ui/styles.css");

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: deepPurple[700],
    },
    secondary: {
      main: pink[700],
    },
  },
  components: {
    MuiButtonBase: {
      styleOverrides: {
        root: {
          justifyContent: "flex-start",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          padding: "12px 16px",
        },
        startIcon: {
          marginRight: 8,
        },
        endIcon: {
          marginLeft: 8,
        },
      },
    },
  },
});

const nhost = new NhostClient({
  subdomain: "nmsqqirmpjgdbtloninj",
  region: "us-east-1",
});

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { autoConnect } = useAutoConnect();

  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network =
    CLUSTER === "mainnet-beta"
      ? WalletAdapterNetwork.Mainnet
      : WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => RPC_ENDPOINT, []);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  const { enqueueSnackbar } = useSnackbar();
  const onError = useCallback((error: WalletError) => {
    showToast({
      primaryMessage: error.name,
      secondaryMessage: error.message,
    });
    // enqueueSnackbar(
    //   error.message ? `${error.name}: ${error.message}` : error.name,
    //   { variant: "error" }
    // );
    console.error(error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect>
        <MaterialUIWalletDialogProvider>
          <AntDesignWalletModalProvider>
            <ReactUIWalletModalProvider>{children}</ReactUIWalletModalProvider>
          </AntDesignWalletModalProvider>
        </MaterialUIWalletDialogProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    // <NhostProvider nhost={nhost} initial={pageProps.nhostSession}>
    <NhostProvider nhost={nhost}>
      <NhostApolloProvider nhost={nhost}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <SnackbarProvider>
              <AutoConnectProvider>
                <WalletContextProvider>{children}</WalletContextProvider>
              </AutoConnectProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </StyledEngineProvider>
      </NhostApolloProvider>
    </NhostProvider>
  );
};
