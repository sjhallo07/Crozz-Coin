import { Box, Callout, Heading, Separator, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";

/**
 * DeepBookV3 design highlights from https://docs.sui.io/standards/deepbookv3/design.
 */
export function DeepBookDesignInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">DeepBookV3 design (book → state → vault)</Heading>
      <Text size="2" color="gray" mb="3">
        Three shared objects orchestrate every market: <strong>Pool</strong> (per market), <strong>PoolRegistry</strong>
        (deduplicates + versions pools at creation), and a reusable <strong>BalanceManager</strong> that sources trader
        funds across pools.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Pool internals</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div>
            <Text size="2"><strong>Book</strong>: maintains bid/ask <code>BigVector&lt;Order&gt;</code>, matches incoming orders,
            emits fills, injects remaining size as compact on-book orders.</Text>
          </div>
          <div>
            <Text size="2"><strong>State</strong>: processes requests and volumes across <em>Governance</em> (fee params + stake
            requirement), <em>History</em> (epoch volumes/fees, maker rebates), and <em>Account</em> (per BalanceManager: stake,
            volumes, settled/owed balances, voted proposal).</Text>
          </div>
          <div>
            <Text size="2"><strong>Vault</strong>: settles base/quote/DEEP vs. BalanceManager, storing <code>DeepPrice</code> points (DEEP
            conversions) to compute fees.</Text>
          </div>
          <div>
            <Text size="2"><strong>BigVector</strong>: B+ tree backed vector for near-constant access/insert/remove; exposes leaf slices
            for iteration.</Text>
          </div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Governance quick notes</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2">Per-pool taker/maker fees are bounded by pool type (e.g., volatile taker 1–10 bps, maker 0–5 bps; stable taker 0.1–1 bps, maker 0–0.5 bps; whitelisted 0).</Text></div>
          <div><Text size="2">Users stake DEEP in the pool to propose/vote; proposals and votes reset each epoch, queued to activate next epoch once quorum (≥50% voting power) is reached.</Text></div>
          <div><Text size="2">Voting power V uses cutoff Vc=100k DEEP: V = min(S, Vc) + max(√S − √Vc, 0).</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Place limit order path</Heading>
      <Box asChild>
        <ol style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2">Pool: <code>place_order_int</code> builds <em>OrderInfo</em>.</Text></div>
          <div><Text size="2">Book: validate → match against contra side (create fills) → inject remainder as on-book <em>Order</em>.</Text></div>
          <div><Text size="2">State: <code>process_create</code> applies fills, computes taker/maker fees (stake-gated discounts), updates account volumes/orders, returns settled/owed triples.</Text></div>
          <div><Text size="2">Vault: <code>settle_balance_manager</code> authorizes BalanceManager, nets base/quote/DEEP in/out and updates vault balances.</Text></div>
        </ol>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Rebates & epochs</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2">Epoch rollover moves current stats to history on first tx of the epoch.</Text></div>
          <div><Text size="2">Makers with stake ≥ required and volume in epoch can earn rebates; total rebates capped by DEEP fees for that epoch, excess DEEP is burned.</Text></div>
          <div><Text size="2">Account updates on first action each epoch to settle prior rebates and reset volumes.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="blue">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Ensure traders are authorized on the BalanceManager they submit with; fees, stake thresholds, and governance params
          are pool-specific—query the Pool and BalanceManager state before placing PTBs.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
