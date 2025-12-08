# Sui Advanced Topics Guide

## Overview

Advanced topics cover coding practices, useful features, and developer-focused considerations that arise when developing more sophisticated solutions on Sui. Not necessarily harder than basics, but often needed for advanced use cases.

**Documentation**: https://docs.sui.io/guides/developer/advanced

## 1. Move 2024 Migration

### What's New in Move 2024

Move is evolving with new features in 2024. These are **opt-in**, so existing code continues to work without changes.

**Key New Features**:

1. **Lambdas & Closures**
   - First-class function support
   - Higher-order functions
   - Functional programming patterns

2. **Enhanced Enum Support**
   - Better pattern matching
   - Improved variant handling
   - More expressive types

3. **Improved Type System**
   - Better generic constraints
   - Enhanced trait support
   - Improved type inference

4. **Standard Library Enhancements**
   - New utility functions
   - Better collection support
   - Additional math operations

### Migration Steps

#### Step 1: Update Move.toml

```toml
[package]
name = "my_package"
language = "2024.beta"  # Enable Move 2024 features
```

#### Step 2: Review Breaking Changes

```move
// Move 2023 (old)
let vec = vector::empty();
vector::push_back(&mut vec, 1);

// Move 2024 (new improvements)
let vec: vector<u64> = vector![1, 2, 3];  // Better type inference
```

#### Step 3: Adopt New Features

```move
// Lambda example (Move 2024)
fun process_items(items: &vector<u64>) -> u64 {
    vector::fold(items, 0, |acc, x| acc + x)
}

// Improved pattern matching
fun handle_result(result: &Result<u64, MyError>) {
    match result {
        Ok(value) => { /* ... */ },
        Err(error) => { /* ... */ }
    }
}
```

#### Step 4: Test & Deploy

```bash
# Test locally with Move 2024
sui move test --config Move.toml

# Deploy to Testnet first
sui client publish --testnet

# Deploy to Mainnet after validation
sui client publish --mainnet
```

### Breaking Changes Checklist

- [ ] API removal or signature changes
- [ ] Behavior changes in standard library
- [ ] Type system constraints
- [ ] Deprecation warnings resolved
- [ ] Tests passing with Move 2024
- [ ] Security audit for behavior changes

---

## 2. Custom Indexer

### Purpose

A custom indexer:
- **Improves Latency**: Query indexed data faster than RPC
- **Enables Pruning**: Remove historical data from full node
- **Provides Aggregations**: Compute app-specific metrics
- **Handles Volume**: Scale beyond RPC limits

### Architecture

```
┌─────────────────────┐
│  Sui Full Node      │
│  (with Events API)  │
└──────────┬──────────┘
           │
           │ WebSocket/RPC Stream
           │ (Events & Checkpoints)
           ↓
┌──────────────────────┐
│  Indexer Service     │
│  (Event Processor)   │
└──────────┬───────────┘
           │
           │ Store
           ↓
┌──────────────────────┐
│  Database            │
│  (PostgreSQL/MongoDB)│
└──────────┬───────────┘
           │
           │ Query
           ↓
┌──────────────────────┐
│  Your Application    │
└──────────────────────┘
```

### Implementation Approaches

#### 1. Full Node + Indexer (Recommended)

**Setup**:
1. Run Sui full node with JSON-RPC enabled
2. Create separate indexer service
3. Indexer listens to event stream
4. Process and store in database
5. Expose query API

**Advantages**:
- Flexible data storage
- Custom aggregations
- Independent scaling
- Database of choice

**Example Tech Stack**:
- Full Node: Sui Official Node
- Indexer: TypeScript/Node.js or Rust
- Database: PostgreSQL
- API: REST or GraphQL

#### 2. Sui Indexer Framework

**Official Framework**:
- Purpose-built for Sui indexing
- Handles checkpoint processing
- Event and transaction indexing
- Built-in optimizations

**Usage**:
```rust
// Pseudo-code
use sui_indexer::IndexerBuilder;

let indexer = IndexerBuilder::new()
    .with_rpc_url("https://sui-mainnet.mystenlabs.com")
    .with_checkpoint_handler(handle_checkpoint)
    .with_event_handler(handle_event)
    .build()
    .await;

indexer.run().await?;
```

#### 3. Event Stream Listener

**Lightweight Option**:
- Listen to Sui events via WebSocket
- Process events as they occur
- Store in simple database
- Minimal infrastructure

### Database Schema Example

```sql
-- Events Table
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    tx_digest VARCHAR(255) NOT NULL,
    event_index INT,
    event_type VARCHAR(255),
    object_id VARCHAR(255),
    sender VARCHAR(255),
    data JSONB,
    timestamp BIGINT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Aggregate Data Table
CREATE TABLE user_stats (
    user_address VARCHAR(255) PRIMARY KEY,
    total_transactions BIGINT,
    total_volume DECIMAL(38, 8),
    last_activity TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Checkpoints Table
CREATE TABLE checkpoints (
    sequence_number BIGINT PRIMARY KEY,
    digest VARCHAR(255) UNIQUE,
    timestamp BIGINT,
    transactions INT,
    processed_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

```typescript
// REST API Example
app.get('/api/user/:address/stats', async (req, res) => {
    const stats = await db.query(
        'SELECT * FROM user_stats WHERE user_address = $1',
        [req.params.address]
    );
    res.json(stats.rows[0]);
});

app.get('/api/events/:type', async (req, res) => {
    const events = await db.query(
        'SELECT * FROM events WHERE event_type = $1 ORDER BY timestamp DESC LIMIT 100',
        [req.params.type]
    );
    res.json(events.rows);
});
```

---

## 3. On-Chain Randomness

### Randomness Sources

#### Sui Randomness API (Recommended)

```move
use sui::random::Random;

fun roll_dice(random: &Random, ctx: &mut TxContext): u8 {
    let seed = random::random_bytes(random);
    let value = random::next_u8(&seed);
    value % 6 + 1  // 1-6
}
```

**Characteristics**:
- Verifiable randomness from validators
- Fair and unpredictable
- Not instant (requires epoch boundary)
- Cryptographically secure

#### Epoch-Based Randomness

```move
use sui::tx_context;

fun use_epoch_randomness(ctx: &mut TxContext): u64 {
    let epoch = tx_context::epoch(ctx);
    let epoch_hash = tx_context::epoch_timestamp_ms(ctx);
    // Hash epoch data for randomness
}
```

**Characteristics**:
- Changes every epoch (~24h mainnet)
- Deterministic but unpredictable advance
- Fast (available immediately)
- Limited randomness per epoch

#### VRF (Verifiable Random Function)

```move
// Pseudo-code for VRF pattern
fun vrf_request(vrf_service: &mut VRFService): VRFProof {
    // Request VRF proof from oracle
    // Verify proof on-chain
    // Use as randomness
}
```

**Characteristics**:
- Cryptographic commitment
- Verifiable on-chain
- Higher cost but more secure
- Best for high-value applications

### Security Vulnerabilities

#### 1. MEV (Maximal Extractable Value)

**Risk**: Validators see transactions before inclusion and can exploit ordering.

**Mitigation**:
```move
// Commit-Reveal Pattern
fun commit_random_action(commitment: vector<u8>, ctx: &mut TxContext) {
    // Store commitment
    // User later reveals with proof
}

fun reveal_random_action(
    salt: vector<u8>,
    action: u64,
    commitment: vector<u8>,
    ctx: &mut TxContext
) {
    // Verify: hash(salt + action) == commitment
    // Execute action based on revealed value
}
```

#### 2. Predictability

**Risk**: Using block hash/timestamp as randomness source.

**Safe Implementation**:
```move
// ❌ BAD: Predictable
fun bad_random(ctx: &TxContext): u64 {
    tx_context::digest(ctx)  // Predictable!
}

// ✅ GOOD: Use official randomness
fun good_random(random: &Random): u64 {
    random::next_u64(&random::random_bytes(random))
}
```

#### 3. Replay Attacks

**Risk**: Same random value used multiple times.

**Mitigation**:
```move
// Add uniqueness to prevent replays
fun safe_random_action(
    random: &Random,
    ctx: &mut TxContext
): u64 {
    let sender = tx_context::sender(ctx);
    let digest = tx_context::digest(ctx);
    
    // Hash random value with unique identifiers
    let unique_seed = hash::hash(
        &random::random_bytes(random),
        &sender,
        &digest
    );
    random::next_u64(&unique_seed)
}
```

#### 4. Timing Windows

**Risk**: Transactions in same block share randomness.

**Mitigation**:
```move
// Include sender and sequence in randomness
fn generate_unique_random(
    random: &Random,
    sequence: u64,
    ctx: &mut TxContext
): u64 {
    let random_bytes = random::random_bytes(random);
    let sender = tx_context::sender(ctx);
    
    // Combine multiple inputs for uniqueness
    let combined = hash::hash(
        &random_bytes,
        &sender,
        &sequence
    );
    random::next_u64(&combined)
}
```

### Best Practices Checklist

- [ ] Use Sui's official `random::Random` API
- [ ] Add sender address to randomness derivation
- [ ] Include transaction digest or sequence number
- [ ] Implement commit-reveal for high-value decisions
- [ ] Avoid block hash/timestamp as randomness source
- [ ] Test with adversarial transaction ordering
- [ ] Audit randomness logic in production contracts
- [ ] Monitor for unusual randomness patterns

---

## 4. GraphQL RPC Queries

### Why GraphQL?

```
Traditional REST API:
GET /api/object/0x123 → Returns all fields
GET /api/object/0x123/owner → Separate request

GraphQL:
query {
  object(id: "0x123") {
    objectId      # Only these fields
    owner         # No over-fetching
  }
}
```

**Benefits**:
- Request only needed fields
- Single request for related data
- Reduce bandwidth
- Better performance
- Type-safe with schema

### Sui GraphQL Endpoints

```
Mainnet:   https://sui-mainnet.mystenlabs.com/graphql
Testnet:   https://sui-testnet.mystenlabs.com/graphql
Devnet:    https://sui-devnet.mystenlabs.com/graphql
```

### Common Query Examples

#### Query Object

```graphql
query {
  object(address: "0x2::sui::SUI") {
    objectId
    owner {
      asAddress {
        address
      }
    }
    version
    digest
    storageRebate
    display {
      key
      value
    }
  }
}
```

#### Query Transactions

```graphql
query {
  transactionBlocks(first: 10) {
    edges {
      node {
        digest
        sender {
          address
        }
        gasPrice
        gasUsed
        kind {
          __typename
        }
        status
        executedEpoch
      }
    }
  }
}
```

#### Query Coins

```graphql
query {
  coins(owner: "0x...", first: 20) {
    edges {
      node {
        coinObjectId
        version
        digest
        balance
        coinType
      }
    }
  }
}
```

#### Query Events

```graphql
query {
  events(filter: {eventType: "0x2::coin::TransferEvent"}, first: 50) {
    edges {
      node {
        timestamp
        type
        sender {
          address
        }
        data
      }
    }
  }
}
```

### Using GraphQL in TypeScript

```typescript
import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient(
  'https://sui-testnet.mystenlabs.com/graphql'
);

interface GetObjectQuery {
  object: {
    objectId: string;
    owner?: { asAddress?: { address: string } };
    version: number;
  };
}

const query = `
  query GetObject($address: String!) {
    object(address: $address) {
      objectId
      owner {
        asAddress {
          address
        }
      }
      version
    }
  }
`;

const data = await client.request<GetObjectQuery>(query, {
  address: '0x2::sui::SUI'
});

console.log(data.object);
```

### Pagination

```graphql
query {
  transactionBlocks(
    first: 10              # Items per page
    after: "cursor_here"   # Pagination cursor
  ) {
    edges {
      node { ... }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

---

## 5. Object-Based Local Fee Markets

### Problem: Shared Object Congestion

```
Traditional Network:
All transactions → Single queue → Bottleneck
If one shared object slow → Entire checkpoint slow

Object-Based Fee Markets:
Each object has independent rate limit
Congestion on one object ≠ affects others
```

### How It Works

1. **Per-Object Rate Limiting**
   - Each shared object can accept N transactions per epoch
   - Excess transactions compete for remaining slots
   - Higher gas price = higher priority

2. **Dynamic Pricing**
   - When object is congested: gas price increases
   - Incentivizes using less-congested objects
   - Reduces spam and improves network health

3. **Independent Checkpoints**
   - Each shared object contributes independently
   - One slow object doesn't block entire network
   - Better overall throughput

### Design Best Practices

#### Problem: Single Shared Counter

```move
// ❌ HIGH CONTENTION
public struct GlobalCounter has key {
    id: UID,
    value: u64
}

// All users compete for single object
public fun increment_global(counter: &mut GlobalCounter) {
    counter.value += 1;
}
```

**Impact**:
- All transactions fight for same object
- High gas prices during usage
- Possible transaction failures

#### Solution: Distributed Counters

```move
// ✅ BETTER: Per-user counters
public struct UserCounter has key {
    id: UID,
    owner: address,
    value: u64
}

// Each user has own counter
public fun increment_user(
    counter: &mut UserCounter,
    ctx: &mut TxContext
) {
    assert!(counter.owner == tx_context::sender(ctx));
    counter.value += 1;
}
```

**Advantages**:
- No contention between users
- Lower gas prices
- Better throughput

#### Advanced: Bucket-Based Distribution

```move
// ✅ BEST: Shard by hash
public fun get_bucket_id(user: address, bucket_count: u64): u64 {
    hash::blake2b_256(&bcs::to_bytes(&user)) % bucket_count
}

public fun increment_bucketed(
    buckets: &mut vector<Bucket>,
    ctx: &mut TxContext
) {
    let user = tx_context::sender(ctx);
    let bucket_id = get_bucket_id(user, vector::length(buckets));
    vector::borrow_mut(buckets, bucket_id).increment();
}
```

**Characteristics**:
- Flexible sharding
- Tunable contention
- Scalable design

### Monitoring & Adaptation

```typescript
// Monitor gas prices for object
async function checkObjectCongestion(objectId: string) {
    const data = await getGraphQL(`
        query {
            object(address: "${objectId}") {
                asMoveObject {
                    contents {
                        json
                    }
                }
            }
        }
    `);
    
    // Analyze recent transaction costs
    const recentTxs = await queryObjectTransactions(objectId, 100);
    const avgGasPrice = recentTxs
        .map(tx => tx.gasPrice)
        .reduce((a, b) => a + b) / recentTxs.length;
    
    if (avgGasPrice > CONGESTION_THRESHOLD) {
        // Increase bucket count or use alternative object
        switchToAlternativeObject();
    }
}
```

### Retry Strategy

```typescript
async function robustTransactionExecution(
    transaction: Transaction,
    objectId: string
) {
    const maxRetries = 5;
    const baseDelay = 1000; // 1 second
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            // Attempt transaction with increased gas budget
            const gasBudget = baseGasBudget * (1 + i * 0.5);
            transaction.setGasBudget(gasBudget);
            
            const result = await suiClient.executeTransaction(transaction);
            return result;
        } catch (err) {
            if (i === maxRetries - 1) throw err;
            
            // Exponential backoff
            const delay = baseDelay * Math.pow(2, i);
            await sleep(delay);
            
            // Try different object/bucket on retry
            await switchToBucket();
        }
    }
}
```

---

## Summary

| Topic | Use Case | Key Consideration |
|-------|----------|-------------------|
| **Move 2024** | Using new language features | Opt-in, test thoroughly before mainnet |
| **Custom Indexer** | Scaling beyond RPC limits | Choose storage backend wisely |
| **Randomness** | Lotteries, sampling, games | Never trust predictable sources |
| **GraphQL** | Efficient data queries | Use for complex multi-object queries |
| **Fee Markets** | High-contention objects | Design with sharding in mind |

---

## Resources

- **Move 2024**: https://docs.sui.io/guides/developer/advanced/move-2024
- **Custom Indexer**: https://docs.sui.io/guides/developer/advanced/indexer
- **Randomness**: https://docs.sui.io/guides/developer/advanced/randomness
- **GraphQL RPC**: https://docs.sui.io/guides/developer/advanced/graphql
- **Fee Markets**: https://docs.sui.io/guides/developer/advanced/fee-markets
