# Sui Essentials Quick Start Guide

**TL;DR**: All 11 Sui 101 essentials are configured and integrated. Import from `suiEssentialsConfig.ts` and follow the patterns below.

---

## 🚀 Quick Reference

### 1. Object Ownership - Choose Your Pattern

```typescript
// Import
import { OBJECT_OWNERSHIP } from '@/config/suiEssentialsConfig';

// Reference in code
const { owned, shared, immutable, wrapped, dynamic_fields } = OBJECT_OWNERSHIP;

// Move contract pattern
// struct MyItem has key { id: UID } // Owned
// transfer::share_object(game_state); // Shared
// transfer::freeze_object(config); // Immutable
```

**Decision tree**:
- Single owner? → **Owned**
- Multi-user access? → **Shared**
- Read-only data? → **Immutable**
- Encapsulate for control? → **Wrapped**
- Variable attributes? → **Dynamic Fields**

---

### 2. Events - Notify the World

```typescript
import { EVENTS_CONFIG } from '@/config/suiEssentialsConfig';

// Move emit
// event::emit(PlayerJoined { player: addr, timestamp: clock::timestamp_ms(&clock) });

// GraphQL subscribe (React hook)
const subscription = `
  subscription {
    events(filter: { emitter: YOUR_PACKAGE }) {
      id, type, data
    }
  }
`;

// Off-chain trigger example
events$.subscribe(event => {
  if (event.type === 'PlayerJoined') {
    updateLeaderboard(event.data.player);
  }
});
```

**Pattern**: Emit at state changes, listen off-chain for reactions.

---

### 3. Data Access - Pick Your Interface

```typescript
import { DATA_ACCESS_CONFIG } from '@/config/suiEssentialsConfig';

// GraphQL (UI data fetching) - RECOMMENDED
const query = `query { objects(owner: address) { id, type } }`;

// Indexer (aggregated data - leaderboards)
const leaderboard = await indexer.getTopScores(100);

// Direct read (state verification)
const obj = await client.getObject({ id: objectId });

// JSON-RPC (tx submission)
const result = await client.executeTransaction(signedTx);
```

**Rule**: GraphQL for UI, Indexer for aggregates, Direct for verification.

---

### 4. On-Chain Time - Control With Timestamps

```typescript
import { ON_CHAIN_TIME_CONFIG } from '@/config/suiEssentialsConfig';

// Move code
// let now_ms = clock::timestamp_ms(&clock);
// assert!(now_ms < season_end_ms, ERR_SEASON_ENDED);

// React hook pattern
const isSeasonActive = (current_ms) => current_ms < SEASON_END_MS;
const getCooldownRemaining = (last_action_ms) => {
  const elapsed = Date.now() - last_action_ms;
  return Math.max(0, COOLDOWN_MS - elapsed);
};
```

**Pattern**: Clock for deadlines, epochs for governance boundaries.

---

### 5. Local Development - Test Locally First

```bash
# Setup
sui start --with-faucet

# Config env
export SUI_NETWORK=localnet
export VITE_GRAPHQL_ENDPOINT=http://127.0.0.1:9125/graphql

# Workflow: Local → Devnet → Testnet → Mainnet
```

**Pattern**: Development loop = edit contract → `sui move publish` → test locally → move to testnet.

---

### 6. Transactions - Build, Sign, Submit

```typescript
import { SIGNING_TRANSACTIONS_CONFIG } from '@/config/suiEssentialsConfig';

// Build
const tx = new Transaction();
tx.setSender(userAddress);
tx.moveCall({
  target: 'package::module::function',
  arguments: [arg1, arg2]
});

// Sign (via wallet)
const signedTx = await wallet.signTransaction(tx);

// Submit
const result = await client.executeTransaction(signedTx);

// Verify (after 1-2 seconds)
const confirmed = await client.getTransaction({ digest: result.digest });
```

**Pattern**: Wallet handles signing; dApp never sees private keys.

---

### 7. Sponsored Transactions - Gasless UX

```typescript
import { SPONSORED_TRANSACTIONS_CONFIG } from '@/config/suiEssentialsConfig';

// Backend relayer flow
// 1. User builds transaction (no gas coin)
// 2. Server identifies sponsor + gas coin
// 3. Server signs as sponsor
// 4. Submit user signature + sponsor signature
// 5. If both valid → executes; sponsor pays

// Result: Better onboarding, no SUI balance required for users
```

**Use case**: Faucet integration, play-to-earn, onboarding flows.

---

### 8. Equivocation Prevention - Atomic = Safe

```typescript
import { EQUIVOCATION_PREVENTION } from '@/config/suiEssentialsConfig';

// Move pattern: Serialize critical operations
// assert!(object_version == expected_version, ERR_EQUIVOCATION);

// TypeScript: Batch in PTB
const tx = new Transaction();
// All these execute atomically - no conflicts
tx.moveCall({ ... }); // Step 1
tx.moveCall({ ... }); // Step 2 (sees step 1 results)
tx.transferObjects([...], recipient); // Step 3
```

**Rule**: Use PTBs for multi-step atomic operations; serialize high-value txs.

---

### 9. Programmable Transaction Blocks - Chain Commands

```typescript
import { PTB_CONFIG } from '@/config/suiEssentialsConfig';

const tx = new Transaction();

// Step 1: Split coins
const [gasCoin, paymentCoin] = tx.splitCoins(inputCoin, [
  gasAmount,
  paymentAmount
]);

// Step 2: Call contract (uses results from step 1)
const result = tx.moveCall({
  target: 'package::game::play',
  arguments: [paymentCoin, gameState]
});

// Step 3: Transfer (uses result from step 2)
tx.transferObjects([result], player);

// Execute (single gas budget for all 3 steps)
tx.setGasBudget(MAX_GAS);
await wallet.signAndSubmit(tx);
```

**Pattern**: Up to 1,024 commands, output chaining, single gas budget.

---

### 10. Coin Management - Split, Merge, Transfer

```typescript
import { COIN_MANAGEMENT_CONFIG } from '@/config/suiEssentialsConfig';

// Split: 1 coin → many coins
const [coin1, coin2, coin3] = tx.splitCoins(
  inputCoin,
  [amount1, amount2, amount3]
);

// Merge: many coins → 1 coin
tx.mergeCoins(coin1, [coin2, coin3]);

// Transfer: move ownership
tx.transferObjects([coin1], recipient);

// Burn: permanent removal (less common)
tx.moveCall({
  target: 'sui::coin::burn',
  arguments: [coin]
});
```

**Pattern**: Always split for gas + payment; handle dust appropriately.

---

### 11. References & Borrow - Temporary Access

```typescript
import { REFERENCE_SIMULATION_CONFIG } from '@/config/suiEssentialsConfig';

// Move pattern: Borrow module
// let ref = borrow::borrow_mut(&mut object);
// // Use ref (mutable access)
// // Automatically returned at scope end

// TypeScript: In PTB
const borrowRef = tx.moveCall({
  target: 'sui::borrow::borrow_mut',
  arguments: [objectRef]
});

tx.moveCall({
  target: 'package::module::read_state',
  arguments: [borrowRef] // Temporary access
});

// borrowRef automatically returned at PTB end
```

**Pattern**: Use when you need read/write access without copying; shared state access.

---

## 📋 Checklist: Building a Game Feature

Use this checklist when implementing a game feature:

- [ ] **Ownership**: What owns the state? (owned/shared/immutable)
- [ ] **Events**: What state changes should be notified? (emit events)
- [ ] **Data Access**: How do players query state? (GraphQL/indexer)
- [ ] **Timing**: Any time-based logic? (Clock, epochs)
- [ ] **Local Testing**: Test on localnet first?
- [ ] **Transactions**: Build PTB for multi-step atomicity?
- [ ] **Sponsorship**: Gasless for new players?
- [ ] **Coins**: Split/merge for game currency?
- [ ] **References**: Temporary shared state access?
- [ ] **Equivocation**: Possible conflicts? Use PTB atomicity.

---

## 🔗 Configuration File Locations

| Concept | File | Variable | Lines |
|---------|------|----------|-------|
| Object Ownership | `suiEssentialsConfig.ts` | `OBJECT_OWNERSHIP` | ~100 |
| Events | `suiEssentialsConfig.ts` | `EVENTS_CONFIG` | ~80 |
| Data Access | `suiEssentialsConfig.ts` | `DATA_ACCESS_CONFIG` | ~100 |
| On-Chain Time | `suiEssentialsConfig.ts` | `ON_CHAIN_TIME_CONFIG` | ~80 |
| Local Dev | `suiEssentialsConfig.ts` | `LOCAL_NETWORK_CONFIG` | ~50 |
| Signing | `suiEssentialsConfig.ts` | `SIGNING_TRANSACTIONS_CONFIG` | ~70 |
| Sponsorship | `suiEssentialsConfig.ts` | `SPONSORED_TRANSACTIONS_CONFIG` | ~60 |
| Equivocation | `suiEssentialsConfig.ts` | `EQUIVOCATION_PREVENTION` | ~50 |
| PTBs | `suiEssentialsConfig.ts` | `PTB_CONFIG` | ~80 |
| Coins | `suiEssentialsConfig.ts` | `COIN_MANAGEMENT_CONFIG` | ~100 |
| References | `suiEssentialsConfig.ts` | `REFERENCE_SIMULATION_CONFIG` | ~80 |

---

## 💡 Pro Tips

1. **Start with patterns**: Copy patterns from `SUI_ESSENTIALS_INDEX.md` for your use case
2. **Test locally**: Always `sui start` and test on localnet first
3. **PTBs for atomicity**: Use PTBs when you need multi-step operations to be all-or-nothing
4. **Events for notifications**: Emit events liberally; they're cheap and valuable for off-chain systems
5. **Batch transactions**: PTBs reduce gas overhead vs. multiple transactions
6. **Monitor object versions**: Keep track of object versions in your game state
7. **Sponsor wisely**: Use sponsored txs for onboarding, but monitor costs
8. **GraphQL subscriptions**: Use for real-time UI updates (leaderboards, game events)

---

## 📚 Full Documentation

- **Detailed Guide**: See `SUI_ESSENTIALS_INDEX.md` for complete explanations
- **Summary**: See `SUI_ESSENTIALS_SUMMARY.md` for implementation details
- **README**: See `README.md` → Sui Essentials section for integration

---

**Last Updated**: December 6, 2025  
**Version**: 1.0 (Sui 101 concepts)  
**Status**: Ready for implementation
