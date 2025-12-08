import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Callout,
  Flex,
  Heading,
  Text,
  Badge,
  Tabs,
} from "@radix-ui/themes";
import {
  InfoCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";

/**
 * DeepBookV3 Staking & Governance
 * - Stake DEEP tokens in pools
 * - Submit governance proposals (fee changes, stake requirements)
 * - Vote on proposals
 * - Claim trading fee rebates
 * - Unstake and withdraw
 */
export function DeepBookV3Staking() {
  const [activeTab, setActiveTab] = useState<
    "stake" | "governance" | "rewards"
  >("stake");
  const [poolId, setPoolId] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [status, setStatus] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  // Stake operations
  const handleStake = async () => {
    if (!poolId || !stakeAmount) {
      setStatus("❌ Pool ID and stake amount required");
      return;
    }
    setStatus(`⏳ Staking ${stakeAmount} DEEP in pool...`);
    setIsBusy(true);
    try {
      // Placeholder: In real usage
      // const tx = new Transaction();
      // dbClient.pool.stake(poolId, stakeAmount)(tx);
      // await suiClient.signAndExecuteTransaction({...});
      setStatus(`✅ Staked ${stakeAmount} DEEP (placeholder - connect wallet for execution)`);
    } catch (err) {
      setStatus(`❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsBusy(false);
    }
  };

  const handleUnstake = async () => {
    if (!poolId) {
      setStatus("❌ Pool ID required");
      return;
    }
    setStatus(`⏳ Unstaking all DEEP from pool...`);
    setIsBusy(true);
    try {
      // Placeholder
      // const tx = new Transaction();
      // dbClient.pool.unstake(poolId)(tx);
      setStatus(`✅ Unstaked all DEEP (placeholder - connect wallet for execution)`);
    } catch (err) {
      setStatus(`❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsBusy(false);
    }
  };

  const handleClaimRebates = async () => {
    if (!poolId) {
      setStatus("❌ Pool ID required");
      return;
    }
    setStatus(`⏳ Claiming trading fee rebates...`);
    setIsBusy(true);
    try {
      // Placeholder
      // const tx = new Transaction();
      // dbClient.pool.claimRebates(poolId)(tx);
      setStatus(`✅ Claimed rebates (placeholder - connect wallet for execution)`);
    } catch (err) {
      setStatus(`❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Card size="3" style={{ marginTop: "20px" }}>
      <Flex direction="column" gap="4">
        {/* Header */}
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <Badge color="purple">Staking & Governance</Badge>
            <Heading size="5">DeepBook Pool Governance</Heading>
          </Flex>
        </Flex>

        {/* Info */}
        <Callout.Root>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Each DeepBook pool has <strong>independent governance</strong>. Stake DEEP tokens
            to participate in governance and earn trading fee rebates. Governance votes happen
            every epoch.
          </Callout.Text>
        </Callout.Root>

        {/* Overview */}
        <Box>
          <Text weight="bold" size="3" style={{ marginBottom: "8px" }}>
            🏛️ How It Works
          </Text>
          <Flex direction="column" gap="2" style={{ fontSize: "13px", color: "var(--gray-11)" }}>
            <Flex gap="2" align="start">
              <Badge>1</Badge>
              <Text>
                <strong>Stake DEEP:</strong> Lock DEEP tokens in a pool's balance manager (becomes
                active next epoch)
              </Text>
            </Flex>
            <Flex gap="2" align="start">
              <Badge>2</Badge>
              <Text>
                <strong>Reduce Fees:</strong> If your stake ≥ required stake, earn maker/taker
                fee rebates
              </Text>
            </Flex>
            <Flex gap="2" align="start">
              <Badge>3</Badge>
              <Text>
                <strong>Submit Proposal:</strong> Propose changes to taker fee, maker fee, or
                stake requirement (one per user/epoch)
              </Text>
            </Flex>
            <Flex gap="2" align="start">
              <Badge>4</Badge>
              <Text>
                <strong>Vote:</strong> Cast your voting power on proposals (all power on one proposal)
              </Text>
            </Flex>
            <Flex gap="2" align="start">
              <Badge>5</Badge>
              <Text>
                <strong>Claim Rebates:</strong> Withdraw accumulated trading fee rebates at epoch
                end
              </Text>
            </Flex>
          </Flex>
        </Box>

        {/* Tabs */}
        <Tabs.Root
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          aria-label="DeepBook staking and governance options"
        >
          <Tabs.List>
            <Tabs.Trigger value="stake">Stake & Unstake</Tabs.Trigger>
            <Tabs.Trigger value="governance">Governance</Tabs.Trigger>
            <Tabs.Trigger value="rewards">Rewards & Rebates</Tabs.Trigger>
          </Tabs.List>

          {/* Stake Tab */}
          <Tabs.Content value="stake" style={{ marginTop: "16px" }}>
            <Flex direction="column" gap="3">
              <Box>
                <Text weight="bold" size="2">
                  Pool ID
                </Text>
                <input
                  type="text"
                  placeholder="Pool address (0x...)"
                  value={poolId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPoolId(e.target.value)
                  }
                  disabled={isBusy}
                  style={{
                    marginTop: "8px",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid var(--gray-a7)",
                    width: "100%",
                  }}
                />
              </Box>

              <Box>
                <Text weight="bold" size="2">
                  DEEP Amount to Stake
                </Text>
                <input
                  type="number"
                  placeholder="Amount in DEEP"
                  value={stakeAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setStakeAmount(e.target.value)
                  }
                  disabled={isBusy}
                  style={{
                    marginTop: "8px",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid var(--gray-a7)",
                    width: "100%",
                  }}
                />
                <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                  ✓ Must be available in your BalanceManager
                </Text>
              </Box>

              <Flex gap="2" wrap="wrap">
                <Button
                  onClick={handleStake}
                  disabled={isBusy || !poolId || !stakeAmount}
                  color="green"
                >
                  Stake DEEP
                </Button>
                <Button
                  onClick={handleUnstake}
                  disabled={isBusy || !poolId}
                  color="red"
                  variant="soft"
                >
                  Unstake All
                </Button>
              </Flex>

              <Callout.Root color="orange">
                <Callout.Icon>
                  <ExclamationTriangleIcon />
                </Callout.Icon>
                <Callout.Text size="1">
                  <strong>Epoch Timing:</strong> Stake becomes active in the <strong>next epoch</strong>
                  . Unstaking removes active and pending stake, forfeits pending rebates.
                </Callout.Text>
              </Callout.Root>
            </Flex>
          </Tabs.Content>

          {/* Governance Tab */}
          <Tabs.Content value="governance" style={{ marginTop: "16px" }}>
            <Flex direction="column" gap="3">
              <Box
                style={{
                  padding: "12px",
                  backgroundColor: "var(--blue-a2)",
                  borderRadius: "6px",
                  borderLeft: "4px solid var(--blue-9)",
                }}
              >
                <Text weight="bold" size="2">
                  ℹ️ Governance Features (UI Placeholder)
                </Text>
                <Text size="1" color="gray" style={{ marginTop: "8px" }}>
                  This UI demonstrates the governance flow. Real implementation requires
                  DeepBookClient integration and wallet connection.
                </Text>
              </Box>

              <Box>
                <Text weight="bold" size="2" style={{ marginBottom: "8px" }}>
                  1️⃣ Submit Proposal
                </Text>
                <Flex direction="column" gap="2">
                  <input
                    type="text"
                    placeholder="Pool ID"
                    disabled={isBusy}
                    style={{
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid var(--gray-a7)",
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Proposed Taker Fee (bps, e.g., 25)"
                    disabled={isBusy}
                    style={{
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid var(--gray-a7)",
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Proposed Maker Fee (bps, e.g., -15)"
                    disabled={isBusy}
                    style={{
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid var(--gray-a7)",
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Proposed Stake Required (DEEP)"
                    disabled={isBusy}
                    style={{
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid var(--gray-a7)",
                    }}
                  />
                  <Button disabled={isBusy}>Submit Proposal (1 per user/epoch)</Button>
                </Flex>
              </Box>

              <Box>
                <Text weight="bold" size="2" style={{ marginBottom: "8px" }}>
                  2️⃣ Vote on Proposal
                </Text>
                <Flex direction="column" gap="2">
                  <input
                    type="text"
                    placeholder="Proposal ID"
                    disabled={isBusy}
                    style={{
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid var(--gray-a7)",
                    }}
                  />
                  <Text size="1" color="gray">
                    💡 Your entire stake becomes voting power on one proposal
                  </Text>
                  <Button disabled={isBusy}>Cast Vote</Button>
                </Flex>
              </Box>

              <Callout.Root color="yellow">
                <Callout.Icon>
                  <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text size="1">
                  <strong>Governance Constraints:</strong> One proposal per user per epoch. If max
                  proposals reached, lowest-voted is removed. Voting power = your staked DEEP.
                </Callout.Text>
              </Callout.Root>
            </Flex>
          </Tabs.Content>

          {/* Rewards Tab */}
          <Tabs.Content value="rewards" style={{ marginTop: "16px" }}>
            <Flex direction="column" gap="3">
              <Box
                style={{
                  padding: "12px",
                  backgroundColor: "var(--green-a2)",
                  borderRadius: "6px",
                  borderLeft: "4px solid var(--green-9)",
                }}
              >
                <Text weight="bold" size="2">
                  💰 Fee Rebates & Rewards
                </Text>
                <Text size="1" color="gray" style={{ marginTop: "8px" }}>
                  If your staked DEEP ≥ pool's required stake, you earn maker/taker fee rebates
                  during that epoch. Claim rebates at the end of each epoch.
                </Text>
              </Box>

              <Flex direction="column" gap="2">
                <input
                  type="text"
                  placeholder="Pool ID"
                  disabled={isBusy}
                  style={{
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid var(--gray-a7)",
                  }}
                />
                <Button
                  onClick={handleClaimRebates}
                  disabled={isBusy}
                  color="green"
                >
                  Claim Trading Fee Rebates
                </Button>
              </Flex>

              <Box
                style={{
                  padding: "12px",
                  backgroundColor: "var(--gray-a2)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                }}
              >
                <div><strong>Rebate Calculation:</strong></div>
                <div style={{ marginTop: "8px" }}>
                  Maker Fee Rebate = maker_fee × trading_volume
                </div>
                <div>Taker Fee Discount = (taker_fee × trading_volume) × reduction_rate</div>
                <div style={{ marginTop: "8px", color: "var(--gray-11)" }}>
                  (Requires stake ≥ stake_required to activate)
                </div>
              </Box>

              <Callout.Root color="orange">
                <Callout.Icon>
                  <ExclamationTriangleIcon />
                </Callout.Icon>
                <Callout.Text size="1">
                  <strong>Rebate Timing:</strong> Rebates are calculated per epoch. Unstaking
                  forfeits pending rebates for that epoch.
                </Callout.Text>
              </Callout.Root>
            </Flex>
          </Tabs.Content>
        </Tabs.Root>

        {/* Status */}
        {status && (
          <Box
            style={{
              padding: "12px",
              backgroundColor: status.includes("❌")
                ? "var(--red-a2)"
                : status.includes("✅")
                  ? "var(--green-a2)"
                  : "var(--blue-a2)",
              borderRadius: "6px",
              borderLeft: `4px solid ${
                status.includes("❌")
                  ? "var(--red-9)"
                  : status.includes("✅")
                    ? "var(--green-9)"
                    : "var(--blue-9)"
              }`,
            }}
          >
            <Text size="2">{status}</Text>
          </Box>
        )}

        {/* Code Reference */}
        <Box>
          <Text weight="bold" size="2" style={{ marginBottom: "8px" }}>
            Code Reference
          </Text>
          <Box
            style={{
              padding: "12px",
              backgroundColor: "var(--gray-a2)",
              borderRadius: "6px",
              fontSize: "11px",
              fontFamily: "monospace",
              overflowX: "auto",
            }}
          >
            <div>{`// Stake DEEP in pool`}</div>
            <div>const tx = new Transaction();</div>
            <div>dbClient.pool.stake(poolId, stakeAmount)(tx);</div>
            <div></div>
            <div>{`// Unstake all`}</div>
            <div>dbClient.pool.unstake(poolId)(tx);</div>
            <div></div>
            <div>{`// Submit governance proposal`}</div>
            <div>{"dbClient.governance.submitProposal(poolId, {"}</div>
            <div>&nbsp;&nbsp;takerFee: 25,</div>
            <div>&nbsp;&nbsp;makerFee: -15,</div>
            <div>&nbsp;&nbsp;stakeRequired: 1000</div>
            <div>{"})(tx);"}</div>
            <div></div>
            <div>{`// Vote on proposal`}</div>
            <div>dbClient.governance.vote(proposalId)(tx);</div>
            <div></div>
            <div>{`// Claim trading fee rebates`}</div>
            <div>dbClient.pool.claimRebates(poolId)(tx);</div>
          </Box>
        </Box>
      </Flex>
    </Card>
  );
}
