/**
 * Sui Local Network CLI Utilities
 * Provides TypeScript utilities for interacting with local Sui network
 * Based on: https://docs.sui.io/guides/developer/sui-101/local-network
 */

import { SuiClient } from "@mysten/sui/client";

// ============================================================================
// LOCAL NETWORK CLIENT MANAGEMENT
// ============================================================================

/**
 * Configuration for local network client
 */
export interface LocalNetworkConfig {
  rpcUrl: string;
  faucetUrl?: string;
  graphqlUrl?: string;
  network: "local" | "testnet" | "mainnet" | "devnet";
}

/**
 * Local network client with convenience methods
 */
export class LocalNetworkClient {
  private client: SuiClient;
  private config: LocalNetworkConfig;

  constructor(config: Partial<LocalNetworkConfig> = {}) {
    this.config = {
      network: "local",
      rpcUrl: "http://127.0.0.1:9000",
      faucetUrl: "http://127.0.0.1:9123",
      graphqlUrl: "http://127.0.0.1:9125/graphql",
      ...config
    };

    this.client = new SuiClient({ url: this.config.rpcUrl });
  }

  /**
   * Get the underlying SuiClient
   */
  getClient(): SuiClient {
    return this.client;
  }

  /**
   * Get configuration
   */
  getConfig(): LocalNetworkConfig {
    return this.config;
  }

  /**
   * Check if local network is running
   */
  async isNetworkRunning(): Promise<boolean> {
    try {
      const count = await this.client.getTotalTransactionBlocks();
      return typeof count === "number";
    } catch {
      return false;
    }
  }

  /**
   * Get network health/status
   */
  async getNetworkStatus(): Promise<{
    running: boolean;
    totalTransactions: number;
    rpcUrl: string;
    network: string;
  }> {
    try {
      const count = await this.client.getTotalTransactionBlocks();
      return {
        running: true,
        totalTransactions: Number(count),
        rpcUrl: this.config.rpcUrl,
        network: this.config.network
      };
    } catch (error) {
      return {
        running: false,
        totalTransactions: 0,
        rpcUrl: this.config.rpcUrl,
        network: this.config.network
      };
    }
  }

  /**
   * Get latest epoch information
   */
  async getLatestEpoch() {
    try {
      const checkpoint = await this.client.getLatestCheckpointSequenceNumber();
      return {
        checkpointSequence: checkpoint
      };
    } catch (error) {
      console.error("Error getting latest epoch:", error);
      return null;
    }
  }

  /**
   * Query objects owned by address
   */
  async getAddressObjects(address: string) {
    try {
      const objects = await this.client.getOwnedObjects({
        owner: address,
        limit: 100
      });
      return objects;
    } catch (error) {
      console.error("Error getting address objects:", error);
      return null;
    }
  }

  /**
   * Get coin balances for address
   */
  async getCoinBalance(address: string, coinType?: string) {
    try {
      const balance = await this.client.getBalance({
        owner: address,
        coinType
      });
      return balance;
    } catch (error) {
      console.error("Error getting coin balance:", error);
      return null;
    }
  }

  /**
   * Get all coin types for address
   */
  async getAllCoinTypes(address: string) {
    try {
      const coins = await this.client.getAllCoins({
        owner: address,
        limit: 100
      });
      return coins;
    } catch (error) {
      console.error("Error getting coin types:", error);
      return null;
    }
  }

  /**
   * Execute test transaction (for debugging)
   */
  async queryTransactions(filter?: object, limit: number = 10) {
    try {
      const params: any = {
        options: { showInput: true, showEffects: true },
        limit
      };
      if (filter) params.filter = filter as any;
      const txs = await this.client.queryTransactionBlocks(params);
      return txs;
    } catch (error) {
      console.error("Error querying transactions:", error);
      return null;
    }
  }

  /**
   * Subscribe to events (if network supports subscriptions)
   */
  async subscribeToEvents(eventFilter: object, callback: (event: any) => void) {
    try {
      await this.client.subscribeEvent({
        filter: eventFilter as any,
        onMessage: callback
      });
    } catch (error) {
      console.error("Error subscribing to events:", error);
    }
  }
}

// ============================================================================
// FAUCET INTERACTION
// ============================================================================

/**
 * Faucet client for requesting test SUI
 */
export class LocalFaucetClient {
  private faucetUrl: string;

  constructor(faucetUrl: string = "http://127.0.0.1:9123") {
    this.faucetUrl = faucetUrl;
  }

  /**
   * Request SUI from faucet
   */
  async requestSUI(address: string): Promise<{
    success: boolean;
    amount?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.faucetUrl}/gas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ FixedAmountRequest: { recipient: address } })
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          amount: result?.transferredGasBudget
        };
      } else {
        return {
          success: false,
          error: `Faucet error: ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to request SUI: ${error}`
      };
    }
  }

  /**
   * Check if faucet is running
   */
  async isFaucetRunning(): Promise<boolean> {
    try {
      const response = await fetch(`${this.faucetUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// LOCAL NETWORK SETUP HELPERS
// ============================================================================

/**
 * Helper utilities for local network setup
 */
export class LocalNetworkSetup {
  /**
   * Format local network URL for Sui CLI
   */
  static formatCliCommand(options: {
    withFaucet?: boolean;
    withIndexer?: boolean;
    withGraphQL?: boolean;
    forceRegenesis?: boolean;
    epochDurationMs?: number;
    rpcPort?: number;
    faucetPort?: number;
  }): string {
    let cmd = 'RUST_LOG="off,sui_node=info" sui start';

    if (options.withFaucet) {
      const port = options.faucetPort || 9123;
      cmd += ` --with-faucet=0.0.0.0:${port}`;
    }

    if (options.withIndexer) {
      cmd += " --with-indexer";
    }

    if (options.withGraphQL) {
      cmd += " --with-graphql";
    }

    if (options.forceRegenesis) {
      cmd += " --force-regenesis";
    }

    if (options.epochDurationMs) {
      cmd += ` --epoch-duration-ms ${options.epochDurationMs}`;
    }

    if (options.rpcPort) {
      cmd += ` --fullnode-rpc-port ${options.rpcPort}`;
    }

    return cmd;
  }

  /**
   * Generate environment setup for dApp
   */
  static generateEnvConfig(customPorts?: {
    rpc?: number;
    faucet?: number;
    graphql?: number;
  }): Record<string, string> {
    const rpcPort = customPorts?.rpc || 9000;
    const faucetPort = customPorts?.faucet || 9123;
    const graphqlPort = customPorts?.graphql || 9125;

    return {
      VITE_SUI_NETWORK: "local",
      VITE_FULLNODE_URL: `http://127.0.0.1:${rpcPort}`,
      VITE_FAUCET_URL: `http://127.0.0.1:${faucetPort}`,
      VITE_GRAPHQL_URL: `http://127.0.0.1:${graphqlPort}/graphql`,
      VITE_SUI_ENV: "local"
    };
  }

  /**
   * Create .env.local file content
   */
  static generateEnvFile(customPorts?: {
    rpc?: number;
    faucet?: number;
    graphql?: number;
  }): string {
    const config = this.generateEnvConfig(customPorts);
    return Object.entries(config)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");
  }

  /**
   * Get CLI commands for setup sequence
   */
  static getSetupSequence(): Array<{
    step: number;
    description: string;
    command: string;
    waitTime?: number;
  }> {
    return [
      {
        step: 1,
        description: "Start local network",
        command: 'RUST_LOG="off,sui_node=info" sui start --with-faucet --with-indexer --with-graphql --force-regenesis --epoch-duration-ms 5000',
        waitTime: 5000
      },
      {
        step: 2,
        description: "Switch Sui CLI to local network",
        command: "sui client switch --env local"
      },
      {
        step: 3,
        description: "Create local environment (if not exists)",
        command: "sui client new-env --alias local --rpc http://127.0.0.1:9000"
      },
      {
        step: 4,
        description: "Request test SUI",
        command: "sui client faucet",
        waitTime: 3000
      },
      {
        step: 5,
        description: "Check gas coins",
        command: "sui client gas"
      },
      {
        step: 6,
        description: "Get active address",
        command: "sui client active-address"
      }
    ];
  }
}

// ============================================================================
// LOCAL NETWORK DIAGNOSTICS
// ============================================================================

/**
 * Diagnostic tools for local network issues
 */
export class LocalNetworkDiagnostics {
  /**
   * Run diagnostic checks on local network
   */
  static async runDiagnostics(): Promise<{
    networkStatus: {
      running: boolean;
      error?: string;
    };
    rpcHealth: {
      accessible: boolean;
      error?: string;
    };
    faucetHealth: {
      running: boolean;
      error?: string;
    };
    summary: string;
  }> {
    const results = {
      networkStatus: {
        running: false,
        error: undefined as string | undefined
      },
      rpcHealth: {
        accessible: false,
        error: undefined as string | undefined
      },
      faucetHealth: {
        running: false,
        error: undefined as string | undefined
      },
      summary: ""
    };

    // Check RPC
    try {
      const response = await fetch("http://127.0.0.1:9000", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "sui_getTotalTransactionBlocks",
          params: []
        })
      });

      if (response.ok) {
        results.networkStatus.running = true;
        results.rpcHealth.accessible = true;
      }
    } catch (error) {
      results.rpcHealth.error = String(error);
    }

    // Check Faucet
    try {
      const response = await fetch("http://127.0.0.1:9123/health");
      if (response.ok) {
        results.faucetHealth.running = true;
      }
    } catch (error) {
      results.faucetHealth.error = String(error);
    }

    // Generate summary
    const statuses = [
      results.networkStatus.running ? "✅ Network running" : "❌ Network not running",
      results.rpcHealth.accessible ? "✅ RPC accessible" : "❌ RPC not accessible",
      results.faucetHealth.running ? "✅ Faucet running" : "❌ Faucet not running"
    ];

    results.summary = statuses.join(" | ");

    return results;
  }

  /**
   * Check specific port availability
   */
  static async checkPort(port: number, host: string = "127.0.0.1"): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1000);
      
      const response = await fetch(`http://${host}:${port}`, {
        signal: controller.signal
      });
      clearTimeout(timeout);
      return response.ok || response.status < 500;
    } catch {
      return false;
    }
  }

  /**
   * Get port conflict suggestions
   */
  static getPortSuggestions(): Array<{
    port: number;
    service: string;
    alternative: number;
  }> {
    return [
      { port: 9000, service: "RPC", alternative: 8000 },
      { port: 9123, service: "Faucet", alternative: 6124 },
      { port: 9124, service: "Consistent Store", alternative: 8124 },
      { port: 9125, service: "GraphQL", alternative: 8125 }
    ];
  }
}

// ============================================================================
// LOCAL NETWORK MONITORING
// ============================================================================

/**
 * Monitor local network activity
 */
export class LocalNetworkMonitor {
  private client: LocalNetworkClient;
  private pollInterval: number;
  private isMonitoring: boolean = false;

  constructor(pollInterval: number = 5000) {
    this.client = new LocalNetworkClient();
    this.pollInterval = pollInterval;
  }

  /**
   * Start monitoring network
   */
  async startMonitoring(onUpdate: (status: any) => void): Promise<void> {
    this.isMonitoring = true;

    const poll = async () => {
      if (!this.isMonitoring) return;

      const status = await this.client.getNetworkStatus();
      onUpdate(status);

      setTimeout(poll, this.pollInterval);
    };

    await poll();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  /**
   * Get current statistics
   */
  async getStats(): Promise<{
    totalTransactions: number;
    epoch: number;
    uptime: number;
  }> {
    const status = await this.client.getNetworkStatus();
    const epochData = await this.client.getLatestEpoch();
    const epochNum = typeof epochData?.checkpointSequence === "number"
      ? epochData.checkpointSequence
      : 0;

    return {
      totalTransactions: status.totalTransactions,
      epoch: epochNum,
      uptime: Date.now() // Placeholder
    };
  }
}

// ============================================================================
// CROZZ LOCAL NETWORK HELPERS
// ============================================================================

/**
 * CROZZ-specific local network utilities
 */
export class CrozzLocalNetworkSetup {
  /**
   * Generate CROZZ development environment
   */
  static generateCrozzEnv(): Record<string, string> {
    return {
      ...LocalNetworkSetup.generateEnvConfig(),
      VITE_PACKAGE_ID: "0x0000000000000000000000000000000000000001",
      VITE_GAME_MODULE: "game",
      VITE_PLAYER_FAUCET_AMOUNT: "1000000000",
      VITE_MIN_GAS_BUDGET: "100000000",
      NODE_ENV: "development"
    };
  }

  /**
   * Get CROZZ setup command
   */
  static getCrozzSetupCommand(): string {
    return LocalNetworkSetup.formatCliCommand({
      withFaucet: true,
      withIndexer: true,
      withGraphQL: true,
      forceRegenesis: true,
      epochDurationMs: 5000 // Fast epochs for testing
    });
  }

  /**
   * Get CROZZ test workflow
   */
  static getCrozzTestWorkflow(): Array<{
    phase: string;
    commands: string[];
    description: string;
  }> {
    return [
      {
        phase: "Setup",
        description: "Initialize local network",
        commands: [
          "RUST_LOG=\"off,sui_node=info\" sui start --with-faucet --with-indexer --with-graphql --force-regenesis --epoch-duration-ms 5000",
          "sui client switch --env local"
        ]
      },
      {
        phase: "Fund Test Accounts",
        description: "Get test SUI for gameplay",
        commands: [
          "sui client faucet",
          "sui client gas"
        ]
      },
      {
        phase: "Deploy Game",
        description: "Deploy game contracts",
        commands: [
          "cd game-contracts",
          "sui client publish --gas-budget 100000000"
        ]
      },
      {
        phase: "Run Tests",
        description: "Execute game tests",
        commands: [
          "npm run test:e2e"
        ]
      }
    ];
  }
}

export default {
  LocalNetworkClient,
  LocalFaucetClient,
  LocalNetworkSetup,
  LocalNetworkDiagnostics,
  LocalNetworkMonitor,
  CrozzLocalNetworkSetup
};
