import { Box, Callout, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

/**
 * ActionRequest overview + best practices for Closed-Loop Tokens.
 */
export function ActionRequestInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">ActionRequest (Protected actions)</Heading>
      <Text size="2" color="gray" mb="3">
        Token protected actions emit <code>ActionRequest</code> that must be confirmed. Standard actions: transfer, spend,
        to_coin, from_coin. Policies/rules decide if they execute.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Fields on ActionRequest</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">name: <code>transfer</code> | <code>spend</code> | <code>to_coin</code> | <code>from_coin</code> | custom</Text></li>
          <li><Text size="2">amount: token amount involved</Text></li>
          <li><Text size="2">sender: initiator</Text></li>
          <li><Text size="2">recipient: present for transfer/custom actions</Text></li>
          <li><Text size="2">spent_balance: present for spend actions</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Ways to confirm</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2"><strong>TreasuryCap</strong>: <code>token::confirm_with_treasury_cap</code> (admin/mint + bypass policy)</Text></li>
          <li><Text size="2"><strong>TokenPolicy</strong>: shared policy, <code>token::confirm_request</code> / <code>confirm_request_mut</code> (enables public flows)</Text></li>
          <li><Text size="2"><strong>TokenPolicyCap</strong>: <code>token::confirm_with_policy_cap</code> (cannot confirm spend)</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Best practices</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Keep admin paths separate: TreasuryCap for ops, TokenPolicy for user flows.</Text></li>
          <li><Text size="2">Explicitly list allowed actions in TokenPolicy; default is deny.</Text></li>
          <li><Text size="2">Add rules per action (limits, allowlists, KYC, service scopes). Test pass/fail cases.</Text></li>
          <li><Text size="2">If allowing to_coin/from_coin, ensure policy guards conversions; otherwise you open the loop.</Text></li>
          <li><Text size="2">Log/monitor confirmations; treat policy caps like production secrets.</Text></li>
          <li><Text size="2">Use approvals (<code>token::add_approval</code>) to collect rule attestations before confirming.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="yellow">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Reminder: ActionRequest is for authorization, not proof. Anyone can create one; only confirmations matter.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
