# Ethereum → Sui: Quick Reference Guide

## 1. Language Syntax Quick Swap

### Variable Declaration

| Solidity | Move |
|----------|------|
| `uint256 count = 0;` | `count: u64 = 0` |
| `address owner;` | `owner: address` |
| `bool active;` | `active: bool` |
| `string name;` | `name: String` (need to import) |
| `mapping(address => uint256) balances;` | `struct Balances { id: UID, data: vector<u64> }` |

### Functions

| Solidity | Move |
|----------|------|
| `function transfer(address to, uint256 amount) public { ... }` | `public fun transfer(to: address, amount: u64) { ... }` |
| `public payable` | `public entry fun withdraw(coin: Coin<SUI>, ...) { ... }` |
| `view` (read-only) | `public fun get_value(ref: &Obj): u64 { ... }` |
| `internal` | `fun` (no prefix) |
| `require(condition, msg);` | `assert!(condition, error_code);` |
| `revert("msg");` | `abort error_code` |

### Control Flow

| Solidity | Move |
|----------|------|
| `if (x > 0) { ... }` | `if (x > 0) { ... }` |
| `for (uint i = 0; i < n; i++) { ... }` | `let i = 0; while (i < n) { ... i += 1; }` |
| `return x;` | Last expression is return |
| `emit Event(...);` | Events handled differently |

---

## 2. Contract → Module Mapping

### Structure

```solidity
// Solidity
contract MyContract {
  struct Data { ... }
  
  function myFunction() public { ... }
}
```

```move
// Move
module app::my_module {
  use sui::object::{Self, UID};
  use sui::transfer;
  use sui::tx_context::TxContext;
  
  public struct Data has key {
    id: UID,
    ...
  }
  
  public fun my_function(...) { ... }
}
```

### Key Differences

| Aspect | Solidity | Move |
|--------|----------|------|
| Contract | Class-like | Module with functions |
| State | Contract fields | Objects with UID |
| Constructor | `constructor()` | `fun init(ctx: &mut TxContext)` |
| Inheritance | Supported | Not supported (use composition) |
| Modules | Not built-in | Primary organization unit |

---

## 3. State Management Patterns

### Simple Value Storage

**Solidity:**
```solidity
contract Storage {
  uint256 public value = 0;
  
  function setValue(uint256 v) public {
    value = v;
  }
}
```

**Move:**
```move
module storage::simple {
  public struct Storage has key {
    id: UID,
    value: u64,
  }
  
  public fun set_value(storage: &mut Storage, v: u64) {
    storage.value = v;
  }
}
```

### Mappings → Objects

**Solidity:**
```solidity
mapping(address => uint256) balances;
balances[msg.sender] = 100;
uint256 balance = balances[user];
```

**Move:**
```move
public struct Balance has key {
  id: UID,
  owner: address,
  amount: u64,
}

// Each user has their own Balance object
// Access through ownership, not mapping lookup
```

### Collections → Dynamic Fields

**Solidity:**
```solidity
mapping(address => mapping(uint256 => bool)) whitelist;
```

**Move:**
```move
use sui::dynamic_field as df;

public struct Whitelist has key {
  id: UID,
}

public fun add_to_whitelist(wl: &mut Whitelist, addr: address) {
  df::add(&mut wl.id, addr, true);
}

public fun is_whitelisted(wl: &Whitelist, addr: address): bool {
  df::exists_(&wl.id, addr)
}
```

---

## 4. Access Control Cheat Sheet

### Solidity Pattern

```solidity
require(msg.sender == owner, "Not owner");
```

### Move Equivalent

```move
// Method 1: Check owner field (not preferred)
assert!(obj.owner == tx_context::sender(ctx), 0);

// Method 2: Use capability (preferred)
public fun protected(cap: &AdminCap, ...) {
  // If caller doesn't own AdminCap, this won't execute
}
```

---

## 5. Common Patterns Side-by-Side

### Pattern: Counter

**Solidity:**
```solidity
contract Counter {
  uint256 count = 0;
  
  function increment() public { count++; }
  function get() public view returns (uint256) { return count; }
}
```

**Move:**
```move
public struct Counter has key {
  id: UID,
  count: u64,
}

public fun increment(c: &mut Counter) {
  c.count += 1;
}

public fun get(c: &Counter): u64 {
  c.count
}
```

### Pattern: Token Transfer

**Solidity:**
```solidity
contract Token {
  mapping(address => uint256) balances;
  
  function transfer(address to, uint256 amount) public {
    balances[msg.sender] -= amount;
    balances[to] += amount;
  }
}
```

**Move:**
```move
public fun transfer(coin: &mut Coin<T>, amount: u64, to: address, ctx: &mut TxContext) {
  let payment = coin::take(&mut coin.balance, amount, ctx);
  transfer::public_transfer(payment, to);
}
```

### Pattern: Admin-Only Function

**Solidity:**
```solidity
modifier onlyAdmin() {
  require(admins[msg.sender], "Not admin");
  _;
}

function adminAction() public onlyAdmin {
  // Protected code
}
```

**Move:**
```move
public struct AdminCap has key { id: UID }

public fun admin_action(
  _cap: &AdminCap,  // Proof of admin status
  // ... other args
) {
  // Protected code - only works if you own AdminCap
}
```

---

## 6. Transaction Construction (PTB vs Function Call)

### Solidity: Single Contract Call

```javascript
// Solidity: Call one function
const tx = await contract.transfer(recipient, amount);
```

### Move: PTB Composition

```typescript
import { TransactionBlock } from '@mysten/sui.js';

// Move: Compose multiple operations
const txb = new TransactionBlock();

// Operation 1
const result1 = txb.moveCall({
  target: `${pkg1}::module::func1`,
  arguments: [arg1, arg2],
});

// Operation 2 (uses result from operation 1)
txb.moveCall({
  target: `${pkg2}::module::func2`,
  arguments: [result1, arg3],
});

// Execute atomically
const result = await client.signAndExecuteTransactionBlock({
  transactionBlock: txb,
  signer: keypair,
});
```

---

## 7. Type System Comparison

### Abilities (Move's Type Constraints)

| Ability | Meaning | Example |
|---------|---------|---------|
| `copy` | Can be duplicated | `u64`, `bool` |
| `drop` | Can be discarded | Temporary values |
| `store` | Can be stored in other structs | Custom types in fields |
| `key` | Can be a top-level object | User assets, NFTs |

### Defining Structs

```move
// Read-only data (has copy and drop)
public struct Point has copy, drop {
  x: u64,
  y: u64,
}

// Transferable data (has store)
public struct Token has store {
  value: u64,
}

// On-chain asset (has key and store)
public struct NFT has key, store {
  id: UID,
  metadata: String,
}
```

---

## 8. Error Handling

### Solidity

```solidity
require(balance >= amount, "Insufficient balance");
require(msg.sender == owner, "Not authorized");
revert("Custom error");
```

### Move

```move
// Assert with error code
assert!(balance >= amount, 0);  // 0 = error code for insufficient balance
assert!(sender == owner, 1);    // 1 = error code for not authorized
abort 2;                        // Custom abort

// Error codes defined as constants
const E_INSUFFICIENT_BALANCE: u64 = 0;
const E_NOT_AUTHORIZED: u64 = 1;
```

---

## 9. Memory/Reference Types

### Solidity

```solidity
function read(MyStruct storage s) internal view {
  uint256 x = s.value;  // Read
}

function write(MyStruct storage s) internal {
  s.value = 100;  // Write
}
```

### Move

```move
// Immutable reference (read-only)
public fun read(s: &MyStruct): u64 {
  s.value
}

// Mutable reference (can modify)
public fun write(s: &mut MyStruct, v: u64) {
  s.value = v;
}

// Takes ownership (consumes object)
public fun consume(s: MyStruct) {
  let MyStruct { id, value } = s;
  // Now s is gone
}
```

---

## 10. Important Differences Summary

### Access Control

| Solidity | Move |
|----------|------|
| `msg.sender` identifies caller | Object passed as argument |
| Runtime require() checks | Compile-time type checks |
| Can be bypassed if logic error | Type system enforces |

### State Mutations

| Solidity | Move |
|----------|------|
| Global contract storage | Individual objects |
| Any function can write | Only mutable references can write |
| Persist automatically | Must explicitly transfer |

### Composition

| Solidity | Move |
|----------|------|
| Need wrapper function | Client uses PTB |
| Limited to what contract implements | Can compose any functions |
| Sequential calls | Atomic transaction block |

### Upgrades

| Solidity | Move |
|----------|------|
| Proxy pattern | Native upgrade capability |
| Complex and error-prone | Type-safe and built-in |
| Storage layout issues | Protocol handles compatibility |

---

## 11. Development Workflow

### Solidity Workflow
```bash
1. Write contract.sol
2. npx hardhat compile
3. npx hardhat test
4. npx hardhat run deploy.js
5. Verify on Etherscan
```

### Move Workflow
```bash
1. Create module.move
2. sui move build
3. sui move test
4. sui client publish --gas-budget 100000000
5. Verify on Sui Explorer
```

---

## 12. Quick Lookup Table

| Need | Solidity | Move |
|------|----------|------|
| Create new value | `new Type()` | `Type { field: value }` |
| Modify field | `obj.field = value` | `obj.field = value` (with &mut) |
| Call function | `obj.method()` or `contract.func()` | `module::function(args)` |
| Check ownership | `require(msg.sender == owner)` | Pass object proving ownership |
| Return value | `return x` | Last expression |
| Loop | `for`, `while` | `while`, `loop` |
| Error | `require()`, `revert()` | `assert!()`, `abort` |
| Array | `uint256[]` | `vector<u64>` |
| Map | `mapping(k => v)` | `dynamic_field` + object |
| Event | `emit Event()` | Event struct (system) |
| Owner | `address owner` | Capability object |
| Permission | `onlyOwner` modifier | `&CapabilityObject` param |

---

## 13. Mental Model: Three Key Rules

### Rule 1: Objects Are Assets
- Every piece of state should be an object
- Think "NFT model" - each state is transferable
- Objects have owners

### Rule 2: Ownership Is Explicit
- Type system enforces who can do what
- No `msg.sender` checks needed
- Protocol validates ownership at execution

### Rule 3: Composition Is Client-Side
- Write simple, single-purpose functions
- Client chains them with PTBs
- No need for wrapper contracts

---

## 14. Common Gotchas

### Gotcha 1: Forgot &mut

**Wrong:**
```move
public fun increment(counter: &Counter) {
  counter.count += 1;  // ERROR: counter is immutable
}
```

**Right:**
```move
public fun increment(counter: &mut Counter) {
  counter.count += 1;  // OK: counter is mutable
}
```

### Gotcha 2: Forgot to Transfer

**Wrong:**
```move
let new_coin = coin::zero(ctx);
// Function ends, new_coin is dropped
```

**Right:**
```move
let new_coin = coin::zero(ctx);
transfer::public_transfer(new_coin, recipient);
// Now it's accessible
```

### Gotcha 3: Used msg.sender Logic

**Wrong:**
```move
// Move doesn't have msg.sender
let sender = tx_context::sender(ctx);  // This doesn't mean anything
```

**Right:**
```move
// Objects prove ownership
public fun my_func(obj: &MyObject) {
  // Caller must own obj - protocol verified before call
}
```

### Gotcha 4: Tried to Use Inheritance

**Wrong:**
```move
// Move has no inheritance
public struct Child is Parent { ... }  // ERROR
```

**Right:**
```move
// Use composition instead
public struct Child {
  parent_data: Parent,
  child_data: u64,
}
```

---

## 15. Resources & Next Steps

### Official Docs
- [Sui Docs](https://docs.sui.io)
- [Move Book](https://move-book.com)
- [Sui for Ethereum Developers](https://docs.sui.io/concepts/sui-for-ethereum)

### Tools
- [Sui CLI](https://docs.sui.io/guides/developer/getting-started)
- [Move VSCode Extension](https://marketplace.visualstudio.com/items?itemName=mysten.move)
- [TypeScript SDK](https://sdk.mystenlabs.com/)

### Examples
- [Sui Examples](https://github.com/MystenLabs/sui/tree/main/examples/move)
- [Move Book Examples](https://move-book.com/)

---

**Pro Tip:** Start by rewriting a simple Solidity contract (like Counter) in Move. This mental model shift takes practice but is worth it! 🚀
