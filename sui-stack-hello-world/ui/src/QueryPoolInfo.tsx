import { Box, Callout, Heading, Separator, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";

/**
 * DeepBookV3 pool query endpoints (read-only) from https://docs.sui.io/standards/deepbookv3/query-the-pool.
 */
export function QueryPoolInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">Query the Pool (DeepBookV3)</Heading>
      <Text size="2" color="gray" mb="3">
        Read-only helpers to inspect pools, books, fees, and account state. Use alongside a <strong>BalanceManager</strong>
        to plan trades or monitor positions.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Fee + price simulations</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Quote-out for base-in with DEEP fees; or base-out for quote-in with DEEP fees.</Text></li>
          <li><Text size="2">Quote-out for base-in with input-token fees; or base-out for quote-in with input-token fees.</Text></li>
          <li><Text size="2">Generic quote: provide base or quote (one non-zero) → returns base_out, quote_out, deep_required.</Text></li>
          <li><Text size="2">Fee checker: returns DEEP required for taker vs maker at given qty/price.</Text></li>
          <li><Text size="2">Mid price: fetch current mid for the pool.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Order book + orders</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Level2 ranges: price/quantity vectors within [price_low, price_high] for bids or asks.</Text></li>
          <li><Text size="2">Level2 by ticks: up to N ticks from best bid/ask → (bid_price, bid_qty, ask_price, ask_qty) vectors.</Text></li>
          <li><Text size="2">Order IDs: list all open order IDs for a BalanceManager in the pool.</Text></li>
          <li><Text size="2">Order info: fetch by single ID, vector of IDs, or all orders for a BalanceManager.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Account + pool state</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Locked balances for a BalanceManager: (base, quote, DEEP).</Text></li>
          <li><Text size="2">Pool params: taker_fee, maker_fee, stake_required; next-epoch leading proposal params; quorum.</Text></li>
          <li><Text size="2">Book params: tick_size, lot_size, min_size; OrderDeepPrice (DEEP fee conversion struct).</Text></li>
          <li><Text size="2">Pool ID lookup by asset types.</Text></li>
          <li><Text size="2">Whitelist status accessor (is the pool whitelisted?).</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Balances + payouts</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Retrieve all balances held in the pool (aggregated).</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="blue">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Pair these read endpoints with dry-run quote checks before submitting PTBs. Ensure you pass the correct shared
          <em>BalanceManager</em> when fetching per-user orders or locked balances.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
