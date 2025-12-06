import { Box, Callout, Heading, Separator, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

/**
 * Permissionless Pool creation cheatsheet from https://docs.sui.io/standards/deepbookv3/permissionless-pool.
 */
export function PermissionlessPoolInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">Permissionless Pool creation (DeepBookV3)</Heading>
      <Text size="2" color="gray" mb="3">
        Each <strong>Pool</strong> is the unique market for a base/quote pair (e.g., SUI/USDC). Creation is open but
        must satisfy tick/lot/min sizing and uniqueness rules.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Create a Pool</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2"><code>create_permissionless_pool()</code> builds the Pool; fails if pair already exists.</Text></li>
          <li><Text size="2">Creation fee: <strong>500 DEEP</strong>.</Text></li>
          <li><Text size="2">Tick size = <code>10^(9 - base_decimals + quote_decimals - decimal_desired)</code>; ensure decimal_desired ≤ 1bps of price (e.g., target 3 decimals requires 0.001/price ≤ 0.0001).</Text></li>
          <li><Text size="2">Lot size (MIST of base): power of 10, ≥ 1,000, ≤ min size, ~ $0.01–$0.10 nominal.</Text></li>
          <li><Text size="2">Min size (MIST of base): power of 10, ≥ lot size, ~ $0.10–$1.00 nominal.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Enable DEEP fee discount</Heading>
      <Box asChild>
        <ol style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Pool must include <strong>USDC</strong> or <strong>SUI</strong> as base or quote.</Text></li>
          <li><Text size="2">Run cron to call <code>add_deep_price_point()</code> every 1–10 minutes to refresh DEEP price for fee calc.</Text></li>
          <li><Text size="2">Reference pool IDs: <code>DEEP/USDC</code> <code>0xf948...95ce</code>; <code>DEEP/SUI</code> <code>0xb663...fc22</code>.</Text></li>
          <li><Text size="2">When enabled, paying fees in DEEP gets ~20% discount vs input-token fees.</Text></li>
        </ol>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Post-upgrade hygiene</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">After contract upgrades, call <code>update_allowed_versions()</code> with pool + registry to permit new versions.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="amber">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Verify the pair doesn’t already exist before paying the 500 DEEP fee. Size tick/lot/min according to asset decimals
          and price—stable pairs may need finer ticks. Keep the DEEP price cron running to preserve the fee discount.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
