/**
 * Sui Signing and Sending Transactions Configuration
 * Based on: https://docs.sui.io/guides/developer/sui-101/sign-and-send-txn
 * 
 * Complete guide for constructing, signing, and executing on-chain transactions
 */

// ============================================================================
// SIGNATURE SCHEMES
// ============================================================================

export const SIGNATURE_SCHEMES = {
  title: "Supported Signature Schemes",
  description: "Cryptographic schemes for signing transactions in Sui",

  schemes: {
    ED25519_PURE: {
      name: "Ed25519 Pure",
      flag: "0x00",
      description: "EdDSA signature scheme using Ed25519 curve",
      security: "Very high - quantum resistant",
      performance: "Fast",
      keySize: "32 bytes",
      signatureSize: "64 bytes",
      instantiation: "Ed25519Keypair"
    },

    ECDSA_SECP256K1: {
      name: "ECDSA Secp256k1",
      flag: "0x01",
      description: "ECDSA signature scheme using Secp256k1 curve (Bitcoin/Ethereum)",
      security: "High",
      performance: "Medium",
      keySize: "32 bytes",
      signatureSize: "64 bytes",
      instantiation: "Secp256k1Keypair",
      note: "Compatible with Bitcoin and Ethereum ecosystems"
    },

    ECDSA_SECP256R1: {
      name: "ECDSA Secp256r1",
      flag: "0x02",
      description: "ECDSA signature scheme using Secp256r1 curve (NIST P-256)",
      security: "High",
      performance: "Medium",
      keySize: "32 bytes",
      signatureSize: "64 bytes",
      instantiation: "Secp256r1Keypair",
      note: "NIST standard curve, used in HSM devices"
    },

    MULTISIG: {
      name: "Multisig",
      flag: "0x03",
      description: "Multi-signature scheme requiring multiple keys",
      security: "Very high - distributed trust",
      performance: "Depends on threshold",
      note: "See /concepts/transactions/transaction-auth/multisig for details"
    },

    ZKLOGIN: {
      name: "zkLogin",
      flag: "0x04",
      description: "Zero-knowledge login using ephemeral key pairs",
      security: "Very high - privacy preserving",
      performance: "Medium",
      note: "See /concepts/cryptography/zklogin for details"
    }
  }
};

// ============================================================================
// KEYPAIR INSTANTIATION PATTERNS
// ============================================================================

export const KEYPAIR_PATTERNS = {
  title: "Ways to Create and Instantiate Keypairs",

  typescript: {
    description: "TypeScript SDK keypair creation patterns",

    randomGeneration: {
      title: "Random Generation",
      patterns: [
        {
          scheme: "Ed25519",
          code: `const kp_rand_0 = new Ed25519Keypair();`
        },
        {
          scheme: "Secp256k1",
          code: `const kp_rand_1 = new Secp256k1Keypair();`
        },
        {
          scheme: "Secp256r1",
          code: `const kp_rand_2 = new Secp256r1Keypair();`
        }
      ],
      use: "Development and testing only"
    },

    importFromHex: {
      title: "Import Private Key from Hex",
      patterns: [
        {
          scheme: "Ed25519",
          code: `const kp_import_0 = Ed25519Keypair.fromSecretKey(
  fromHex('0xd463e11c7915945e86ac2b72d88b8190cfad8ff7b48e7eb892c275a5cf0a3e82')
);`
        },
        {
          scheme: "Secp256k1",
          code: `const kp_import_1 = Secp256k1Keypair.fromSecretKey(
  fromHex('0xd463e11c7915945e86ac2b72d88b8190cfad8ff7b48e7eb892c275a5cf0a3e82')
);`
        }
      ],
      warning: "Never hardcode private keys - use environment variables"
    },

    deriveMnemonic: {
      title: "Derive from BIP39 Mnemonic",
      patterns: [
        {
          scheme: "Ed25519 (default path)",
          code: `const kp_derive_0 = Ed25519Keypair.deriveKeypair(
  'retire skin goose will hurry this field stadium drastic label husband venture cruel toe wire'
);`
        },
        {
          scheme: "Ed25519 (custom path)",
          code: `const kp_derive_custom = Ed25519Keypair.deriveKeypair(
  '$MNEMONICS',
  "m/44'/784'/1'/0'/0'"
);`
        },
        {
          scheme: "Secp256k1 (custom path)",
          code: `const kp_derive_secp = Secp256k1Keypair.deriveKeypair(
  '$MNEMONICS',
  "m/54'/784'/1'/0/0"
);`
        }
      ],
      advantage: "Deterministic and recoverable from mnemonic"
    }
  },

  rust: {
    description: "Rust SDK keypair creation patterns",

    deterministicGeneration: {
      code: `let skp_determ = SuiKeyPair::Ed25519(
  Ed25519KeyPair::generate(&mut StdRng::from_seed([0; 32]))
);`,
      note: "Testing only - do not use for mainnet"
    },

    randomGeneration: {
      code: `let skp_rand = SuiKeyPair::Ed25519(
  get_key_pair_from_rng(&mut rand::rngs::OsRng).1
);`,
      note: "Use for production with OsRng"
    },

    importFromBase64: {
      code: `let skp_import = SuiKeyPair::Ed25519(
  Ed25519KeyPair::from_bytes(
    &Base64::decode("1GPhHHkVlF6GrCty2IuBkM+tj/e0jn64ksJ1pc8KPoI=")?
  )?
);`
    },

    importWithFlag: {
      code: `let skp_import_flag = SuiKeyPair::decode_base64(
  "ANRj4Rx5FZRehqwrctiLgZDPrY/3tI5+uJLCdaXPCj6C"
)?;`,
      note: "First byte is signature scheme flag"
    }
  },

  cli: {
    description: "Sui CLI keypair creation",

    randomGeneration: [
      {
        scheme: "Ed25519",
        command: "sui client new-address ed25519"
      },
      {
        scheme: "Secp256k1",
        command: "sui client new-address secp256k1"
      },
      {
        scheme: "Secp256r1",
        command: "sui client new-address secp256r1"
      }
    ],

    importPrivateKey: [
      {
        scheme: "Ed25519",
        command: "sui keytool import \"0xd463e11c7915945e86ac2b72d88b8190cfad8ff7b48e7eb892c275a5cf0a3e82\" ed25519"
      },
      {
        scheme: "Secp256k1",
        command: "sui keytool import \"0xd463e11c7915945e86ac2b72d88b8190cfad8ff7b48e7eb892c275a5cf0a3e82\" secp256k1"
      }
    ],

    importMnemonic: [
      {
        scheme: "Ed25519",
        command: "sui keytool import \"$MNEMONICS\" ed25519"
      },
      {
        scheme: "Secp256k1",
        command: "sui keytool import \"$MNEMONICS\" secp256k1"
      }
    ],

    listAddresses: {
      command: "sui keytool list",
      description: "View all available addresses in keystore"
    }
  }
};

// ============================================================================
// TRANSACTION SIGNING WORKFLOW
// ============================================================================

export const TRANSACTION_WORKFLOW = {
  title: "Transaction Signing and Execution Workflow",
  description: "High-level process for creating, signing, and executing transactions",

  steps: [
    {
      step: 1,
      name: "Construct Transaction",
      description: "Create a Transaction with multiple chained operations",
      details: [
        "Use Transaction class or ProgrammableTransactionBuilder",
        "Chain multiple transaction calls",
        "Set sender address",
        "Reference gas coin or let SDK select it"
      ],
      references: "/guides/developer/sui-101/building-ptb"
    },

    {
      step: 2,
      name: "Estimate and Select Gas",
      description: "SDK picks appropriate gas coin and estimates gas",
      details: [
        "SDK's built-in gas estimation calculates gas requirements",
        "Coin selection picks gas coin automatically",
        "Or manually specify gas coin to be used",
        "Use splitCoin if no gas coin available"
      ],
      gasSelection: {
        automatic: "SDK selects best gas coin",
        manual: "Specify gas coin object ID explicitly",
        splitCoin: "Create gas coin from existing coin first"
      }
    },

    {
      step: 3,
      name: "Build Transaction Bytes",
      description: "Serialize transaction to bytes",
      details: [
        "Convert Transaction object to bytes",
        "Ready for signing"
      ]
    },

    {
      step: 4,
      name: "Create Intent Message",
      description: "Create intent message (intent || tx_data)",
      details: [
        "Combine intent with transaction data",
        "Intent specifies transaction type (e.g., sui_transaction)",
        "Encode using BCS",
        "Hash with Blake2b"
      ],
      formula: "intent || bcs_bytes(tx_data) -> blake2b_hash -> digest"
    },

    {
      step: 5,
      name: "Sign Transaction",
      description: "Use private key to generate signature",
      details: [
        "Sign the blake2b digest of intent message",
        "Use corresponding SuiKeyPair",
        "Produces signature in chosen scheme",
        "Can verify signature locally before submission"
      ],
      verification: "Optional - verify signature locally to catch errors early"
    },

    {
      step: 6,
      name: "Submit for Execution",
      description: "Send signed transaction to blockchain",
      details: [
        "Submit Transaction and signature to executor",
        "Network validates and executes transaction",
        "Returns transaction response with results"
      ]
    }
  ],

  gasConfiguration: {
    gasPrice: "Retrieved from network (e.g., get_reference_gas_price())",
    gasBudget: "Maximum gas units willing to spend",
    gasObject: "Coin object used to pay for gas",
    splitCoin: "Use first in PTB if creating new gas coin"
  }
};

// ============================================================================
// MULTI-TRANSACTION EXECUTORS
// ============================================================================

export const TRANSACTION_EXECUTORS = {
  title: "Processing Multiple Transactions from Same Address",
  description: "SDK executors for handling multiple transactions efficiently",

  SerialTransactionExecutor: {
    name: "SerialTransactionExecutor",
    when: "Process transactions one after another sequentially",
    use: "Default choice for most scenarios",
    
    behavior: {
      processing: "Executes transactions one at a time",
      coinHandling: "Combines all coins into single coin for all transactions",
      sequencing: "Handles SequenceNumber versioning automatically",
      objectTracking: "Prevents object version conflicts across PTBs"
    },

    advantages: [
      "Prevents SequenceNumber errors",
      "Handles coin combination automatically",
      "Simpler to reason about",
      "Better for dependent transactions"
    ],

    bestFor: [
      "Sequential workflows",
      "Transactions with dependencies",
      "Simple batch operations",
      "When execution order matters"
    ],

    typescript: {
      code: `import { SerialTransactionExecutor } from '@mysten/sui/transactions';

const executor = new SerialTransactionExecutor(client, keypair);

// Create multiple transactions
const tx1 = new Transaction();
// ...build tx1...

const tx2 = new Transaction();
// ...build tx2...

// Execute sequentially
const result1 = await executor.execute({ transaction: tx1 });
const result2 = await executor.execute({ transaction: tx2 });`
    }
  },

  ParallelTransactionExecutor: {
    name: "ParallelTransactionExecutor",
    when: "Process transactions with same sender simultaneously",
    use: "For parallel, non-dependent transactions",
    
    behavior: {
      processing: "Executes multiple transactions in parallel",
      gasPool: "Creates pool of gas coins for parallel use",
      coinTracking: "Prevents coin equivocation across transactions",
      objectOrdering: "Orders processing to avoid object version conflicts"
    },

    advantages: [
      "Parallel execution for speed",
      "Manages gas coin pool automatically",
      "Tracks object usage across transactions",
      "Prevents conflicting transactions from interfering"
    ],

    bestFor: [
      "Independent transactions",
      "Batch operations",
      "High-throughput scenarios",
      "When execution order doesn't matter"
    ],

    typescript: {
      code: `import { ParallelTransactionExecutor } from '@mysten/sui/transactions';

const executor = new ParallelTransactionExecutor(client, keypair);

// Create multiple independent transactions
const transactions = Array(5).fill(null).map((_, i) => {
  const tx = new Transaction();
  // ...build transaction...
  return tx;
});

// Execute in parallel
const results = await Promise.all(
  transactions.map(tx => executor.execute({ transaction: tx }))
);`
    }
  }
};

// ============================================================================
// SIGNATURE VERIFICATION
// ============================================================================

export const SIGNATURE_VERIFICATION = {
  title: "Signature Verification Process",
  description: "Verifying transaction signatures locally before submission",

  process: {
    step1: "Derive digest from intent message (blake2b hash)",
    step2: "Use public key to verify signature against digest",
    step3: "Confirm sender address consistency with public key"
  },

  typescript: {
    code: `// Verify signature locally
const isValid = await keypair
  .getPublicKey()
  .verifyTransaction(bytes, serializedSignature);

if (!isValid) {
  throw new Error('Signature verification failed');
}

// Only submit if verification passes
const result = await client.executeTransactionBlock({
  transactionBlock: bytes,
  signature: serializedSignature,
});`
  },

  benefits: [
    "Catch errors before network submission",
    "Reduce failed transactions",
    "Validate key ownership",
    "Ensure correct signature scheme"
  ]
};

// ============================================================================
// COMMON PATTERNS AND BEST PRACTICES
// ============================================================================

export const BEST_PRACTICES = {
  title: "Transaction Signing Best Practices",

  security: [
    "✅ Never hardcode private keys - use environment variables or hardware wallets",
    "✅ Use Ed25519 for new applications (most secure against quantum)",
    "✅ Verify signatures locally before network submission",
    "✅ Use hardware wallets for mainnet transactions",
    "✅ Store mnemonics securely (encrypted, backed up)",
    "✅ Rotate keys periodically",
    "✅ Use different keys for different networks (testnet vs mainnet)"
  ],

  gasManagement: [
    "✅ Let SDK estimate gas for initial development",
    "✅ Test gas costs on testnet before mainnet",
    "✅ Add buffer to gas budget (20-30% above estimate)",
    "✅ Monitor gas price trends for optimization",
    "✅ Use splitCoin early in PTB if needed",
    "✅ Batch transactions to reduce gas overhead"
  ],

  transactions: [
    "✅ Use SerialTransactionExecutor for sequential operations",
    "✅ Use ParallelTransactionExecutor for independent transactions",
    "✅ Cache transaction responses for analytics",
    "✅ Implement retry logic for failed transactions",
    "✅ Use consistent gas budgets within batches",
    "✅ Test transaction logic on testnet first"
  ],

  signatures: [
    "✅ Always use immutable references to public key",
    "✅ Verify signature locally before submission (when possible)",
    "✅ Include only 1 user signature unless sponsored",
    "✅ For multisig, follow Multisig documentation",
    "✅ For zkLogin, follow zkLogin documentation",
    "✅ Document which signature scheme each key uses"
  ]
};

// ============================================================================
// CROZZ-SPECIFIC PATTERNS
// ============================================================================

export const CROZZ_TRANSACTION_STRATEGY = {
  title: "CROZZ Transaction Management",

  gameTransactions: {
    playerActions: {
      type: "SerialTransactionExecutor",
      reason: "Sequential game actions may depend on previous results",
      pattern: "Move, Attack, Use Item - each updates game state"
    },

    tradeOperations: {
      type: "ParallelTransactionExecutor",
      reason: "Multiple independent trades can happen simultaneously",
      pattern: "NFT swaps, coin exchanges - no dependencies"
    },

    stakingRewards: {
      type: "SerialTransactionExecutor",
      reason: "Rewards distribution depends on previous epoch data",
      pattern: "Calculate, distribute, update - sequential flow"
    }
  },

  keyManagement: {
    gameServer: "Use Ed25519 for primary game server",
    playerWallets: "Support all schemes (Ed25519, Secp256k1, Secp256r1)",
    multisig: "For high-value transactions (treasury operations)",
    hsm: "Consider HSM (Secp256r1) for production servers"
  },

  gasStrategy: {
    development: "Use testnet with generous gas budgets for testing",
    staging: "Profile real costs on testnet before mainnet",
    production: "Conservative budgets with 25% buffer",
    batching: "Batch player transactions for efficiency"
  }
};

export default {
  SIGNATURE_SCHEMES,
  KEYPAIR_PATTERNS,
  TRANSACTION_WORKFLOW,
  TRANSACTION_EXECUTORS,
  SIGNATURE_VERIFICATION,
  BEST_PRACTICES,
  CROZZ_TRANSACTION_STRATEGY
};
