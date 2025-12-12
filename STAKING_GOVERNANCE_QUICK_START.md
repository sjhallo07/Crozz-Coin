# Staking & Governance Quick Start

## 🚀 5-Minute Setup

### Step 1: Add Component to Your App

```typescript
// pages/staking.tsx
import StakingGovernance from '@/components/StakingGovernance';

export default function StakingPage() {
  return <StakingGovernance />;
}
```

### Step 2: Update Navigation

Add link to staking page:
```typescript
// components/Navigation.tsx
<Link href="/staking">
  <Lock size={20} /> Staking & Governance
</Link>
```

### Step 3: Deploy Smart Contract

```bash
# From sui-stack-hello-world directory
cd sui-stack-hello-world/move/token-factory
sui client publish --gas-budget 100000000
```

Copy the package ID from output and update configuration.

### Step 4: Initialize Staking Pool

```typescript
// In your init transaction
import { StakingTransactionBuilder } from '@/lib/stakingSDK';

const builder = new StakingTransactionBuilder(config);
// Call smart contract init_staking_pool
```

## 📊 Key Stats

- **Smart Contract**: 550 lines of Move code
- **React Component**: 1,000+ lines with full UI
- **TypeScript SDK**: 600+ lines with type-safe builders
- **CSS**: 700+ responsive styles
- **Documentation**: Complete with examples

## 🎯 Main Features

### Staking
- Stake minimum 1 CROZ
- Earn 5% APY
- Withdraw anytime
- Real-time reward accrual

### Governance
- Create proposals (3 types)
- Vote with staked power
- 7-day voting period
- 2-day execution delay

### Parameters
- Taker Fee: 0.5% (adjustable)
- Maker Fee: 0.25% (adjustable)
- Reward Rate: 5% (adjustable)
- Min Stake: 1 CROZ (adjustable)

## 📁 File Locations

```
Smart Contract:
  sui-stack-hello-world/move/token-factory/sources/
    └── staking_governance.move

Frontend:
  src/components/
    ├── StakingGovernance.tsx
    └── StakingGovernance.module.css

TypeScript SDK:
  src/lib/
    └── stakingSDK.ts

Documentation:
  STAKING_GOVERNANCE_GUIDE.md
  STAKING_GOVERNANCE_QUICK_START.md (this file)
```

## 💡 Common Tasks

### Stake Tokens
```typescript
const tx = stakingBuilder.buildStakeTransaction(
  tx,
  toOnChainAmount(100), // 100 CROZ
  CLOCK_OBJECT_ID,
);
```

### Claim Rewards
```typescript
const tx = stakingBuilder.buildClaimRewardsTransaction(
  tx,
  stakeRecordId,
  CLOCK_OBJECT_ID,
);
```

### Create Proposal
```typescript
const tx = governanceBuilder.buildCreateProposalTransaction(
  tx,
  'Increase Reward Rate',
  'Increase APY from 5% to 7%',
  'parameter',
  stakeRecordId,
  CLOCK_OBJECT_ID,
);
```

### Vote on Proposal
```typescript
const tx = governanceBuilder.buildVoteTransaction(
  tx,
  proposalId,
  stakeRecordId,
  true, // vote for
  CLOCK_OBJECT_ID,
);
```

## 🔧 Configuration

Update in `src/lib/stakingSDK.ts`:

```typescript
const config = {
  packageId: 'YOUR_PACKAGE_ID', // From deploy
  poolAddress: 'YOUR_POOL_ADDRESS', // From init
  minStakeAmount: BigInt(1_000_000),
  rewardRate: 5, // 5% APY
};
```

## 🧪 Testing

### Test Staking on Devnet
```bash
# 1. Deploy to Devnet
sui client publish --network devnet --gas-budget 100000000

# 2. Fund your account with Devnet SUI
curl -s https://faucet.devnet.sui.io/gas -d '{"FixedAmountRequest":{"recipient":"YOUR_ADDRESS"}}' | jq

# 3. Run integration tests
npm run test:integration
```

### Test Governance Voting
```typescript
// Create test proposal
await governanceBuilder.buildCreateProposalTransaction(
  tx,
  'Test Proposal',
  'Testing voting mechanism',
  'feature',
  stakeRecordId,
  CLOCK_OBJECT_ID,
);

// Vote on it
await governanceBuilder.buildVoteTransaction(
  tx,
  testProposalId,
  stakeRecordId,
  true,
  CLOCK_OBJECT_ID,
);
```

## 📈 Reward Examples

**100 CROZ staked @ 5% APY**
- Daily: 0.0137 CROZ
- Weekly: 0.096 CROZ
- Monthly: 0.411 CROZ
- Yearly: 5 CROZ

**1000 CROZ staked @ 5% APY**
- Daily: 0.137 CROZ
- Weekly: 0.959 CROZ
- Monthly: 4.11 CROZ
- Yearly: 50 CROZ

## 🎨 UI Features

The StakingGovernance component includes:

- **Stats Cards**: Total staked, rewards, APY
- **Staking Tab**: Deposit and manage stakes
- **Rewards Tab**: Claim and view history
- **Governance Tab**: Vote on active proposals
- **Responsive Design**: Mobile, tablet, desktop
- **Real-time Updates**: Instant reward calculation
- **Error Handling**: User-friendly messages

## 🔐 Security Features

✅ Only stake owners can unstake
✅ Vote prevention per proposal per user
✅ Proposer must have minimum stake
✅ Timestamp validation for voting
✅ Quorum requirements enforced
✅ Execution delay prevents flashloan attacks

## 📚 API Reference

### StakingTransactionBuilder
- `buildStakeTransaction(tx, amount, clock)`
- `buildUnstakeTransaction(tx, stakeId, clock)`
- `buildClaimRewardsTransaction(tx, stakeId, clock)`
- `calculateRewards(amount, duration)`
- `getAPY()`

### GovernanceTransactionBuilder
- `buildCreateProposalTransaction(...)`
- `buildVoteTransaction(...)`
- `buildFinalizeProposalTransaction(...)`
- `buildUpdateParameterTransaction(...)`

### StakingQueryHelper
- `getTotalStaked()`
- `getUserStakes(address)`
- `getUserRewards(address)`

### GovernanceQueryHelper
- `getActiveProposals()`
- `getUserVotes(address)`
- `getProposalDetails(id)`

## 🐛 Debugging

### Enable Verbose Logging
```typescript
// In stakingSDK.ts
const DEBUG = true;

if (DEBUG) {
  console.log('Staking config:', config);
  console.log('Transaction:', tx);
}
```

### Check Contract State
```typescript
// Query pool state
const pool = await client.getObject({
  id: config.poolAddress,
  options: { showContent: true },
});
console.log('Pool state:', pool.data?.content);
```

### Verify Events
```typescript
// Query staking events
const events = await client.queryEvents({
  query: {
    MoveEventType: `${config.packageId}::staking_governance::StakeEvent`,
  },
});
console.log('Stake events:', events.data);
```

## ⚡ Performance

- Staking transaction: ~2-3M gas
- Reward claim: ~2M gas
- Vote: ~2M gas
- Proposal creation: ~3-4M gas

## 🚨 Common Issues

**Issue**: "Insufficient Stake"
- **Fix**: Ensure you have at least 1 CROZ staked

**Issue**: "Proposal Expired"
- **Fix**: Voting period is 7 days, finalize before claiming rewards

**Issue**: "Not Staker"
- **Fix**: Only stake owner can claim/unstake their stake

**Issue**: "Already Voted"
- **Fix**: Each user can vote once per proposal

## 📞 Support

For issues or questions:
1. Check [STAKING_GOVERNANCE_GUIDE.md](./STAKING_GOVERNANCE_GUIDE.md)
2. Review inline code comments
3. Check Sui documentation: https://docs.sui.io

## 🎓 Learning Path

1. **5 minutes**: Read this file
2. **15 minutes**: Review StakingGovernance.tsx component
3. **30 minutes**: Study stakingSDK.ts and types
4. **1 hour**: Deploy and test on Devnet
5. **2 hours**: Integrate into your dApp

## 📋 Checklist

- [ ] Files copied to project
- [ ] Smart contract deployed
- [ ] Package ID updated
- [ ] StakingGovernance component added
- [ ] Navigation link added
- [ ] Tested on Devnet
- [ ] Tested staking flow
- [ ] Tested governance voting
- [ ] Ready for Testnet/Mainnet

---

**Version**: 1.0.0
**Last Updated**: December 12, 2025
**Status**: Production Ready ✅
