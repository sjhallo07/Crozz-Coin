// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * SUI ESSENTIALS CONFIGURATION
 * 
 * Implementation of core Sui concepts from:
 * https://docs.sui.io/guides/developer/sui-101
 * 
 * These are fundamental patterns for Sui dApp development
 */

/**
 * 1. OBJECT OWNERSHIP MODELS
 * Different ownership patterns for Sui objects
 */
export const OBJECT_OWNERSHIP = {
  owned: {
    name: "Owned Object",
    description: "Single user/address owns the object exclusively",
    syntax: "struct Asset has key { id: UID }",
    access: "Only owner can modify",
    transfer: "Owner can transfer to another address",
    benefits: [
      "Simple permission model",
      "Direct access without permissions",
      "Efficient single-owner objects",
    ],
    use_cases: [
      "Personal NFTs",
      "User wallets",
      "Private game items",
      "Individual accounts",
    ],
    example:
      "struct GameItem has key { id: UID, owner: address, properties: String }",
  },

  shared: {
    name: "Shared Object",
    description: "Multiple users/transactions can access the same object",
    syntax: "transfer::share_object(obj)",
    access: "Requires lock/version constraints for consistency",
    transfer: "Cannot be transferred; must be deleted or wrapped",
    benefits: [
      "Enables collaborative state",
      "Supports concurrent access with atomic consensus",
      "Natural for game worlds, pools, contracts",
    ],
    use_cases: [
      "Smart contracts (fungible/NFT)",
      "Decentralized exchanges",
      "Game worlds/environments",
      "Protocol state",
      "Liquidity pools",
    ],
    consistency: "Mysticeti ensures atomic consistency via quorum",
    example:
      "transfer::share_object({ state: 100, users: vector[] }); // Multiple txs access atomically",
  },

  immutable: {
    name: "Immutable Object",
    description: "Object cannot be modified after creation; read-only",
    syntax: "transfer::freeze_object(obj)",
    access: "Read-only; anyone can reference",
    transfer: "Cannot be transferred or modified",
    benefits: [
      "Permanent, trustless references",
      "No locks required for parallel reads",
      "Efficient caching",
      "Proof of integrity",
    ],
    use_cases: [
      "Published smart contracts",
      "Standards/specifications",
      "Immutable records (certificates)",
      "Reference data",
      "Protocol constants",
    ],
    example:
      "struct Standard has key { id: UID, version: u64, definition: String }; // Once frozen, immutable",
  },

  wrapped: {
    name: "Wrapped Object",
    description: "Object contained within another object; indirect access",
    syntax: "struct Container { value: T }",
    access: "Only accessible through wrapper's methods",
    transfer: "Transfers with wrapper",
    benefits: [
      "Capability control",
      "Encapsulation",
      "Access control through wrapper methods",
    ],
    use_cases: [
      "Capability-based security",
      "Dynamic fields",
      "Hidden state",
      "Composable contracts",
    ],
    example:
      "struct Capability<T> { inner: T, authorized: address } // Access only via capability holder",
  },

  dynamic_fields: {
    name: "Dynamic Fields",
    description: "Map-like storage for variable fields within objects",
    syntax: "field::add(&mut obj, key, value)",
    access: "O(1) lookup via key, no struct recompilation",
    use_cases: [
      "Extensible objects",
      "NFT metadata",
      "User-defined attributes",
      "Sparse data",
    ],
    benefits: [
      "No struct size limits",
      "Efficient sparse storage",
      "Dynamic schema",
      "On-chain flexibility",
    ],
    example:
      "field::add(&mut nft.id, b'metadata', metadata); // Add properties dynamically",
  },
};

/**
 * 2. EVENTS SYSTEM
 * Emit and listen to on-chain events
 */
export const EVENTS_CONFIG = {
  definition: {
    description: "Events are emitted by smart contracts to notify off-chain systems",
    syntax: "event::emit(MyEvent { ... })",
    visibility: "Public; indexed and queryable immediately",
    indexing: "GraphQL/indexer services index events automatically",
  },

  emit_patterns: {
    basic: {
      name: "Basic Event Emission",
      syntax: "event::emit(TransactionEvent { user: ctx.sender(), amount: 100 })",
      use: "Notify asset activity",
      example_event: "struct AssetMinted has copy, drop { id: ID, amount: u64, owner: address }",
    },

    structured_data: {
      name: "Structured Event Data",
      syntax: "event::emit(ComplexEvent { data: nested_struct, metadata: ... })",
      use: "Rich event context for complex operations",
      benefits: [
        "Full transaction context in events",
        "Indexed fields for filtering",
        "Type-safe event handling",
      ],
    },

    chained_events: {
      name: "Event Chains",
      syntax: "Within same tx, emit multiple events in sequence",
      use: "Audit trail of multi-step operations",
      pattern: "Each step in transaction emits its own event for tracking",
    },
  },

  query_patterns: {
    graphql_subscription: {
      description: "Real-time event streaming via GraphQL",
      syntax: "subscription { events(filter: { emitter: PACKAGE }) { ... } }",
      latency: "Near real-time (within 1-2 seconds)",
      use: "Monitor contract activity in dApp UI",
    },

    event_filtering: {
      description: "Filter events by package, type, sender, or field",
      syntax: "Filter by emitter module, event type, MoveEvent type",
      fields_indexed: "All event fields searchable",
      retention: "Queryable for historical analysis",
    },

    trigger_logic: {
      description: "Off-chain logic triggered by events",
      pattern: "Listen for event X, then execute action Y",
      use_cases: [
        "User notifications",
        "Cross-chain bridges",
        "Bot reactions",
        "Analytics aggregation",
        "Compliance monitoring",
      ],
    },
  },
};

/**
 * 3. DATA ACCESS MECHANISMS
 * Different ways to read Sui data
 */
export const DATA_ACCESS_CONFIG = {
  graphql_rpc: {
    name: "GraphQL RPC",
    description: "Flexible, structured queries for objects, transactions, events",
    advantages: [
      "Flexible filtering and field selection",
      "Cursor-based pagination",
      "No over-fetching",
      "Real-time subscriptions",
    ],
    endpoint: "https://graphql.[network].sui.io/graphql",
    use_cases: [
      "UI data fetching",
      "Complex queries with multiple filters",
      "Subscription-based updates",
      "Aggregation queries",
    ],
    query_examples: [
      "Get objects by owner",
      "Query transaction history",
      "Stream events in real-time",
      "Dynamic field lookups",
    ],
  },

  json_rpc: {
    name: "JSON RPC",
    description: "Traditional RPC for reading state and submitting transactions",
    advantages: [
      "Direct protocol access",
      "Lower-level object reads",
      "Multi-sig transaction construction",
      "State snapshots",
    ],
    methods: [
      "sui_getObject",
      "sui_multiGetObjects",
      "sui_getTransaction",
      "sui_executeTransaction",
    ],
    use_cases: [
      "Transaction submission",
      "State verification",
      "Wallet integration",
      "Protocol-level access",
    ],
  },

  indexer_api: {
    name: "Indexer API (via Indexer Service)",
    description: "Pre-computed indexed data for common queries",
    advantages: [
      "Optimized for common patterns",
      "Fast historical queries",
      "Aggregated metrics",
      "Custom data structures",
    ],
    data_sources: [
      "Sequential pipeline (order-guaranteed)",
      "Concurrent pipeline (high throughput)",
      "PostgreSQL (custom schemas)",
    ],
    use_cases: [
      "Leaderboards",
      "Analytics dashboards",
      "Historical analysis",
      "Aggregated stats",
    ],
  },

  direct_object_reads: {
    name: "Direct Object Reads",
    description: "Read raw object state via sui_getObject",
    advantages: [
      "Single authoritative source",
      "No derived data",
      "Version-specific reads",
    ],
    constraints: [
      "Only latest versions available",
      "No complex filtering",
      "Slower for bulk queries",
    ],
  },
};

/**
 * 4. ON-CHAIN TIME ACCESS
 * Clock module for timestamps and epoch tracking
 */
export const ON_CHAIN_TIME_CONFIG = {
  clock_module: {
    name: "Sui Clock Module",
    location: "sui::clock::Clock",
    description: "Immutable reference to network time",
    shared_object: true,
    object_id: "0x6",
    access_pattern: "Read-only via immutable reference",
  },

  timestamp_ms: {
    description: "Current timestamp in milliseconds (Unix epoch)",
    function: "clock::timestamp_ms(&clock)",
    precision: "Millisecond",
    source: "Validator consensus timestamp",
    use_cases: [
      "Expiration checks",
      "Timeout mechanisms",
      "Rate limiting",
      "Temporal logic",
    ],
    example:
      "let now_ms = clock::timestamp_ms(&clock); if (now_ms > deadline_ms) abort ERR_EXPIRED;",
  },

  epoch_tracking: {
    description: "Current epoch number and timing",
    function: "tx_context::epoch(&ctx)",
    boundaries: "Epoch changes every ~24h (Mainnet/Testnet), ~1h (Devnet)",
    use_cases: [
      "Epoch-based rewards",
      "Validator set changes",
      "Staking/unstaking windows",
      "Epoch-scoped events",
    ],
    pattern:
      "struct EpochReward { epoch: u64, amount: u64 }; // Reward per epoch",
  },

  consensus_time: {
    description: "Validator consensus establishes definitive timestamp",
    properties: [
      "Monotonically increasing",
      "Set at consensus (not by individual validators)",
      "Same timestamp for all txs in same commit",
    ],
    implications: [
      "Timestamps are final and honest",
      "No clock manipulation possible",
      "Safe for critical logic",
    ],
  },

  common_patterns: {
    timeout_check: "if (clock::timestamp_ms(&clock) > deadline) abort;",
    cooldown_mechanism:
      "require(clock::timestamp_ms(&clock) - last_action_ms > COOLDOWN);",
    schedule_activation:
      "require(clock::timestamp_ms(&clock) >= activation_time_ms);",
    epoch_boundary_logic:
      "if (current_epoch > last_recorded_epoch) { perform_epoch_transition(); }",
  },
};

/**
 * 5. LOCAL NETWORK SETUP
 * Connect to local Sui network for development
 */
export const LOCAL_NETWORK_CONFIG = {
  localnet: {
    name: "Localnet",
    setup: "sui start --with-faucet",
    http_rpc: "http://127.0.0.1:9000",
    graphql_rpc: "http://127.0.0.1:9125/graphql",
    faucet: "http://127.0.0.1:9123/gas",
    published_packages: "Published objects in local chain",
    reset_command: "sui start --force-regenesis",
    advantages: [
      "No network latency",
      "Instant finality",
      "Repeatable test scenarios",
      "Full control over validator set",
    ],
    use_cases: [
      "Unit testing",
      "Integration testing",
      "Transaction simulation",
      "Performance benchmarking",
    ],
  },

  setup_steps: {
    install_sui_cli: "cargo install --locked --git https://github.com/MystenLabs/sui --branch testnet sui",
    start_local: "sui start --with-faucet",
    configure_client: "sui client new-address ed25519",
    request_faucet: "curl -s http://127.0.0.1:9123/gas -d '0x[your_address]'",
    verify_setup: "sui client active-address && sui client balance",
  },

  environment_variables: {
    SUI_NETWORK: "localnet",
    VITE_SUI_NETWORK: "localnet",
    VITE_GRAPHQL_ENDPOINT: "http://127.0.0.1:9125/graphql",
  },

  testing_workflow: [
    "Deploy smart contracts to localnet",
    "Test transactions locally",
    "Verify events and state changes",
    "Move to Devnet when ready",
    "Final integration on Testnet",
  ],
};

/**
 * 6. SIGNING & SENDING TRANSACTIONS
 * Transaction lifecycle and signatures
 */
export const SIGNING_TRANSACTIONS_CONFIG = {
  transaction_lifecycle: {
    construction: "Build TransactionBlock with commands",
    signing: "Sign with private key (wallet or Ed25519)",
    submission: "Send to fullnode RPC",
    consensus: "Validators agree on ordering (Mysticeti DAG)",
    finalization: "Committed to blockchain",
    confirmation: "Available for queries",
  },

  typescript_sdk: {
    construct: "const tx = new Transaction()",
    add_commands: "tx.moveCall({ ... }), tx.transferObjects([obj], recipient)",
    gas_budget: "tx.setGasBudget(gasPrice * estimatedGas)",
    sign: "const signedTx = await signer.signTransaction(tx)",
    submit: "const result = await client.executeTransaction(signedTx)",
  },

  wallet_integration: {
    dapp_kit: "@mysten/dapp-kit provides useSignTransaction hook",
    user_approval: "User approves transaction in wallet UI",
    signature: "Wallet signs with user's private key (never exposed to dApp)",
    safety: "Private key never leaves user's wallet",
  },

  multi_signature: {
    definition: "Multiple keys required to authorize transaction",
    use_cases: [
      "Multi-sig wallets",
      "DAO governance",
      "Escrow contracts",
      "Treasury control",
    ],
    sdk_support:
      "sui.js TransactionBlock supports multi-sig construction and verification",
  },

  transaction_verification: {
    digest: "Unique hash of transaction content",
    signature_verification: "Cryptographic proof of authorization",
    event_indexing: "Events indexed immediately after finality",
  },
};

/**
 * 7. SPONSORED TRANSACTIONS
 * User pays gas via sponsor mechanism
 */
export const SPONSORED_TRANSACTIONS_CONFIG = {
  concept: {
    description:
      "Sponsor (dApp/protocol) pays gas fee on behalf of user transaction",
    use_case:
      "Improve UX by eliminating user gas management; sponsor absorbs costs",
    protocol_primitive: "Native Sui feature; not dependent on external relayers",
  },

  flow: {
    user_prepares:
      "User builds transaction via dApp UI (no gas coin needed)",
    sponsor_provides_gas:
      "Backend/smart contract identifies sponsor and gas coin",
    sponsor_signs:
      "Sponsor authorizes gas payment (separate from user signature)",
    both_submit:
      "User + sponsor transactions submitted together; validated atomically",
    execution: "If both signatures valid, transaction executes; sponsor pays",
    failure: "If sponsor signature fails, entire transaction reverts",
  },

  implementation_patterns: {
    backend_relayer: "Backend owns gas coins; signs all sponsored txs",
    smart_contract_sponsor: "Contract logic determines sponsor (e.g., protocol)",
    payment_model: "Sponsor may charge user fees offline",
  },

  benefits: [
    "Better UX (no SUI balance needed)",
    "Reduced onboarding friction",
    "Enables gasless interactions",
    "Sponsor controls cost (can refuse expensive txs)",
  ],

  examples: [
    "Faucet-like gas distribution",
    "Game where server sponsors transactions",
    "Protocol-subsidized operations",
    "Onboarding flows",
  ],

  gas_estimation: "Backend pre-checks transaction gas before sponsoring",
};

/**
 * 8. AVOID EQUIVOCATION
 * Prevention of conflicting transactions (ALREADY IN CONSENSUS_CONFIG)
 * Referenced here for completeness in Sui 101 guide
 */
export const EQUIVOCATION_PREVENTION = {
  definition:
    "Equivocation = using same object version in conflicting transactions",
  consequence: "Would create inconsistent state if undetected",

  prevention_mechanisms: {
    object_versioning:
      "Each object mutation increments version; conflicts detected by Mysticeti",
    serialization:
      "High-value txs executed sequentially to prevent concurrent use",
    programmable_transaction_blocks:
      "PTB with up to 1024 operations in single atomic unit",
    parallel_execution_with_safety:
      "Validators propose transactions in parallel; Mysticeti detects conflicts",
  },

  detection_and_recovery: {
    mysticeti_dag: "Detects equivocation during consensus",
    object_version_tracking: "Version number proves object used correctly",
    sui_tool_locked_object:
      "sui-tool object-lock for manual invariant enforcement",
    validator_punishment:
      "Equivocating validators identified and punished per protocol",
  },

  best_practices: [
    "Use PTBs for atomic multi-step operations",
    "Batch related operations to ensure atomicity",
    "Monitor object versions for unexpected changes",
    "Use locked objects for critical state via sui-tool",
  ],
};

/**
 * 9. PROGRAMMABLE TRANSACTION BLOCKS (PTBs)
 * Execute multiple commands atomically
 */
export const PTB_CONFIG = {
  definition: {
    description: "Single transaction containing up to 1024 Move commands",
    atomicity: "All commands execute in order; all-or-nothing semantics",
    advantages: [
      "Atomic multi-step operations",
      "No intermediate inconsistent states",
      "Reduced transaction costs (single gas budget)",
      "Prevents equivocation across steps",
    ],
  },

  command_types: {
    move_call: "Call function in published Move package",
    transfer_objects: "Transfer owned objects to recipient",
    split_coins: "Create multiple coins from single coin",
    merge_coins: "Combine multiple coins into one",
    publish: "Deploy new Move package",
    upgrade: "Upgrade existing package",
  },

  typescript_example: {
    construct: "const tx = new Transaction();",
    set_sender: "tx.setSender(userAddress);",
    add_move_call:
      "tx.moveCall({ target: 'package::module::function', arguments: [arg1, arg2] });",
    add_transfer: "tx.transferObjects([obj1, obj2], recipientAddress);",
    set_gas: "tx.setGasBudget(MAX_GAS);",
    sign: "const signedTx = await wallet.signTransaction(tx);",
    execute: "await client.executeTransaction(signedTx);",
  },

  input_handling: {
    pure_input: "Constant value (no object reference)",
    object_reference: "Reference to existing object (owned or shared)",
    result_reference: "Output from previous command in same PTB",
  },

  common_patterns: [
    "Swap + transfer (atomically exchange assets)",
    "Batch transfers (multiple recipients in one tx)",
    "Multi-step contract execution",
    "Coin management (split → transfer → merge)",
  ],

  gas_optimization: "Combine related operations to reduce per-tx overhead",
};

/**
 * 10. COIN MANAGEMENT
 * Explicit coin handling for transactions
 */
export const COIN_MANAGEMENT_CONFIG = {
  coin_as_object: {
    description: "Coins are owned objects with value and owner fields",
    structure:
      "struct Coin<T> has key { id: UID, balance: Balance<T> }",
    transfer: "Use sui::transfer or Transaction::transferObjects",
    split: "Create lower-denomination coin via coin::split",
  },

  operations: {
    transfer_coin: "Move coin to new owner; original coin ceases to exist",
    split_coin: "Take amount X from coin Y; creates new coin with amount X",
    merge_coins: "Combine multiple coins into single coin",
    burn_coin: "Permanently remove coin from circulation",
  },

  ptb_coin_operations: {
    split_coins: "tx.splitCoins(coinInput, [amount1, amount2, ...])",
    transfer_objects:
      "tx.transferObjects([coin1, coin2, ...], recipient)",
    pay: "Simplified coin transfer; tx.pay([inputs], [amounts], [recipients])",
  },

  gas_coin_handling: {
    gas_budget: "Must specify in Transaction; amount deducted from gas coin",
    change_return: "Unused gas returned to sender after execution",
    explicit_split: "If using coin for both gas and data, split first",
    example:
      "const [gasCoin, dataCoin] = tx.splitCoins(coinInput, [gasAmount, dataAmount])",
  },

  common_patterns: [
    "Get user coin balances via GraphQL",
    "Select coin(s) for transaction",
    "Split if needed for operations",
    "Transfer remaining as change",
  ],

  best_practices: [
    "Validate coin balance before transactions",
    "Handle dust (small coin remnants)",
    "Batch coin operations in PTBs",
    "Monitor gas prices for cost estimation",
  ],
};

/**
 * 11. SIMULATING REFERENCES WITH BORROW MODULE
 * Include objects in PTBs without transferring ownership
 */
export const REFERENCE_SIMULATION_CONFIG = {
  borrow_module: {
    location: "sui::borrow::Borrow",
    description: "Simulate object references in PTBs",
    pattern:
      "borrow::borrow_mut(&mut object) returns temporary mutable reference",
    use_case:
      "Access shared/immutable objects without transfer; enables read-only patterns",
  },

  reference_types: {
    immutable_reference: "Read-only; no modifications allowed",
    mutable_reference:
      "Temporary exclusive access; must be returned; enables controlled mutations",
  },

  ptb_pattern: {
    borrow: "tx.moveCall({ target: 'sui::borrow::borrow_mut', args: [objectRef] })",
    use_reference: "Pass borrow output to subsequent commands in same PTB",
    return_reference: "Borrow is automatically returned at PTB completion",
  },

  benefits: [
    "Access immutable objects without making copies",
    "Temporary mutable access to shared objects",
    "No ownership transfer; reference is temporary",
    "Reduced storage and computation",
  ],

  shared_object_pattern: {
    scenario: "Multiple users access same shared contract state",
    solution: "Use borrow to temporarily access; Mysticeti ensures atomicity",
    consistency: "All transactions see committed state due to consensus",
  },

  examples: [
    "Read immutable configuration object",
    "Temporarily modify shared game state",
    "Access contract registry without copies",
    "Query shared pool state",
  ],
};

/**
 * EXPORTS FOR ARCHITECTURE INTEGRATION
 */
export const SUI_ESSENTIALS = {
  OBJECT_OWNERSHIP,
  EVENTS_CONFIG,
  DATA_ACCESS_CONFIG,
  ON_CHAIN_TIME_CONFIG,
  LOCAL_NETWORK_CONFIG,
  SIGNING_TRANSACTIONS_CONFIG,
  SPONSORED_TRANSACTIONS_CONFIG,
  EQUIVOCATION_PREVENTION,
  PTB_CONFIG,
  COIN_MANAGEMENT_CONFIG,
  REFERENCE_SIMULATION_CONFIG,
};
