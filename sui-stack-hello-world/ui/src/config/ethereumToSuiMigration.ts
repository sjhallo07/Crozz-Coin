// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * SOLIDITY → MOVE CONCEPT MAPPING
 *
 * This configuration maps all major differences between Ethereum/Solidity
 * and Sui/Move to help developers transition their smart contracts.
 */

/**
 * 1. PROGRAMMING LANGUAGE COMPARISON
 * Solidity vs Move
 */
export const LANGUAGE_COMPARISON = {
  solidity: {
    name: "Solidity",
    blockchain: "Ethereum",
    runtime: "EVM (Ethereum Virtual Machine)",
    paradigm: "Account-based, contract-centric",
    type_system: "Dynamically typed with some static checks",
    inheritance: "Multiple inheritance with polymorphism",
    memory_model: "Stack, memory, storage",
    features: {
      interfaces: true,
      abstract_contracts: true,
      polymorphism: true,
      dynamic_dispatch: true,
      mappings: true,
    },
    example: `
// Solidity: Account-centric storage in contract
contract Token {
  mapping(address => uint256) balances;
  
  function transfer(address to, uint256 amount) public {
    balances[msg.sender] -= amount;
    balances[to] += amount;
  }
}
    `,
  },

  move: {
    name: "Move",
    blockchain: "Sui",
    runtime: "MoveVM",
    paradigm: "Object-centric, data-owned",
    type_system: "Statically typed with ownership system",
    inheritance: "No inheritance, uses generics and abilities",
    memory_model: "Stack, heap (objects with ownership)",
    features: {
      interfaces: false,
      abstract_contracts: false,
      polymorphism: false,
      dynamic_dispatch: false,
      generics: true,
      abilities: true,
      capabilities: true,
    },
    example: `
// Move: Object-centric storage, owned by users
public struct Coin has key, store {
  id: UID,
  balance: u64,
}

public fun transfer(coin: &mut Coin, amount: u64) {
  coin.balance -= amount;
}
    `,
  },

  comparison: {
    paradigm: {
      solidity: "Contracts store and manage data",
      move: "Objects own and manage their own data",
    },
    state: {
      solidity: "Global state in contract storage",
      move: "Distributed state in individual objects",
    },
    ownership: {
      solidity: "Implicit through access control patterns",
      move: "Explicit through type system",
    },
    upgrades: {
      solidity: "Proxy pattern (complex, error-prone)",
      move: "Native upgrade mechanism (safe, built-in)",
    },
  },
};

/**
 * 2. DATA STORAGE MODEL
 * Where and how data is stored
 */
export const DATA_STORAGE = {
  solidity: {
    storage_location: "Smart contract state",
    structure: "Mappings, arrays, structs in contract",
    example: `
contract BankAccount {
  mapping(address => uint256) deposits;
  mapping(address => bool) approved;
  
  struct Account {
    owner: address,
    balance: uint256,
    active: bool
  }
}
    `,
    characteristics: {
      centralized: "All data in one contract",
      accessed_by: "Contract functions only",
      owned_by: "Contract address",
      mutation: "Through contract function calls",
    },
  },

  move: {
    storage_location: "Distributed Move objects",
    structure: "Objects with UID, stored on-chain",
    example: `
public struct Account has key {
  id: UID,
  owner: address,
  balance: u64,
  active: bool,
}

public struct Deposit has key {
  id: UID,
  amount: u64,
  depositor: address,
}
    `,
    characteristics: {
      decentralized: "Each object is independent",
      accessed_by: "Owner through capabilities",
      owned_by: "Individual addresses or objects",
      mutation: "Direct through PTB or function call",
    },
  },

  migration_tips: [
    "Convert contract state variables to separate objects",
    "Replace mappings with objects that have UID",
    "Each unique data owner gets their own object instance",
    "Use dynamic fields for variable-sized collections",
    'Think: "NFT model" - each piece of state is an asset',
  ],
};

/**
 * 3. OWNERSHIP AND ACCESS CONTROL
 * How access is granted and enforced
 */
export const OWNERSHIP_AND_ACCESS = {
  solidity_access_control: {
    patterns: {
      ownable: {
        description: "Single owner through address check",
        example: `
contract MyContract is Ownable {
  function onlyOwner() public onlyOwner {
    // Only contract owner can call
  }
}
        `,
      },
      access_control: {
        description: "Role-based through OpenZeppelin",
        example: `
contract MyContract is AccessControl {
  bytes32 constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
  
  function adminFunction() onlyRole(ADMIN_ROLE) public {
    // Only admin role can call
  }
}
        `,
      },
      mapping_based: {
        description: "Custom logic through mappings",
        example: `
contract Custom {
  mapping(address => bool) whitelist;
  
  modifier onlyWhitelisted() {
    require(whitelist[msg.sender]);
    _;
  }
}
        `,
      },
    },
    characteristics: {
      validation: "Runtime checks in function body",
      reverts: "If condition not met, transaction reverts",
      identity_based: "Checks msg.sender address",
      stateless: "No persistent capability object",
    },
  },

  move_access_control: {
    patterns: {
      capability: {
        description: "Capability object grants access",
        example: `
/// Admin can create new users
public struct AdminCap has drop {}

public fun new_user(_: &AdminCap, ctx: &mut TxContext) {
  User { id: object::new(ctx) }
}
        `,
      },
      shared_objects: {
        description: "Public objects with mutable access",
        example: `
public struct SharedResource has key {
  id: UID,
  data: u64,
}

public fun modify_shared(obj: &mut SharedResource, val: u64) {
  obj.data = val;
}
        `,
      },
      owned_objects: {
        description: "Owner-only through type system",
        example: `
public fun transfer(coin: Coin, to: address) {
  // Ownership check done at protocol level
  // Transaction fails if signer doesn't own coin
}
        `,
      },
    },
    characteristics: {
      validation: "Type system enforces at compile time",
      protocol_level: "Ownership verified by validators",
      capability_based: "Objects grant rights",
      stateful: "Capability object persists",
    },
  },

  comparison: {
    solidity: "Identity/address-based (WHO can call)",
    move: "Capability/object-based (WHAT objects are needed)",
  },

  migration_strategy: [
    "Replace Ownable with capability objects",
    "Convert role mappings to capability types",
    "Use object ownership instead of address checks",
    "Let protocol enforce ownership at execution",
    "Prefer capability objects for better security",
  ],
};

/**
 * 4. CONTRACT INHERITANCE AND POLYMORPHISM
 * How contracts extend each other
 */
export const INHERITANCE_COMPARISON = {
  solidity_inheritance: {
    description: "Multiple inheritance with method overriding",
    example: `
contract Base {
  virtual function getValue() public view returns (uint256) {
    return 1;
  }
}

contract Child is Base {
  override function getValue() public view returns (uint256) {
    return 2;
  }
}
    `,
    features: {
      multiple_inheritance: true,
      method_overriding: true,
      abstract_contracts: true,
      interfaces: true,
      polymorphism: true,
      dynamic_dispatch: true,
    },
    challenges: [
      "Diamond problem with multiple inheritance",
      "Hard to trace method resolution order",
      "Complex dispatch at runtime",
      "Potential security vulnerabilities",
    ],
  },

  move_alternatives: {
    description: "No inheritance, uses generics and abilities",
    example: `
// Generic type parameter instead of inheritance
public fun process<T: drop>(item: T) {
  // Works with any type T that has drop ability
}

// Abilities define what operations are allowed
public struct Container<T: store> has key {
  id: UID,
  item: T,  // T must be storable
}
    `,
    features: {
      generics: true,
      abilities: true,
      traits: false,
      polymorphism: "through generics",
      dynamic_dispatch: false,
      composition: true,
    },
    benefits: [
      "No diamond problem",
      "Clear data flow",
      "Compile-time verification",
      "Better security properties",
    ],
  },

  move_abilities: {
    copy: {
      description: "Can be copied (duplicated)",
      use_case: "Primitive types, read-only",
      example: "u64, bool, address",
    },
    drop: {
      description: "Can be discarded without explicit action",
      use_case: "Temporary values",
      example: "u64, bool without key/store",
    },
    store: {
      description: "Can be stored in other structs",
      use_case: "Field values, generic types",
      example: "Custom types that can nest",
    },
    key: {
      description: "Can be a top-level object",
      use_case: "On-chain assets, NFTs",
      example: "User accounts, tokens",
    },
  },

  migration_strategy: [
    "Replace inheritance with composition",
    "Use generic type parameters <T>",
    "Leverage abilities for constraints",
    "Create trait-like modules instead of interfaces",
    "Share common logic through module functions",
  ],
};

/**
 * 5. OBJECT MUTATION PATTERNS
 * How state is modified
 */
export const MUTATION_PATTERNS = {
  solidity_mutation: {
    model: "Global state modification",
    process: [
      "1. Caller sends transaction to contract",
      "2. Contract validates caller (msg.sender)",
      "3. Contract modifies its storage state",
      "4. State change persists across transactions",
    ],
    example: `
contract Bank {
  mapping(address => uint256) balances;
  
  function deposit() public payable {
    // No ownership check, only msg.sender check
    balances[msg.sender] += msg.value;
  }
  
  function withdraw(uint256 amount) public {
    require(balances[msg.sender] >= amount);
    balances[msg.sender] -= amount;
    // Transfer to caller
  }
}
    `,
    characteristics: {
      caller_based: "Uses msg.sender for validation",
      contract_centric: "Contract manages all state",
      global_state: "One source of truth per contract",
      mutation_semantics: "Through function calls",
    },
  },

  move_mutation: {
    model: "Object owner-based mutation",
    process: [
      "1. Owner passes object as argument to PTB",
      "2. Protocol validates owner at execution",
      "3. Function receives mutable reference (&mut)",
      "4. Function modifies object state",
      "5. Modified object stored with owner",
    ],
    example: `
public struct Account has key {
  id: UID,
  owner: address,
  balance: u64,
}

public fun deposit(account: &mut Account, amount: u64) {
  // Ownership checked by protocol
  // account passed as mutable reference
  account.balance += amount;
}
    `,
    characteristics: {
      owner_based: "Object ownership enforced by protocol",
      object_centric: "Objects manage themselves",
      distributed_state: "Each object is independent",
      reference_semantics: "Through &mut references",
    },
  },

  ptb_advantage: {
    description: "Programmable Transaction Blocks enable atomic composition",
    example: `
// Single atomic transaction combining multiple operations
const txb = new TransactionBlock();

// Operation 1: Get object
const coin = txb.object(coinId);

// Operation 2: Use output from previous call
txb.moveCall({
  target: \`\${packageId}::bank::deposit\`,
  arguments: [coin, txb.pure(amount)],
});

// Operation 3: Use output from operation 2
const result = txb.moveCall({
  target: \`\${packageId}::bank::check_balance\`,
  arguments: [result_from_op2],
});

// All operations execute atomically with same ownership checks
    `,
    benefits: [
      "Compose multiple calls atomically",
      "Chain outputs as inputs to next call",
      "No need for super-contract",
      "Can handle up to 1,024 commands",
      "Guaranteed all-or-nothing execution",
    ],
  },

  migration_strategy: [
    "Convert contract functions to object methods",
    "Pass objects as mutable references (&mut)",
    "Remove msg.sender checks (protocol enforces)",
    "Use PTBs to compose related operations",
    'Think: "Who owns this object?" not "Who called this?"',
  ],
};

/**
 * 6. CONTRACT UPGRADES
 * How to evolve contracts over time
 */
export const UPGRADE_PATTERNS = {
  solidity_upgrades: {
    pattern: "Proxy pattern with delegation",
    flow: [
      "1. Deploy logic contract with functions",
      "2. Deploy proxy contract that delegates calls",
      "3. Proxy forwards all calls to logic contract",
      "4. To upgrade: deploy new logic, point proxy to it",
      "5. Users interact with proxy (address stays same)",
    ],
    example: `
// Proxy pattern (complex and error-prone)
contract Proxy {
  address implementation;
  
  fallback() external payable {
    (bool success, bytes memory result) = 
      implementation.delegatecall(msg.data);
  }
}

// To upgrade: change implementation address
// Storage layout must match between versions
    `,
    challenges: [
      "Complex proxy logic (potential bugs)",
      "Storage layout compatibility needed",
      "Easy to make unsafe upgrades",
      "Requires careful testing",
      "Users may lose funds if done wrong",
    ],
  },

  move_upgrades: {
    pattern: "Native upgrade mechanism with capability",
    flow: [
      "1. Publish initial package (v1)",
      "2. To upgrade: publish new package (v2)",
      "3. New objects use new package functions",
      "4. Old objects can be migrated if compatible",
      "5. Both versions can coexist during migration",
    ],
    example: `
// Move: Native upgrade with capability
public struct UpgradeCap has key {
  id: UID,
  package_version: u64,
}

public fun upgrade(
  cap: &UpgradeCap,
  new_package: ID
) {
  // Upgrade logic handled by protocol
}

// New version can have different layout
// Protocol ensures compatibility
    `,
    safety_features: [
      "Compile-time verification of layout compatibility",
      "Upgrade capability controls who can upgrade",
      "Protocol checks dependency constraints",
      "Shared objects versioning supported",
      "Less auditing needed than Solidity proxy",
    ],
  },

  comparison: {
    solidity: "Manual proxy pattern (developer implements)",
    move: "Native support (protocol handles)",
    complexity: {
      solidity: "High (easy to make mistakes)",
      move: "Low (built into language)",
    },
    safety: {
      solidity: "Requires careful implementation",
      move: "Type system provides safety",
    },
  },

  migration_strategy: [
    "Remove proxy pattern entirely",
    "Use native Move upgrade mechanism",
    "Version shared objects in code",
    "Keep old objects during migration period",
    "Implement migration functions for new version",
  ],
};

/**
 * 7. ASSET AND TOKEN MANAGEMENT
 * How tokens and assets work
 */
export const ASSET_MANAGEMENT = {
  solidity_tokens: {
    standard: "ERC-20, ERC-721, ERC-1155",
    structure: {
      erc20: `
contract Token {
  mapping(address => uint256) balances;
  mapping(address => mapping(address => uint256)) allowances;
  
  function transfer(address to, uint256 amount) public {
    balances[msg.sender] -= amount;
    balances[to] += amount;
  }
  
  function transferFrom(address from, address to, uint256 amount) public {
    require(allowances[from][msg.sender] >= amount);
    balances[from] -= amount;
    balances[to] += amount;
  }
}
      `,
      characteristics: {
        stored_in: "Contract mappings",
        access: "Through contract functions",
        standard: "ERC-20 interface",
        user_control: "Indirect (through contract)",
      },
    },
    features: {
      approval_model: "approve() then transferFrom()",
      no_custody: "Contract holds all balances",
      global_ledger: "Single mapping for all users",
      fungible: "All tokens identical",
    },
  },

  move_tokens: {
    standard: "Coin type, Closed-Loop Token",
    structure: {
      coin: `
public struct Coin<T> has key, store {
  id: UID,
  balance: u64,
}

public fun transfer<T>(
  coin: &mut Coin<T>,
  amount: u64,
  to: address,
) -> Coin<T> {
  // Create new coin with amount
  // Return to recipient via PTB
}
      `,
      characteristics: {
        stored_in: "User objects",
        access: "Direct through ownership",
        standard: "Coin type, Currency Standard",
        user_control: "Direct (owns the coin)",
      },
    },
    features: {
      direct_transfer: "No approval needed",
      custody: "Users hold their own coins",
      distributed_ledger: "Each user has their coin",
      fungible: "By balance amount",
      nft_capable: "Can have unique coins",
    },
  },

  nft_comparison: {
    solidity_nft: `
// ERC-721: NFT ownership in contract
contract NFT {
  mapping(uint256 => address) owners;
  mapping(address => uint256) balances;
  
  function ownerOf(uint256 tokenId) public view returns (address) {
    return owners[tokenId];
  }
}
    `,
    move_nft: `
// Move: NFT as object with key ability
public struct NFT has key {
  id: UID,
  owner: address,
  metadata: String,
}

// Ownership is inherent in object, not stored in mapping
    `,
  },

  royalty_enforcement: {
    solidity: "Only possible through marketplace integration",
    move: "Enforced natively by the protocol at transfer",
  },

  migration_strategy: [
    "Convert token mappings to Coin objects",
    "Replace ERC-20 with native Coin type",
    "Users directly own their coins",
    "Remove approval logic (not needed)",
    "Use Coin<T> generic for type safety",
    "Native NFTs with automatic royalties",
  ],
};

/**
 * 8. TRANSACTION MODEL AND PTBs
 * How transactions work differently
 */
export const TRANSACTION_MODEL = {
  solidity_transactions: {
    model: "Sequential contract calls",
    flow: [
      "1. User signs transaction calling contract func A",
      "2. Contract A executes, modifies state",
      "3. If user wants to call func B using A's output:",
      "4.   Must write function that calls both",
      "5.   Or send separate transaction for B",
      "6. No client-side composition of calls",
    ],
    example: `
// Solidity: Limited composition
contract DeFiRouter {
  function swapAndDeposit(
    address tokenIn,
    uint256 amount,
    address tokenOut,
    address poolAddress
  ) public {
    // Must implement all logic in this function
    // Cannot compose external contracts easily
    
    IERC20(tokenIn).transferFrom(msg.sender, address(this), amount);
    
    uint256 swapOutput = swap(tokenIn, amount, tokenOut);
    
    IPool(poolAddress).deposit(swapOutput);
  }
}
    `,
    limitations: [
      "Must create function for each composition",
      "State changes after each internal call",
      "Complex error handling",
      "Cannot guarantee atomicity across contracts",
    ],
  },

  move_ptbs: {
    model: "Programmable Transaction Blocks",
    flow: [
      "1. Client constructs PTB locally",
      "2. PTB contains up to 1,024 commands",
      "3. Commands can call any public functions",
      "4. Commands can chain outputs as inputs",
      "5. Entire PTB is atomic (all succeed or all fail)",
      "6. No transaction fees unless all succeed",
    ],
    example: `
// Move: Client-side composition with PTBs
const txb = new TransactionBlock();

// Step 1: Call swap on DEX A
const swapResult = txb.moveCall({
  target: \`\${dexA}::swap::swap\`,
  arguments: [
    txb.object(tokenInId),
    txb.pure(amount),
  ],
});

// Step 2: Use swap output in deposit call
txb.moveCall({
  target: \`\${pool}::deposit::deposit\`,
  arguments: [swapResult], // Use output from previous call
});

// Execute atomically
const result = await signer.signAndExecuteTransactionBlock({ txb });

// All-or-nothing: both succeed together or both fail
    `,
    capabilities: [
      "Chain outputs to inputs across any contracts",
      "Guaranteed atomic execution",
      "Up to 1,024 commands in single transaction",
      "No need to modify contracts for composition",
      "Client-side scripting without smart contract",
    ],
  },

  ptb_advantages: {
    defi_example: `
// DeFi aggregator: Find best price across protocols
// Solidity: Would need super-contract managing logic
// Move PTB: Client directly orchestrates

const txb = new TransactionBlock();

// Get price from DEX A
const priceA = txb.moveCall({
  target: \`\${dexA}::prices::get_price\`,
  arguments: [coin],
});

// Get price from DEX B
const priceB = txb.moveCall({
  target: \`\${dexB}::prices::get_price\`,
  arguments: [coin],
});

// Swap at better price
if (bestPrice from A) {
  txb.moveCall({
    target: \`\${dexA}::swap::swap\`,
    arguments: [coin, amount],
  });
} else {
  txb.moveCall({
    target: \`\${dexB}::swap::swap\`,
    arguments: [coin, amount],
  });
}

// Single atomic transaction with guaranteed execution
    `,
    benefits: [
      "No need for super-contracts",
      "Simpler contract code",
      "Client has full control",
      "Better composability",
      "Guaranteed best price or revert",
    ],
  },

  migration_strategy: [
    "Stop writing wrapper functions in contracts",
    "Use PTBs to compose calls on client-side",
    "Chain contract outputs directly",
    "Remove composition logic from contracts",
    "Let contracts be single-responsibility",
  ],
};

/**
 * 9. DEVELOPMENT TOOLS AND ENVIRONMENT
 */
export const DEVELOPMENT_TOOLS = {
  solidity_tools: {
    language: "Solidity",
    compilers: ["solc"],
    frameworks: ["Hardhat", "Foundry"],
    testing: ["Hardhat Test", "Foundry Forge"],
    deployment: ["Scripts", "Hardhat Deploy"],
    monitoring: ["Etherscan", "The Graph"],
    ide: ["VSCode", "Remix IDE"],
    libraries: ["OpenZeppelin", "Uniswap SDK"],
  },

  move_tools: {
    language: "Move",
    compilers: ["Move compiler"],
    frameworks: ["Sui CLI", "Sui SDK"],
    testing: ["Move test framework"],
    deployment: ["Sui CLI publish"],
    monitoring: ["Sui Explorer", "Custom indexer"],
    ide: ["VSCode with Move extension"],
    libraries: ["Sui framework", "Custom modules"],
  },

  move_vscode_extension: {
    name: "Move VSCode Extension",
    publisher: "mysten",
    id: "mysten.move",
    features: [
      "Syntax highlighting",
      "Diagnostics",
      "Go to definition",
      "Code completion",
      "Move file templates",
    ],
  },

  migration_setup: [
    "Install Move VSCode extension",
    "Set up Sui CLI",
    "Create Move project with Sui CLI",
    "Write tests in Move test framework",
    "Use Sui explorer for monitoring",
  ],
};

/**
 * 10. CONSENSUS AND NETWORK DIFFERENCES
 */
export const NETWORK_COMPARISON = {
  ethereum: {
    consensus: "Proof of Stake (PoS)",
    security_threshold: "51% of total stake",
    block_time: "~12 seconds",
    finality: "Requires multiple block confirmations",
    transaction_finality_time: "Minutes to hours",
    parallelization: "Sequential execution (every tx in order)",
    state_machine: "UTXO model (accounts with balances)",
    data_structure: "Blocks in chain",
    eips: "Ethereum Improvement Proposals + Hardforking",
    upgrade_mechanism: "Network hardfork voting",
  },

  sui: {
    consensus: "Delegated Proof of Stake (DPoS)",
    security_threshold: "66% of total stake",
    block_time: "Instant (no blocks)",
    finality: "Two round trips from client",
    transaction_finality_time: "Milliseconds",
    parallelization: "Parallel execution (independent txs)",
    state_machine: "DAG (Directed Acyclic Graph)",
    data_structure: "Checkpoints in DAG",
    protocol: "On-chain voting by validators",
    upgrade_mechanism: "Protocol flags + framework upgrades",
  },

  implications_for_devs: {
    finality: {
      ethereum: "Must wait for confirmations",
      sui: "Immediate finality for owned objects",
    },
    throughput: {
      ethereum: "Limited by sequential execution",
      sui: "Scales with parallel independent transactions",
    },
    transaction_costs: {
      ethereum: "High, no rebates",
      sui: "Low with storage rebates",
    },
    complexity: {
      ethereum: "Must manage nonce, gas price, confirmations",
      sui: "Simpler model, protocol handles ordering",
    },
  },
};

/**
 * 11. COMPLETE MIGRATION CHECKLIST
 */
export const MIGRATION_CHECKLIST = [
  // Language & Environment
  {
    category: "Environment Setup",
    items: [
      "[ ] Install Move VSCode extension",
      "[ ] Install Sui CLI",
      "[ ] Create new Sui project",
      "[ ] Set up Move.toml with dependencies",
    ],
  },

  // Core Concepts
  {
    category: "Core Concept Changes",
    items: [
      "[ ] Convert contract → Move module",
      "[ ] Convert state variables → Objects with UID",
      "[ ] Replace mappings → Separate objects or dynamic fields",
      "[ ] Replace Ownable → Capability objects",
      "[ ] Replace AccessControl → Capability types",
    ],
  },

  // Data Model
  {
    category: "Data Model Migration",
    items: [
      "[ ] Define structs with key ability for stored objects",
      "[ ] Add store ability for generic parameters",
      "[ ] Use TxContext for object creation",
      "[ ] Implement appropriate abilities for types",
      "[ ] Replace ERC-20 with Coin<T>",
      "[ ] Replace ERC-721 with NFT structs",
    ],
  },

  // Functions
  {
    category: "Function Migration",
    items: [
      "[ ] Remove msg.sender checks (protocol enforces)",
      "[ ] Convert public functions → public entry functions",
      "[ ] Use &mut for state modifications",
      "[ ] Add ctx: &mut TxContext for object creation",
      "[ ] Replace revert() → error enums",
      "[ ] Use assertions for preconditions",
    ],
  },

  // Testing
  {
    category: "Testing & Validation",
    items: [
      "[ ] Write Move unit tests",
      "[ ] Test with different signer addresses",
      "[ ] Test ownership enforcement",
      "[ ] Test object transfer semantics",
      "[ ] Test error conditions",
      "[ ] Test on testnet before mainnet",
    ],
  },

  // Composition
  {
    category: "Redesign for PTBs",
    items: [
      "[ ] Remove wrapper/aggregator functions",
      "[ ] Make functions single-responsibility",
      "[ ] Design for client-side PTB composition",
      "[ ] Return objects instead of storing in contract",
      "[ ] Enable chaining outputs to inputs",
    ],
  },

  // Deployment
  {
    category: "Deployment & Integration",
    items: [
      "[ ] Publish to testnet",
      "[ ] Test with TypeScript SDK",
      "[ ] Verify PTB construction",
      "[ ] Build client application",
      "[ ] Test end-to-end on testnet",
      "[ ] Audit contract",
      "[ ] Publish to mainnet",
    ],
  },
];

/**
 * 12. CODE MIGRATION EXAMPLES
 */
export const CODE_EXAMPLES = {
  simple_counter: {
    solidity: `
// Solidity: Counter stored in contract
contract Counter {
  uint256 public count = 0;
  
  function increment() public {
    count += 1;
  }
  
  function decrement() public {
    require(count > 0, "Already zero");
    count -= 1;
  }
  
  function getCount() public view returns (uint256) {
    return count;
  }
}
    `,
    move: `
// Move: Counter as object
module counter::counter {
  use sui::object::{Self, UID};
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
  
  public fun decrement(counter: &mut Counter) {
    assert!(counter.count > 0, 0);
    counter.count -= 1;
  }
  
  public fun get_count(counter: &Counter): u64 {
    counter.count
  }
}
    `,
  },

  token_transfer: {
    solidity: `
// Solidity: Approval + transfer
contract Token {
  mapping(address => uint256) balances;
  mapping(address => mapping(address => uint256)) allowances;
  
  function approve(address spender, uint256 amount) public {
    allowances[msg.sender][spender] = amount;
  }
  
  function transferFrom(address from, address to, uint256 amount) public {
    require(balances[from] >= amount);
    require(allowances[from][msg.sender] >= amount);
    balances[from] -= amount;
    balances[to] += amount;
    allowances[from][msg.sender] -= amount;
  }
}
    `,
    move: `
// Move: Direct transfer
module token::coin {
  use sui::coin::{Coin, Self};
  use sui::transfer;
  use sui::tx_context::TxContext;
  
  public struct TOKEN {}
  
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
    `,
  },

  access_control: {
    solidity: `
// Solidity: Role-based access
contract Admin {
  mapping(address => bool) admins;
  
  modifier onlyAdmin() {
    require(admins[msg.sender], "Not admin");
    _;
  }
  
  function setAdmin(address account) public onlyAdmin {
    admins[account] = true;
  }
  
  function performAdminTask() public onlyAdmin {
    // Admin only task
  }
}
    `,
    move: `
// Move: Capability-based access
module admin::access {
  use sui::object::{Self, UID};
  use sui::transfer;
  use sui::tx_context::{Self, TxContext};
  
  public struct AdminCap has key {
    id: UID,
  }
  
  public fun grant_admin(
    _: &AdminCap,
    recipient: address,
    ctx: &mut TxContext
  ) {
    let cap = AdminCap { id: object::new(ctx) };
    transfer::transfer(cap, recipient);
  }
  
  public fun perform_admin_task(
    _: &AdminCap,
  ) {
    // Admin only task
  }
}
    `,
  },

  swapping_tokens: {
    solidity: `
// Solidity: Swap function calls both protocols
contract Aggregator {
  function swapAndRoute(
    address tokenIn,
    uint256 amount,
    address dex1,
    address dex2
  ) public returns (uint256) {
    IERC20(tokenIn).transferFrom(msg.sender, address(this), amount);
    
    uint256 out1 = IDEX(dex1).swap(tokenIn, amount);
    uint256 out2 = IDEX(dex2).swap(tokenIn, amount);
    
    if (out1 > out2) return out1;
    else return out2;
  }
}
    `,
    move: `
// Move: PTB composition on client
const txb = new TransactionBlock();

// Get price from DEX 1
const quote1 = txb.moveCall({
  target: \`\${dex1}::prices::quote\`,
  arguments: [txb.object(coinId)],
});

// Get price from DEX 2
const quote2 = txb.moveCall({
  target: \`\${dex2}::prices::quote\`,
  arguments: [txb.object(coinId)],
});

// Swap at better price
txb.moveCall({
  target: \`\${bestDEX}::swap::swap\`,
  arguments: [txb.object(coinId), quote], // Use output
});

// Client orchestrates, contracts stay simple
    `,
  },
};

export default {
  LANGUAGE_COMPARISON,
  DATA_STORAGE,
  OWNERSHIP_AND_ACCESS,
  INHERITANCE_COMPARISON,
  MUTATION_PATTERNS,
  UPGRADE_PATTERNS,
  ASSET_MANAGEMENT,
  TRANSACTION_MODEL,
  DEVELOPMENT_TOOLS,
  NETWORK_COMPARISON,
  MIGRATION_CHECKLIST,
  CODE_EXAMPLES,
};
