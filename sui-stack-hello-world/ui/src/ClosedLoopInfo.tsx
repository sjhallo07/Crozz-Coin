import { Box, Callout, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

/**
 * Closed-Loop Token quick primer + best practices.
 */
export function ClosedLoopInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">Closed-Loop Token (Token Standard)</Heading>

      <Text size="2" color="gray" mb="3">
        Tokens use <code>sui::token</code> and are account-only (no <code>store</code> ability),
        so they cannot be freely wrapped or transferred unless policies permit it. Custom
        policies/rules gate transfers, spends, and conversions.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Key differences from Coin</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Token has <code>key</code> only (no <code>store</code>), cannot be wrapped or stored as a dynamic field.</Text></li>
          <li><Text size="2">Ownership is account-only; protected actions require policy approval.</Text></li>
          <li><Text size="2">Conversions to/from Coin go through protected actions with policy checks.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Design & policy tips</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Define a <strong>TokenPolicy</strong> and rules per action (transfer, spend, to/from coin).</Text></li>
          <li><Text size="2">Compose reusable rules (limits, KYC/allowlist, service-specific spend) and keep them small.</Text></li>
          <li><Text size="2">Prefer deny/allow lists in policy rules over ad-hoc checks for better auditability.</Text></li>
          <li><Text size="2">Document which actions are enabled; default protected actions are disabled until policy approves.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Operational best practices</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Separate authorities: policy admin vs. issuance/minter (if any conversion/mint path exists).</Text></li>
          <li><Text size="2">Log and monitor policy updates; treat policy capabilities like prod secrets.</Text></li>
          <li><Text size="2">Test protected flows: transfer, spend, to_coin/from_coin with failing and passing rules.</Text></li>
          <li><Text size="2">For regulated/blocked scenarios, use explicit rules rather than custom Move aborts.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="yellow">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Reminder: Protected actions emit ActionRequests that must be resolved (e.g., via TokenPolicy). If you allow
          conversions to Coin, ensure policy guards it or you effectively open the loop.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
