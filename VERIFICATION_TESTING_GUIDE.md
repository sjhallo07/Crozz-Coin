# Source Code Verification & dApp Testing Guide

## 🔍 Overview

This guide covers two essential modules for Sui blockchain development:

1. **Source Code Verification** - Verify smart contract source code matches on-chain bytecode
2. **dApp Function Testing** - Comprehensive testing framework for decentralized application functions

## 📦 Module Structure

```
src/
├── utils/
│   ├── sourceCodeVerification.ts   # Source code verification utilities
│   └── dAppFunctionTesting.ts       # dApp function testing framework
└── components/
    ├── VerificationTesting.tsx      # UI component
    └── VerificationTesting.module.css
```

## 🛠️ Source Code Verification

### Features

- ✅ Verify package exists on-chain
- ✅ Retrieve package metadata and module information
- ✅ Verify module and function existence
- ✅ Get function signatures and parameters
- ✅ Compare package versions
- ✅ Generate verification reports

### Usage Examples

#### Initialize Verifier

```typescript
import { SuiClient } from '@mysten/sui/client';
import { SourceCodeVerifier } from '@/utils/sourceCodeVerification';

const client = new SuiClient({ url: 'https://fullnode.devnet.sui.io' });
const verifier = new SourceCodeVerifier(client);
```

#### Verify Package Exists

```typescript
const packageId = '0x...';
const exists = await verifier.verifyPackageExists(packageId);

if (exists) {
  console.log('✓ Package verified on chain');
} else {
  console.log('✗ Package not found');
}
```

#### Get Package Information

```typescript
const packageInfo = await verifier.getPackageInfo(packageId);

console.log(`Package: ${packageInfo.packageId}`);
console.log(`Modules: ${packageInfo.modules.length}`);

packageInfo.modules.forEach((module) => {
  console.log(`Module: ${module.name}`);
  console.log(`  Functions: ${module.functions.length}`);
  console.log(`  Structs: ${module.structs.length}`);
});
```

#### Verify Function Exists

```typescript
const exists = await verifier.verifyFunctionExists(
  packageId,
  'greeting',
  'new'
);

if (exists) {
  const signature = await verifier.getFunctionSignature(
    packageId,
    'greeting',
    'new'
  );
  console.log('Function signature:', signature);
}
```

#### Verify Source Code

```typescript
const sourceCode = `
module greeting {
  public fun new(ctx: &mut TxContext) { ... }
}
`;

const result = await verifier.verifySourceCode(
  packageId,
  'greeting',
  sourceCode
);

if (result.verified) {
  console.log('✓ Source code verified!');
  console.log('Source hash:', result.sourceHash);
} else {
  console.log('✗ Verification failed:', result.error);
}
```

#### Generate Verification Report

```typescript
import { createVerificationReport } from '@/utils/sourceCodeVerification';

const report = createVerificationReport(result);
console.log(report);
```

### Verification Utilities

```typescript
import { verificationUtils } from '@/utils/sourceCodeVerification';

// Validate addresses
const isValid = verificationUtils.isValidAddress('0x...');
const isValidPkg = verificationUtils.isValidPackageId('0x...');

// Format status
const status = verificationUtils.formatStatus(true); // "✓ Verified"
```

## 🧪 dApp Function Testing

### Features

- ✅ Test smart contract function calls (dry run)
- ✅ Test object creation
- ✅ Verify event emissions
- ✅ Gas estimation testing
- ✅ Parameter validation
- ✅ Execution limits testing
- ✅ Comprehensive test suites
- ✅ Assert helpers
- ✅ Mock data generators

### Usage Examples

#### Initialize Tester

```typescript
import { DAppFunctionTester } from '@/utils/dAppFunctionTesting';

const client = new SuiClient({ url: 'https://fullnode.devnet.sui.io' });
const tester = new DAppFunctionTester(client);
```

#### Test a Function Call

```typescript
const config = {
  packageId: '0x...',
  moduleName: 'greeting',
  functionName: 'new',
  arguments: [],
};

const result = await tester.testFunctionCall(config);

if (result.success) {
  console.log(`✓ Test passed in ${result.duration}ms`);
  console.log(`Gas used: ${result.gasUsed}`);
} else {
  console.log(`✗ Test failed: ${result.error}`);
}
```

#### Test Object Creation

```typescript
const result = await tester.testObjectCreation(
  packageId,
  'greeting',
  'new'
);

if (result.success) {
  console.log(`Created ${result.data.objectsCreated} objects`);
}
```

#### Test Event Emission

```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${packageId}::greeting::new`,
  arguments: [],
});

const result = await tester.testEventEmission(tx, 'GreetingCreated');

if (result.success) {
  console.log('Event emitted:', result.data.eventType);
  console.log('Event data:', result.data.eventData);
}
```

#### Test Gas Estimation

```typescript
const tx = new Transaction();
// Build your transaction...

const result = await tester.testGasEstimation(tx);

if (result.success) {
  console.log('Gas breakdown:');
  console.log(`  Computation: ${result.data.computationCost}`);
  console.log(`  Storage: ${result.data.storageCost}`);
  console.log(`  Rebate: ${result.data.storageRebate}`);
  console.log(`  Total: ${result.data.total}`);
}
```

#### Run Test Suite

```typescript
import { TestSuite, assert } from '@/utils/dAppFunctionTesting';

const suite: TestSuite = {
  name: 'Greeting Contract Tests',
  setup: async () => {
    console.log('Setting up tests...');
  },
  tests: [
    {
      name: 'Package Exists',
      description: 'Verify package is deployed',
      test: async () => {
        const exists = await verifier.verifyPackageExists(packageId);
        assert.isTrue(exists, 'Package should exist on chain');
      },
    },
    {
      name: 'Create Greeting',
      description: 'Test greeting creation',
      test: async () => {
        const result = await tester.testFunctionCall({
          packageId,
          moduleName: 'greeting',
          functionName: 'new',
          arguments: [],
        });
        assert.isTrue(result.success, 'Creation should succeed');
      },
    },
  ],
  teardown: async () => {
    console.log('Cleaning up...');
  },
};

const results = await tester.runTestSuite(suite);
console.log(`Tests completed: ${results.length}`);
```

#### Validate Function Parameters

```typescript
const result = await tester.validateParameters(
  packageId,
  'greeting',
  'update_text',
  ['greetingId', 'newText']
);

if (result.success) {
  console.log('Parameters are valid');
} else {
  console.log('Parameter error:', result.error);
}
```

### Assert Helpers

```typescript
import { assert } from '@/utils/dAppFunctionTesting';

// Boolean assertions
assert.isTrue(condition, 'Should be true');
assert.isFalse(condition, 'Should be false');

// Equality assertions
assert.equals(actual, expected, 'Should be equal');
assert.notEquals(actual, expected, 'Should not be equal');

// Null checks
assert.isNull(value, 'Should be null');
assert.isNotNull(value, 'Should not be null');

// Exception testing
assert.throws(() => functionThatThrows(), 'Should throw');
await assert.throwsAsync(async () => asyncFunctionThatThrows(), 'Should throw');
```

### Mock Data Generators

```typescript
import { mockData } from '@/utils/dAppFunctionTesting';

// Generate random Sui address
const address = mockData.randomAddress();
// 0xabcd1234...

// Generate random object ID
const objectId = mockData.randomObjectId();

// Generate random amount
const amount = mockData.randomAmount(1, 1000);

// Generate random string
const text = mockData.randomString(20);
```

## 🎯 Complete Testing Example

```typescript
import { SuiClient } from '@mysten/sui/client';
import { SourceCodeVerifier } from '@/utils/sourceCodeVerification';
import { DAppFunctionTester, TestSuite, assert } from '@/utils/dAppFunctionTesting';

async function testGreetingContract() {
  const client = new SuiClient({ url: 'https://fullnode.devnet.sui.io' });
  const verifier = new SourceCodeVerifier(client);
  const tester = new DAppFunctionTester(client);
  
  const packageId = '0x...'; // Your package ID

  const suite: TestSuite = {
    name: 'Greeting Contract Comprehensive Tests',
    
    setup: async () => {
      console.log('🚀 Starting test suite...');
    },
    
    tests: [
      {
        name: 'Verify Package Deployment',
        description: 'Check if package is deployed on chain',
        test: async () => {
          const exists = await verifier.verifyPackageExists(packageId);
          assert.isTrue(exists, 'Package must be deployed');
        },
      },
      
      {
        name: 'Verify Module Structure',
        description: 'Check module exists with expected functions',
        test: async () => {
          const exists = await verifier.verifyModuleExists(packageId, 'greeting');
          assert.isTrue(exists, 'Greeting module should exist');
          
          const hasNew = await verifier.verifyFunctionExists(
            packageId,
            'greeting',
            'new'
          );
          assert.isTrue(hasNew, 'new() function should exist');
        },
      },
      
      {
        name: 'Test Greeting Creation',
        description: 'Test creating a new greeting',
        test: async () => {
          const result = await tester.testFunctionCall({
            packageId,
            moduleName: 'greeting',
            functionName: 'new',
            arguments: [],
          });
          
          assert.isTrue(result.success, 'Greeting creation should succeed');
          assert.isNotNull(result.gasUsed, 'Gas should be estimated');
        },
      },
      
      {
        name: 'Test Object Creation',
        description: 'Verify greeting object is created',
        test: async () => {
          const result = await tester.testObjectCreation(
            packageId,
            'greeting',
            'new'
          );
          
          assert.isTrue(result.success, 'Should create object');
          assert.equals(result.data.objectsCreated, 1, 'Should create 1 object');
        },
      },
      
      {
        name: 'Test Gas Estimation',
        description: 'Verify gas costs are reasonable',
        test: async () => {
          const tx = new Transaction();
          tx.moveCall({
            target: `${packageId}::greeting::new`,
            arguments: [],
          });
          
          const result = await tester.testGasEstimation(tx);
          assert.isTrue(result.success, 'Gas estimation should succeed');
          
          const totalGas = BigInt(result.data.total);
          assert.isTrue(
            totalGas < 10000000n,
            'Gas should be less than 10M'
          );
        },
      },
    ],
    
    teardown: async () => {
      console.log('✅ Test suite completed');
      
      const results = tester.getResults();
      const passed = results.filter((r) => r.success).length;
      console.log(`Results: ${passed}/${results.length} passed`);
    },
  };

  await tester.runTestSuite(suite);
}

// Run tests
testGreetingContract().catch(console.error);
```

## 🎨 UI Component

The `VerificationTesting` component provides a user-friendly interface for:

- **Source Verification Tab**:
  - Verify package exists
  - View package information
  - Verify source code against bytecode
  - Generate verification reports

- **Function Testing Tab**:
  - Test individual functions
  - Run comprehensive test suites
  - View test results with details
  - Clear test history

### Using the Component

```typescript
import VerificationTesting from '@/components/VerificationTesting';

function App() {
  return (
    <div>
      <VerificationTesting />
    </div>
  );
}
```

## 📊 Best Practices

### Verification

1. **Always verify packages** before integrating
2. **Check function signatures** to ensure compatibility
3. **Compare package versions** when upgrading
4. **Generate reports** for audit trails

### Testing

1. **Write comprehensive test suites** covering all functions
2. **Test both success and failure cases** using `shouldFail` flag
3. **Validate parameters** before execution
4. **Monitor gas costs** to optimize transactions
5. **Test event emissions** to ensure proper logging
6. **Use assertions** to make tests explicit
7. **Mock data** for repeatable tests

## 🔒 Security Considerations

- Verify all packages before deployment
- Test with realistic gas budgets
- Validate all user inputs
- Test failure scenarios
- Monitor event emissions for anomalies
- Compare bytecode hashes for verification

## 📝 Error Handling

Both modules include comprehensive error handling:

```typescript
try {
  const result = await verifier.verifySourceCode(...);
  if (!result.verified) {
    console.error('Verification failed:', result.error);
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## 🚀 Quick Start Checklist

- [ ] Install dependencies
- [ ] Import verification and testing modules
- [ ] Initialize with SuiClient
- [ ] Verify your package exists
- [ ] Get package information
- [ ] Write test suite
- [ ] Run tests
- [ ] Review results
- [ ] Generate verification report

---

**Version**: 1.0.0
**Last Updated**: December 12, 2025
**Status**: Production Ready ✅
