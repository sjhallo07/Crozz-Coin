import { Box, Callout, Heading, Separator, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

/**
 * DeepBookV3 BalanceManager overview from https://docs.sui.io/standards/deepbookv3/balance-manager.
 */
export function BalanceManagerInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">BalanceManager (shared fund hub)</Heading>
      <Text size="2" color="gray" mb="3">
        Holds user balances for DeepBookV3. Provide it (plus a TradeProof) to pools when placing orders. One manager can
        serve all pools; funds move in/out on matches.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Creation options</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2"><code>new()</code>: create then <strong>share</strong> in same txn (optionally with deposits).</Text></div>
          <div><Text size="2"><code>new_with_custom_owner()</code>: same but set a custom owner; must share.</Text></div>
          <div><Text size="2"><code>new_with_custom_owner_and_caps()</code>: custom owner + returns <em>DepositCap</em>, <em>WithdrawCap</em>, <em>TradeCap</em> in one call; share required.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Capabilities & limits</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2">Owner can mint <em>TradeCap</em> (trading only) to other addresses; no deposit/withdraw rights.</Text></div>
          <div><Text size="2">Owner can mint <em>DepositCap</em> or <em>WithdrawCap</em> (fund moves) to others; no trading rights.</Text></div>
          <div><Text size="2">Combined cap count (trade + withdraw + deposit) ≤ <strong>1000</strong>; revoke before minting beyond.</Text></div>
          <div><Text size="2">Use <code>revoke_trade_cap</code> to revoke any of the three cap types.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Trading auth</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2">Every trade needs: shared <em>BalanceManager</em> + <em>TradeProof</em> + (optionally) pool inputs.</Text></div>
          <div><Text size="2">TradeProof from owner: no equivocation risk; suited for HFT engines.</Text></div>
          <div><Text size="2">TradeProof from <em>TradeCap</em> holder: simpler delegation but owned cap can equivocate—ensure trust.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Deposits / withdrawals</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2">Owner-only deposit/withdraw functions move funds into/out of BalanceManager.</Text></div>
          <div><Text size="2">Cap-based deposit/withdraw functions allow holders of <em>DepositCap</em>/<em>WithdrawCap</em> to move funds; no trading.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Other ops</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2">Set/unset referral on a TradeCap to link a <em>DeepBookReferral</em> for fee sharing.</Text></div>
          <div><Text size="2">Register the BalanceManager with the registry to list it under the owner.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="amber">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Always share the BalanceManager after creation; unshared managers cause tx failure. Delegate TradeCaps carefully—
          owned caps can equivocate. Reuse a single manager across pools to simplify funds.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
