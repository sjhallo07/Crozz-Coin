/**
 * Sui Local Network Setup & Developer Guide
 * Complete guide for setting up and using local Sui network for development
 * Based on: https://docs.sui.io/guides/developer/sui-101/local-network
 */

// ============================================================================
// QUICK START GUIDE
// ============================================================================

export const QUICK_START = {
  title: "Local Network Quick Start",
  description: "Get a local Sui network running in 2 minutes",

  prerequisites: [
    "✅ Sui CLI installed (https://docs.sui.io/guides/developer/getting-started/sui-install)",
    "✅ Node.js 18+ (for TypeScript SDK)",
    "✅ (Optional) PostgreSQL 11+ for indexer/GraphQL"
  ],

  steps: [
    {
      step: 1,
      task: "Start local network",
      command: 'RUST_LOG="off,sui_node=info" sui start --with-faucet --force-regenesis',
      expectedOutput: "✅ Local network running on http://127.0.0.1:9000",
      timeEstimate: "~30 seconds"
    },
    {
      step: 2,
      task: "In new terminal: Switch Sui CLI to local",
      command: "sui client new-env --alias local --rpc http://127.0.0.1:9000",
      thenRun: "sui client switch --env local",
      expectedOutput: "Active environment switched to [local]"
    },
    {
      step: 3,
      task: "Request test SUI",
      command: "sui client faucet",
      expectedOutput: "Successfully invoked faucet and got tokens",
      timeEstimate: "~30-60 seconds"
    },
    {
      step: 4,
      task: "Verify setup",
      command: "sui client gas",
      expectedOutput: "Shows your gas coins with balances"
    },
    {
      step: 5,
      task: "Configure dApp",
      file: ".env.local",
      content: `VITE_SUI_NETWORK=local
VITE_FULLNODE_URL=http://127.0.0.1:9000`,
      description: "Update dApp environment"
    },
    {
      step: 6,
      task: "Run dApp",
      command: "npm run dev",
      expectedOutput: "dApp connected to local network"
    }
  ]
};

// ============================================================================
// SETUP CONFIGURATIONS
// ============================================================================

export const SETUP_SCENARIOS = {
  title: "Different Setup Scenarios",
  description: "Choose setup based on your development needs",

  minimalist: {
    name: "Minimalist (Testing Only)",
    command: 'sui start --with-faucet --force-regenesis',
    description: "Basic setup for quick testing",
    includes: ["RPC Server", "Faucet"],
    pros: ["Minimal resources", "Fast startup", "No dependencies"],
    cons: ["No data persistence", "No advanced queries"],
    bestFor: "Quick testing, prototyping"
  },

  standard: {
    name: "Standard (Development)",
    command: 'RUST_LOG="off,sui_node=info" sui start --with-faucet --force-regenesis --epoch-duration-ms 5000',
    description: "Recommended for active development",
    includes: ["RPC Server", "Faucet", "Fast Epochs (5s)"],
    pros: ["Rapid iteration", "Testing epoch-related features"],
    cons: ["Still no persistence", "Epochs reset on restart"],
    bestFor: "Active dApp development"
  },

  fullStack: {
    name: "Full Stack (Complete)",
    command: 'RUST_LOG="off,sui_node=info" sui start --with-faucet --with-indexer --with-graphql --force-regenesis',
    description: "Complete development environment",
    requires: ["PostgreSQL 11+"],
    includes: [
      "RPC Server",
      "Faucet",
      "Indexer (temporary DB)",
      "Consistent Store",
      "GraphQL with IDE"
    ],
    pros: [
      "Full feature set",
      "GraphQL queries",
      "Indexed data",
      "Web IDE at http://127.0.0.1:9125"
    ],
    cons: ["PostgreSQL required", "More resources"],
    bestFor: "Complete testing, complex queries, UI development"
  },

  persistent: {
    name: "Persistent State",
    command: 'RUST_LOG="off,sui_node=info" sui start --with-faucet',
    description: "Keep state between restarts (no --force-regenesis)",
    includes: ["RPC Server", "Faucet", "Persistent State"],
    pros: ["Data persists", "Useful for debugging"],
    cons: ["State grows over time", "May need cleanup"],
    bestFor: "Long-running development, state preservation"
  },

  custom: {
    name: "Custom Configuration",
    command: "sui start [options]",
    description: "Tailored to specific needs",
    customizations: [
      "--fullnode-rpc-port <PORT> - Change RPC port (default: 9000)",
      "--with-faucet=<HOST:PORT> - Custom faucet address",
      "--epoch-duration-ms <MS> - Set epoch duration",
      "--committee-size <N> - Number of validators",
      "--data-ingestion-dir <DIR> - Dump checkpoints to directory"
    ]
  }
};

// ============================================================================
// INSTALLATION GUIDE
// ============================================================================

export const INSTALLATION_GUIDE = {
  title: "Sui CLI Installation",
  description: "How to install Sui CLI",

  prerequisites: {
    linux: {
      distros: ["Ubuntu 20.04+", "Debian 11+", "Fedora 35+"],
      tools: ["curl", "git", "build-essentials"]
    },
    macos: {
      versions: ["macOS 11+"],
      tools: ["Homebrew", "Command Line Tools"]
    },
    windows: {
      note: "WSL2 recommended for best experience",
      tools: ["WSL2", "Ubuntu or Debian on WSL"]
    }
  },

  installationSteps: {
    macOS: [
      "# Install Homebrew (if not installed)",
      'ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
      "",
      "# Install Sui",
      "brew install sui",
      "",
      "# Verify installation",
      "sui --version"
    ],
    ubuntu: [
      "# Update package manager",
      "sudo apt update",
      "",
      "# Install dependencies",
      "sudo apt install curl git build-essential",
      "",
      "# Install Sui (using cargo if not in apt)",
      "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh",
      "source $HOME/.cargo/env",
      "cargo install --locked sui",
      "",
      "# Verify installation",
      "sui --version"
    ],
    fromSource: [
      "# Clone Sui repository",
      "git clone https://github.com/MystenLabs/sui.git",
      "cd sui",
      "",
      "# Build and install",
      "cargo install --locked --path crates/sui",
      "",
      "# Verify installation",
      "sui --version"
    ]
  }
};

// ============================================================================
// DETAILED CONFIGURATION
// ============================================================================

export const DETAILED_CONFIGURATION = {
  title: "Detailed Configuration Guide",

  portConfiguration: {
    description: "Default ports used by local network services",
    ports: [
      { service: "RPC Server", port: 9000, env: "VITE_FULLNODE_URL", customizable: true },
      { service: "Faucet", port: 9123, env: "VITE_FAUCET_URL", customizable: true },
      { service: "Consistent Store", port: 9124, env: "N/A", customizable: true },
      { service: "GraphQL", port: 9125, env: "VITE_GRAPHQL_URL", customizable: true }
    ],
    conflict: {
      problem: "Port already in use",
      solution: "Use custom ports with flags",
      example: "sui start --fullnode-rpc-port 8000 --with-faucet=0.0.0.0:6124"
    }
  },

  databaseSetup: {
    description: "PostgreSQL setup for indexer and GraphQL",
    
    installation: {
      macOS: "brew install postgresql",
      ubuntu: "sudo apt install postgresql postgresql-contrib",
      docker: "docker run -d -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15"
    },

    modes: {
      disabled: {
        command: "sui start --with-faucet",
        description: "No indexer (default)"
      },
      
      temporary: {
        command: "sui start --with-faucet --with-indexer",
        description: "Temporary database in config directory",
        cleanup: "Automatically deleted when network stops"
      },
      
      persistent: {
        command: "sui start --with-faucet --with-indexer=postgres://postgres:password@localhost:5432/sui_local",
        description: "Use existing PostgreSQL database",
        setup: [
          "# Create database",
          "createdb sui_local",
          "",
          "# Or set custom connection",
          "sui start --with-indexer=postgres://USER:PASS@HOST:PORT/DATABASE"
        ]
      }
    }
  },

  environmentVariables: {
    description: "Environment variables for local network",
    
    suiCli: {
      SUI_CONFIG_DIR: {
        description: "Sui CLI config directory",
        default: "~/.sui/sui_config",
        example: "SUI_CONFIG_DIR=~/.sui/local_config sui client active-address"
      },
      
      RUST_LOG: {
        description: "Rust logging level",
        default: "info",
        recommended: "off,sui_node=info",
        example: 'RUST_LOG="off,sui_node=info" sui start'
      },
      
      TMPDIR: {
        description: "Temporary directory for network data",
        default: "/tmp",
        useWhen: "/tmp is on tmpfs (read-only or limited)",
        example: "TMPDIR=./local-network-tmp sui start"
      }
    },

    dApp: {
      VITE_SUI_NETWORK: {
        description: "Active Sui network",
        value: "local",
        example: "VITE_SUI_NETWORK=local npm run dev"
      },
      
      VITE_FULLNODE_URL: {
        description: "RPC endpoint",
        value: "http://127.0.0.1:9000",
        example: "VITE_FULLNODE_URL=http://127.0.0.1:9000"
      },
      
      VITE_FAUCET_URL: {
        description: "Faucet endpoint",
        value: "http://127.0.0.1:9123",
        example: "VITE_FAUCET_URL=http://127.0.0.1:9123"
      },
      
      VITE_GRAPHQL_URL: {
        description: "GraphQL endpoint",
        value: "http://127.0.0.1:9125/graphql",
        example: "VITE_GRAPHQL_URL=http://127.0.0.1:9125/graphql"
      }
    }
  }
};

// ============================================================================
// WORKFLOW GUIDES
// ============================================================================

export const WORKFLOW_GUIDES = {
  title: "Development Workflows",

  smartContractDevelopment: {
    name: "Smart Contract Development",
    tools: ["Move CLI", "Local Network", "Tests"],
    steps: [
      "1. Write Move code in contracts/",
      "2. Run `sui client publish` to deploy",
      "3. Use Sui CLI to interact: `sui client call`",
      "4. Monitor events with GraphQL (if enabled)",
      "5. Iterate and redeploy"
    ]
  },

  dAppDevelopment: {
    name: "dApp Development",
    tools: ["TypeScript SDK", "Local Network", "Hot Reload"],
    environment: {
      ".env.local": [
        "VITE_SUI_NETWORK=local",
        "VITE_FULLNODE_URL=http://127.0.0.1:9000",
        "VITE_FAUCET_URL=http://127.0.0.1:9123"
      ]
    },
    steps: [
      "1. Start local network: `sui start --with-faucet --force-regenesis`",
      "2. Configure dApp with .env.local",
      "3. Start dev server: `npm run dev`",
      "4. Connect wallet to local network",
      "5. Request test SUI: `sui client faucet`",
      "6. Test interactions (hot reload available)"
    ]
  },

  integratedTesting: {
    name: "Integrated Testing",
    tools: ["Local Network", "Indexer", "GraphQL", "TypeScript SDK"],
    environment: {
      startup: "sui start --with-faucet --with-indexer --with-graphql --force-regenesis",
      setupTime: "~30 seconds"
    },
    steps: [
      "1. Start full network with indexer/GraphQL",
      "2. Deploy contracts: `sui client publish`",
      "3. Run SDK tests against local network",
      "4. Query data with GraphQL",
      "5. Monitor events in real-time",
      "6. Verify on-chain state"
    ]
  }
};

// ============================================================================
// TROUBLESHOOTING GUIDE
// ============================================================================

export const TROUBLESHOOTING_GUIDE = {
  title: "Troubleshooting Guide",
  description: "Common issues and solutions",

  networkStartupIssues: [
    {
      issue: "Command not found: sui",
      cause: "Sui CLI not installed or not in PATH",
      solutions: [
        "Check installation: `sui --version`",
        "Reinstall Sui CLI",
        "Add Sui to PATH: `export PATH=$PATH:~/.cargo/bin`"
      ]
    },
    {
      issue: "Port 9000 already in use",
      cause: "Another service or Sui process using the port",
      solutions: [
        "Kill existing process: `lsof -i :9000`",
        "Use custom port: `sui start --fullnode-rpc-port 8000`",
        "Wait for process to fully shutdown"
      ]
    },
    {
      issue: "/tmp directory error (read-only/tmpfs)",
      cause: "System configuration or disk space issue",
      solutions: [
        "Use custom TMPDIR: `TMPDIR=./local-network-tmp sui start`",
        "Check disk space: `df -h /tmp`",
        "Clear old data: `rm -rf ~/.sui/sui_config`"
      ]
    }
  ],

  faucetIssues: [
    {
      issue: "Faucet not working - 'fetch is not defined'",
      cause: "Node.js version < 18",
      solutions: [
        "Check Node.js version: `node --version`",
        "Update Node.js to 18+: `nvm install 18`",
        "Verify with: `node --version`"
      ]
    },
    {
      issue: "Faucet connection refused",
      cause: "Faucet service not running",
      solutions: [
        "Verify faucet flag: `--with-faucet` in startup command",
        "Check port 9123 is available",
        "Use custom port: `--with-faucet=0.0.0.0:6124`"
      ]
    },
    {
      issue: "Faucet timeout (> 60 seconds)",
      cause: "Network latency or system overload",
      solutions: [
        "Retry: `sui client faucet`",
        "Check system resources: `top` or Activity Monitor",
        "Reduce other load"
      ]
    }
  ],

  databaseIssues: [
    {
      issue: "PostgreSQL not found (for indexer/GraphQL)",
      cause: "PostgreSQL not installed",
      solutions: [
        "Install PostgreSQL: `brew install postgresql` (macOS)",
        "Or use Docker: `docker run -d postgres`",
        "Or skip indexer for now: skip `--with-indexer`"
      ]
    },
    {
      issue: "Database connection refused",
      cause: "PostgreSQL not running or wrong credentials",
      solutions: [
        "Start PostgreSQL: `brew services start postgresql`",
        "Check credentials: `psql -U postgres`",
        "Use temporary DB: `--with-indexer` (no URL)"
      ]
    }
  ],

  connectionIssues: [
    {
      issue: "dApp cannot connect to local network",
      cause: "Wrong RPC URL or network not running",
      solutions: [
        "Verify URL is `http://127.0.0.1:9000` (not localhost)",
        "Check network is running: `curl http://127.0.0.1:9000`",
        "Test with: `sui client active-address`"
      ]
    },
    {
      issue: "Transactions fail with gas errors",
      cause: "Not enough test SUI",
      solutions: [
        "Request more SUI: `sui client faucet`",
        "Check balance: `sui client gas`",
        "Wait 60s between requests"
      ]
    }
  ]
};

// ============================================================================
// BEST PRACTICES
// ============================================================================

export const BEST_PRACTICES = {
  title: "Development Best Practices",

  dos: [
    "✅ Use `--epoch-duration-ms 5000` for faster testing",
    "✅ Keep separate environments for different tasks",
    "✅ Save snapshots of working state before major changes",
    "✅ Use GraphQL for complex data queries",
    "✅ Test event handling with event subscriptions",
    "✅ Monitor logs with appropriate RUST_LOG levels",
    "✅ Use dApp transactions before smart contract calls"
  ],

  donts: [
    "❌ Don't use `--force-regenesis` for persistent development",
    "❌ Don't rely on network data persisting (unless configured)",
    "❌ Don't expose local network to internet",
    "❌ Don't use production private keys for testing",
    "❌ Don't leave verbose logging on (performance impact)",
    "❌ Don't assume state between network restarts"
  ],

  optimization: {
    performance: [
      "Disable logging for speed: `RUST_LOG=off`",
      "Use temporary indexer database (faster than custom DB)",
      "Reduce epoch duration for fast testing",
      "Run dApp on same machine as network"
    ],
    
    debugging: [
      "Enable verbose logging for troubleshooting",
      "Use `--data-ingestion-dir` to dump checkpoints",
      "Monitor with GraphQL IDE at http://127.0.0.1:9125",
      "Use wallet to track transaction history"
    ]
  }
};

// ============================================================================
// MONITORING & EXPLORATION
// ============================================================================

export const MONITORING_EXPLORATION = {
  title: "Monitoring & Exploration Tools",

  graphqlIde: {
    name: "GraphQL Web IDE",
    url: "http://127.0.0.1:9125",
    enabled: "When GraphQL service is running",
    features: [
      "Interactive query builder",
      "Auto-complete and documentation",
      "Real-time result display",
      "Introspection of schema"
    ]
  },

  explorerTools: [
    {
      name: "Polymedia Explorer",
      setup: "Open https://explorer.polymedia.app/",
      customization: "Settings → Custom RPC → http://127.0.0.1:9000",
      bestFor: "Visual network exploration"
    },
    {
      name: "Local Explorer",
      setup: "Clone and build from GitHub",
      github: "https://github.com/suiware/sui-explorer",
      bestFor: "Complete control and customization"
    }
  ],

  cliQueries: {
    getTotalTransactions: "sui client call --address 0x2 --module system --function total_tx_count",
    getActiveAddress: "sui client active-address",
    listObjects: "sui client objects --address [YOUR_ADDRESS]",
    checkGas: "sui client gas"
  }
};

export default {
  QUICK_START,
  SETUP_SCENARIOS,
  INSTALLATION_GUIDE,
  DETAILED_CONFIGURATION,
  WORKFLOW_GUIDES,
  TROUBLESHOOTING_GUIDE,
  BEST_PRACTICES,
  MONITORING_EXPLORATION
};
