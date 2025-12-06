import { Box, Callout, Heading, Link, Separator, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";

/**
 * DeepBookV3 TypeScript SDK overview from https://docs.sui.io/standards/deepbookv3-sdk.
 */
export function DeepBookSdkInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">DeepBookV3 TypeScript SDK</Heading>
      <Text size="2" color="gray" mb="3">
        Thin wrapper over DeepBook PTBs: constructs transactions for pools, balance managers, swaps, orders, etc. Ships
        with default coins/pools and utility constants for deployed addresses.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Install</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2"><code>pnpm add @mysten/deepbook-v3</code> (or npm/yarn).</Text></li>
          <li><Text size="2">Constants: <Link href="https://github.com/MystenLabs/ts-sdks/blob/main/packages/deepbook-v3/src/utils/constants.ts" target="_blank">utils/constants.ts</Link> holds latest package/pool/coin IDs.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Client setup</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Create <code>DeepBookClient</code> with <code>{`{ client: SuiClient, address, env }`}</code>; use Sui TS SDK for keypairs/signing.</Text></li>
          <li><Text size="2">Provide <em>balanceManagers</em> map if you already have one; otherwise SDK can create+share then re-init.</Text></li>
          <li><Text size="2">Keys: coins in <em>CoinMap</em>, pools in <em>PoolMap</em>, managers keyed by your labels (e.g., <code>MANAGER_1</code>).</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Balance manager patterns</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Existing manager: pass <code>{`{ address, tradeCap }`}</code> map to constructor.</Text></li>
          <li><Text size="2">Create manager: use <code>balanceManager.createAndShareBalanceManager()</code> in a Transaction; parse created objectId; re-init client with new map.</Text></li>
          <li><Text size="2">Ensure <code>tradeCap</code> is provided when delegating trading.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Typical usage</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Read helpers: <code>checkManagerBalance</code>, <code>getLevel2Range</code>, etc.</Text></li>
          <li><Text size="2">Balance ops: <code>depositIntoManager</code>, <code>withdrawAllFromManager</code>.</Text></li>
          <li><Text size="2">Trading: place limit/market via SDK PTB builders; flash loans helpers available.</Text></li>
          <li><Text size="2">Custom PTBs: compose SDK builders inside a <code>Transaction</code> then sign+execute with your keypair.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="blue">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Keep private keys in env/secure vaults; pass a <code>balanceManagers</code> map when known to avoid re-init cost. Update constants as
          DeepBook redeploys. Always simulate with dry-run or SDK read calls before sending mainnet PTBs.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
