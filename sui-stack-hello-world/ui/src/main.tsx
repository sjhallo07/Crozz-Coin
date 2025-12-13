// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import ReactDOM from "react-dom/client";
import "@mysten/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";

import { registerSlushWallet } from "@mysten/slush-wallet";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Theme } from "@radix-ui/themes";
import App from "./App.tsx";
import { networkConfig } from "./networkConfig.ts";
import { LanguageProvider } from "./i18n";

const queryClient = new QueryClient();

// Get network from environment variable, default to testnet
const defaultNetwork = (import.meta.env.VITE_SUI_NETWORK || "testnet") as "localnet" | "testnet" | "mainnet";

if (typeof window !== "undefined") {
  const globalWindow = window as typeof window & {
    __slushWalletRegistration__?: ReturnType<typeof registerSlushWallet>;
  };

  if (!globalWindow.__slushWalletRegistration__) {
    try {
      console.log("Registering Slush wallet...");
      globalWindow.__slushWalletRegistration__ = registerSlushWallet(
        "CROZZ Ecosystem",
        {
          origin: window.location.origin,
        }
      );
      console.log("✓ Slush wallet registered successfully");
    } catch (error) {
      console.error("Failed to register Slush wallet:", error);
    }
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LanguageProvider>
      <Theme appearance="dark">
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networkConfig} defaultNetwork={defaultNetwork}>
            <WalletProvider autoConnect={false}>
              <App />
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </Theme>
    </LanguageProvider>
  </React.StrictMode>,
);
