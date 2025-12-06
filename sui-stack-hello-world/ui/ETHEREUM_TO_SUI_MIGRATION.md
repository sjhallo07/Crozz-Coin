# Ethereum → Sui: Complete Migration Guide

## Overview

This guide helps developers familiar with **Solidity/Ethereum** transition to **Move/Sui**. While both are blockchain platforms, they have fundamentally different approaches to smart contracts and data management.

**Key Insight:** Ethereum is **contract-centric** (contracts manage data); Sui is **object-centric** (objects manage themselves).

---

## 1. Language: Solidity vs Move

### The Core Difference

| Aspect | Solidity | Move |
|--------|----------|------|
| **Paradigm** | Imperative, contract-based | Functional, object-based |
| **Ownership** | Implicit (managed in contract) | Explicit (in type system) |
| **Inheritance** | Multiple inheritance, polymorphism | No inheritance, uses generics |
| **Mutability** | All state mutable by default | Explicit mutability control |
| **Memory Safety** | Runtime checks | Compile-time verification |
| **Dispatch** | Dynamic (at runtime) | Static (at compile-time) |

### Example: Simple Balance Transfer

**Solidity:**

```solidity
contract Bank {
  mapping(address => uint256) balances;
  
  function transfer(address to, uint256 amount) public {
    balances[msg.sender] -= amount;      // Check & modify sender
    balances[to] += amount;              // Check & modify receiver
  }
}
```

**Move:**

```move
public struct Coin<T> has key, store {
  id: UID,
  balance: u64,
}

public fun transfer<T>(
  coin: &mut Coin<T>,
  amount: u64,
  to: address,
  ctx: &mut TxContext
) {
  let payment = coin::take(&mut coin.balance, amount, ctx);
  transfer::public_transfer(payment, to);
}
```

**Key Differences:**

- Solidity: Contract stores and manages all balances
- Move: Each user owns their own Coin object
- Solidity: `msg.sender` identifies the caller
- Move: Object ownership is verified by protocol at execution

---

## 2. Data Storage: Global vs Distributed

### Solidity: Contract-Centric Storage

```solidity
contract DeFiProtocol {
  struct UserData {
    balance: uint256,
    reward: uint256,
    lastUpdate: uint256,
  }
  
  mapping(address => UserData) userData;  // All in one contract
  
  function deposit(uint256 amount) public {
    userData[msg.sender].balance += amount;
    userData[msg.sender].lastUpdate = block.timestamp;
  }
}
```

**Characteristics:**

- All state centralized in contract storage
- Single source of truth per contract
- Access through contract functions only
- Accessed by address key

### Move: Object-Centric Storage

```move
module defi::pool {
  public struct UserData has key {
    id: UID,
    owner: address,
    balance: u64,
    reward: u64,
    last_update: u64,
  }
  
  public fun deposit(
    user_data: &mut UserData,
    amount: u64,
    ctx: &mut TxContext
  ) {
    user_data.balance += amount;
    user_data.last_update = tx_context::epoch(ctx);
  }
}
```

**Characteristics:**

- State distributed across objects
- Each object owned by an address
- Direct access by owner
- No central contract state
- Objects transferred between addresses

### Migration Strategy

| Solidity | Move |
|----------|------|
| `mapping(address => Data)` | `struct Data has key { id: UID, ... }` |
| Store in contract | Store in objects |
| Access by key | Access by ownership |
| Global state | Distributed state |

---

## 3. Ownership & Access Control

### Solidity: Identity-Based (Address Checks)

```solidity
// Ownable pattern
contract MyContract is Ownable {
  mapping(address => bool) whitelist;
  
  modifier onlyWhitelisted() {
    require(whitelist[msg.sender], "Not whitelisted");
    _;
  }
  
  function restrictedFunction() public onlyWhitelisted {
    // Check msg.sender at runtime
  }
}

// OpenZeppelin AccessControl
contract MyContract is AccessControl {
  bytes32 constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
  
  function adminFunc() public onlyRole(ADMIN_ROLE) {
    // Check role mapping at runtime
  }
}
```

### Move: Capability-Based (Object Grants Rights)

```move
module admin::access {
  use sui::object::{Self, UID};
  
  /// This object grants admin rights
  public struct AdminCap has key {
    id: UID,
  }
  
  /// Only works if you own AdminCap
  public fun admin_only_function(
    _admin: &AdminCap,  // Must pass the capability
    // ... other args
  ) {
    // Type system enforces: if you don't own AdminCap,
    // this function call fails at compile time
  }
}
```

### Key Differences

| Aspect | Solidity | Move |
|--------|----------|------|
| **Mechanism** | Address in mapping | Object ownership |
| **Validation** | Runtime check (`require`) | Compile-time + Protocol |
| **Revocation** | Delete from mapping | Transfer/burn object |
| **Granularity** | Role strings | Custom object types |
| **Security** | Mapping update mistakes | Type system safety |

### Migration Path

```
Solidity                          Move
├─ Ownable contract        →     AdminCap object
├─ Role mapping           →     RoleCap object
├─ require(check)         →     Type requirement
└─ msg.sender validation  →     Object ownership
```

---

## 4. Functions & Composition

### Solidity: Contract Functions + Wrapper Pattern

When combining multiple operations in Solidity, you typically need a wrapper function:

```solidity
contract Router {
  function swapAndDeposit(
    address tokenIn,
    uint256 amount,
    address dex,
    address pool
  ) public {
    // Contract must implement all composition logic
    IERC20(tokenIn).transferFrom(msg.sender, address(this), amount);
    
    uint256 swapped = ISwap(dex).swap(tokenIn, amount);
    
    IPool(pool).deposit(swapped);
    
    // State changes persist
  }
}
```

**Limitations:**

- Need wrapper function for each composition
- Contract logic becomes complex
- Hard to reuse external contracts
- Limited to what contract author implemented

### Move: PTBs (Programmable Transaction Blocks)

On the client side, you compose operations atomically:

```typescript
import { TransactionBlock } from '@mysten/sui.js';

const txb = new TransactionBlock();

// Step 1: Swap tokens
const swapped = txb.moveCall({
  target: `${dexPackage}::swap::swap`,
  arguments: [
    txb.object(tokenInId),
    txb.pure(amount),
  ],
});

// Step 2: Deposit using swap output
txb.moveCall({
  target: `${poolPackage}::pool::deposit`,
  arguments: [swapped],  // Use output from previous call
});

// Execute atomically
await signer.signAndExecuteTransactionBlock({ txb });
```

**Advantages:**

- Client-side composition (no wrapper needed)
- Works with any public function
- Output of one call → input to next
- All-or-nothing execution
- Up to 1,024 commands per transaction

### Function Signature Changes

**Solidity Function:**

```solidity
function transfer(address to, uint256 amount) public {
  // State mutation through storage
  // Caller identified via msg.sender
}
```

**Move Function:**

```move
public fun transfer<T>(
  coin: &mut Coin<T>,      // Object to mutate
  amount: u64,
  to: address,
  ctx: &mut TxContext      // For object creation
) {
  // Caller is implicit in who owns the coin
  // No msg.sender needed
}
```

---

## 5. Contract Upgrades: Proxy vs Native

### Solidity: Proxy Pattern (Complex)

```solidity
// Implementation contract
contract TokenV1 {
  uint256 public totalSupply;
  
  function mint(uint256 amount) public {
    totalSupply += amount;
  }
}

// Proxy (delegates all calls)
contract Proxy {
  address implementation;
  
  fallback() external payable {
    (bool success, bytes memory result) = 
      implementation.delegatecall(msg.data);
  }
}

// Upgrade: Change implementation address
// Users stay at proxy address
// Storage layout must match between versions
```

**Risks:**

- Complex proxy logic (potential bugs)
- Storage layout incompatibility
- Uninitialized variables issues
- Easy to lose funds on bad upgrade

### Move: Native Upgrade (Safe)

```move
/// Package upgraded through native mechanism
module token::coin_v2 {
  // New version can have different fields
  // Protocol ensures compatibility
  
  public struct Coin<T> has key {
    id: UID,
    balance: u64,
    new_field: bool,  // Can add new fields
  }
}

/// Upgrade capability
public struct UpgradeCap has key {
  id: UID,
  policy: u8,
}

public fun upgrade(
  cap: &UpgradeCap,
  new_package: ID,
  ctx: &mut TxContext
) {
  // Protocol handles upgrade validation
  // Type-safe migration
}
```

**Benefits:**

- Compile-time verification of compatibility
- No complex proxy logic
- Can migrate objects with special functions
- Protocol enforces layout compatibility

### Comparison

| Aspect | Solidity Proxy | Move Native |
|--------|----------------|------------|
| **Complexity** | High (delegatecall) | Low (built-in) |
| **Safety** | Low (manual) | High (automatic) |
| **Auditing** | Complex | Simple |
| **Compatibility** | Manual checks | Compiler checks |
| **Cost** | Extra gas for proxy | Efficient |

---

## 6. Assets & Tokens: ERC-20/ERC-721 to Move

### Solidity: ERC-20 (Mapping-Based)

```solidity
contract MyToken is IERC20 {
  mapping(address => uint256) public balanceOf;
  mapping(address => mapping(address => uint256)) public allowance;
  
  uint256 public totalSupply;
  string public name = "MyToken";
  uint8 public decimals = 18;
  
  function transfer(address to, uint256 amount) public returns (bool) {
    balanceOf[msg.sender] -= amount;
    balanceOf[to] += amount;
    emit Transfer(msg.sender, to, amount);
    return true;
  }
  
  function approve(address spender, uint256 amount) public returns (bool) {
    allowance[msg.sender][spender] = amount;
    return true;
  }
  
  function transferFrom(
    address from,
    address to,
    uint256 amount
  ) public returns (bool) {
    allowance[from][msg.sender] -= amount;
    balanceOf[from] -= amount;
    balanceOf[to] += amount;
    return true;
  }
}
```

### Move: Coin & Currency Standard

```move
module token::token {
  use sui::coin::{Self, Coin};
  use sui::transfer;
  use sui::tx_context::{Self, TxContext};
  
  public struct TOKEN has drop {}
  
  fun init(witness: TOKEN, ctx: &mut TxContext) {
    let (treasury, metadata) = coin::create_currency(
      witness,
      18,  // decimals
      b"TOKEN",
      b"MyToken",
      b"Description",
      option::none(),
      ctx
    );
    
    transfer::public_transfer(treasury, tx_context::sender(ctx));
    transfer::public_share_object(metadata);
  }
  
  public fun transfer_token(
    coin: &mut Coin<TOKEN>,
    amount: u64,
    to: address,
    ctx: &mut TxContext
  ) {
    let payment = coin::take(&mut coin.balance, amount, ctx);
    transfer::public_transfer(payment, to);
  }
}
```

### Key Differences

| Feature | ERC-20 | Coin<T> |
|---------|--------|---------|
| **Storage** | Mappings in contract | Individual coins |
| **Approval** | `approve()` then `transferFrom()` | Direct transfer |
| **Custody** | Contract holds all | Users hold coins |
| **Standards** | ERC-20 interface | Native Coin type |
| **Safety** | Requires auditing | Type-safe by default |
| **Royalties** | Not enforced | Enforced by protocol |

### Migration Map

```
ERC-20 Solidity          →   Move Coin<T>
├─ balanceOf mapping    →   User's Coin object
├─ approve + transfer   →   Direct transfer
├─ totalSupply          →   Supply tracking (off-chain or object)
├─ decimals             →   Defined at coin creation
└─ name/symbol          →   In metadata object
```

---

## 7. Access Patterns: msg.sender to Ownership

### Solidity Pattern

```solidity
contract Bank {
  mapping(address => uint256) deposits;
  
  function deposit() public payable {
    // msg.sender identifies caller
    deposits[msg.sender] += msg.value;
  }
  
  function withdraw(uint256 amount) public {
    // Check if caller has balance
    require(deposits[msg.sender] >= amount);
    deposits[msg.sender] -= amount;
    // Transfer to msg.sender
  }
}
```

### Move Pattern

```move
public struct Deposit has key {
  id: UID,
  owner: address,
  amount: u64,
}

public fun deposit(
  mut deposit: Deposit,  // Object owner passes it
  amount: u64,
  ctx: &mut TxContext
) {
  // Protocol verified owner before execution
  deposit.amount += amount;
}

public fun withdraw(
  mut deposit: Deposit,  // Owner passes object
  amount: u64,
  ctx: &mut TxContext
) -> Coin<SUI> {
  assert!(deposit.amount >= amount);
  deposit.amount -= amount;
  
  coin::take(&mut sui_balance, amount, ctx)
}
```

### Validation Comparison

| Solidity | Move |
|----------|------|
| `require(msg.sender == owner)` | Object passed as argument |
| Runtime check in function | Protocol validates before execution |
| Caller proves identity | Owner proves object ownership |
| Revert if unauthorized | Transaction fails at protocol level |

---

## 8. Development Workflow Changes

### Solidity Development

```bash
# Install tools
npm install -g hardhat
npm install @openzeppelin/contracts

# Compile
npx hardhat compile

# Test
npx hardhat test

# Deploy
npx hardhat run scripts/deploy.js --network mainnet
```

### Move Development

```bash
# Install Sui CLI
curl -sSL https://sui-releases.s3-us-west-2.amazonaws.com/latest/sui-macos-x86_64 | \
  tar xz -C ~/.local/bin sui

# Create project
sui move new my_project
cd my_project

# Compile
sui move build

# Test
sui move test

# Publish
sui client publish --gas-budget 100000000
```

### IDE Setup

**Solidity:**

- VSCode + Solidity extension
- Hardhat for compilation

**Move:**

- VSCode + Move extension (mysten.move)
- Move compiler built into Sui CLI

---

## 9. Complete Migration Checklist

### Phase 1: Setup

- [ ] Install Sui CLI
- [ ] Install VSCode Move extension
- [ ] Create Move project with `sui move new`
- [ ] Review Move.toml and dependencies

### Phase 2: Redesign Data Model

- [ ] Map Solidity contracts → Move modules
- [ ] Convert state variables → Objects with `key` ability
- [ ] Replace mappings with individual objects
- [ ] Add `id: UID` to stored structs
- [ ] Add `store` ability for generic types

### Phase 3: Rewrite Functions

- [ ] Remove `msg.sender` checks
- [ ] Add `ctx: &mut TxContext` where needed
- [ ] Convert `require()` to `assert!()`
- [ ] Use `&mut` for state modifications
- [ ] Implement entry functions for client calls

### Phase 4: Access Control

- [ ] Replace `Ownable` with capability objects
- [ ] Replace role mappings with cap objects
- [ ] Use `drop` ability for consumable caps
- [ ] Implement revocation via ownership

### Phase 5: Composition

- [ ] Remove wrapper/router functions
- [ ] Keep functions single-responsibility
- [ ] Design for PTB composition
- [ ] Return objects instead of storing

### Phase 6: Testing

- [ ] Write Move unit tests
- [ ] Test ownership rules
- [ ] Test object transfers
- [ ] Test error conditions
- [ ] Test on devnet/testnet

### Phase 7: Deployment

- [ ] Publish to devnet
- [ ] Build TypeScript client
- [ ] Test PTB construction
- [ ] Publish to testnet
- [ ] Security audit
- [ ] Publish to mainnet

---

## 10. Real-World Examples

### Example 1: Simple Counter

**Solidity:**

```solidity
contract Counter {
  uint256 count;
  
  function increment() public { count++; }
  function get() public view returns (uint256) { return count; }
}
```

**Move:**

```move
module counter::counter {
  use sui::object::{Self, UID};
  use sui::transfer;
  use sui::tx_context::TxContext;
  
  public struct Counter has key {
    id: UID,
    count: u64,
  }
  
  public fun create(ctx: &mut TxContext) {
    let counter = Counter {
      id: object::new(ctx),
      count: 0,
    };
    transfer::transfer(counter, tx_context::sender(ctx));
  }
  
  public fun increment(counter: &mut Counter) {
    counter.count += 1;
  }
  
  public fun get(counter: &Counter): u64 {
    counter.count
  }
}
```

**Usage (TypeScript/PTB):**

```typescript
const txb = new TransactionBlock();

// Create counter
const counter = txb.moveCall({
  target: `${pkg}::counter::create`,
});

// Increment
txb.moveCall({
  target: `${pkg}::counter::increment`,
  arguments: [counter],
});

// Get value
const count = txb.moveCall({
  target: `${pkg}::counter::get`,
  arguments: [counter],
});
```

### Example 2: Token Swap with PTB

**Solidity (wrapper needed):**

```solidity
contract Aggregator {
  function swapBest(
    IERC20 tokenIn,
    uint256 amount,
    address dex1,
    address dex2
  ) public {
    tokenIn.transferFrom(msg.sender, address(this), amount);
    
    uint256 out1 = IDex(dex1).getQuote(amount);
    uint256 out2 = IDex(dex2).getQuote(amount);
    
    if (out1 > out2) {
      IDex(dex1).swap(tokenIn, amount);
    } else {
      IDex(dex2).swap(tokenIn, amount);
    }
  }
}
```

**Move (no wrapper, client-side PTB):**

Move contracts stay simple:

```move
module dex_a::swap {
  public fun quote(amount: u64): u64 { /* ... */ }
  public fun swap(coin: &mut Coin<TOKEN>, amount: u64): Coin<USDC> { /* ... */ }
}

module dex_b::swap {
  public fun quote(amount: u64): u64 { /* ... */ }
  public fun swap(coin: &mut Coin<TOKEN>, amount: u64): Coin<USDC> { /* ... */ }
}
```

Client orchestrates:

```typescript
const txb = new TransactionBlock();

// Get quotes from both DEXes
const quote1 = txb.moveCall({
  target: `${dexA}::swap::quote`,
  arguments: [txb.pure(amount)],
});

const quote2 = txb.moveCall({
  target: `${dexB}::swap::quote`,
  arguments: [txb.pure(amount)],
});

// Compare and choose (in application logic)
const bestDex = quote1 > quote2 ? dexA : dexB;
const bestQuote = quote1 > quote2 ? quote1 : quote2;

// Swap at best price
txb.moveCall({
  target: `${bestDex}::swap::swap`,
  arguments: [txb.object(coinId), txb.pure(amount)],
});
```

---

## 11. Common Pitfalls & Solutions

| Pitfall | Solidity | Move Solution |
|---------|----------|---------------|
| Forgot `msg.sender` check | Runtime error | Pass object - protocol verifies |
| Complex proxy upgrade | Proxy bugs | Native upgrade capability |
| ERC-20 approval race | Approve then transfer | Direct Coin transfer |
| Limited composition | Need wrapper function | Use PTBs on client |
| Reentrancy bugs | Guards needed | Immutable objects prevent |
| Storage collisions | Manual layout care | Type system ensures safe |
| Lost gas on failed TX | Paid gas before fail | Pay gas only on success |

---

## 12. Performance Differences

| Metric | Ethereum | Sui |
|--------|----------|-----|
| **Finality** | 12+ blocks (~3 min) | 2 round trips (~200ms) |
| **Throughput** | ~15 TPS | 120,000+ TPS (parallelizable) |
| **Gas (simple TX)** | $5-50+ | $0.001-0.01 |
| **Gas (complex TX)** | $100+ | $0.01-0.10 |
| **Execution** | Sequential | Parallel (if independent) |
| **Storage costs** | Expensive | Cheap with rebates |

---

## 13. Resources

### Official Documentation

- [Sui Documentation](https://docs.sui.io)
- [Move Book](https://move-book.com)
- [Sui for Ethereum Developers](https://docs.sui.io/concepts/sui-for-ethereum)

### Tools

- [Sui CLI](https://docs.sui.io/guides/developer/getting-started)
- [Move VSCode Extension](https://marketplace.visualstudio.com/items?itemName=mysten.move)
- [Sui Explorer](https://suiscan.xyz)
- [TypeScript SDK](https://sdk.mystenlabs.com/)

### Learning

- [Sui Examples](https://github.com/MystenLabs/sui/tree/main/examples)
- [Move Examples](https://move-book.com/)
- [Sui Testnet Faucet](https://testnet-faucet.sui.io)

---

## Summary

### Mental Model Shift

**Ethereum: "Where is the data?"**

- Data lives in contract storage
- Contract manages everything
- Caller identified by address

**Sui: "Who owns the data?"**

- Data lives in objects
- Objects own themselves
- Owner identified by object possession

### Three Rules of Move

1. **Objects are Assets**
   - Think NFT model (everything is tradeable)
   - Each unique state has its own object

2. **Ownership is Explicit**
   - Type system enforces access rights
   - No runtime checks needed
   - Protocol validates at execution

3. **Composition is Client-Side**
   - Write simple, focused functions
   - Client chains them with PTBs
   - No need for wrapper contracts

---

**Next Steps:**

1. Set up Move development environment
2. Rewrite simple contract (counter, token, etc.)
3. Test on devnet
4. Build TypeScript client with PTBs
5. Scale to complex contracts

Good luck with your migration! 🚀
