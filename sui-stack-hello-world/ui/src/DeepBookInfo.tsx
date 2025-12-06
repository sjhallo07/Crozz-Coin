import { Box, Callout, Heading, Separator, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

/**
 * DeepBookV3 overview + quick reference.
 */
export function DeepBookInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">DeepBookV3 (CLOB on Sui)</Heading>
      <Text size="2" color="gray" mb="3">
        Decentralized central limit order book leveraging Sui parallel execution. Adds flash loans, governance, account
        abstraction improvements, and DEEP tokenomics. SDK available for integrations (DEXs, wallets, MM).
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Tokenomics (DEEP)</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Trading fees payable in DEEP or input tokens; DEEP fee tier ~20% lower (governance-set).</Text></li>
          <li><Text size="2">Staking DEEP: taker incentives (fees down to ~0.25 bps stable / 2.5 bps volatile) and maker rebates by volume.</Text></li>
          <li><Text size="2">DEEP token: <code>0xdeeb7a46...::deep::DEEP</code> (see suivision link).</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Order flow & matching</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Supports market and limit orders (bids/asks). Matching engine pools multiple contra orders to satisfy size.</Text></li>
          <li><Text size="2">Parallel execution + low fees → low-latency on-chain CLOB.</Text></li>
          <li><Text size="2">Transparent ledger: on-chain bids/asks enable monitoring, dashboards, and fairness.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Features</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Flash loans, governance hooks, improved account abstraction.</Text></li>
          <li><Text size="2">SDK abstracts PTBs for trading/integration; suits DEX frontends, wallets, and MM bots.</Text></li>
          <li><Text size="2">Open source; proposals via Sui Improvement Proposals (SIPs).</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="yellow">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          DeepBookV3 is backend CLOB infra—no built-in end-user UI. Use the SDK for PTBs. Fee tiers and token benefits are
          governance-driven; verify current parameters before integrating.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
