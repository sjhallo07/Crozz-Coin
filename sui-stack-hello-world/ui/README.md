# CROZZ ECOSYSTEM - dApp UI

![CROZZ Logo](./public/logo-no-background.png)

**A NEW BEGINNING** - The official CROZZ_COIN decentralized application on Sui Blockchain.

## 🌟 Overview

CROZZ ECOSYSTEM is a revolutionary blockchain project built on the Sui network, representing **THE TRUE RELIGION** of decentralized finance. Our dApp provides a comprehensive interface for interacting with the CROZZ_COIN token and ecosystem features.

**Status:** 🚀 Pre Sale Coming Soon  
**Website:** [crozzcoin.com](https://crozzcoin.com/)

## ✨ Features

### ✅ Implemented

#### Consensus & Security

- **Mysticeti DAG Consensus** - BFT with >2/3 quorum certificates; implicit commitment mechanism reduces bandwidth overhead vs. explicit confirmations
- **Low Latency / High TPS** - ~0.5s block commits, ~200k TPS sustained (tested up to 300-400k); Devnet targets even higher throughput
- **Quorum Certificates** - Aggregated 2/3+ validator signatures provide finality; no additional confirmation rounds needed
- **Epochs & Reconfiguration** - Approximately 24h duration on Mainnet/Testnet, ~1h on Devnet; only fully synchronous event for validator set updates, ensuring consistency across network
- **Object Versioning** - Prevents double-spending and equivocation by tracking object versions; each transaction increments object version, making concurrent conflicting transactions detectable
- **Equivocation Prevention** - Serialize high-value transactions, batch with PTB (up to 1024 ops), use parallel validator proposals with wrapper structs to prevent conflicting broadcasts; use `sui-tool` locked-object commands for invariant enforcement
- **Parallel Processing** - Validator proposals execute in parallel streams; individual validators process independently, enabling censorship resistance through decentralized execution
- **Validator Punishment** - Equivocating validators identified and punished via protocol; prevents Byzantine actors from disrupting consensus
- **Pruning Profiles** - Moderate (default) and aggressive options aligned with Sui's storage fund rebates (99% refundable); enables long-term cost-effective archival

#### Blockchain Integration

- **Wallet Connection** - Seamless integration with Sui wallets
- **Testnet Support** - Full Sui Testnet compatibility
- **Transaction Execution** - Smart contract interactions
- **Faucet Integration** - Easy testnet SUI acquisition

#### GraphQL RPC Client

- **Full Sui GraphQL Support** - Access to all blockchain data
- **8 Custom Hooks** - React hooks for common operations
- **Interactive Explorer** - Test queries in real-time
- **Type Safety** - Complete TypeScript definitions (45+ types)
- **Pagination** - Cursor-based pagination for large datasets
- **Multi-Network** - Devnet, Testnet, and Mainnet support

#### Custom Indexing Framework

- **Sequential Pipelines** - In-order data processing
- **Concurrent Pipelines** - High-throughput parallel processing
- **PostgreSQL Integration** - Production-ready storage
- **Multiple Data Sources** - Remote stores, local files, RPC endpoints

#### Sui Essentials (Sui 101 Developer Guide)

- **Object Ownership Models** - Owned, shared, immutable, wrapped, and dynamic field patterns
- **Events System** - Emit and query on-chain events for off-chain notifications
- **Data Access Mechanisms** - GraphQL RPC, JSON-RPC, Indexer API, and direct object reads
- **On-Chain Time** - Clock module for timestamps and epoch-aware logic
- **Programmable Transaction Blocks** - Chain up to 1024 commands atomically with single gas budget
- **Coin Management** - Explicit operations: split, merge, transfer, and burn
- **Sponsored Transactions** - Gasless UX via protocol-sponsored gas fees
- **Signing & Transaction Submission** - Full transaction lifecycle from building to finality
- **Equivocation Prevention** - Object versioning and conflict detection via Mysticeti consensus
- **References & Borrow Module** - Temporary object access without ownership transfer
- **Local Development** - `sui start` setup with localnet, GraphQL, and faucet

#### UI/UX

- **Official Branding** - CROZZ ECOSYSTEM design system
- **Responsive Design** - Mobile-first approach
- **Radix UI Components** - Modern, accessible components
- **Dark/Light Themes** - User preference support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Sui wallet extension ([Sui Wallet](https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil))
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/sjhallo07/Crozz-Coin.git
cd Crozz-Coin/sui-stack-hello-world/ui

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

### Environment Setup

Create a `.env` file:

```env
VITE_SUI_NETWORK=testnet
VITE_GRAPHQL_ENDPOINT=https://graphql.testnet.sui.io/graphql
```

## 📖 Usage Guide

### Connecting Your Wallet

1. Click **"Connect Wallet"** in the top-right corner
2. Select your Sui wallet (e.g., Sui Wallet, Suiet)
3. Approve the connection request
4. Ensure you're on **Sui Testnet**

### Getting Testnet SUI

1. Connect your wallet
2. Click **"Get Testnet SUI"** button
3. Complete the faucet request
4. Wait for tokens to arrive (~30 seconds)

### Using GraphQL Explorer

The app includes an interactive GraphQL explorer with 5 tabs:

#### 1. Epoch Tab

Query current or specific epoch information:

- Epoch ID and timestamps
- Validator information
- Reference gas price
- Protocol configurations

#### 2. Transactions Tab

Browse and filter transactions:

- Paginated transaction list
- Filter by sender address
- Transaction details and effects
- Gas usage information

#### 3. Object Tab

Inspect on-chain objects:

- Object details by ID
- Move object contents
- Ownership information
- Version history

#### 4. Balance Tab

Check coin balances:

- Total balance by owner
- Coin type filtering
- Individual coin details
- Balance formatting (MIST ↔ SUI)

#### 5. Config Tab

View service configuration:

- Maximum query depth
- Maximum nodes per query
- Page size limits
- Timeout settings
- Data retention policies

### Creating Greetings

The demo application includes a simple greeting system:

1. Connect wallet and ensure Testnet connection
2. Click **"Create Greeting"**
3. Enter your greeting text
4. Sign the transaction
5. View your greeting with a shareable link

## 🛠️ Development

### Project Structure

```
ui/
├── public/
│   └── logo-no-background.png       # CROZZ official logo
├── src/
│   ├── components/
│   │   ├── GraphQLExplorer.tsx      # Interactive query UI (500+ lines)
│   │   ├── Greeting.tsx             # Display greeting component
│   │   └── CreateGreeting.tsx       # Create greeting form
│   ├── contexts/
│   │   └── GraphQLContext.tsx       # GraphQL state management (200+ lines)
│   ├── hooks/
│   │   └── useGraphQL.ts            # 8 custom hooks (550+ lines)
│   ├── services/
│   │   └── graphqlClient.ts         # GraphQL client (450+ lines)
│   ├── types/
│   │   └── graphql.ts               # TypeScript definitions (400+ lines)
│   ├── utils/
│   │   └── graphqlUtils.ts          # Helper utilities (550+ lines)
│   ├── examples/
│   │   └── graphqlExamples.ts       # 15 working examples (450+ lines)
│   ├── App.tsx                      # Main application
│   └── main.tsx                     # App entry point
├── GRAPHQL_README.md                # GraphQL documentation
├── PROJECT_INFO.md                  # Project information
└── package.json
```

### Available Scripts

```bash
# Development
pnpm dev                 # Start dev server (port 5173)
pnpm build              # Build for production
pnpm preview            # Preview production build

# Linting
pnpm lint               # Run ESLint
pnpm lint:fix           # Fix linting issues

# Type Checking
pnpm typecheck          # Run TypeScript compiler check
```

### Key Technologies

- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite** - Build tool and dev server
- **Radix UI** - Component library
- **@mysten/dapp-kit** - Sui wallet integration
- **@mysten/sui** - Sui JavaScript SDK

## 📚 Sui Essentials (Sui 101 Developer Guide)

This project implements all 11 core concepts from the [Sui 101 Developer Guide](https://docs.sui.io/guides/developer/sui-101):

### 1. Object Ownership Models
Located in `src/config/objectOwnershipPatterns.ts` and `src/config/suiEssentialsConfig.ts`

Two main paths with distinct tradeoffs:

#### Fastpath Objects (Address-Owned)
- **Single Owner**: Must be owned by one address or immutable
- **Finality**: ~0.5s without consensus (very low latency)
- **Gas Cost**: Lower than consensus objects
- **Multi-Party**: Not directly supported; requires off-chain coordination or custodian
- **Use Case**: Personal assets, individual wallets, high-frequency updates
- **Example**: Game items, player NFTs, personal accounts

**Fastpath Escrow Pattern**:
Three-phase protocol with trusted custodian:
1. **Lock Phase**: Both parties lock objects, receiving `Locked<T>` and unique `Key`
2. **Escrow Registration**: Parties register `Escrow` objects with custodian (custodian holds both)
3. **Custodian Swap**: Custodian verifies sender/recipient and key IDs match, then executes atomic swap

**Safety**: Lock mechanism prevents tampering (changed objects produce different Key IDs)

#### Consensus Objects (Shared)
- **Multi-Party Access**: Anyone can read/write; Mysticeti sequences atomically
- **Finality**: ~1-2s with consensus (atomic but slightly higher latency)
- **Gas Cost**: Higher due to consensus overhead
- **Trust**: Only Move code enforces correctness; no custodian needed
- **Use Case**: Smart contracts, game worlds, liquidity pools, protocol state
- **Example**: Token state, game world, escrow contracts

**Consensus Escrow Pattern**:
Two-phase protocol without trusted third party:
1. **Alice Creates Shared Escrow**: Creates public `Escrow<T>` with her asset and desired key ID from Bob
2. **Bob Completes Swap**: Calls `swap(KeyB, Locked<AssetB>)` which atomically exchanges assets

**Advantages**: No custodian required; Move code enforces all rules; atomic via Mysticeti consensus

#### Comparison Matrix
| Aspect | Fastpath | Consensus |
|--------|----------|-----------|
| Latency | ~0.5s | ~1-2s |
| Gas Cost | Lower | Higher (~10-20%) |
| Multi-Party | Off-chain coordination | Full on-chain support |
| Trust Model | Custodian-based | Move code + consensus |
| Custody Steps | More (4+ phases) | Fewer (2-3 phases) |
| Off-Chain Service | Custodian required | None required |
| Atomicity | Per-swap | Protocol-enforced |
| Hot Contention | Not applicable | Can impact latency |

#### Five Object Ownership Patterns
- **Owned Objects** - Single user/address owns exclusively; fast, simple
- **Shared Objects** - Multiple users access via Mysticeti; atomic, trustless
- **Immutable Objects** - Read-only after creation; no locks needed, efficient
- **Wrapped Objects** - Encapsulated for access control; capability-based security
- **Dynamic Fields** - Map-like storage for variable attributes; extensible schema

**Usage in CROZZ**: 
- Game items (owned/fastpath), 
- Game state (shared/consensus), 
- Protocol standards (immutable), 
- Escrow trades (shared/consensus for trust), 
- Capabilities (wrapped)

### 2. Events System
Located in `src/config/suiEssentialsConfig.ts` → `EVENTS_CONFIG`

Emit on-chain events for:
- **Real-time notifications** - GraphQL subscriptions for UI updates
- **Off-chain triggers** - Event-driven indexing and webhooks
- **Audit trails** - Structured event data for compliance
- **Bot reactions** - External systems respond to blockchain activity

**Usage in CROZZ**: Game events (player actions), leaderboard updates, transaction auditing

### 3. Data Access Mechanisms
Located in `src/services/graphqlClient.ts` and `src/config/suiEssentialsConfig.ts`

Four data access interfaces:
- **GraphQL RPC** - Flexible queries with subscriptions (3,650+ LOC)
- **JSON-RPC** - Traditional protocol for state reads and tx submission
- **Indexer API** - Pre-computed data via custom indexing (2,000+ LOC)
- **Direct Reads** - Raw object state via `sui_getObject`

**Usage in CROZZ**: UI fetches via GraphQL, indexer for leaderboards, direct reads for verification

### 4. On-Chain Time Access
Located in `src/config/suiEssentialsConfig.ts` → `ON_CHAIN_TIME_CONFIG`

Via Sui Clock module (object `0x6`):
- **Timestamps** - `clock::timestamp_ms(&clock)` for millisecond precision
- **Epochs** - `tx_context::epoch(&ctx)` for epoch tracking (~24h on Mainnet/Testnet, ~1h on Devnet)
- **Expiration** - Time-based validation and cooldowns
- **Rewards** - Epoch-scoped reward distribution

**Usage in CROZZ**: Season scheduling, cooldown mechanics, epoch-based rewards

### 5. Local Network Development
Located in `src/config/suiEssentialsConfig.ts` → `LOCAL_NETWORK_CONFIG`

Setup local Sui network:
```bash
sui start --with-faucet
# RPC: http://127.0.0.1:9000
# GraphQL: http://127.0.0.1:9125/graphql
# Faucet: http://127.0.0.1:9123/gas
```

**Workflow**: Local testing → Devnet → Testnet → Mainnet

**Usage in CROZZ**: Unit tests, integration tests, contract development

### 6. Signing & Sending Transactions
Located in `src/config/suiEssentialsConfig.ts` → `SIGNING_TRANSACTIONS_CONFIG`

Full transaction lifecycle:
1. **Build** - Create TransactionBlock with commands
2. **Sign** - Wallet signs with user's private key (never exposed to dApp)
3. **Submit** - Send to fullnode RPC
4. **Consensus** - Mysticeti orders and finalizes
5. **Confirm** - Available for queries

**Usage in CROZZ**: Game actions, multi-sig admin operations, automated transactions

### 7. Sponsored Transactions
Located in `src/config/suiEssentialsConfig.ts` → `SPONSORED_TRANSACTIONS_CONFIG`

Sponsor (dApp/protocol) pays gas for users:
- **Better UX** - Users don't need SUI balance
- **Onboarding** - Reduced friction for new players
- **Cost Control** - Sponsor approves transaction before paying

**Usage in CROZZ**: Gasless game actions, faucet integration, play-to-earn rewards

### 8. Equivocation Prevention
Located in `src/config/suiEssentialsConfig.ts` → `EQUIVOCATION_PREVENTION`

Prevent conflicting transaction:
- **Object Versioning** - Each mutation increments version; conflicts detected
- **PTBs** - Up to 1024 commands executed atomically
- **Serialization** - High-value txs executed sequentially
- **Mysticeti Consensus** - Detects and rejects equivocation

**Usage in CROZZ**: Atomic game mechanics, double-spend prevention, fair ordering

### 9. Programmable Transaction Blocks (PTBs)
Located in `src/config/suiEssentialsConfig.ts` → `PTB_CONFIG`

Chain up to 1024 Move commands atomically:
- **All-or-nothing** - Transaction succeeds completely or reverts entirely
- **Output chaining** - Use previous command results in next command
- **Single gas budget** - Reduced overhead vs. multiple txs
- **Atomic operations** - Multi-step game mechanics in one tx

**Usage in CROZZ**: Swap + transfer, batch transfers, multi-step contracts

### 10. Coin Management
Located in `src/config/suiEssentialsConfig.ts` → `COIN_MANAGEMENT_CONFIG`

Explicit coin operations:
- **Split** - Create lower-denomination coins
- **Merge** - Combine coins into one
- **Transfer** - Move ownership
- **Burn** - Permanent removal

**Operations in PTBs**: `tx.splitCoins()`, `tx.mergeCoins()`, `tx.transferObjects()`

**Usage in CROZZ**: In-game currency, reward distribution, gas management

### 11. Simulating References with Borrow Module
Located in `src/config/suiEssentialsConfig.ts` → `REFERENCE_SIMULATION_CONFIG`

Temporary object access without ownership transfer:
- **Immutable References** - Read-only access
- **Mutable References** - Temporary exclusive access
- **Borrow Pattern** - `sui::borrow::borrow_mut(&mut object)`

**Benefits**: No copies, reduced storage, shared state access

**Usage in CROZZ**: Read game config, access shared pools, query immutable data

## 🏗️ Object Ownership Patterns (Deep Dive)

Located in `src/config/objectOwnershipPatterns.ts` and `src/config/escrowExamples.ts`

This section covers the critical decision between **Fastpath Objects** (address-owned) and **Consensus Objects** (shared), with a complete **Escrow Pattern** implementation for both.

### Understanding the Two Paths

Sui offers two fundamentally different approaches to object ownership, each with distinct tradeoffs:

#### 1. Fastpath Objects (Address-Owned)
- **Ownership**: Single address only (or immutable)
- **Finality**: ~0.5 seconds (no consensus required)
- **Gas Cost**: Lower than consensus
- **Multi-Party**: Not directly supported
- **Best For**: Personal assets, individual accounts, latency-critical operations
- **Trade-off**: Simpler but requires trusted intermediary for multi-party coordination

**Key Characteristics**:
- Objects owned by single address can be updated without consensus
- No locking needed for single-owner updates
- Perfect for game items, wallets, personal NFTs
- Cannot be shared directly; hot object problem solved via off-chain coordination

#### 2. Consensus Objects (Shared)
- **Ownership**: Globally accessible; Mysticeti sequences access
- **Finality**: ~1-2 seconds (consensus required)
- **Gas Cost**: Higher due to shared object versioning overhead
- **Multi-Party**: Fully supported via Mysticeti atomic ordering
- **Best For**: Smart contracts, game worlds, liquidity pools, trustless coordination
- **Trade-off**: Slightly higher latency but eliminates custodian requirement

**Key Characteristics**:
- Accessible by any transaction; Mysticeti ensures atomic consistency
- No single owner; governance via Move code rules
- Perfect for protocol state, shared game worlds, token contracts
- Supports complex multi-party logic natively

### Escrow Pattern: The Critical Example

The escrow pattern demonstrates the fundamental choice between these two approaches. Both patterns implement the same goal (trustless two-party swap) but with different trust models.

#### Fastpath Escrow (Address-Owned Objects)
Located in `src/config/escrowExamples.ts` → `FASTPATH_ESCROW_EXAMPLE`

**Protocol**: Three-phase swap with trusted custodian

```
Phase 1: LOCK
- Alice: lock(asset_a) -> (Locked<A>, KeyA)
- Bob:   lock(asset_b) -> (Locked<B>, KeyB)
- Keys prove objects not tampered with

Phase 2: REGISTER WITH CUSTODIAN
- Alice: create_escrow(locked_a, key_a, exchange_key=id(KeyB), recipient=Bob, custodian=C)
- Bob:   create_escrow(locked_b, key_b, exchange_key=id(KeyA), recipient=Alice, custodian=C)
- Both Escrows transferred to custodian

Phase 3: CUSTODIAN EXECUTES SWAP
- Custodian verifies:
  ✓ sender_a == recipient_b (mutual agreement)
  ✓ escrowed_key_a == exchange_key_b (assets match)
- If checks pass: atomic swap of assets
```

**Safety Mechanism**: Key ID matching prevents tampering
- If Bob modifies asset_b after locking, it produces a different Key
- Key ID mismatch detected in swap verification
- Swap reverts; Alice's asset safely returned

**Tradeoffs**:
- ✅ Very low latency (~0.5s)
- ✅ Lower gas costs
- ❌ Requires trusted custodian service
- ❌ More protocol steps (lock, register, swap)
- ❌ Off-chain coordination needed

#### Consensus Escrow (Shared Objects)
Located in `src/config/escrowExamples.ts` → `CONSENSUS_ESCROW_EXAMPLE`

**Protocol**: Two-phase swap without custodian

```
Phase 1: ALICE CREATES SHARED ESCROW
- Alice: create_escrow(asset_a, recipient=Bob, exchange_key=id(KeyB))
- Escrow made publicly shared: transfer::public_share_object(escrow)
- Anyone can query escrow state; Bob can see it via GraphQL

Phase 2: BOB COMPLETES SWAP
- Bob: lock(asset_b) -> (Locked<B>, KeyB)
- Bob: calls escrow.swap(KeyB, Locked<B>)
- Move code verifies:
  ✓ caller is recipient (Bob)
  ✓ KeyB ID matches exchange_key
- If checks pass: atomic swap via Mysticeti consensus
```

**Safety Mechanism**: Move code + Mysticeti atomicity
- Only Move-enforced rules control swap eligibility
- Mysticeti ensures all operations execute atomically
- No custodian can interfere or steal assets
- Events emit for off-chain indexing

**Tradeoffs**:
- ✅ No custodian required (fully trustless)
- ✅ Fewer protocol steps (create, swap)
- ✅ Transparent on-chain settlement
- ✅ Atomic via Mysticeti consensus
- ❌ Slightly higher latency (~1-2s)
- ❌ Higher gas costs
- ❌ Shared object contention possible

### Comparison Matrix

| Aspect | Fastpath | Consensus |
|--------|----------|-----------|
| **Latency** | ~0.5s | ~1-2s |
| **Gas Cost** | Lower | Higher (~10-20%) |
| **Multi-Party** | Off-chain coordination | Native support |
| **Trust Model** | Custodian + rules | Rules only |
| **Custody Model** | Custodian holds | Move code holds |
| **Steps** | 3-4 phases | 2 phases |
| **Hot Contention** | Not applicable | Can impact latency |
| **Best For** | Personal assets, latency-critical | Coordination, trustless |

### Decision Framework

```
Question 1: Do you need multi-party coordination?
  → No: Use Fastpath (lower latency, lower gas)
  → Yes: Use Consensus (atomic, trustless)

Question 2: Do you have a trusted custodian?
  → Yes: Consider Fastpath (better latency)
  → No: Must use Consensus (trustless)

Question 3: Is latency critical (<1s)?
  → Yes: Fastpath Escrow (0.5s finality)
  → No: Consensus Escrow (1-2s acceptable)

Question 4: Is atomic multi-party essential?
  → Yes: Consensus Escrow (only option)
  → No: Fastpath Escrow (simpler protocol)
```

### CROZZ Implementation Strategy

#### Game Items (Fastpath)
```typescript
struct GameItem has key {
  id: UID,
  owner: address,
  properties: ItemProperties,
  ...
}
```
- Personal NFTs owned by players
- Transferred via fastpath for speed
- No shared access needed

#### Game World (Consensus)
```typescript
shared GameWorld {
  state: WorldState,
  players: Table<address, Player>,
  ...
}
```
- Shared by all players
- Atomic transactions via Mysticeti
- Handles concurrent player actions

#### Player-to-Player Trades (Consensus Escrow)
```typescript
shared Escrow<GameItem> {
  sender: address,
  recipient: address,
  exchange_key: ID,
  ...
}
```
- Trustless peer-to-peer swaps
- No custodian required
- Events track trade history

#### NPC Trades (Fastpath Escrow)
- Uses contract-as-custodian for control
- Lower latency for better UX
- Contract enforces trade rules

### Configuration Files

Located in `src/config/`:
- **`objectOwnershipPatterns.ts`** - Fastpath vs Consensus patterns (600+ lines)
- **`escrowExamples.ts`** - Both escrow implementations with Move examples (700+ lines)
- **`suiEssentialsConfig.ts`** - Complete Sui 101 configuration (700+ lines)
- **`architectureIntegration.ts`** - Integration with services and UI
- **`suiArchitectureConfig.ts`** - Network, storage, and consensus details

---

## 🎯 Using Events (Deep Dive)

**Documentation:** [Sui Using Events Guide](https://docs.sui.io/guides/developer/sui-101/using-events)

The Sui network tracks countless on-chain activities through **events**. CROZZ uses event monitoring to track game progress, trades, item transfers, and ecosystem activity in real-time.

### Event Structure

Every event on Sui contains:

| Field | Description |
|-------|-------------|
| `id` | Transaction digest + event sequence number |
| `packageId` | Smart contract package ID |
| `transactionModule` | Module that emitted the event |
| `sender` | Address that triggered the event |
| `type` | Event type (e.g., `package::module::EventName`) |
| `parsedJson` | Event payload data |
| `bcs` | Binary canonical serialization |
| `timestampMs` | Unix timestamp in milliseconds |

### Move Event Emission Patterns

#### 1. Lock Events (Escrow Pattern)

```move
use sui::event;

public struct LockCreated has copy, drop {
    lock_id: ID,
    key_id: ID,
    creator: address,
    item_id: ID,
}

public fun lock<T: key + store>(
    obj: T, 
    ctx: &mut TxContext
): (Locked<T>, Key) {
    let key = Key { id: object::new(ctx) };
    let mut lock = Locked {
        id: object::new(ctx),
        key: object::id(&key),
    };

    // Emit event when lock is created
    event::emit(LockCreated {
        lock_id: object::id(&lock),
        key_id: object::id(&key),
        creator: ctx.sender(),
        item_id: object::id(&obj),
    });

    (lock, key)
}
```

**Use Case:** Track secure object locking for trustless escrows
**Payload:** Creator address, lock ID, key ID, item ID
**Benefits:** 
- Enables audit trail for escrow lifecycle
- Track who created locks and when
- Monitor item transfers through escrows

#### 2. Game State Events

```move
public struct GameCreated has copy, drop {
    game_id: ID,
    creator: address,
    size: u8,
    timestamp: u64,
}

public struct MoveMade has copy, drop {
    game_id: ID,
    player: address,
    position: u8,
    outcome: u8, // 0 = ongoing, 1 = won, 2 = lost
}

public struct GameFinished has copy, drop {
    game_id: ID,
    winner: address,
    final_outcome: u8,
}
```

**Use Case:** Monitor game lifecycle and player progress
**Payload:** Game ID, player addresses, move positions, outcomes
**Benefits:**
- Real-time game status updates
- Player achievement tracking
- Leaderboard generation
- Statistics and analytics

#### 3. Trade/Escrow Events

```move
public struct EscrowCreated has copy, drop {
    escrow_id: ID,
    sender: address,
    locked_asset_id: ID,
    recipient: address,
}

public struct EscrowSwapped has copy, drop {
    escrow_id: ID,
    sender: address,
    recipient: address,
    asset_received: ID,
}

public struct EscrowCancelled has copy, drop {
    escrow_id: ID,
    sender: address,
    refunded_asset: ID,
}
```

**Use Case:** Track trustless atomic swaps
**Payload:** Participant addresses, asset IDs, trade status
**Benefits:**
- Audit trail for all trades
- Detect and prevent fraud
- Monitor market activity
- Generate trade analytics

### Querying Events

#### JSON-RPC Method: `queryEvents`

```typescript
import { SuiClient } from "@mysten/sui/client";

const client = new SuiClient({ url: "https://fullnode.testnet.sui.io" });

// Query events by transaction
const events = await client.queryEvents({
  query: { Transaction: txDigest },
});

// Query events by module
const moduleEvents = await client.queryEvents({
  query: {
    MoveModule: {
      package: "0x158f2027f60c89bb91526d9bf08831d27f5a0fcb0f74e6698b9f0e1fb2be5d05",
      module: "lock"
    }
  }
});

// Query events by sender
const senderEvents = await client.queryEvents({
  query: {
    Sender: "0x8b35e67a519fffa11a9c74f169228ff1aa085f3a3d57710af08baab8c02211b9"
  }
});

// Query with pagination
let cursor = null;
while (true) {
  const result = await client.queryEvents({
    query: { MoveModule: { package, module } },
    cursor,
    limit: 50,
  });

  console.log(`Processed ${result.data.length} events`);
  
  if (!result.hasNextPage) break;
  cursor = result.nextCursor;
}
```

#### Event Filter Options

| Filter | Description | Use Case |
|--------|-------------|----------|
| `All` | All events on network | Debugging, testing |
| `Transaction` | Events from specific tx | Single transaction analysis |
| `MoveModule` | Events from package::module | Monitor specific contracts |
| `MoveEventType` | Events by type name | Track specific event type |
| `Sender` | Events by address | Monitor specific user activity |
| `TimeRange` | Events in time window | Historical analysis, reports |
| `Any` | Multiple filters (OR logic) | Complex queries |

### Monitoring Strategies

#### Strategy 1: Polling (Simple & Flexible)

```typescript
const EVENTS_TO_TRACK = [
  {
    type: `${packageId}::lock`,
    filter: { MoveEventModule: { package: packageId, module: "lock" } },
    callback: handleLockObjects,
  },
  {
    type: `${packageId}::shared`,
    filter: { MoveEventModule: { package: packageId, module: "shared" } },
    callback: handleEscrowObjects,
  },
];

// Poll for new events
async function pollEvents() {
  for (const tracker of EVENTS_TO_TRACK) {
    const result = await client.queryEvents({
      query: tracker.filter,
      cursor: lastCursor,
      order: "ascending",
    });

    // Process events
    await tracker.callback(result.data, tracker.type);

    // Save cursor for next poll
    if (result.nextCursor) {
      lastCursor = result.nextCursor;
    }

    // Schedule next poll
    setTimeout(pollEvents, 5000); // Poll every 5 seconds
  }
}
```

**Advantages:**
- Simple to implement
- Works with any endpoint
- Easy to debug
- No external dependencies

**Disadvantages:**
- Latency: 5-30 second delays
- Network overhead: Many requests
- Not suitable for real-time responses

**Best For:** Statistics, analytics, audit logs, infrequent events

#### Strategy 2: Custom Indexer (Real-Time)

```typescript
// Stream checkpoints for real-time events
const indexer = new CustomIndexer(client);

indexer.on("checkpoint", async (checkpoint) => {
  for (const event of checkpoint.events) {
    if (event.type.includes("GameFinished")) {
      // Update leaderboard immediately
      await updateLeaderboard(event);
    }
    
    if (event.type.includes("EscrowSwapped")) {
      // Process trade immediately
      await processTrade(event);
    }
  }
});

await indexer.start();
```

**Advantages:**
- Real-time events (< 500ms)
- Consistent checkpoint ordering
- Minimal overhead per event
- Suitable for immediate reactions

**Disadvantages:**
- More complex setup
- Requires running indexer service
- State management overhead

**Best For:** Leaderboards, immediate rewards, real-time UI updates

### CROZZ Event Strategy

CROZZ uses a **hybrid approach** optimized for different event types:

| Event Type | Method | Latency | Use Case |
|------------|--------|---------|----------|
| **GameFinished** | Custom Indexer | < 500ms | Immediate reward distribution |
| **MoveMade** | Polling (5s) | 5-10s | Game state updates, analytics |
| **TradeCompleted** | Custom Indexer | < 500ms | Instant settlement confirmation |
| **ItemTransferred** | Polling (10s) | 10-30s | Market data, inventory sync |
| **NPCTradeCompleted** | Polling (5s) | 5-10s | NPC economy tracking |
| **ItemMinted** | Polling (1m) | 1-5m | Statistics, supply data |
| **AchievementUnlocked** | Polling (10s) | 10-30s | Profile updates |

### Event Processing with Database

```typescript
import { SuiEvent } from "@mysten/sui/client";
import { prisma } from "../db";

type LockEvent = LockCreated | LockDestroyed;

export const handleLockObjects = async (
  events: SuiEvent[],
  type: string
) => {
  const updates = {};

  // Group events by lock ID
  for (const event of events) {
    const data = event.parsedJson as LockEvent;
    const isDeletion = !("key_id" in data);

    if (!updates[data.lock_id]) {
      updates[data.lock_id] = {
        objectId: data.lock_id,
      };
    }

    if (isDeletion) {
      updates[data.lock_id].deleted = true;
    } else {
      updates[data.lock_id].keyId = data.key_id;
      updates[data.lock_id].creator = data.creator;
      updates[data.lock_id].itemId = data.item_id;
    }
  }

  // Batch database updates
  const promises = Object.values(updates).map((update) =>
    prisma.locked.upsert({
      where: { objectId: update.objectId },
      create: update,
      update,
    })
  );

  await Promise.all(promises);
};
```

### GraphQL Event Queries (Early-Stage)

```graphql
{
  events(
    filter: {
      eventType: "0x3164fcf73eb6b41ff3d2129346141bd68469964c2d95a5b1533e8d16e6ea6e13::Market::ChangePriceEvent"
    }
  ) {
    nodes {
      sendingModule { name package { digest } }
      sender { address }
      timestamp
      contents { type { repr } json }
    }
  }
}
```

Query by sender:

```graphql
query ByTxSender {
  events(
    first: 10
    filter: { sender: "0xdff57c401e125a7e0e06606380560b459a179aacd08ed396d0162d57dbbdadfb" }
  ) {
    pageInfo { hasNextPage endCursor }
    nodes {
      sender { address }
      timestamp
      contents { type { repr } json }
    }
  }
}
```

### Configuration Files

Located in `src/config/`:
- **`eventsConfig.ts`** - Event structures, patterns, and strategies (900+ lines)
- **`eventHandlers.ts`** - Event processing and polling system (500+ lines)
- **`graphqlEvents.ts`** - GraphQL queries and WebSocket subscriptions (600+ lines)

### Key Features Implemented

✅ Event structure documentation
✅ Move event emission patterns (3 types)
✅ TypeScript event query builder
✅ JSON-RPC event polling system
✅ Database schema for event storage
✅ Event processing patterns (batch, idempotent, DLQ)
✅ GraphQL event queries
✅ Real-time event subscriptions (WebSocket)
✅ CROZZ-specific event handlers
✅ Event statistics collection
✅ Adaptive polling strategies
✅ Pagination support

---

## 📚 Additional Documentation

### GraphQL Integration

See [GRAPHQL_README.md](./GRAPHQL_README.md) for comprehensive GraphQL documentation including:

- Architecture overview
- API reference
- Usage examples
- Best practices
- Pagination guide
- Error handling

### Custom Indexing

See [Custom Indexing Framework](../../docs/custom-indexing/) for indexer documentation:

- Pipeline architectures
- Database integration
- Data sources
- Example implementations

### Project Information

See [PROJECT_INFO.md](./PROJECT_INFO.md) for:

- Token details
- Team information
- Website structure
- Technical stack
- Roadmap

## 🔗 GraphQL Endpoints

### Testnet (Default)

```
https://graphql.testnet.sui.io/graphql
```

### Mainnet

```
https://graphql.mainnet.sui.io/graphql
```

### Devnet

```
https://graphql.devnet.sui.io/graphql
```

## 🎯 Roadmap

### Phase 1: Foundation ✅

- [x] Sui dApp integration
- [x] Wallet connection
- [x] GraphQL client
- [x] Official branding

### Phase 2: Token Launch 🔄

- [ ] Smart contract deployment
- [ ] Tokenomics implementation
- [ ] Pre-sale mechanism
- [ ] Whitepaper release

### Phase 3: Ecosystem 📋

- [ ] Staking features
- [ ] Governance system
- [ ] Community features
- [ ] Mobile app

### Phase 4: Expansion 🔮

- [ ] Cross-chain bridges
- [ ] DeFi integrations
- [ ] NFT marketplace
- [ ] Advanced analytics

## 👥 Team

**Owner:** Carlo Luken  
**Developer:** Marcos Mora  
**Contact:** <Abreu760@hotmail.com>

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the CROZZ ECOSYSTEM. All rights reserved.

## 🔗 Links

- **Website:** [crozzcoin.com](https://crozzcoin.com/)
- **GitHub:** [github.com/sjhallo07/Crozz-Coin](https://github.com/sjhallo07/Crozz-Coin)
- **Sui Network:** [sui.io](https://sui.io/)
- **Sui Docs:** [docs.sui.io](https://docs.sui.io/)

## 📞 Support

For questions, issues, or support:

- **Email:** <Abreu760@hotmail.com>
- **Website:** [crozzcoin.com/#Contact](https://crozzcoin.com/#Contact)
- **GitHub Issues:** [Create an issue](https://github.com/sjhallo07/Crozz-Coin/issues)

---

**A NEW BEGINNING** - CROZZ ECOSYSTEM © 2025

Built with ❤️ on the Sui Blockchain
