import { Box, Callout, Heading, Separator, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

/**
 * Spending (Token) overview + best practices.
 */
export function SpendingInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">Spending (Token)</Heading>
      <Text size="2" color="gray" mb="3">
        Tokens have no <code>store</code> ability, so they cannot be kept inside other objects. Paying with a Token
        consumes it via <code>token::spend</code>, producing an <code>ActionRequest</code> whose <code>spent_balance</code>
        is later burned (TreasuryCap) or delivered to the shared <code>TokenPolicy</code>.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Spend action</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2"><strong>token::spend&lt;T&gt;(Token&lt;T&gt;, &amp;mut TxContext)</strong> → ActionRequest&lt;T&gt;</Text></li>
          <li><Text size="2">Consumes the Token; balance moves into the request as <code>spent_balance</code>.</Text></li>
          <li><Text size="2">The request must be confirmed to finish the flow.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">What happens to spent balance?</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2"><strong>TreasuryCap</strong>: <code>confirm_with_treasury_cap</code> burns the spent balance immediately.</Text></li>
          <li><Text size="2"><strong>TokenPolicy</strong>: <code>confirm_request</code> / <code>confirm_request_mut</code> delivers the spent balance into the policy.</Text></li>
          <li><Text size="2">Spent balance cannot be withdrawn; only <code>flush</code> burns it later with TreasuryCap.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Gating & stamping spend</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Assign at least one rule to <code>spend</code> to avoid uncontrolled destruction.</Text></li>
          <li><Text size="2">Stamp approvals in the same function that calls <code>spend</code> (e.g., service witness via <code>token::add_approval</code>).</Text></li>
          <li><Text size="2">Test both allowed and disallowed rule paths for spend before launch.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Operational tips</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">If policies deliver spent balance, schedule <code>flush</code> with TreasuryCap as part of ops.</Text></li>
          <li><Text size="2">Document who can confirm spend (policy vs. TreasuryCap) and how rules are satisfied.</Text></li>
          <li><Text size="2">Log spend confirmations and rejections to monitor misuse or misconfiguration.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="yellow">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Spent balances are irrevocable: they can only be burned (now or later). Always gate <code>spend</code> and stamp
          the request where spending occurs.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
