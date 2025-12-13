/**
 * Source Code Verification & Testing Component
 * 
 * UI for verifying smart contract source code and testing dApp functions
 */

import { useSuiClient } from '@mysten/dapp-kit';
import { useState, useEffect } from 'react';
import {
  SourceCodeVerifier,
  VerificationResult,
  PackageInfo,
  ModuleInfo,
  verificationUtils,
  createVerificationReport,
} from '../utils/sourceCodeVerification';
import {
  DAppFunctionTester,
  TestResult,
  TestSuite,
  FunctionTestConfig,
  assert,
  mockData,
} from '../utils/dAppFunctionTesting';
import { Transaction } from '@mysten/sui/transactions';
import styles from './VerificationTesting.module.css';

export function VerificationTesting() {
  const client = useSuiClient();
  const [verifier] = useState(() => new SourceCodeVerifier(client));
  const [tester] = useState(() => new DAppFunctionTester(client));

  // Verification state
  const [packageId, setPackageId] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [sourceCode, setSourceCode] = useState('');
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Testing state
  const [testPackageId, setTestPackageId] = useState('');
  const [testModuleName, setTestModuleName] = useState('');
  const [testFunctionName, setTestFunctionName] = useState('');
  const [testArguments, setTestArguments] = useState('[]');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const [activeTab, setActiveTab] = useState<'verification' | 'testing'>('verification');

  /**
   * Verify package exists
   */
  const handleVerifyPackage = async () => {
    if (!packageId) return;

    setVerifying(true);
    try {
      const exists = await verifier.verifyPackageExists(packageId);
      if (exists) {
        const info = await verifier.getPackageInfo(packageId);
        setPackageInfo(info);
        alert('✓ Package verified successfully!');
      } else {
        alert('✗ Package not found on chain');
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setVerifying(false);
    }
  };

  /**
   * Verify source code
   */
  const handleVerifySource = async () => {
    if (!packageId || !moduleName || !sourceCode) {
      alert('Please fill in all fields');
      return;
    }

    setVerifying(true);
    try {
      const result = await verifier.verifySourceCode(packageId, moduleName, sourceCode);
      setVerificationResult(result);

      if (result.verified) {
        alert('✓ Source code verified!');
      } else {
        alert(`✗ Verification failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setVerifying(false);
    }
  };

  /**
   * Test a function
   */
  const handleTestFunction = async () => {
    if (!testPackageId || !testModuleName || !testFunctionName) {
      alert('Please fill in all required fields');
      return;
    }

    setTesting(true);
    try {
      const args = JSON.parse(testArguments);

      const config: FunctionTestConfig = {
        packageId: testPackageId,
        moduleName: testModuleName,
        functionName: testFunctionName,
        arguments: args,
      };

      const result = await tester.testFunctionCall(config);
      setTestResults([result, ...testResults]);

      if (result.success) {
        alert(`✓ Test passed! (${result.duration}ms)`);
      } else {
        alert(`✗ Test failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  /**
   * Run comprehensive test suite
   */
  const handleRunTestSuite = async () => {
    if (!testPackageId || !testModuleName) {
      alert('Please enter package ID and module name');
      return;
    }

    setTesting(true);
    try {
      const suite: TestSuite = {
        name: `${testModuleName} Test Suite`,
        tests: [
          {
            name: 'Package Exists',
            description: 'Verify package exists on chain',
            test: async () => {
              const exists = await verifier.verifyPackageExists(testPackageId);
              assert.isTrue(exists, 'Package should exist');
            },
          },
          {
            name: 'Module Exists',
            description: 'Verify module exists in package',
            test: async () => {
              const exists = await verifier.verifyModuleExists(testPackageId, testModuleName);
              assert.isTrue(exists, 'Module should exist');
            },
          },
          {
            name: 'Get Package Info',
            description: 'Retrieve package information',
            test: async () => {
              const info = await verifier.getPackageInfo(testPackageId);
              assert.isNotNull(info, 'Package info should not be null');
            },
          },
        ],
      };

      const results: TestResult[] = await tester.runTestSuite(suite);
      setTestResults([...results, ...testResults]);
      
      const passed = results.filter((r: TestResult) => r.success).length;
      alert(`Test suite completed: ${passed}/${results.length} tests passed`);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  /**
   * Clear test results
   */
  const handleClearResults = () => {
    setTestResults([]);
    tester.clearResults();
  };

  return (
    <div className={styles.container}>
      <h1>🔍 Verification & Testing</h1>
      <p className={styles.subtitle}>
        Verify smart contract source code and test dApp functions
      </p>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'verification' ? styles.active : ''}`}
          onClick={() => setActiveTab('verification')}
        >
          📜 Source Verification
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'testing' ? styles.active : ''}`}
          onClick={() => setActiveTab('testing')}
        >
          🧪 Function Testing
        </button>
      </div>

      {activeTab === 'verification' && (
        <div className={styles.section}>
          <h2>Source Code Verification</h2>

          <div className={styles.formGroup}>
            <label>Package ID</label>
            <input
              type="text"
              placeholder="0x..."
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              className={styles.input}
            />

            <button
              onClick={handleVerifyPackage}
              disabled={verifying || !packageId}
              className={styles.button}
            >
              {verifying ? 'Verifying...' : 'Verify Package'}
            </button>
          </div>

          {packageInfo && (
            <div className={styles.infoBox}>
              <h3>Package Information</h3>
              <p>
                <strong>Package ID:</strong> {packageInfo.packageId}
              </p>
              <p>
                <strong>Modules:</strong> {packageInfo.modules.length}
              </p>
              <ul>
                {packageInfo.modules.map((module: ModuleInfo) => (
                  <li key={module.name}>
                    <strong>{module.name}</strong>
                    <ul>
                      <li>Functions: {module.functions.length}</li>
                      <li>Structs: {module.structs.length}</li>
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Module Name</label>
            <input
              type="text"
              placeholder="greeting"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              className={styles.input}
            />

            <label>Source Code</label>
            <textarea
              placeholder="Paste your Move source code here..."
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              className={styles.textarea}
              rows={10}
            />

            <button
              onClick={handleVerifySource}
              disabled={verifying || !packageId || !moduleName || !sourceCode}
              className={styles.button}
            >
              {verifying ? 'Verifying...' : 'Verify Source Code'}
            </button>
          </div>

          {verificationResult && (
            <div
              className={`${styles.resultBox} ${
                verificationResult.verified ? styles.success : styles.error
              }`}
            >
              <h3>Verification Result</h3>
              <pre>{createVerificationReport(verificationResult)}</pre>
            </div>
          )}
        </div>
      )}

      {activeTab === 'testing' && (
        <div className={styles.section}>
          <h2>Function Testing</h2>

          <div className={styles.formGroup}>
            <label>Package ID</label>
            <input
              type="text"
              placeholder="0x..."
              value={testPackageId}
              onChange={(e) => setTestPackageId(e.target.value)}
              className={styles.input}
            />

            <label>Module Name</label>
            <input
              type="text"
              placeholder="greeting"
              value={testModuleName}
              onChange={(e) => setTestModuleName(e.target.value)}
              className={styles.input}
            />

            <label>Function Name</label>
            <input
              type="text"
              placeholder="new"
              value={testFunctionName}
              onChange={(e) => setTestFunctionName(e.target.value)}
              className={styles.input}
            />

            <label>Arguments (JSON array)</label>
            <textarea
              placeholder='["arg1", "arg2"]'
              value={testArguments}
              onChange={(e) => setTestArguments(e.target.value)}
              className={styles.textarea}
              rows={3}
            />

            <div className={styles.buttonRow}>
              <button
                onClick={handleTestFunction}
                disabled={testing || !testPackageId || !testModuleName || !testFunctionName}
                className={styles.button}
              >
                {testing ? 'Testing...' : 'Test Function'}
              </button>

              <button
                onClick={handleRunTestSuite}
                disabled={testing || !testPackageId || !testModuleName}
                className={`${styles.button} ${styles.secondary}`}
              >
                {testing ? 'Running...' : 'Run Test Suite'}
              </button>

              <button
                onClick={handleClearResults}
                disabled={testResults.length === 0}
                className={`${styles.button} ${styles.warning}`}
              >
                Clear Results
              </button>
            </div>
          </div>

          {testResults.length > 0 && (
            <div className={styles.resultsContainer}>
              <h3>
                Test Results ({testResults.filter((r) => r.success).length}/{testResults.length}{' '}
                passed)
              </h3>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`${styles.testResult} ${
                    result.success ? styles.success : styles.error
                  }`}
                >
                  <div className={styles.testHeader}>
                    <span className={styles.testName}>
                      {result.success ? '✓' : '✗'} {result.testName}
                    </span>
                    <span className={styles.testDuration}>{result.duration}ms</span>
                  </div>
                  {result.error && <div className={styles.testError}>Error: {result.error}</div>}
                  {result.data && (
                    <details className={styles.testDetails}>
                      <summary>Details</summary>
                      <pre>{JSON.stringify(result.data, null, 2)}</pre>
                    </details>
                  )}
                  {result.gasUsed && (
                    <div className={styles.gasInfo}>Gas Used: {result.gasUsed}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VerificationTesting;
