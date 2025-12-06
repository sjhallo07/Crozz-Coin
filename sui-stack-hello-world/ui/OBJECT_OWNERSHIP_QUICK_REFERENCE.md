# Quick Reference: Sui Object Ownership Patterns

## One-Minute Overview

Sui offers **two fundamentally different** approaches to modeling object ownership. Choose based on your needs:

| Need | Choose | Latency | Gas | Trust |
|------|--------|---------|-----|-------|
| Personal assets only | **Fastpath** | ~0.5s | Low | Custodian |
| Multi-party coordination | **Consensus** | ~1-2s | High | Code |
| Very latency-sensitive | **Fastpath** | ~0.5s | Low | Custodian |
| Trustless settlement | **Consensus** | ~1-2s | High | Code |

---

## Fastpath Objects (Address-Owned)

### Characteristics
- **Single owner** only (or immutable)
- **~0.5 second** finality (no consensus)
- **Lower gas costs**
- **Not shareable** without off-chain coordination

### Best For
- 🎮 Game items, NFTs
- 💰 Personal wallets
- 👤 User accounts
- ⚡ Latency-critical apps

### Example: Game Item
```move
struct GameItem has key {
  id: UID,
  owner: address,
  properties: Properties
}
// Transfer: transfer::transfer(item, new_owner)
```

### Trade-off
❌ Need custodian or off-chain coordination for multi-party swaps  
✅ Very fast, very cheap

---

## Consensus Objects (Shared)

### Characteristics
- **Globally accessible** (anyone can transact)
- **~1-2 second** finality (via Mysticeti)
- **Higher gas costs** (shared object overhead)
- **Fully shareable** with atomic guarantees

### Best For
- 🌍 Game worlds, shared state
- 💱 Liquidity pools, DEXs
- 🔐 Smart contracts, protocols
- 🤝 Multi-party coordination

### Example: Game World
```move
shared struct GameWorld {
  state: WorldState,
  players: Table<address, Player>
}
// Multiple txs access atomically via Mysticeti
```

### Trade-off
❌ Slightly higher latency and gas  
✅ No custodian needed, fully trustless

---

## The Escrow Pattern: Two Implementations

### Fastpath Escrow (3 phases, with custodian)

```
1. LOCK       → Alice & Bob lock objects
2. REGISTER   → Send to trusted custodian C
3. SWAP       → Custodian verifies & executes

Safety: Key ID matching prevents tampering
Trust: Must trust custodian for liveness
```

**Gas**: ⬇️ Lower  
**Latency**: ⚡ Faster (~0.5s)  
**Custody**: 🔐 Custodian holds objects  

### Consensus Escrow (2 phases, no custodian)

```
1. CREATE → Alice creates shared Escrow
2. SWAP   → Bob completes swap atomically

Safety: Move code + Mysticeti consensus
Trust: Only trust code, not custodian
```

**Gas**: ⬆️ Higher  
**Latency**: 🐢 Slower (~1-2s)  
**Custody**: ⛓️ Blockchain/consensus holds  

---

## Decision Tree

```
Q1: Need multi-party coordination?
├─ YES  → Go to Q2
└─ NO   → Use Fastpath (simpler)

Q2: Have trusted custodian?
├─ YES  → Use Fastpath Escrow (faster)
└─ NO   → Use Consensus Escrow (trustless)

Q3: Is latency <1s critical?
├─ YES  → Fastpath + accept custodian
└─ NO   → Consensus + full trustlessness
```

---

## Five Object Ownership Models

| Model | Ownership | Finality | Use Case |
|-------|-----------|----------|----------|
| **Owned** | Single address | Fastpath | Personal NFTs |
| **Shared** | Global access | Consensus | Game state |
| **Immutable** | Read-only | Fastpath | Standards |
| **Wrapped** | Via wrapper | Fastpath | Capabilities |
| **Dynamic** | Key-value map | Variable | Extensible |

---

## CROZZ Implementation Map

```
Game Items
  └─ Fastpath (owned)
     └─ Players own NFTs exclusively

Game World
  └─ Consensus (shared)
     └─ Multiple players access atomically

Player Trade
  └─ Consensus Escrow (trustless)
     └─ No custodian needed

NPC Trade
  └─ Fastpath Escrow (contract custodian)
     └─ Lower latency for UX

Token State
  └─ Consensus (shared)
     └─ Protocol state atomicity
```

---

## Key Safety Mechanisms

### Fastpath Escrow: Key ID Matching
```
1. Alice locks asset_a → produces Key_A
2. Custodian remembers id(Key_A)
3. If Bob tampers with asset_b → new Key_B'
4. Custodian compares: expects Key_B but gets Key_B'
5. Mismatch → Swap fails, Alice's asset safe
```

### Consensus Escrow: Move + Consensus
```
1. Alice creates Escrow specifying expected key ID from Bob
2. Bob provides locked asset + key
3. Move code verifies: key ID matches specified
4. Mysticeti consensus orders and executes atomically
5. All-or-nothing via protocol enforcement
```

---

## Configuration Files Reference

```
src/config/
├─ objectOwnershipPatterns.ts  (610 lines)
│  └─ FASTPATH_OBJECTS, CONSENSUS_OBJECTS
│     OWNERSHIP_COMPARISON, CROZZ_OWNERSHIP_STRATEGY
│
├─ escrowExamples.ts          (431 lines)
│  └─ FASTPATH_ESCROW_EXAMPLE, CONSENSUS_ESCROW_EXAMPLE
│     ESCROW_DECISION_TREE, CROZZ_ESCROW_IMPLEMENTATION
│
├─ architectureIntegration.ts (updated)
│  └─ OBJECT_OWNERSHIP_INTEGRATION section
│
└─ README.md                  (enhanced)
   └─ Section 1: Object Ownership Models
      New Section: Object Ownership Patterns (Deep Dive)
```

---

## When to Reconsider

### Fastpath Might Be Wrong If:
- ❌ Multiple parties need simultaneous access
- ❌ You don't have trusted infrastructure
- ❌ Need atomic multi-party transactions
- ❌ Want audit trail via consensus

**→ Switch to Consensus**

### Consensus Might Be Wrong If:
- ❌ Latency <1s is absolutely critical
- ❌ Your app is extremely latency-sensitive (gaming, HFT)
- ❌ Gas cost optimization is top priority
- ❌ Objects are personal only (no sharing needed)

**→ Switch to Fastpath**

---

## Performance Expectations

### Fastpath Objects
- **Finality**: 500-800ms
- **Gas** (simple transfer): ~100 units
- **Concurrency**: No contention (single owner)
- **Peak TPS**: Single-shard capacity

### Consensus Objects (via Mysticeti)
- **Finality**: 1-2 seconds
- **Gas** (shared update): ~150 units
- **Concurrency**: Atomic but ordered
- **Peak TPS**: Network-wide capacity (200k+ TPS)

---

## Move Code Patterns

### Fastpath: Transfer Ownership
```move
transfer::transfer(item, new_owner);
```

### Consensus: Share Globally
```move
transfer::public_share_object(contract);
```

### Fastpath: Freeze Immutable
```move
transfer::freeze_object(standard);
```

### Consensus: Dynamic Fields
```move
dof::add(&mut obj.id, key, value);
```

---

## Event Emission (Both Patterns)

### Fastpath Escrow
```move
event::emit(EscrowCreated { escrow_id, ... });
event::emit(EscrowSwapped { escrow_id, ... });
```

### Consensus Escrow
```move
event::emit(EscrowCreated { escrow_id, ... });
event::emit(EscrowSwapped { escrow_id, ... });
event::emit(EscrowCancelled { escrow_id, ... });
```

Events queryable via GraphQL immediately after emission.

---

## Recommended Reading Order

1. **This file** - Quick reference (5 min)
2. **README.md Section 1** - Object Ownership Models (10 min)
3. **README.md "Deep Dive"** - Full escrow examples (15 min)
4. **objectOwnershipPatterns.ts** - Detailed config (30 min)
5. **escrowExamples.ts** - Move code samples (30 min)
6. **Sui Docs** - https://docs.sui.io/guides/developer/sui-101/object-ownership (30 min)

---

**Last Updated**: December 6, 2025  
**Status**: ✅ Build verified, all tests passing
