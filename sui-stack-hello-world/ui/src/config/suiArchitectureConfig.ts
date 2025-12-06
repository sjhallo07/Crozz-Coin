// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

/**
 * 1. NETWORKS CONFIGURATION
 * Sui operates multiple networks for different purposes
 */
export const NETWORKS_CONFIG = {
  mainnet: {
    name: "Mainnet",
    purpose: "Production environment",
    url: getFullnodeUrl("mainnet"),
    rpcUrl: "https://fullnode.mainnet.sui.io:443",
    epochDuration: "~24h",
    persistence: "Persistent (production ledger)",
    faucet: null,
    explorer: "https://suiscan.xyz/mainnet/home",
    status: "production",
    description: "Live blockchain for real transactions (uses real SUI/MIST)",
  },
  testnet: {
    name: "Testnet",
    purpose: "Staging and pre-production testing",
    url: getFullnodeUrl("testnet"),
    rpcUrl: "https://fullnode.testnet.sui.io:443",
    epochDuration: "~24h",
    persistence: "Best-effort; may be wiped occasionally",
    faucet: "https://faucet.sui.io",
    explorer: "https://testnet.suivision.xyz/",
    status: "staging",
    description:
      "Testing before mainnet deployment (uses free Testnet SUI/MIST)",
  },
  devnet: {
    name: "Devnet",
    purpose: "Development and new feature testing",
    url: getFullnodeUrl("devnet"),
    rpcUrl: "https://fullnode.devnet.sui.io:443",
    epochDuration: "~1h",
    persistence: "Wiped weekly (scheduled)",
    faucet: "https://faucet.sui.io",
    explorer: "https://suiscan.xyz/devnet/home",
    status: "development",
    description: "For developing upcoming features; unstable, frequent resets",
  },
  localnet: {
    name: "Localnet",
    purpose: "Local development environment",
    url: "http://localhost:9000",
    rpcUrl: "http://localhost:9000",
    epochDuration: "Configurable",
    persistence: "Depends on local config",
    faucet: "Local faucet (optional)",
    explorer: null,
    status: "local",
    description: "Run Sui locally with `sui start`",
  },
} as const;

/**
 * 2. STORAGE CONFIGURATION
 * Sui pricing based on computation and storage costs
 */
export const STORAGE_CONFIG = {
  // Storage pricing per byte per year (in MIST - 1 SUI = 10^9 MIST)
  pricing: {
    storageCostPerByteYear: 38_400, // Approximate cost
    computationCostPerUnit: 1_000, // Per computational unit
    minStorageRebate: 2_700, // Minimum refund when deleting
    baseTransactionCost: 1_000, // Base cost for any transaction
  },

  // On-chain fee model
  fees: {
    storageUnitMist: 76, // per storage unit
    unitsPerByte: 100, // 1 byte = 100 storage units
    refundablePortion: 0.99, // refunded on delete (storage rebate)
    nonRefundablePortion: 0.01, // locked in storage fund
    note: "Storage fee is part of gas; rebate returned when data is deleted (immutable objects lock fees forever)",
  },

  // Object lifecycle costs
  objectLifecycle: {
    creation: "Includes storage cost upfront",
    mutation: "Read (free) + Write (storage cost)",
    deletion: "Refunded storage rebate",
    transfer: "Minimal cost, no storage change",
  },

  // Pruning strategies (aligning with Sui storage guidance)
  pruningProfiles: {
    moderate: {
      target: "Validators / pruned full nodes",
      retention: "Enable pruning; keep recent epochs and rely on checkpoints bucket for older data",
      expectedDisk: "~250-400GB validators; ~2.5TB pruned full nodes with indexes (Mainnet single-epoch snapshot)",
    },
    aggressive: {
      target: "RPC-focused or resource-constrained full nodes",
      retention: "Minimal history; delegate historical fetches to checkpoints bucket or archival peer",
      expectedDisk: "Similar to validators for DB; indexes dominate (~1.5TB in Mainnet). Use archival bucket for deep history",
      caution: "Aggressive pruning requires archival fallback for historical RPC queries",
    },
    unpruned: {
      target: "Rare, archival needs",
      retention: "Full object and transaction history",
      expectedDisk: "~16TB (Mainnet, Nov 2025)",
    },
  },

  // Storage classes and growth references (Mainnet, Nov 2025)
  storageClasses: {
    validators: { medium: "~250-400GB", description: "Pruned, high-performance NVMe" },
    prunedFullNodes: { medium: "~2.5TB", description: "Indexes + consensus_db, single-epoch snapshot" },
    unprunedFullNodes: { large: "~16TB", description: "Full history archival" },
    snapshots: {
      database: "Same size as source DB (1:1)",
      formal: "~30GB per recent epoch",
    },
    checkpointsBucket: {
      size: "~30TB",
      growthPerDay: "3-10GB/day depending on TPS",
      purpose: "Historical state fetch for pruned nodes",
    },
  },

  // Best practices
  optimization: {
    monitorCreationFrequency: "Objects created per transaction",
    implementCleanup: "Remove temporary objects",
    useDynamicFields: "For variable-sized data",
    batchOperations: "Combine multiple moves in PTB",
  },
};

/**
 * 3. CONSENSUS & EPOCHS CONFIGURATION
 * Epochs define validator set periods and network changes
 */
export const CONSENSUS_CONFIG = {
  epochModel: {
    duration: "~24h (Mainnet/Testnet), ~1h (Devnet)",
    validatorSetFixed: "Remains same throughout epoch",
    reconfiguration: "Validator set & staking ops processed at boundaries",
    finality: "Certificates give finality within epoch",
  },

  equivocation: {
    definition: "Using same object pair (ObjectId, SequenceNumber) in multiple non-finalized transactions",
    objectVersioning: "(ObjectId, SequenceNumber) uniquely identifies object version",
    versionUpdate: "Only 1 tx modifies per version; version increments after modification",
    prevention: "Serialize transactions or use PTBs (up to 1024 ops per block)",
    detection: "Validators detect and lock objects until epoch end",
    consequences: "Objects locked, transactions fail, network usability degraded",
    doubleSpending: "Prevented via object versioning (coin reused with updated version)",
    punishment: "Validator punishment discourages accidental/intentional abuse",
    singleThreadRec: "Serialize txs using same owned object to prevent SequenceNumber errors",
    parallelRec: "Create separate owned object per thread or use shared wrapper with allowlist",
    tools: "Use sui-tool locked-object command to check/rescue locked assets",
    advantage: "Enables safe reuse of same gas coin across series of transactions",
  },

  reconfiguration: {
    timing: "End of each epoch",
    purpose: "Adjust network for upcoming epoch (only fully synchronous network event)",
    step1: "Finalize transactions & checkpoints (identical state across validators)",
    step2: "Distribute gas rewards to validator staking pool",
    step3: "Allocate storage fees to storage fund",
    step4: "Process pending staking/unstaking (sole opportunity for validator set change)",
    step5: "Protocol upgrade if agreed by 2f+1 validators (new features, bug fixes, framework updates)",
    advantages: "Consistent state across validators; coordinated reward distribution; decentralized upgrades",
  },

  quorum: {
    threshold: ">= 2/3 voting power",
    certificate: "Tx + quorum signatures → certificate for BFT safety",
    staking: "DPoS; voting power from staked SUI",
  },

  mysticeti: {
    model: "DAG-based, implicit commitment",
    latency: "~0.5s median to commit (tested)",
    throughput: "~200k TPS sustained; tests up to 300-400k TPS",
    parallelProposals: "Multiple validators propose in parallel",
    leaderTolerance: "Tolerates unavailable leaders with low tail latency",
    cancellation: "Can cancel overly expensive batches post-consensus",
  },

  implementation: {
    trackCurrentEpoch: "Monitor via SuiSystemState",
    respectEpochBounds: "Submit transactions within validity window",
    handleReconfiguration: "Be ready for validator changes",
    verifyFinality: "Wait for epoch boundaries",
    epochMetadata: "All transactions include epoch value; only valid if executed before set epoch",
  },
};

/**
 * 4. SECURITY CONFIGURATION
 * Asset ownership and access control
 */
export const SECURITY_CONFIG = {
  ownershipModel: {
    addressOwned: "Single address controls object",
    dynamicFields: "Object contains other objects",
    immutable: "Cannot be modified",
    shared: "Multiple signers can interact",
  },

  accessControl: {
    onlyOwnerCanUse: "Default for address-owned objects",
    smartContractLogic: "Enforces access rules via Move",
    atomicOperations: "All-or-nothing transactions",
    nonRepudiation: "Signature proves authorization",
  },

  assetTypes: {
    coins: "Native SUI tokens",
    tokens: "Custom tokens on Sui",
    nfts: "Non-fungible objects",
    customObjects: "Any Move struct",
  },

  bestPractices: {
    validateOwnership: "Check owner before operation",
    useSmartContracts: "Implement complex logic",
    multiSignature: "For high-value operations",
    zkLogin: "For privacy-preserving auth",
  },
};

/**
 * 5. PROTOCOL UPGRADES CONFIGURATION
 * Sui supports protocol, framework, and engine upgrades
 */
export const UPGRADES_CONFIG = {
  packageVersioning: {
    v1: "Initial release",
    v2: "Added new features",
    vN: "Continue versioning",
  },

  upgradeProcess: {
    step1: "Deploy new package version",
    step2: "Maintain backward compatibility",
    step3: "Migrate data to new version",
    step4: "All clients sync eventually",
  },

  compatibility: {
    backward: "New versions support old interfaces",
    forward: "Plan for future upgrades",
    dataLoss: "Migrations prevent loss",
    rollback: "Previous versions remain available",
  },

  examples: {
    addNewFunction: "No impact on existing functions",
    modifyStruct: "Migration handles data transformation",
    deprecateFeature: "Gradual phase-out period",
    majorUpgrade: "Requires full data migration",
  },
};

/**
 * 6. TRANSACTIONS CONFIGURATION
 * Life of a transaction and execution model
 */
export const TRANSACTIONS_CONFIG = {
  lifecycle: {
    build: "Create programmable transaction block (PTB)",
    sign: "Sign with private key",
    submit: "Send to fullnode",
    execute: "Validators execute atomically",
    confirm: "Wait for epoch boundary",
    archive: "Historical data available",
  },

  programmableBlocks: {
    atomic: "All commands succeed or all fail",
    sequential: "Commands execute in order",
    dependencies: "Can use outputs from previous commands",
    maxCommands: "Up to limit per block",
    maxGasBudget: "Limit spending",
  },

  gasOptimization: {
    coinSmashing: "Automatically combines coins",
    batchOps: "Multiple moves in one transaction",
    efficientStorage: "Minimize object creation",
    gasEstimation: "Preview costs before submitting",
  },

  sponsoring: {
    enabled: true,
    useCase: "User onboarding without gas upfront",
    flow: "Sponsor pays, user signs",
    benefits: "Better UX for new users",
  },
};

/**
 * 7. TRANSACTION AUTHENTICATION CONFIGURATION
 * Multiple signature schemes and multi-sig support
 */
export const AUTH_CONFIG = {
  signatureSchemes: {
    ed25519: {
      id: 0x00,
      name: "Ed25519",
      description: "Default signature scheme",
      supported: true,
    },
    secp256k1: {
      id: 0x01,
      name: "Secp256k1",
      description: "Bitcoin-compatible curve",
      supported: true,
    },
    secp256r1: {
      id: 0x02,
      name: "Secp256r1",
      description: "NIST P-256 curve",
      supported: true,
    },
  },

  zkLogin: {
    id: 0x04,
    name: "zkLogin",
    description: "OAuth + zero-knowledge proofs",
    providers: 13,
    twoFactorAuth: true,
  },

  passkey: {
    id: 0x05,
    name: "Passkey",
    description: "WebAuthn biometric signing",
    standard: "FIDO2",
    biometric: true,
  },

  multiSig: {
    enabled: true,
    threshold: "Configurable",
    weights: "Per signer",
    combinations: "Can mix different schemes",
  },
};

/**
 * 8. TOKENOMICS CONFIGURATION
 * SUI token and economic model
 */
export const TOKENOMICS_CONFIG = {
  nativeToken: {
    name: "SUI",
    purpose: "Pay for gas fees",
    decimals: 9,
    supply: "Capped at 10 billion",
  },

  gasFees: {
    computation: {
      unit: "Per computational unit",
      example: "1 unit = basic operation",
    },
    storage: {
      unit: "Per byte-year",
      example: "Object creation cost",
      rebate: "Refunded when deleted",
    },
    formula: "Total = (computation * rate) + (storage * rate) - rebate",
  },

  staking: {
    enabled: true,
    mechanism: "Stake SUI with validators",
    rewards: "Percentage of validator gas earnings",
    unstaking: "Requires waiting period",
    minAmount: "None specified",
  },

  bridging: {
    suiBridge: "Native Sui bridge",
    wormhole: "Wormhole Connect and Portal",
    zetaChain: "ZetaChain cross-chain bridge",
    purpose: "Move tokens across blockchains",
  },

  vesting: {
    useCase: "Token launches with long-term outlook",
    strategies: "Custom vesting schedules",
    benefits: "Strengthen token economics",
  },
};

/**
 * 9. OBJECT MODEL CONFIGURATION
 * Object ownership and transfer semantics
 */
export const OBJECT_MODEL_CONFIG = {
  ownership: {
    addressOwned: {
      description: "Single address controls",
      capabilities: "Can transfer or modify",
      examples: "User assets, balances",
    },
    objectOwned: {
      description: "Wrapped in another object",
      capabilities: "Parent object controls",
      examples: "Nested objects, compositions",
    },
    shared: {
      description: "Multiple signers interact",
      capabilities: "Requires consensus",
      examples: "Shared state, voting",
    },
    immutable: {
      description: "Cannot be modified",
      capabilities: "Read-only access",
      examples: "Package code, constants",
    },
  },

  transfers: {
    mechanism: "Objects move between owners",
    atomicity: "Atomic operation",
    validation: "Ownership verified at execution",
    limitations: "Some objects non-transferable",
  },

  versioning: {
    enabled: true,
    purpose: "Upgrade packages and objects",
    compatibility: "Backward compatible upgrades",
    migration: "Data transforms between versions",
  },
};

/**
 * 10. MOVE CONFIGURATION
 * Smart contract language and development
 */
export const MOVE_CONFIG = {
  language: {
    name: "Move",
    purpose: "Safe smart contracts on Sui",
    openSource: true,
    safety: "Prevents common vulnerabilities",
  },

  packages: {
    structure: "Modules within packages",
    deployment: "Immutable once published",
    dependencies: "Standard library and custom",
    versioning: "Multiple versions can coexist",
  },

  conventions: {
    modules: "snake_case (hello_world)",
    structs: "PascalCase (Greeting)",
    functions: "snake_case (create_greeting)",
    constants: "UPPER_CASE (MAX_TEXT_LENGTH)",
    visibility: "public, public(friend), private",
  },

  dynamicFields: {
    purpose: "Variable-sized heterogeneous data",
    gasModel: "Only charged when accessed",
    operations: "Add and remove dynamically",
    flexibility: "Without recompilation",
  },

  bestPractices: [
    "Use type wrapping for domain concepts",
    "Implement proper error handling",
    "Test thoroughly with Move test framework",
    "Document public interfaces",
    "Follow Move 2024 conventions",
    "Use dynamic fields for scalability",
    "Validate all inputs",
    "Use abilities correctly (key, store, copy, drop)",
  ],
};

/**
 * 11. DATA ACCESS CONFIGURATION
 * Multiple ways to query Sui data
 */
export const DATA_ACCESS_CONFIG = {
  graphQL: {
    type: "Structured query language",
    benefits: [
      "Type-safe queries",
      "Flexible filtering",
      "Real-time subscriptions",
    ],
    capabilities: {
      objects: true,
      transactions: true,
      events: true,
      coins: true,
      dynamicFields: true,
    },
    implemented: "3,650+ lines of code",
  },

  gRPC: {
    type: "Binary protocol, lower latency",
    benefits: ["Fast streaming", "Low bandwidth", "Type-safe"],
    services: {
      indexer: true,
      readApi: true,
      writeApi: true,
      transactionStream: true,
      eventStream: true,
    },
  },

  customIndexing: {
    type: "Application-specific indexing",
    strategies: {
      sequential: "Process blocks in order",
      concurrent: "Parallel processing",
      adaptive: "Dynamic optimization",
    },
    features: {
      eventIndexing: true,
      objectTracking: true,
      historicalQueries: true,
      realtimeSync: true,
    },
    implemented: "2,000+ lines of code",
  },

  archival: {
    type: "Historical state access",
    capabilities: ["Point-in-time queries", "Full history", "Verification"],
    useCase: "Auditing and analysis",
  },
};

/**
 * 12. CRYPTOGRAPHY CONFIGURATION
 * Advanced cryptographic primitives
 */
export const CRYPTOGRAPHY_CONFIG = {
  zkLogin: {
    type: "Zero-knowledge OAuth",
    purpose: "OAuth without on-chain linking",
    providers: 13,
    twoFactorAuth: {
      factor1: "OAuth credential (provider)",
      factor2: "User salt (service or user)",
    },
    security: {
      proofSystem: "Groth16 zkSNARK",
      sessionDuration: "24 hours",
      saltLength: "32-64 bytes",
      jwtValidation: "RS256 signature verification",
    },
    networks: ["mainnet", "testnet", "devnet"],
    implemented: "1,700+ lines of code",
  },

  passkey: {
    type: "WebAuthn biometric signing",
    standard: "FIDO2",
    benefits: {
      biometric: "Fingerprint/Face ID",
      hardware: "Security keys",
      local: "Sign without server",
      deviceBinding: "Tied to device",
    },
  },

  checkpointVerification: {
    type: "Blockchain state verification",
    mechanism: "Cryptographic checkpoints",
    capabilities: {
      stateProof: "Verify state at checkpoint",
      fullNodeSync: "Validate against network",
      historicalProofs: "Past state verification",
    },
  },
};

/**
 * 13. ADVANCED FEATURES CONFIGURATION
 */
export const ADVANCED_CONFIG = {
  gaming: {
    dynamicNFTs: "NFTs that evolve",
    kiosks: "Secure asset management",
    soulbound: "Non-transferable assets",
    onChainRandom: "Provably fair RNG",
    tournaments: "On-chain competitions",
  },

  bridges: {
    suiBridge: "Native bridge",
    wormhole: "Multi-chain messaging",
    zetaChain: "Omnichain computation",
  },

  evmMigration: {
    accountModel: "Account → Object-based",
    stateManagement: "Global state → Object ownership",
    transactions: "Sequential → Parallel (UTXOs)",
    gas: "Stateful → Computation + Storage",
  },
};

/**
 * Helper function to get current network client
 */
export function getSuiClient(
  network: keyof typeof NETWORKS_CONFIG = "testnet",
): SuiClient {
  const config = NETWORKS_CONFIG[network];
  return new SuiClient({ url: config.url });
}

/**
 * Helper function to get network info
 */
export function getNetworkInfo(
  network: keyof typeof NETWORKS_CONFIG = "testnet",
) {
  return NETWORKS_CONFIG[network];
}

/**
 * Helper function to estimate gas costs
 */
export function estimateGasCost(
  computationUnits: number,
  storageBytes: number,
  durationYears: number = 1,
): number {
  const computation =
    computationUnits * STORAGE_CONFIG.pricing.computationCostPerUnit;
  const storage =
    storageBytes *
    durationYears *
    STORAGE_CONFIG.pricing.storageCostPerByteYear;
  const base = STORAGE_CONFIG.pricing.baseTransactionCost;

  return computation + storage + base;
}

export default {
  NETWORKS_CONFIG,
  STORAGE_CONFIG,
  CONSENSUS_CONFIG,
  SECURITY_CONFIG,
  UPGRADES_CONFIG,
  TRANSACTIONS_CONFIG,
  AUTH_CONFIG,
  TOKENOMICS_CONFIG,
  OBJECT_MODEL_CONFIG,
  MOVE_CONFIG,
  DATA_ACCESS_CONFIG,
  CRYPTOGRAPHY_CONFIG,
  ADVANCED_CONFIG,
  getSuiClient,
  getNetworkInfo,
  estimateGasCost,
};
