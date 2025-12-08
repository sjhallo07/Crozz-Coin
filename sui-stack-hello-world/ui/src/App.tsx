// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import { Box, Button, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { SUI_TESTNET_CHAIN } from "@mysten/wallet-standard";
import { useState } from "react";
import { Greeting } from "./Greeting";
import { CreateGreeting } from "./CreateGreeting";
import { CoinManager } from "./CoinManager";
import { CoinStandardInfo } from "./CoinStandardInfo";
import { CurrencyManager } from "./CurrencyManager";
import { CurrencyStandardInfo } from "./CurrencyStandardInfo";
import { ClosedLoopInfo } from "./ClosedLoopInfo";
import { ActionRequestInfo } from "./ActionRequestInfo";
import { TokenPolicyInfo } from "./TokenPolicyInfo";
import { SpendingInfo } from "./SpendingInfo";
import { CoinTokenComparison } from "./CoinTokenComparison";
import { KioskInfo } from "./KioskInfo";
import { KioskAppsInfo } from "./KioskAppsInfo";
import { DeepBookInfo } from "./DeepBookInfo";
import { DeepBookDesignInfo } from "./DeepBookDesignInfo";
import { BalanceManagerInfo } from "./BalanceManagerInfo";
import { PermissionlessPoolInfo } from "./PermissionlessPoolInfo";
import { QueryPoolInfo } from "./QueryPoolInfo";
import { OrdersInfo } from "./OrdersInfo";
import { SwapsInfo } from "./SwapsInfo";
import { FlashLoansInfo } from "./FlashLoansInfo";
import { StakingGovernanceInfo } from "./StakingGovernanceInfo";
import { DeepBookSdkInfo } from "./DeepBookSdkInfo";
import { DeepBookMarginSdkInfo } from "./DeepBookMarginSdkInfo";
import { DisplayInfo } from "./DisplayInfo";
import { PaymentKitInfo } from "./PaymentKitInfo";
import { WalletStandardInfo } from "./WalletStandardInfo";
import { ReferencesOverviewInfo } from "./ReferencesOverviewInfo";
import { SlushWalletInfo } from "./SlushWalletInfo";
import { GraphQLProvider } from "./contexts/GraphQLContext";
import { GraphQLExplorer } from "./components/GraphQLExplorer";
import { GraphQLConnectionPanel } from "./components/GraphQLConnectionPanel";
import { TestnetStatus } from "./components/TestnetStatus";
import { ObjectViewer } from "./components/ObjectViewer";
import { GraphQLHealthPanel } from "./components/GraphQLHealthPanel";
import { CreateCurrencyPanel } from "./components/CreateCurrencyPanel";
import { CreateCurrencyOTWPanel } from "./components/CreateCurrencyOTWPanel";
import { CreateDisplayPanel } from "./components/CreateDisplayPanel";
import { UpdateDisplayPanel } from "./components/UpdateDisplayPanel";
import { DisplayViewer } from "./components/DisplayViewer";
import { PaymentURIGenerator } from "./components/PaymentURIGenerator";
import { PaymentRegistryManager } from "./components/PaymentRegistryManager";
import { EphemeralPaymentPanel } from "./components/EphemeralPaymentPanel";
import { RegistryPaymentPanel } from "./components/RegistryPaymentPanel";
import { DeepBookV3Info } from "./components/DeepBookV3Info";
import { DeepBookV3BalanceManager } from "./components/DeepBookV3BalanceManager";
import { DeepBookV3Staking } from "./components/DeepBookV3Staking";
import { SuiAdvancedTopics } from "./components/SuiAdvancedTopics";

function App() {
  const currentAccount = useCurrentAccount();
  const [greetingId, setGreeting] = useState(() => {
    const hash = window.location.hash.slice(1);
    return isValidSuiObjectId(hash) ? hash : null;
  });

  const accountChains = currentAccount?.chains ?? [];
  const isOnTestnet = accountChains.includes(SUI_TESTNET_CHAIN);
  const activeChainLabel = accountChains[0];

  return (
    <GraphQLProvider defaultEnvironment="testnet" autoConnect={true}>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        align={"center"}
        style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}
      >
        <Box style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src="/logo-no-background.png"
            alt="CROZZ ECOSYSTEM"
            style={{ width: "40px", height: "40px" }}
          />
          <Box>
            <Heading size="6">CROZZ ECOSYSTEM</Heading>
            <Text size="1" color="gray">
              THE TRUE RELIGION - A NEW BEGINNING
            </Text>
          </Box>
        </Box>

        <Box style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {currentAccount && (
            <Button
              variant="soft"
              onClick={() => {
                window.open(
                  `https://faucet.sui.io/?address=${currentAccount.address}`,
                  "_blank",
                );
              }}
            >
              Get Testnet SUI
            </Button>
          )}
          <ConnectButton />
        </Box>
      </Flex>
      <Container>
        <Container
          mt="5"
          pt="2"
          px="4"
          style={{ background: "var(--gray-a2)", minHeight: 500 }}
        >
          <Flex direction="column" align="center" gap="4" mb="5">
            <img
              src="/logo-no-background.png"
              alt="CROZZ Coin Logo"
              style={{ width: "200px", height: "200px", marginTop: "20px" }}
            />
            <Heading size="8" align="center">
              CROZZ_COIN
            </Heading>
            <Text size="5" weight="bold" color="blue" align="center">
              Pre Sale Coming Soon
            </Text>

            {currentAccount && <TestnetStatus />}

            {currentAccount && isOnTestnet && <CreateCurrencyPanel />}
            {currentAccount && isOnTestnet && <CreateCurrencyOTWPanel />}
            {currentAccount && isOnTestnet && <CoinManager />}
            {currentAccount && isOnTestnet && <CoinStandardInfo />}
            {currentAccount && isOnTestnet && <CurrencyManager />}
            {currentAccount && isOnTestnet && <CurrencyStandardInfo />}
            {currentAccount && isOnTestnet && <ClosedLoopInfo />}
            {currentAccount && isOnTestnet && <ActionRequestInfo />}
            {currentAccount && isOnTestnet && <SpendingInfo />}
            {currentAccount && isOnTestnet && <TokenPolicyInfo />}
            {currentAccount && isOnTestnet && <CoinTokenComparison />}
            {currentAccount && isOnTestnet && <KioskInfo />}
            {currentAccount && isOnTestnet && <KioskAppsInfo />}
            {currentAccount && isOnTestnet && <DeepBookInfo />}
            {currentAccount && isOnTestnet && <DeepBookDesignInfo />}
            {currentAccount && isOnTestnet && <BalanceManagerInfo />}
            {currentAccount && isOnTestnet && <PermissionlessPoolInfo />}
            {currentAccount && isOnTestnet && <QueryPoolInfo />}
            {currentAccount && isOnTestnet && <OrdersInfo />}
            {currentAccount && isOnTestnet && <SwapsInfo />}
            {currentAccount && isOnTestnet && <FlashLoansInfo />}
            {currentAccount && isOnTestnet && <StakingGovernanceInfo />}
            {currentAccount && isOnTestnet && <DeepBookSdkInfo />}
            {currentAccount && isOnTestnet && <DeepBookMarginSdkInfo />}
            {currentAccount && isOnTestnet && <DisplayInfo />}
            {currentAccount && isOnTestnet && <CreateDisplayPanel />}
            {currentAccount && isOnTestnet && <UpdateDisplayPanel />}
            {currentAccount && isOnTestnet && <DisplayViewer />}
            {currentAccount && isOnTestnet && <PaymentKitInfo />}
            {currentAccount && isOnTestnet && <PaymentURIGenerator />}
            {currentAccount && isOnTestnet && <PaymentRegistryManager />}
            {currentAccount && isOnTestnet && <EphemeralPaymentPanel />}
            {currentAccount && isOnTestnet && <RegistryPaymentPanel />}
            {currentAccount && isOnTestnet && <DeepBookV3Info />}
            {currentAccount && isOnTestnet && <DeepBookV3BalanceManager />}
            {currentAccount && isOnTestnet && <WalletStandardInfo />}
            {currentAccount && isOnTestnet && <SlushWalletInfo />}
            {currentAccount && isOnTestnet && <ReferencesOverviewInfo />}
            {currentAccount && isOnTestnet && <GraphQLHealthPanel />}
            {currentAccount && isOnTestnet && <ObjectViewer />}
          </Flex>

          {currentAccount ? (
            isOnTestnet ? (
              greetingId ? (
                <Greeting id={greetingId} />
              ) : (
                <CreateGreeting
                  onCreated={(id) => {
                    window.location.hash = id;
                    setGreeting(id);
                  }}
                />
              )
            ) : (
              <Flex direction="column" gap="2">
                <Heading>Switch your wallet to Sui Testnet</Heading>
                <Text color="gray">
                  Connected chain: {activeChainLabel ?? "unknown"}. Please open
                  your wallet and select the
                  <Text weight="bold"> Sui Testnet </Text>
                  network so this dApp can find the package and execute
                  transactions.
                </Text>
              </Flex>
            )
          ) : (
            <Heading>Please connect your wallet</Heading>
          )}
        </Container>

        <Box style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <GraphQLConnectionPanel />
          <DeepBookV3Staking />
          <SuiAdvancedTopics />
          <GraphQLExplorer />
        </Box>
      </Container>
    </GraphQLProvider>
  );
}

export default App;
