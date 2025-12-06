import { Box, Callout, Heading, Separator, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

/**
 * DeepBookV3 swaps overview from https://docs.sui.io/standards/deepbookv3/swaps.
 */
export function SwapsInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">Swaps (DeepBookV3)</Heading>
      <Text size="2" color="gray" mb="3">
        AMM-like swap helpers on top of the CLOB. Can swap with raw coins (no BalanceManager) or with a manager. Fees paid
        in DEEP; you may over-provide DEEP and excess is returned.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Direct coin swaps (no manager)</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2"><code>swap_exact_amount</code> base→quote: set <code>base_in &gt; 0</code>, <code>quote_in = 0</code>; returns Base, Quote, DEEP coins.</Text></li>
          <li><Text size="2"><code>swap_exact_amount</code> quote→base: set <code>quote_in &gt; 0</code>, <code>base_in = 0</code>; returns Base, Quote, DEEP coins.</Text></li>
          <li><Text size="2">Underlying exact-quantity swap is called by both paths; one of base/quote must be zero.</Text></li>
          <li><Text size="2">Some input may remain if not divisible by lot size.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Manager-based swaps</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Exact base→quote with BalanceManager (assumes DEEP fees, manager holds DEEP).</Text></li>
          <li><Text size="2">Exact quote→base with BalanceManager (assumes DEEP fees, manager holds DEEP).</Text></li>
          <li><Text size="2">Exact quantity with BalanceManager: core helper both call into.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Simulation</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2"><code>get_amount_out</code>: simulate swap; returns exact DEEP required.</Text></li>
          <li><Text size="2">You can overestimate DEEP input in the real swap; unused DEEP is refunded.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="amber">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Ensure only one of base_in/quote_in is non-zero. Provide sufficient DEEP for fees (or overestimate). Expect
          leftovers if the provided amount is not aligned to lot size.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
