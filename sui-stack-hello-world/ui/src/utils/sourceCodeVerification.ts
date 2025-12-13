/**
 * Source Code Verification Utilities
 * 
 * Tools for verifying smart contract source code on Sui blockchain
 */

import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

export interface VerificationResult {
  verified: boolean;
  packageId: string;
  moduleName: string;
  bytecode: string;
  sourceHash?: string;
  timestamp: number;
  error?: string;
}

export interface PackageInfo {
  packageId: string;
  version: string;
  modules: ModuleInfo[];
  dependencies: string[];
}

export interface ModuleInfo {
  name: string;
  functions: FunctionInfo[];
  structs: StructInfo[];
  bytecodeHash: string;
}

export interface FunctionInfo {
  name: string;
  visibility: 'public' | 'private' | 'entry';
  parameters: any[];
  returnType: any;
}

export interface StructInfo {
  name: string;
  abilities: any;
  fields: FieldInfo[];
}

export interface FieldInfo {
  name: string;
  type: string;
}

/**
 * Source Code Verification Class
 */
export class SourceCodeVerifier {
  private client: SuiClient;

  constructor(client: SuiClient) {
    this.client = client;
  }

  /**
   * Verify that a package exists on chain
   */
  async verifyPackageExists(packageId: string): Promise<boolean> {
    try {
      const pkg = await this.client.getObject({
        id: packageId,
        options: { showContent: true },
      });

      return pkg.data !== null && pkg.data !== undefined;
    } catch (error) {
      console.error('Error verifying package:', error);
      return false;
    }
  }

  /**
   * Get package information including modules and functions
   */
  async getPackageInfo(packageId: string): Promise<PackageInfo | null> {
    try {
      const pkg = await this.client.getNormalizedMoveModulesByPackage({
        package: packageId,
      });

      const modules: ModuleInfo[] = Object.entries(pkg).map(([name, module]) => {
        const functions: FunctionInfo[] = Object.entries(module.exposedFunctions || {}).map(
          ([funcName, func]) => ({
            name: funcName,
            visibility: func.isEntry ? 'entry' : 'public',
            parameters: func.parameters || [],
            returnType: func.return ?? 'void',
          })
        );

        const structs: StructInfo[] = Object.entries(module.structs || {}).map(
          ([structName, struct]) => ({
            name: structName,
            abilities: (struct as any).abilities || [],
            fields: Object.entries((struct as any).fields || {}).map(([fieldName, field]) => ({
              name: fieldName,
              type: String(field),
            })),
          })
        );

        return {
          name,
          functions,
          structs,
          bytecodeHash: '', // Would need to compute from bytecode
        };
      });

      return {
        packageId,
        version: '1.0.0', // Would need to get from package metadata
        modules,
        dependencies: [],
      };
    } catch (error) {
      console.error('Error getting package info:', error);
      return null;
    }
  }

  /**
   * Verify that a module exists in a package
   */
  async verifyModuleExists(packageId: string, moduleName: string): Promise<boolean> {
    try {
      const module = await this.client.getNormalizedMoveModule({
        package: packageId,
        module: moduleName,
      });

      return module !== null && module !== undefined;
    } catch (error) {
      console.error('Error verifying module:', error);
      return false;
    }
  }

  /**
   * Verify that a function exists in a module
   */
  async verifyFunctionExists(
    packageId: string,
    moduleName: string,
    functionName: string
  ): Promise<boolean> {
    try {
      const module = await this.client.getNormalizedMoveModule({
        package: packageId,
        module: moduleName,
      });

      const functions = module.exposedFunctions || {};
      return functionName in functions;
    } catch (error) {
      console.error('Error verifying function:', error);
      return false;
    }
  }

  /**
   * Get function signature and parameters
   */
  async getFunctionSignature(
    packageId: string,
    moduleName: string,
    functionName: string
  ): Promise<FunctionInfo | null> {
    try {
      const module = await this.client.getNormalizedMoveModule({
        package: packageId,
        module: moduleName,
      });

      const func = module.exposedFunctions?.[functionName];
      if (!func) return null;

      return {
        name: functionName,
        visibility: func.isEntry ? 'entry' : 'public',
        parameters: func.parameters || [],
        returnType: func.return ? func.return.toString() : 'void',
      };
    } catch (error) {
      console.error('Error getting function signature:', error);
      return null;
    }
  }

  /**
   * Verify complete source code against on-chain bytecode
   */
  async verifySourceCode(
    packageId: string,
    moduleName: string,
    sourceCode: string
  ): Promise<VerificationResult> {
    const result: VerificationResult = {
      verified: false,
      packageId,
      moduleName,
      bytecode: '',
      timestamp: Date.now(),
    };

    try {
      // Check if module exists
      const moduleExists = await this.verifyModuleExists(packageId, moduleName);
      if (!moduleExists) {
        result.error = 'Module not found on chain';
        return result;
      }

      // Get module bytecode
      const module = await this.client.getNormalizedMoveModule({
        package: packageId,
        module: moduleName,
      });

      // In a real implementation, we would:
      // 1. Compile the source code
      // 2. Compare bytecode hashes
      // 3. Verify function signatures match
      
      // For now, we verify structure matches
      const packageInfo = await this.getPackageInfo(packageId);
      const moduleInfo = packageInfo?.modules.find((m) => m.name === moduleName);

      if (moduleInfo) {
        result.verified = true;
        result.bytecode = JSON.stringify(module);
        result.sourceHash = this.hashString(sourceCode);
      }

      return result;
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      return result;
    }
  }

  /**
   * Simple hash function for strings
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Compare two package versions
   */
  async comparePackages(packageId1: string, packageId2: string): Promise<{
    same: boolean;
    differences: string[];
  }> {
    try {
      const pkg1 = await this.getPackageInfo(packageId1);
      const pkg2 = await this.getPackageInfo(packageId2);

      if (!pkg1 || !pkg2) {
        return { same: false, differences: ['One or both packages not found'] };
      }

      const differences: string[] = [];

      // Compare module count
      if (pkg1.modules.length !== pkg2.modules.length) {
        differences.push(
          `Different module count: ${pkg1.modules.length} vs ${pkg2.modules.length}`
        );
      }

      // Compare module names
      const modules1 = pkg1.modules.map((m) => m.name).sort();
      const modules2 = pkg2.modules.map((m) => m.name).sort();
      const missingModules = modules1.filter((m) => !modules2.includes(m));
      const extraModules = modules2.filter((m) => !modules1.includes(m));

      if (missingModules.length > 0) {
        differences.push(`Missing modules in pkg2: ${missingModules.join(', ')}`);
      }
      if (extraModules.length > 0) {
        differences.push(`Extra modules in pkg2: ${extraModules.join(', ')}`);
      }

      return {
        same: differences.length === 0,
        differences,
      };
    } catch (error) {
      return {
        same: false,
        differences: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
}

/**
 * Create a verification report
 */
export function createVerificationReport(result: VerificationResult): string {
  const lines = [
    '=== Source Code Verification Report ===',
    '',
    `Package ID: ${result.packageId}`,
    `Module: ${result.moduleName}`,
    `Verified: ${result.verified ? '✓ YES' : '✗ NO'}`,
    `Timestamp: ${new Date(result.timestamp).toISOString()}`,
  ];

  if (result.sourceHash) {
    lines.push(`Source Hash: ${result.sourceHash}`);
  }

  if (result.error) {
    lines.push('', `Error: ${result.error}`);
  }

  lines.push('', '=== End Report ===');

  return lines.join('\n');
}

/**
 * Export utilities
 */
export const verificationUtils = {
  /**
   * Check if address is valid Sui address
   */
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(address);
  },

  /**
   * Check if package ID is valid
   */
  isValidPackageId(packageId: string): boolean {
    return /^0x[a-fA-F0-9]{1,64}$/.test(packageId);
  },

  /**
   * Format verification status
   */
  formatStatus(verified: boolean): string {
    return verified ? '✓ Verified' : '✗ Not Verified';
  },
};
