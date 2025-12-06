import { Box, Callout, Heading, Link, Separator, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

/**
 * DeepBook Margin SDK overview from https://docs.sui.io/standards/deepbook-margin-sdk.
 */
export function DeepBookMarginSdkInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">DeepBook Margin SDK</Heading>
      <Text size="2" color="gray" mb="3">
        Same <code>@mysten/deepbook-v3</code> package; adds margin trading helpers for leveraged positions. Requires
        <strong>MarginManager</strong> (similar to BalanceManager) and pools with margin support.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Install & setup</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2"><code>pnpm add @mysten/deepbook-v3</code> (margin included).</Text></li>
          <li><Text size="2">Create <code>DeepBookClient</code> with <code>marginManagers</code> map keyed by label (e.g., <code>MARGIN_MANAGER_1</code>).</Text></li>
          <li><Text size="2">Each manager: <code>{`{ address, poolKey }`}</code> where <code>poolKey</code> is the margin pool (e.g., <code>SUI_DBUSDC</code>).</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Margin manager patterns</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Existing: pass <code>{`{ address, poolKey }`}</code> map to constructor.</Text></li>
          <li><Text size="2">Create: <code>marginManager.newMarginManager(poolKey)</code> in a Transaction; parse created objectId; re-init client with map.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Leveraged ops</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Deposit collateral: <code>marginManager.deposit(managerKey, coin, amount)</code>.</Text></li>
          <li><Text size="2">Borrow: <code>marginManager.borrowBase(managerKey, poolKey, qty)</code>.</Text></li>
          <li><Text size="2">Place leveraged order: <code>poolProxy.placeLimitOrder({`{ poolKey, marginManagerKey, price, quantity, isBid, payWithDeep }`})</code>.</Text></li>
          <li><Text size="2">Provide liquidity: mint <em>SupplierCap</em> → supply via <code>marginPool.supplyToMarginPool</code>.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Default coins/pools</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Testnet: DEEP, SUI, DBUSDC, DBUSDT (same as spot).</Text></li>
          <li><Text size="2">Mainnet: DEEP, SUI, USDC, USDT, WETH.</Text></li>
          <li><Text size="2">Override via <code>CoinMap</code> / <code>PoolMap</code> at construction if custom assets needed.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="amber">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Leveraged positions amplify risk—ensure collateral ratios and liquidation thresholds are understood. Keep keys
          secure; use <code>maintainerCap</code> sparingly. Always simulate before signing margin PTBs.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
