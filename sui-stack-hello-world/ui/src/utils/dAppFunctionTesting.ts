/**
 * Decentralized App Function Testing Module
 * 
 * Comprehensive testing utilities for dApp functions on Sui blockchain
 */

import { SuiClient, SuiTransactionBlockResponse } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

export interface TestResult {
  success: boolean;
  testName: string;
  duration: number;
  error?: string;
  data?: any;
  gasUsed?: string;
  transactionDigest?: string;
}

export interface TestSuite {
  name: string;
  tests: TestCase[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

export interface TestCase {
  name: string;
  description: string;
  test: () => Promise<void>;
  timeout?: number;
}

export interface FunctionTestConfig {
  packageId: string;
  moduleName: string;
  functionName: string;
  arguments: any[];
  typeArguments?: string[];
  expectedResult?: any;
  shouldFail?: boolean;
}

/**
 * DApp Function Tester Class
 */
export class DAppFunctionTester {
  private client: SuiClient;
  private results: TestResult[] = [];

  constructor(client: SuiClient) {
    this.client = client;
  }

  /**
   * Run a test suite
   */
  async runTestSuite(suite: TestSuite): Promise<TestResult[]> {
    console.log(`\n🧪 Running test suite: ${suite.name}`);
    this.results = [];

    // Run setup if provided
    if (suite.setup) {
      try {
        await suite.setup();
        console.log('✓ Setup completed');
      } catch (error) {
        console.error('✗ Setup failed:', error);
        return this.results;
      }
    }

    // Run each test
    for (const testCase of suite.tests) {
      await this.runTest(testCase);
    }

    // Run teardown if provided
    if (suite.teardown) {
      try {
        await suite.teardown();
        console.log('✓ Teardown completed');
      } catch (error) {
        console.error('✗ Teardown failed:', error);
      }
    }

    this.printSummary();
    return this.results;
  }

  /**
   * Run a single test case
   */
  async runTest(testCase: TestCase): Promise<TestResult> {
    const startTime = Date.now();
    const result: TestResult = {
      success: false,
      testName: testCase.name,
      duration: 0,
    };

    try {
      console.log(`\n  Running: ${testCase.name}`);
      console.log(`  ${testCase.description}`);

      // Run test with timeout
      const timeout = testCase.timeout || 30000;
      await Promise.race([
        testCase.test(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Test timeout')), timeout)
        ),
      ]);

      result.success = true;
      result.duration = Date.now() - startTime;
      console.log(`  ✓ Passed (${result.duration}ms)`);
    } catch (error) {
      result.success = false;
      result.duration = Date.now() - startTime;
      result.error = error instanceof Error ? error.message : 'Unknown error';
      console.log(`  ✗ Failed: ${result.error}`);
    }

    this.results.push(result);
    return result;
  }

  /**
   * Test a smart contract function call
   */
  async testFunctionCall(config: FunctionTestConfig): Promise<TestResult> {
    const startTime = Date.now();
    const result: TestResult = {
      success: false,
      testName: `${config.moduleName}::${config.functionName}`,
      duration: 0,
    };

    try {
      // Build transaction
      const tx = new Transaction();

      const target = `${config.packageId}::${config.moduleName}::${config.functionName}`;
      
      tx.moveCall({
        target,
        arguments: config.arguments,
        typeArguments: config.typeArguments,
      });

      // Dry run to test without executing
      const dryRunResult = await this.client.dryRunTransactionBlock({
        transactionBlock: await tx.build({ client: this.client }),
      });

      // Check if execution should fail
      if (config.shouldFail) {
        if (dryRunResult.effects.status.status === 'failure') {
          result.success = true;
          result.data = 'Function failed as expected';
        } else {
          result.error = 'Function should have failed but succeeded';
        }
      } else {
        if (dryRunResult.effects.status.status === 'success') {
          result.success = true;
          result.gasUsed = dryRunResult.effects.gasUsed.computationCost;
          result.data = dryRunResult.effects;
        } else {
          result.error = dryRunResult.effects.status.error || 'Function failed';
        }
      }

      result.duration = Date.now() - startTime;
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Test object creation
   */
  async testObjectCreation(
    packageId: string,
    moduleName: string,
    functionName: string
  ): Promise<TestResult> {
    const result: TestResult = {
      success: false,
      testName: 'Object Creation Test',
      duration: 0,
    };

    try {
      const tx = new Transaction();
      const target = `${packageId}::${moduleName}::${functionName}`;

      tx.moveCall({
        target,
        arguments: [],
      });

      const dryRunResult = await this.client.dryRunTransactionBlock({
        transactionBlock: await tx.build({ client: this.client }),
      });

      const createdObjects = dryRunResult.effects.created || [];
      
      if (createdObjects.length > 0) {
        result.success = true;
        result.data = {
          objectsCreated: createdObjects.length,
          objects: createdObjects,
        };
      } else {
        result.error = 'No objects were created';
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  /**
   * Test event emission
   */
  async testEventEmission(
    tx: Transaction,
    expectedEventType: string
  ): Promise<TestResult> {
    const result: TestResult = {
      success: false,
      testName: 'Event Emission Test',
      duration: 0,
    };

    try {
      const dryRunResult = await this.client.dryRunTransactionBlock({
        transactionBlock: await tx.build({ client: this.client }),
      });

      const events = dryRunResult.events || [];
      const matchingEvent = events.find((e) => e.type.includes(expectedEventType));

      if (matchingEvent) {
        result.success = true;
        result.data = {
          eventType: matchingEvent.type,
          eventData: matchingEvent.parsedJson,
        };
      } else {
        result.error = `Expected event type ${expectedEventType} not found`;
        result.data = { emittedEvents: events.map((e) => e.type) };
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  /**
   * Test gas estimation
   */
  async testGasEstimation(tx: Transaction): Promise<TestResult> {
    const result: TestResult = {
      success: false,
      testName: 'Gas Estimation Test',
      duration: 0,
    };

    try {
      const dryRunResult = await this.client.dryRunTransactionBlock({
        transactionBlock: await tx.build({ client: this.client }),
      });

      const gasUsed = dryRunResult.effects.gasUsed;
      
      result.success = true;
      result.data = {
        computationCost: gasUsed.computationCost,
        storageCost: gasUsed.storageCost,
        storageRebate: gasUsed.storageRebate,
        total: (
          BigInt(gasUsed.computationCost) +
          BigInt(gasUsed.storageCost) -
          BigInt(gasUsed.storageRebate)
        ).toString(),
      };
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  /**
   * Test transaction execution limits
   */
  async testExecutionLimits(tx: Transaction): Promise<TestResult> {
    const result: TestResult = {
      success: false,
      testName: 'Execution Limits Test',
      duration: 0,
    };

    try {
      const dryRunResult = await this.client.dryRunTransactionBlock({
        transactionBlock: await tx.build({ client: this.client }),
      });

      const effects = dryRunResult.effects;
      
      result.success = effects.status.status === 'success';
      result.data = {
        status: effects.status,
        executedEpoch: effects.executedEpoch,
        gasUsed: effects.gasUsed,
      };

      if (effects.status.status === 'failure') {
        result.error = effects.status.error;
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  /**
   * Validate function parameters
   */
  async validateParameters(
    packageId: string,
    moduleName: string,
    functionName: string,
    args: any[]
  ): Promise<TestResult> {
    const result: TestResult = {
      success: false,
      testName: 'Parameter Validation Test',
      duration: 0,
    };

    try {
      const module = await this.client.getNormalizedMoveModule({
        package: packageId,
        module: moduleName,
      });

      const func = module.exposedFunctions?.[functionName];
      if (!func) {
        result.error = `Function ${functionName} not found`;
        return result;
      }

      const expectedParams = func.parameters.length;
      const providedParams = args.length;

      if (expectedParams !== providedParams) {
        result.error = `Expected ${expectedParams} parameters but got ${providedParams}`;
      } else {
        result.success = true;
        result.data = {
          expectedParameters: func.parameters,
          providedArguments: args.length,
        };
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  /**
   * Print test summary
   */
  private printSummary(): void {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.success).length;
    const failed = total - passed;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Summary');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${total}`);
    console.log(`✓ Passed: ${passed}`);
    console.log(`✗ Failed: ${failed}`);
    console.log(`⏱  Total Duration: ${totalDuration}ms`);
    console.log('='.repeat(50) + '\n');
  }

  /**
   * Get test results
   */
  getResults(): TestResult[] {
    return this.results;
  }

  /**
   * Clear test results
   */
  clearResults(): void {
    this.results = [];
  }
}

/**
 * Assert helpers for testing
 */
export const assert = {
  isTrue(condition: boolean, message?: string): void {
    if (!condition) {
      throw new Error(message || 'Assertion failed: expected true');
    }
  },

  isFalse(condition: boolean, message?: string): void {
    if (condition) {
      throw new Error(message || 'Assertion failed: expected false');
    }
  },

  equals<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
      throw new Error(
        message || `Assertion failed: expected ${expected} but got ${actual}`
      );
    }
  },

  notEquals<T>(actual: T, expected: T, message?: string): void {
    if (actual === expected) {
      throw new Error(message || `Assertion failed: expected not ${expected}`);
    }
  },

  isNull(value: any, message?: string): void {
    if (value !== null) {
      throw new Error(message || 'Assertion failed: expected null');
    }
  },

  isNotNull(value: any, message?: string): void {
    if (value === null) {
      throw new Error(message || 'Assertion failed: expected not null');
    }
  },

  throws(fn: () => any, message?: string): void {
    try {
      fn();
      throw new Error(message || 'Assertion failed: expected function to throw');
    } catch (error) {
      // Expected
    }
  },

  async throwsAsync(fn: () => Promise<any>, message?: string): Promise<void> {
    try {
      await fn();
      throw new Error(message || 'Assertion failed: expected async function to throw');
    } catch (error) {
      // Expected
    }
  },
};

/**
 * Mock data generators for testing
 */
export const mockData = {
  /**
   * Generate random Sui address
   */
  randomAddress(): string {
    const hex = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 64; i++) {
      address += hex[Math.floor(Math.random() * 16)];
    }
    return address;
  },

  /**
   * Generate random object ID
   */
  randomObjectId(): string {
    return this.randomAddress();
  },

  /**
   * Generate random amount
   */
  randomAmount(min: number = 1, max: number = 1000000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Generate random string
   */
  randomString(length: number = 10): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  },
};
