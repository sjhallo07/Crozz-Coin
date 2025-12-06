import { Box, Callout, Heading, Separator, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

/**
 * DeepBookV3 Orders overview from https://docs.sui.io/standards/deepbookv3/orders.
 */
export function OrdersInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">Orders (DeepBookV3)</Heading>
      <Text size="2" color="gray" mb="3">
        Limit/market placement with TradeProof + BalanceManager. Fees can be DEEP (discount) or input token. Supports
        modify, cancel, cancel-all, and permissionless withdrawal of settled amounts.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Order options</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Place limit (price) or market (limit with MAX/MIN price) in base units.</Text></li>
          <li><Text size="2">Flags: <code>pay_with_deep</code> (true → DEEP fees, false → input token). Current version requires true for limit.</Text></li>
          <li><Text size="2">Self-match behaviors: choose among three options (e.g., allow, cancel taker, cancel maker) to prevent unwanted self fills.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Lifecycle structs & events</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2"><em>OrderInfo</em>: returned on place; holds full execution details; dropped after completion/injection.</Text></li>
          <li><Text size="2"><em>OrderDeepPrice</em>: DEEP conversion snapshot at order time.</Text></li>
          <li><Text size="2"><em>Fill</em>: maker/taker match details for state updates.</Text></li>
          <li><Text size="2">Events: <em>OrderPlaced</em>, <em>OrderFilled</em>, <em>OrderModified</em>, <em>OrderCanceled</em>.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Modify & cancel</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Modify: only shrink quantity and/or shorten expiration; cannot increase size/expiry—cancel + re-place instead.</Text></li>
          <li><Text size="2">Cancel single: removes from book + open orders, refunds remaining to BalanceManager.</Text></li>
          <li><Text size="2">Cancel multiple (vector): atomic; if one fails, none cancel.</Text></li>
          <li><Text size="2">Cancel all: convenience to remove every open order for the BalanceManager in the pool.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Settlement</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Orders auto-withdraw settled amounts; explicit withdraw function also available.</Text></li>
          <li><Text size="2">Permissionless withdraw: anyone can settle a BalanceManager's funds without a TradeProof.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="amber">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Ensure the BalanceManager has funds and a valid TradeProof before placing orders. To increase size or extend
          expiry, cancel then place a new order. Choose self-match policy intentionally to avoid unintended crosses.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
