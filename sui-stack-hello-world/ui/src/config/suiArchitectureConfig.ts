// Sui Architecture Concepts Configuration
// Maps official Sui documentation concepts to CROZZ implementation

import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import type { Network } from "@mysten/sui/networks";

/**
 * 1. NETWORKS CONFIGURATION
 * Sui operates multiple networks for different purposes
 */
export const NETWORKS_CONFIG = {
  mainnet: {
    name: "Mainnet",
    purpose: "Production environment",
    url: getFullnodeUrl("mainnet"),
    status: "production",
    description: "Live blockchain for real transactions",
  },
  testnet: {
    name: "Testnet",
    purpose: "Staging and pre-production testing",
    url: getFullnodeUrl("testnet"),
    status: "staging",
    description: "Testing before mainnet deployment",
  },
  devnet: {
    name: "Devnet",
    purpose: "Development and new feature testing",
    url: getFullnodeUrl("devnet"),
    status: "development",
    description: "For developing new features",
  },
  localnet: {
    name: "Localnet",
    purpose: "Local development environment",
    url: "http://localhost:9000",
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
    storageCostPerByteYear: 38_400,      // Approximate cost
    computationCostPerUnit: 1_000,       // Per computational unit
    minStorageRebate: 2_700,             // Minimum refund when deleting
    baseTransactionCost: 1_000,          // Base cost for any transaction
  },

  // Object lifecycle costs
  objectLifecycle: {
    creation: "Includes storage cost upfront",
    mutation: "Read (free) + Write (storage cost)",
    deletion: "Refunded storage rebate",
    transfer: "Minimal cost, no storage change",
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
    duration: "Approximately 24 hours",
    validatorSetFixed: "Remains same throughout epoch",
    reconfiguration: "Network parameters adjust at boundaries",
    finality: "Object reads must be within same epoch",
  },

  equivocation: {
    definition: "Using same object in parallel transactions",
    prevention: "Serialize object access",
    detection: "Validators detect double-spending attempts",
    consequences: "Transaction reverted",
  },

  implementation: {
    trackCurrentEpoch: "Monitor via SuiSystemState",
    respectEpochBounds: "Submit transactions within validity window",
    handleReconfiguration: "Be ready for validator changes",
    verifyFinality: "Wait for epoch boundaries",
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
    benefits: ["Type-safe queries", "Flexible filtering", "Real-time subscriptions"],
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
export function getSuiClient(network: keyof typeof NETWORKS_CONFIG = "testnet"): SuiClient {
  const config = NETWORKS_CONFIG[network];
  return new SuiClient({ url: config.url });
}

/**
 * Helper function to get network info
 */
export function getNetworkInfo(network: keyof typeof NETWORKS_CONFIG = "testnet") {
  return NETWORKS_CONFIG[network];
}

/**
 * Helper function to estimate gas costs
 */
export function estimateGasCost(
  computationUnits: number,
  storageBytes: number,
  durationYears: number = 1
): number {
  const computation = 
    computationUnits * STORAGE_CONFIG.pricing.computationCostPerUnit;
  const storage = 
    storageBytes * durationYears * STORAGE_CONFIG.pricing.storageCostPerByteYear;
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
