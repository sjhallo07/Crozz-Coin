# Staking & Governance API Reference Card

## Quick API Reference

### Transaction Builders

#### StakingTransactionBuilder

```typescript
import { StakingTransactionBuilder, toOnChainAmount } from '@/lib/stakingSDK';

const builder = new StakingTransactionBuilder(config);

// Stake tokens
tx = builder.buildStakeTransaction(tx, toOnChainAmount(100), CLOCK_ID);

// Unstake
tx = builder.buildUnstakeTransaction(tx, stakeId, CLOCK_ID);

// Claim rewards
tx = builder.buildClaimRewardsTransaction(tx, stakeId, CLOCK_ID);

// Calculate rewards
const rewards = builder.calculateRewards(BigInt(1_000_000), 24*60*60*1000);

// Get APY
const apy = builder.getAPY(); // returns 5
```

#### GovernanceTransactionBuilder

```typescript
import { GovernanceTransactionBuilder } from '@/lib/stakingSDK';

const governor = new GovernanceTransactionBuilder(config);

// Create proposal
tx = governor.buildCreateProposalTransaction(
  tx,
  'Increase APY',
  'Proposal description',
  'parameter',
  stakeId,
  CLOCK_ID
);

// Vote
tx = governor.buildVoteTransaction(tx, proposalId, stakeId, true, CLOCK_ID);

// Finalize
tx = governor.buildFinalizeProposalTransaction(tx, proposalId, CLOCK_ID);

// Update parameter
tx = governor.buildUpdateParameterTransaction(
  tx,
  paramsId,
  'reward_rate',
  7 // new value
);
```

### Query Helpers

#### StakingQueryHelper

```typescript
import { StakingQueryHelper } from '@/lib/stakingSDK';

const query = new StakingQueryHelper(client, config);

// Get total staked
const total = await query.getTotalStaked();

// Get user stakes
const stakes = await query.getUserStakes(address);

// Get user rewards
const rewards = await query.getUserRewards(address);
```

#### GovernanceQueryHelper

```typescript
import { GovernanceQueryHelper } from '@/lib/stakingSDK';

const govQuery = new GovernanceQueryHelper(client, config);

// Get active proposals
const proposals = await govQuery.getActiveProposals();

// Get user votes
const votes = await govQuery.getUserVotes(address);

// Get proposal details
const proposal = await govQuery.getProposalDetails(proposalId);
```

### Utility Functions

```typescript
import {
  formatAmount,
  toOnChainAmount,
  calculateVotingPower,
  canExecuteProposal,
  getProposalOutcome,
} from '@/lib/stakingSDK';

// Format (on-chain to display)
const displayAmount = formatAmount(BigInt(5_000_000), 6); // 5

// Convert (display to on-chain)
const onChainAmount = toOnChainAmount(100, 6); // BigInt

// Voting power = stake amount
const power = calculateVotingPower(BigInt(1_000_000)); // BigInt

// Check if proposal ready
if (canExecuteProposal(proposal)) { /* ... */ }

// Get outcome
const { passed, supportPercentage } = getProposalOutcome(proposal);
```

### Type Definitions

```typescript
// Staking
interface StakeRecord {
  id: string;
  owner: string;
  amount: bigint;
  stakedTimestamp: number;
  lastRewardClaim: number;
  pendingRewards: bigint;
}

// Governance
interface ProposalRecord {
  id: string;
  proposer: string;
  title: string;
  description: string;
  proposalType: ProposalType;
  votesFor: bigint;
  votesAgainst: bigint;
  createdTimestamp: number;
  votingEndTimestamp: number;
  executionTimestamp: number;
  status: ProposalStatus;
  minVotingPowerRequired: bigint;
}

interface VoteRecord {
  id: string;
  voter: string;
  proposalId: string;
  vote: boolean; // true = for
  votingPower: bigint;
  voteTimestamp: number;
}

// Configuration
interface StakingConfig {
  packageId: string;
  poolAddress: string;
  minStakeAmount: bigint;
  rewardRate: number;
}

// Enums
type ProposalType = 'parameter' | 'feature' | 'emergency';

enum ProposalStatus {
  Pending = 0,
  Active = 1,
  Passed = 2,
  Rejected = 3,
  Executed = 4,
}
```

## Common Patterns

### Complete Staking Flow

```typescript
// 1. Stake tokens
let tx = new Transaction();
tx = stakingBuilder.buildStakeTransaction(tx, toOnChainAmount(100), CLOCK_ID);
const stakeResult = await signAndExecute({ transaction: tx });
const stakeId = stakeResult.objectChanges[0].objectId;

// 2. Wait for rewards to accrue (monitor off-chain)

// 3. Claim rewards
tx = new Transaction();
tx = stakingBuilder.buildClaimRewardsTransaction(tx, stakeId, CLOCK_ID);
await signAndExecute({ transaction: tx });

// 4. Unstake
tx = new Transaction();
tx = stakingBuilder.buildUnstakeTransaction(tx, stakeId, CLOCK_ID);
await signAndExecute({ transaction: tx });
```

### Complete Governance Flow

```typescript
// 1. Create proposal
let tx = new Transaction();
tx = governanceBuilder.buildCreateProposalTransaction(
  tx,
  'Increase APY to 7%',
  'Boost rewards for stakers',
  'parameter',
  stakeId,
  CLOCK_ID
);
const proposalResult = await signAndExecute({ transaction: tx });
const proposalId = proposalResult.objectChanges[0].objectId;

// 2. Vote (requires staking)
tx = new Transaction();
tx = governanceBuilder.buildVoteTransaction(tx, proposalId, stakeId, true, CLOCK_ID);
await signAndExecute({ transaction: tx });

// 3. Wait for voting period (7 days)

// 4. Finalize proposal
tx = new Transaction();
tx = governanceBuilder.buildFinalizeProposalTransaction(tx, proposalId, CLOCK_ID);
await signAndExecute({ transaction: tx });

// 5. Execute if passed (2 day delay)
tx = new Transaction();
tx = governanceBuilder.buildUpdateParameterTransaction(
  tx,
  paramsId,
  'reward_rate',
  7
);
await signAndExecute({ transaction: tx });
```

### React Component Integration

```typescript
import StakingGovernance from '@/components/StakingGovernance';

export function StakingPage() {
  return (
    <div>
      <h1>Staking & Governance</h1>
      <StakingGovernance />
    </div>
  );
}
```

## Configuration Template

```typescript
// src/config/staking.ts
import { StakingConfig } from '@/lib/stakingSDK';

export const STAKING_CONFIG: StakingConfig = {
  packageId: '0x...', // From deployment
  poolAddress: '0x...', // From initialization
  minStakeAmount: BigInt(1_000_000), // 1 CROZ
  rewardRate: 5, // 5% APY
};

export const CLOCK_OBJECT_ID = '0x6'; // Sui clock
```

## Error Codes

| Code | Error | Solution |
|------|-------|----------|
| 0 | E_INVALID_STAKE_AMOUNT | Stake must be >= 1 CROZ |
| 1 | E_INSUFFICIENT_STAKE | Need more staked to propose |
| 2 | E_INVALID_PROPOSAL_ID | Proposal doesn't exist |
| 3 | E_PROPOSAL_EXPIRED | Voting period ended |
| 4 | E_NOT_STAKER | Not stake owner |
| 5 | E_ALREADY_VOTED | Already voted on proposal |
| 6 | E_INVALID_VOTING_POWER | No voting power |
| 7 | E_PROPOSAL_NOT_ACTIVE | Proposal not voting |

## Event Types

```typescript
// Emitted on stake
event StakeEvent {
  staker: address,
  amount: u64,
  timestamp: u64,
}

// Emitted on unstake
event UnstakeEvent {
  staker: address,
  amount: u64,
  rewards_claimed: u64,
  timestamp: u64,
}

// Emitted on claim
event RewardClaimedEvent {
  staker: address,
  reward_amount: u64,
  timestamp: u64,
}

// Emitted on proposal creation
event ProposalCreatedEvent {
  proposal_id: ID,
  proposer: address,
  title: String,
  proposal_type: u8,
  voting_end_timestamp: u64,
}

// Emitted on vote
event VoteSubmittedEvent {
  proposal_id: ID,
  voter: address,
  vote: bool,
  voting_power: u64,
}

// Emitted on finalize
event ProposalExecutedEvent {
  proposal_id: ID,
  status: u8,
  timestamp: u64,
}
```

## Gas Estimates

| Operation | Gas | Time |
|-----------|-----|------|
| Stake | 2-3M | ~1s |
| Unstake | 2M | ~1s |
| Claim | 2M | ~1s |
| Propose | 3-4M | ~1s |
| Vote | 2M | ~1s |
| Finalize | 2-3M | ~1s |

## Constants

| Constant | Value | Notes |
|----------|-------|-------|
| MIN_STAKE_AMOUNT | 1 CROZ | Minimum to stake |
| REWARD_RATE | 5% | Annual percentage yield |
| VOTING_PERIOD | 7 days | Proposal voting window |
| EXECUTION_DELAY | 2 days | After passing, before execute |
| TAKER_FEE | 0.5% | 50 basis points |
| MAKER_FEE | 0.25% | 25 basis points |
| QUORUM | 1M votes | Minimum to count |

## Helpful Links

- **Sui Docs**: https://docs.sui.io
- **Sui SDK**: https://github.com/MystenLabs/sui
- **Move Book**: https://move-language.github.io/move/

---

**API Version**: 1.0.0
**Last Updated**: December 12, 2025
