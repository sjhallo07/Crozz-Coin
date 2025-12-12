import { Box, Callout, Heading, Separator, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

/**
 * DeepBookV3 staking & governance overview from https://docs.sui.io/standards/deepbookv3/staking-governance.
 */
export function StakingGovernanceInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">Staking & Governance (DeepBookV3)</Heading>
      <Text size="2" color="gray" mb="3">
        Per-pool governance over three params: taker fee, maker fee, stake required. Stake DEEP in a pool to earn fee
        discounts and maker rebates, and to propose/vote each epoch.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Stake / Unstake</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2">Stake: DEEP must be in <strong>BalanceManager</strong>; becomes active next epoch. Active stake ≥ stake_required unlocks reduced taker fees and maker rebate eligibility.</Text></div>
          <div><Text size="2">Unstake: removes all active/inactive stake, clears votes, forfeits maker rebates for the epoch, and disables reduced taker fees for the remainder. Funds return to BalanceManager immediately.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Proposals</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2">One proposal per BalanceManager per epoch; submitting also casts your vote.</Text></div>
          <div><Text size="2">Must have non-zero active stake; if max proposals reached, the lowest-vote proposal is evicted. If your voting power is below that floor, proposal is rejected.</Text></div>
          <div><Text size="2">Params proposed: taker_fee, maker_fee, stake_required (per pool).</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Voting</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2">Non-zero voting power required (depends on staked DEEP per governance formula).</Text></div>
          <div><Text size="2">All voting power goes to a single proposal; re-voting moves your prior vote.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Rebates</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2">Claim rebates for the BalanceManager if available. Requires rewards to claim; updates BalanceManager with claimed amounts.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="amber">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Stakes activate next epoch—plan ahead. Unstaking mid-epoch forfeits maker rebates and fee discounts. Ensure
          BalanceManager holds enough DEEP before proposing, voting, or claiming rebates.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
