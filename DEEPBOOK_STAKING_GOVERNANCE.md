# DeepBook V3 Staking & Governance Integration

## Overview

DeepBook V3 implements a novel approach to governance where each pool has **independent governance** parameters and mechanisms. Users can stake DEEP tokens to participate in governance, earn trading fee rebates, and influence pool parameters.

**Documentation**: [https://docs.sui.io/standards/deepbookv3/staking-governance](https://docs.sui.io/standards/deepbookv3/staking-governance)

## Staking Mechanism

### Stake DEEP Tokens

**Flow**:

1. Deposit DEEP tokens into the pool's `BalanceManager`
2. Call `Pool.stake()` with the amount
3. Stake becomes **active in the following epoch**
4. If your stake ≥ `stake_required`, you earn maker/taker fee rebates that epoch

**Activation Timeline**:

- **Epoch N**: Call `stake()` → Stake is "pending"
- **Epoch N+1**: Stake becomes "active" → Fee rebates start accruing
- **Fee Reduction**: If your stake ≥ required stake, taker fees are reduced and maker fees are rebated

**Requirements**:

- DEEP tokens must be available in the `BalanceManager`
- One `BalanceManager` per user per pool

### Unstake

**Flow**:

1. Remove all active and inactive (pending) stake
2. Any casted votes are removed
3. Pending maker rebates for current epoch are **forfeited**
4. Reduced taker fees are immediately disabled
5. DEEP tokens return to `BalanceManager` immediately

**Important**: Unstaking mid-epoch forfeits that epoch's rebates. Plan unstaking for epoch boundaries if you want to claim all rewards.

## Governance System

### Key Parameters (Per Pool)

Each pool has three independent governance parameters:

1. **Taker Fee Rate** (bps - basis points)
   - Fee charged to makers when they initiate trades
   - Example: 25 bps = 0.25% fee

2. **Maker Fee Rate** (bps)
   - Incentive rebate for makers providing liquidity
   - Usually negative (rebate to maker)
   - Example: -15 bps = 0.15% rebate to maker

3. **Stake Required** (DEEP tokens)
   - Minimum stake balance needed to qualify for fee rebates
   - Example: 1,000 DEEP = must stake ≥1,000 DEEP to earn rebates

### Governance Timeline

- **Governance Window**: Every epoch (e.g., every 24 hours)
- **One Proposal Per User Per Epoch**: Each user/BalanceManager can submit maximum 1 proposal
- **Vote Duration**: Full epoch
- **Execution**: Winning proposal implements at next epoch boundary

### Submit Proposal

**Requirements**:

- Must have **non-zero active stake** in the pool
- Must have ≥ minimum voting power (usually your staked DEEP amount)
- **One proposal per user per epoch**

**Proposal Structure**:

```typescript
{
  takerFeeRate: number,        // New taker fee (bps)
  makerFeeRate: number,        // New maker fee rebate (bps)
  stakeRequired: number        // New minimum stake (DEEP)
}
```

**Maximum Proposals**:

- Pool can hold maximum number of active proposals per epoch
- If limit reached, lowest-voted proposal is removed
- New proposal must have more voting power than lowest-voted proposal to be added

**Auto-Vote**:

- User automatically votes for their own proposal

### Vote on Proposal

**Requirements**:

- Must have **non-zero active stake** in the pool
- Voting power = your staked DEEP amount

**Voting Rules**:

- **All voting power on one proposal**: You cannot split votes across proposals
- **One vote per epoch**: If you vote on Proposal A, then vote on Proposal B, your vote moves from A to B
- **Vote removal on unstake**: Unstaking removes your vote

**Vote Removal on Unstake**:

```
User stakes 1000 DEEP → votes for Proposal A (1000 voting power)
User unstakes → Vote removed, voting power = 0
```

## Rewards & Fee Rebates

### Earning Rebates

**Condition**: `your_stake >= pool.stake_required`

**Rebate Types**:

1. **Maker Fee Rebate**
   - Direct rebate on maker trades
   - Formula: `maker_fee_rebate × trading_volume`

2. **Taker Fee Discount**
   - Reduced taker fee on your trades
   - Formula: `taker_fee × trading_volume × discount_rate`

**Rebate Tracking**:

- Rebates accrue per epoch
- Stored in `BalanceManager.rebates`
- Claimable at epoch boundary

### Claim Rebates

**Flow**:

1. Call `Pool.claimRebates()`
2. All accumulated rebates transferred to `BalanceManager`
3. Rebate balance reset to 0

**Timing**:

- Can be claimed anytime after accrual
- Recommended: Claim at epoch boundary to ensure all rebates are finalized
- Claiming doesn't require unstaking

**Requirements**:

- `BalanceManager` must have accumulated rebates > 0
- Wallet must be connected to sign transaction

## Integration Example

### Setup Balance Manager

```typescript
import { Transaction } from "@mysten/sui/transactions";
import { DeepBookClient } from "@mysten/deepbook-v3";

const tx = new Transaction();
const client = new DeepBookClient(suiClient, dbAccount);

// Create BalanceManager for the user
const balanceManagerId = await client.BalanceManager.create()(tx);
```

### Stake DEEP

```typescript
const tx = new Transaction();

// Deposit DEEP into BalanceManager first
const deepCoinIds = /* ... get user's DEEP coin objects ... */;
client.BalanceManager.depositBalance(balanceManagerId, deepCoinIds)(tx);

// Stake in the pool
const poolId = "0x123..."; // Target pool
const stakeAmount = 1000_000_000_000; // 1000 DEEP (12 decimals)
client.Pool.stake(poolId, stakeAmount, balanceManagerId)(tx);

await suiClient.signAndExecuteTransaction({ transaction: tx, signer: dbAccount });
```

### Submit Governance Proposal

```typescript
const tx = new Transaction();

client.Governance.submitProposal(poolId, {
  takerFeeRate: 25,        // 25 bps = 0.25%
  makerFeeRate: -15,       // -15 bps rebate
  stakeRequired: 1000_000_000_000 // 1000 DEEP
}, balanceManagerId)(tx);

await suiClient.signAndExecuteTransaction({ transaction: tx, signer: dbAccount });
```

### Vote on Proposal

```typescript
const tx = new Transaction();

const proposalId = "0x456..."; // Target proposal
client.Governance.vote(proposalId, balanceManagerId)(tx);

await suiClient.signAndExecuteTransaction({ transaction: tx, signer: dbAccount });
```

### Claim Rebates

```typescript
const tx = new Transaction();

client.Pool.claimRebates(poolId, balanceManagerId)(tx);

await suiClient.signAndExecuteTransaction({ transaction: tx, signer: dbAccount });
```

## UI Component: DeepBookV3Staking

Located in `src/components/DeepBookV3Staking.tsx`

**Features**:

- ✅ Stake/Unstake interface
- ✅ Governance proposal submission UI
- ✅ Vote on proposals UI
- ✅ Claim rebates button
- ✅ Status feedback
- ✅ Code reference examples

**Tabs**:

1. **Stake & Unstake**: Manage your stake in a pool
2. **Governance**: Submit proposals and vote
3. **Rewards & Rebates**: Claim accumulated rebates

### Usage

```typescript
import { DeepBookV3Staking } from "@/components/DeepBookV3Staking";

function MyPage() {
  return <DeepBookV3Staking />;
}
```

## Pool Parameters Reference

### Common Pool Configurations

**Conservative Pool** (DeFi beginners):

- Taker Fee: 50 bps (0.50%)
- Maker Fee: -20 bps (0.20% rebate)
- Stake Required: 100 DEEP

**Liquid Pool** (Active trading):

- Taker Fee: 25 bps (0.25%)
- Maker Fee: -10 bps (0.10% rebate)
- Stake Required: 500 DEEP

**Incentivized Pool** (Market-making focus):

- Taker Fee: 10 bps (0.10%)
- Maker Fee: -50 bps (0.50% rebate)
- Stake Required: 2000 DEEP

## Best Practices

### Staking Strategy

1. **Monitor Stake Required**
   - Check pool's current `stake_required` before staking
   - Your stake must be ≥ required to earn rebates
   - Proposal changes can increase/decrease requirement

2. **Epoch Boundaries**
   - Plan stake/unstake for epoch boundaries if possible
   - Unstaking mid-epoch forfeits that epoch's rebates
   - Claim rebates after epoch completes to ensure finalization

3. **Voting Power**
   - Your voting power = your active staked DEEP
   - Unstaking removes your vote completely
   - Large stakes have more influence on governance

### Governance Strategy

1. **Analyze Proposals**
   - Review current pool parameters before voting
   - Evaluate impact of proposed fee changes
   - Consider maker vs. taker impacts

2. **Fee Impact Analysis**
   - Lower taker fees = Better for traders
   - Higher maker fees (more negative) = Better for liquidity providers
   - Trade-off: Tight spreads attract volume but reduce individual rebates

3. **Stake Required Strategy**
   - High requirement = Easier to qualify for rebates (fewer competitors)
   - Low requirement = More competitors but more stakers vote
   - Vote based on your trading volume and strategy

## Risks & Considerations

### Governance Risks

1. **Vote Removal on Unstake**
   - Unstaking removes your vote immediately
   - Vote power is not refundable if proposal changes after your vote

2. **Proposal Maximum Limit**
   - If max proposals reached, yours may not be added
   - Requires more voting power than lowest-voted proposal
   - Better to coordinate with others for larger stakes

3. **Parameter Volatility**
   - Fee rates can change every epoch
   - Stake requirement can increase (harder to qualify)
   - Monitor pool governance frequently

### Trading Risks

1. **Rebate Timing Lag**
   - Rebates accrue over epoch but are claimable after epoch ends
   - Delayed rebate realization
   - Plan cashflow accordingly

2. **Impermanent Loss (AMM Pools)**
   - If using rebates for market-making, consider IL risk
   - DeepBook is AMM-free order book, but strategy depends on pool type
   - Monitor asset prices vs. your staked position

3. **Unstaking Penalties**
   - Unstaking mid-epoch forfeits all pending rebates
   - No recovery of forfeited amounts
   - Plan withdrawals carefully

## Troubleshooting

### "Must have non-zero active stake"

- **Cause**: Your stake hasn't activated yet (submit at wrong epoch)
- **Fix**: Wait for next epoch, then submit proposal/vote
- **Verify**: Check `BalanceManager.active_stake` field

### "Proposal not added - insufficient voting power"

- **Cause**: More proposals exist with higher voting power
- **Fix**: Stake more DEEP or wait for lower-power proposals to complete
- **Check**: Query pool's max proposals and current proposals

### "Cannot unstake - insufficient balance"

- **Cause**: `BalanceManager` doesn't have expected DEEP amount
- **Fix**: Verify DEEP deposited and not allocated elsewhere
- **Debug**: Check `BalanceManager.balance[DEEP]` field

### "Vote removed unexpectedly"

- **Cause**: You (or someone controlling account) unstaked
- **Fix**: Re-stake and re-submit vote
- **Note**: Votes don't accumulate; changing vote cancels previous vote

## Related Resources

- **Repository**: <https://github.com/MystenLabs/deepbookv3>
- **Documentation**: <https://docs.sui.io/standards/deepbookv3/staking-governance>
- **Design Docs**: <https://docs.sui.io/standards/deepbookv3/design#governance>
- **TS SDK**: <https://github.com/MystenLabs/ts-sdks>

## Summary

DeepBook V3 staking and governance provides a unique mechanism for community-driven pool parameter management. Users stake DEEP to:

- Earn trading fee rebates
- Participate in governance voting
- Submit proposals for fee/stake changes

Each pool operates independently, allowing different governance strategies and fee structures to emerge based on user preferences and market conditions.
