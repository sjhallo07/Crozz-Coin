/**
 * Sui Local Network Configuration
 * Implements local development network setup and management
 * Based on: https://docs.sui.io/guides/developer/sui-101/local-network
 */

// ============================================================================
// LOCAL NETWORK ENVIRONMENT CONFIGURATION
// ============================================================================

/**
 * Default local network configuration
 * These settings match Sui CLI defaults for `sui start` command
 */
export const LOCAL_NETWORK_DEFAULTS = {
  description: "Default Sui local network configuration",
  
  // RPC Server Configuration
  rpc: {
    host: "127.0.0.1",
    port: 9000,
    url: "http://127.0.0.1:9000",
    method: "JSON-RPC 2.0"
  },

  // Faucet Configuration
  faucet: {
    enabled: true,
    host: "0.0.0.0",
    port: 9123,
    url: "http://127.0.0.1:9123",
    description: "Provides test SUI coins for gas fees"
  },

  // Indexer Configuration (requires PostgreSQL)
  indexer: {
    enabled: false,
    database: "PostgreSQL",
    mode: "temporary", // or "postgres://user:pass@host:5432/db"
    description: "Indexes blockchain data for faster queries"
  },

  // Consistent Store Configuration
  consistentStore: {
    enabled: false,
    host: "0.0.0.0",
    port: 9124,
    url: "http://127.0.0.1:9124",
    description: "Provides consistent view of chain state"
  },

  // GraphQL Configuration (requires indexer + consistent store)
  graphql: {
    enabled: false,
    host: "0.0.0.0",
    port: 9125,
    url: "http://127.0.0.1:9125",
    description: "GraphQL API with web-based GraphiQL IDE"
  },

  // Genesis Configuration
  genesis: {
    forceRegenesis: true,
    description: "Creates new genesis each time (no state persistence)",
    epochDurationMs: 60000 // 60 seconds
  },

  // Logging
  logging: {
    rustLog: "off,sui_node=info",
    description: "Show only sui_node logs, suppress others"
  }
};

// ============================================================================
// STARTUP COMMANDS
// ============================================================================

/**
 * CLI commands for different local network scenarios
 */
export const LOCAL_NETWORK_COMMANDS = {
  description: "Sui CLI commands for local network setup",

  // Basic command with faucet only
  basicWithFaucet: {
    command: 'RUST_LOG="off,sui_node=info" sui start --with-faucet --force-regenesis',
    description: "Start local network with faucet (no persistence)",
    features: ["RPC on 9000", "Faucet on 9123"],
    useCase: "Quick testing without persistence"
  },

  // Full development setup
  fullDevelopment: {
    command: 'RUST_LOG="off,sui_node=info" sui start --with-faucet --with-indexer --with-graphql --force-regenesis',
    description: "Start with indexer, GraphQL, and faucet",
    requirements: ["PostgreSQL/libpq installed"],
    features: [
      "RPC on 9000",
      "Faucet on 9123",
      "Indexer (temporary DB)",
      "Consistent Store on 9124",
      "GraphQL on 9125"
    ],
    useCase: "Full-featured development"
  },

  // Persistent state
  withPersistence: {
    command: 'sui start --with-faucet',
    description: "Start with persistence (no force-regenesis)",
    features: ["RPC on 9000", "Faucet on 9123", "Persistent state"],
    useCase: "Keep network state between restarts"
  },

  // Custom configuration directory
  customConfig: {
    command: 'sui start --network.config ~/.sui/custom_local --with-faucet --force-regenesis',
    description: "Use custom genesis configuration",
    features: ["Custom genesis", "Faucet", "Force regenerate"],
    useCase: "Advanced customization"
  },

  // Custom port configuration
  customPorts: {
    command: 'sui start --with-faucet=0.0.0.0:6124 --fullnode-rpc-port 8000 --force-regenesis',
    description: "Use custom ports for faucet and RPC",
    ports: { faucet: 6124, rpc: 8000 },
    useCase: "Avoid port conflicts"
  },

  // Custom epoch duration
  customEpochDuration: {
    command: 'sui start --with-faucet --force-regenesis --epoch-duration-ms 5000',
    description: "Set epoch duration to 5 seconds",
    useCase: "Fast testing of epoch-related features"
  },

  // Multiple validators
  multipleValidators: {
    command: 'sui genesis --with-faucet -f --committee-size 5 && sui start --force-regenesis --with-faucet',
    description: "Create genesis with 5 validators",
    useCase: "Test distributed consensus behavior"
  },

  // With data ingestion
  withDataIngestion: {
    command: 'sui start --with-faucet --with-indexer --data-ingestion-dir ./checkpoints --force-regenesis',
    description: "Dump checkpoints to directory for analysis",
    features: ["RPC", "Faucet", "Indexer", "Checkpoint export"],
    useCase: "Debug and analyze checkpoints"
  },

  // Verbose logging
  verboseLogging: {
    command: 'sui start --with-faucet --force-regenesis',
    description: "Start without RUST_LOG (maximum verbosity)",
    environment: { RUST_LOG: "default" },
    useCase: "Debugging network issues"
  }
};

// ============================================================================
// LOCAL ENVIRONMENT SETUP
// ============================================================================

/**
 * CLI client configuration for local network
 */
export const LOCAL_CLIENT_SETUP = {
  description: "Sui CLI client configuration for local network",

  createLocalEnvironment: {
    command: 'sui client new-env --alias local --rpc http://127.0.0.1:9000',
    description: "Create new environment alias for local network",
    result: "Creates 'local' environment pointing to localhost:9000"
  },

  switchToLocal: {
    command: 'sui client switch --env local',
    description: "Switch active CLI environment to local network",
    result: "Active environment switched to [local]"
  },

  checkActiveEnvironment: {
    command: 'sui client active-env',
    description: "Check current active environment",
    expectedResult: "local"
  },

  showActiveAddress: {
    command: 'sui client active-address',
    description: "Show the active address on local network",
    note: "Each address is unique (example: 0xbc33e6e4818f9f2ef77d020b35c24be738213e64d9e58839ee7b4222029610de)"
  },

  listAllAddresses: {
    command: 'sui client addresses',
    description: "List all addresses in the local network keystore"
  }
};

// ============================================================================
// FAUCET OPERATIONS
// ============================================================================

/**
 * Faucet configuration and commands
 */
export const LOCAL_FAUCET_OPERATIONS = {
  description: "Operations for getting test SUI from local faucet",

  requestSUI: {
    command: 'sui client faucet',
    description: "Request SUI coins from local faucet (active address)",
    waitTime: "up to 60 seconds",
    defaultAmount: "1000 SUI per coin (typically 5 coins = 5000 SUI)"
  },

  checkGasCoins: {
    command: 'sui client gas',
    description: "View coin objects for the active address",
    showsFields: [
      "gasCoinId - Object ID of the coin",
      "gasBalance - Amount of SUI in that coin"
    ]
  },

  requestSUIForSpecificAddress: {
    command: 'sui client faucet --address 0xADDRESS',
    description: "Request SUI for a specific address (instead of active)"
  },

  customFaucetServer: {
    command: 'sui client faucet --faucet-server-url http://custom-faucet:9123',
    description: "Use a custom faucet server URL"
  }
};

// ============================================================================
// ACCESS LOCAL FULL NODE
// ============================================================================

/**
 * Examples for accessing the local full node RPC
 */
export const LOCAL_FULLNODE_ACCESS = {
  description: "Access local full node via JSON-RPC",

  getTotalTransactions: {
    method: "sui_getTotalTransactionBlocks",
    description: "Get total transaction count from local network",
    curlCommand: `curl --location --request POST 'http://127.0.0.1:9000' \
--header 'Content-Type: application/json' \
--data-raw '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "sui_getTotalTransactionBlocks",
  "params": []
}'`,
    expectedResponse: {
      jsonrpc: "2.0",
      result: "number (e.g., 168)",
      id: 1
    }
  },

  getAllEpochs: {
    method: "suix_getAllEpochInfo",
    description: "Get information about all epochs",
    useCase: "Monitor epoch progression"
  },

  getCurrentEpoch: {
    method: "suix_getLatestCheckpointSequenceNumber",
    description: "Get latest checkpoint/epoch info",
    useCase: "Check current chain state"
  },

  getObjectData: {
    method: "sui_getObject",
    description: "Get object data by ID",
    params: ["objectId"],
    useCase: "Inspect specific objects"
  },

  queryTransactionBlocks: {
    method: "sui_queryTransactionBlocks",
    description: "Query transactions with filters",
    params: ["filter", "limit"],
    useCase: "Search transaction history"
  }
};

// ============================================================================
// TYPESCRIPT SDK INTEGRATION
// ============================================================================

/**
 * Sui TypeScript SDK configuration for local network
 */
export const LOCAL_SDK_CONFIGURATION = {
  description: "TypeScript SDK setup for local network development",

  basicSetup: {
    code: `
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

// Connect to local network
const client = new SuiClient({
  url: "http://127.0.0.1:9000"
});

// Get transaction count
const count = await client.getTotalTransactionBlocks();
console.log("Total transactions:", count);
    `,
    description: "Basic SDK client setup for local network"
  },

  queryLocalNetwork: {
    code: `
import { SuiClient } from "@mysten/sui/client";

const client = new SuiClient({ url: "http://127.0.0.1:9000" });

// Query objects for an address
const objects = await client.getOwnedObjects({
  owner: "0xbc33e6e4818f9f2ef77d020b35c24be738213e64d9e58839ee7b4222029610de"
});

console.log("User objects:", objects.data);

// Get specific object
const obj = await client.getObject({ id: objectId });
console.log("Object data:", obj.data?.content);
    `,
    description: "Query objects on local network"
  },

  executeTransaction: {
    code: `
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

const client = new SuiClient({ url: "http://127.0.0.1:9000" });
const wallet = new Ed25519Keypair(); // Local keypair

// Build transaction
const tx = new Transaction();
tx.moveCall({
  target: "0x2::sui_system::request_add_delegation",
  arguments: [/* ... */],
});

// Execute on local network
const result = await client.signAndExecuteTransactionBlock({
  transaction: tx,
  signer: wallet,
});

console.log("Transaction digest:", result.digest);
    `,
    description: "Execute transactions on local network"
  },

  subscribeToEvents: {
    code: `
const client = new SuiClient({ url: "http://127.0.0.1:9000" });

// Subscribe to events
client.subscribe({
  method: "sui_subscribeEvent",
  params: [{
    filter: {
      EventType: "0x2::coin::CoinMinted"
    }
  }],
  onMessage: (event) => {
    console.log("New event:", event);
  }
});
    `,
    description: "Subscribe to events on local network"
  }
};

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

/**
 * Environment variables for local network configuration
 */
export const LOCAL_ENVIRONMENT_VARIABLES = {
  description: "Environment variables for local network setup",

  configurations: {
    RUST_LOG: {
      description: "Control Rust logging levels",
      recommended: "off,sui_node=info",
      options: [
        "off,sui_node=info - Only show node logs",
        "debug - Show debug logs",
        "info - Show info level logs",
        "default - Use default logging"
      ]
    },

    TMPDIR: {
      description: "Temporary directory for local network data",
      useCase: "Set when /tmp is mounted to tmpfs",
      example: "TMPDIR=./local-network-tmp sui start --with-faucet --force-regenesis"
    },

    SUI_CONFIG_DIR: {
      description: "Override default config directory",
      default: "~/.sui/sui_config",
      example: "SUI_CONFIG_DIR=~/.sui/custom_config sui client active-env"
    },

    NETWORK_CONFIG: {
      description: "Specify network configuration directory",
      useWith: "--network.config flag",
      example: "sui start --network.config ~/.sui/custom_local"
    }
  }
};

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

/**
 * PostgreSQL configuration for indexer and consistent store
 */
export const LOCAL_DATABASE_CONFIG = {
  description: "Database configuration for local indexer/GraphQL",

  requirements: {
    postgresql: "11.0 or higher",
    libpq: "Required for Sui CLI indexer integration",
    installCommand: {
      macos: "brew install postgresql",
      ubuntu: "sudo apt-get install postgresql postgresql-contrib",
      other: "See PostgreSQL installation docs"
    }
  },

  modes: {
    disabled: {
      flag: "No flag",
      description: "No indexer is started (default)"
    },
    
    temporary: {
      flag: "--with-indexer",
      description: "Create/use temporary database in network config directory",
      useCase: "Development without persistence"
    },
    
    persistent: {
      flag: '--with-indexer=postgres://user:pass@host:5432/db',
      description: "Use provided PostgreSQL database URL",
      useCase: "Production or long-running tests"
    }
  },

  exampleConnections: {
    localhost: "postgres://postgres:password@localhost:5432/sui_local",
    docker: "postgres://postgres:password@host.docker.internal:5432/sui_local",
    remote: "postgres://user:pass@remote-server.com:5432/sui_local"
  },

  createLocalDB: {
    command: "createdb sui_local",
    description: "Create PostgreSQL database for local network"
  },

  connectToLocalDB: {
    command: "sui start --with-faucet --with-indexer=postgres://postgres:password@localhost:5432/sui_local",
    description: "Start network with custom database"
  }
};

// ============================================================================
// MONITORING AND DEBUGGING
// ============================================================================

/**
 * Tools and techniques for monitoring local network
 */
export const LOCAL_MONITORING = {
  description: "Monitoring and debugging tools for local network",

  explorers: [
    {
      name: "Polymedia Explorer",
      url: "https://explorer.polymedia.app/",
      feature: "Can set custom RPC URL to http://127.0.0.1:9000",
      github: "https://github.com/juzybits/polymedia-explorer"
    },
    {
      name: "Sui Explorer",
      url: "Community fork",
      feature: "Build locally or use online",
      github: "https://github.com/suiware/sui-explorer"
    },
    {
      name: "suiscan",
      url: "https://suiscan.xyz/",
      feature: "Set custom RPC URL",
      type: "Network scanner"
    },
    {
      name: "SuiVision",
      url: "https://suivision.xyz/",
      feature: "Set custom RPC URL",
      type: "Network scanner"
    }
  ],

  customRPCSetup: {
    description: "How to use custom RPC URL in online explorers",
    steps: [
      "Open explorer website",
      "Look for settings/gear icon",
      "Find 'Custom RPC URL' setting",
      "Enter: http://127.0.0.1:9000",
      "Explorer will now show local network data"
    ]
  },

  logsAndDebugging: {
    rustLogs: "Controlled by RUST_LOG environment variable",
    checkpointDump: "Use --data-ingestion-dir to dump checkpoints as files",
    queryMethods: "Use curl or SDK to query RPC endpoints"
  }
};

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

/**
 * Common issues and solutions for local network setup
 */
export const LOCAL_NETWORK_TROUBLESHOOTING = {
  description: "Troubleshooting guide for local network issues",

  issues: [
    {
      problem: "Faucet not working - 'fetch is not defined'",
      cause: "Node.js version < 18",
      solution: "Update to Node.js 18 or later",
      command: "node --version && nvm install 18"
    },
    {
      problem: "Cannot start GraphQL - 'PostgreSQL not found'",
      cause: "PostgreSQL not installed or not in PATH",
      solution: "Install PostgreSQL and ensure it's accessible",
      command: "brew install postgresql (macOS) or apt-get install postgresql (Linux)"
    },
    {
      problem: "Port already in use (e.g., 9000, 9123)",
      cause: "Another service using the port or previous process still running",
      solution: "Use custom ports or kill the process",
      command: "sui start --fullnode-rpc-port 8000 --with-faucet=0.0.0.0:6124"
    },
    {
      problem: "/tmp directory not writeable or mounted to tmpfs",
      cause: "System configuration issue",
      solution: "Set custom TMPDIR",
      command: "TMPDIR=./local-network-tmp sui start --with-faucet --force-regenesis"
    },
    {
      problem: "Network state not persisting between restarts",
      cause: "Using --force-regenesis flag",
      solution: "Remove the flag to persist state",
      command: "sui start --with-faucet (without --force-regenesis)"
    },
    {
      problem: "Cannot connect to local network from dApp",
      cause: "Incorrect RPC URL or firewall blocking",
      solution: "Verify RPC URL is http://127.0.0.1:9000",
      command: "curl http://127.0.0.1:9000/health"
    }
  ]
};

// ============================================================================
// CROZZ LOCAL DEVELOPMENT SETUP
// ============================================================================

/**
 * CROZZ-specific local network configuration
 */
export const CROZZ_LOCAL_NETWORK_SETUP = {
  description: "Local network setup optimized for CROZZ development",

  recommendedCommand: {
    development: 'RUST_LOG="off,sui_node=info" sui start --with-faucet --with-indexer --with-graphql --force-regenesis --epoch-duration-ms 5000',
    description: "Full-featured development setup with fast epochs",
    features: [
      "RPC on 9000",
      "Faucet on 9123",
      "Indexer with temporary DB",
      "Consistent Store on 9124",
      "GraphQL on 9125",
      "5-second epochs for rapid testing"
    ]
  },

  developmentWorkflow: {
    steps: [
      {
        step: 1,
        task: "Start local network",
        command: "RUST_LOG=\"off,sui_node=info\" sui start --with-faucet --with-indexer --with-graphql --force-regenesis --epoch-duration-ms 5000",
        output: "Network running on http://127.0.0.1:9000"
      },
      {
        step: 2,
        task: "Switch CLI to local",
        command: "sui client switch --env local",
        output: "Active environment switched to [local]"
      },
      {
        step: 3,
        task: "Get test SUI",
        command: "sui client faucet",
        output: "Coins received"
      },
      {
        step: 4,
        task: "Verify connection",
        command: "sui client active-address",
        output: "Your address"
      },
      {
        step: 5,
        task: "Set dApp environment",
        environment: "VITE_SUI_NETWORK=local",
        description: "Configure dApp to use local network"
      },
      {
        step: 6,
        task: "Deploy and test",
        command: "npm run build && npm run dev",
        output: "dApp running on local network"
      }
    ]
  },

  environmentVariables: {
    VITE_SUI_NETWORK: {
      value: "local",
      description: "dApp uses local network"
    },
    VITE_FULLNODE_URL: {
      value: "http://127.0.0.1:9000",
      description: "RPC endpoint for local network"
    },
    VITE_FAUCET_URL: {
      value: "http://127.0.0.1:9123",
      description: "Faucet endpoint"
    },
    VITE_GRAPHQL_URL: {
      value: "http://127.0.0.1:9125/graphql",
      description: "GraphQL endpoint"
    }
  },

  testSUIRequirements: {
    gasCost: "Gas fees required for all transactions (same as other networks)",
    faucetUsage: "Use `sui client faucet` freely on local network",
    defaultAmount: "Typically 5 coins × 1000 SUI each = 5000 SUI",
    checkBalance: "sui client gas"
  }
};

// ============================================================================
// TYPESCRIPT SDK TESTING
// ============================================================================

/**
 * Testing configuration and examples
 */
export const LOCAL_SDK_TESTING = {
  description: "TypeScript SDK testing with local network",

  e2eTestCommand: {
    prerequisite: "sui start --force-regenesis --with-faucet --with-indexer --with-graphql",
    command: "pnpm --filter @mysten/sui test:e2e",
    description: "Run end-to-end tests with example data",
    requirement: "Run from Sui repository root",
    purpose: "Generate and test example data on local network"
  },

  versionConsiderations: {
    issue: "Published SDK might be older than local Sui version",
    solution: "Use experimental-tagged SDK version",
    example: "@mysten/sui@0.0.0-experimental-20230317184920",
    reference: "Check npm @mysten/sui package versions"
  },

  testPatterns: {
    unitTesting: "Test Move contracts without network",
    integrationTesting: "Test SDK interactions with local network",
    e2eTestng: "Full workflow testing with example data"
  }
};

export default {
  LOCAL_NETWORK_DEFAULTS,
  LOCAL_NETWORK_COMMANDS,
  LOCAL_CLIENT_SETUP,
  LOCAL_FAUCET_OPERATIONS,
  LOCAL_FULLNODE_ACCESS,
  LOCAL_SDK_CONFIGURATION,
  LOCAL_ENVIRONMENT_VARIABLES,
  LOCAL_DATABASE_CONFIG,
  LOCAL_MONITORING,
  LOCAL_NETWORK_TROUBLESHOOTING,
  CROZZ_LOCAL_NETWORK_SETUP,
  LOCAL_SDK_TESTING
};
