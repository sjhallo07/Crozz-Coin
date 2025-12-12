import { Box, Callout, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

/**
 * TokenPolicy overview + best practices for closed-loop tokens.
 */
export function TokenPolicyInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">TokenPolicy (Closed-Loop Token)</Heading>
      <Text size="2" color="gray" mb="3">
        Shared policy derived from <code>TreasuryCap</code>. It advertises allowed actions and rules so wallets/clients
        know what’s permitted. Create with <code>token::new_policy</code>, share via <code>token::share_policy</code>.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Core API</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2"><strong>new_policy</strong>(treasury_cap) → (TokenPolicy, TokenPolicyCap)</Text></div>
          <div><Text size="2"><strong>share_policy</strong>(policy)</Text></div>
          <div><Text size="2"><strong>allow / disallow</strong>(policy, cap, action: String)</Text></div>
          <div><Text size="2"><strong>add_rule_for_action / remove_rule_for_action</strong>(policy, cap, action, Rule)</Text></div>
          <div><Text size="2"><strong>confirm_request / confirm_request_mut</strong> (for ActionRequest, spend uses *_mut)</Text></div>
          <div><Text size="2"><strong>flush</strong>(policy, treasury_cap) to consume spent balances</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Design & rule tips</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2">Keep actions explicit: default is deny; call <code>allow</code> per action you want public.</Text></div>
          <div><Text size="2">Attach rules per action (allowlist/denylist, spending limits, KYC, service scopes).</Text></div>
          <div><Text size="2">Test confirm_request pass/fail paths for each rule combo before production.</Text></div>
          <div><Text size="2">If enabling to_coin/from_coin, guard with rules; otherwise you open the loop.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Operational best practices</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2">Separate capabilities: TreasuryCap for issuance/admin; TokenPolicyCap for policy changes.</Text></div>
          <div><Text size="2">Share the TokenPolicy; keep the TokenPolicyCap private (treat like prod secret).</Text></div>
          <div><Text size="2">Log/monitor policy updates (allow/disallow/rule changes); review before enabling new actions.</Text></div>
          <div><Text size="2">Use <code>flush</code> with TreasuryCap to handle spent balances if spend rules apply.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="yellow">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          TokenPolicy is discoverable once shared; TokenPolicyCap is powerful—protect it. Always pair allowed actions with
          rules when you need guardrails.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
