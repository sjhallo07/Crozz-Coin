import fs from "fs";
import path from "path";
import type { SmartContractFunction, ContractParam } from "../types/admin";

/**
 * Scans Move.toml and Move source files to discover smart contract functions
 * Extracts function signatures, parameter types, and return types for bytecode execution
 */

export class MoveContractScanner {
  private contractPath: string;

  constructor(contractPath: string) {
    this.contractPath = contractPath;
  }

  /**
   * Scan all Move modules in the contract directory
   */
  async discoverFunctions(): Promise<SmartContractFunction[]> {
    const functions: SmartContractFunction[] = [];

    // Find all Move source files
    const moveFiles = this.findMoveFiles(this.contractPath);

    for (const file of moveFiles) {
      const moduleFunctions = this.extractFunctionsFromFile(file);
      functions.push(...moduleFunctions);
    }

    return functions;
  }

  /**
   * Find all .move files in the contract directory
   */
  private findMoveFiles(dir: string): string[] {
    let moveFiles: string[] = [];

    try {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && !file.startsWith(".")) {
          moveFiles = moveFiles.concat(this.findMoveFiles(filePath));
        } else if (file.endsWith(".move")) {
          moveFiles.push(filePath);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error);
    }

    return moveFiles;
  }

  /**
   * Extract function signatures from a Move source file
   */
  private extractFunctionsFromFile(filePath: string): SmartContractFunction[] {
    const functions: SmartContractFunction[] = [];

    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const moduleName = this.extractModuleName(content);

      // Match public functions
      const publicFnRegex = /public\s+(?:entry\s+)?(?:fun|async fun)\s+(\w+)\s*\((.*?)\)\s*(?::\s*(.*?))?(?:\{|;)/gs;
      let match;

      while ((match = publicFnRegex.exec(content)) !== null) {
        const name = match[1];
        const paramsStr = match[2];
        const returnType = match[3]?.trim() || "void";

        const params = this.parseParameters(paramsStr);

        functions.push({
          id: `${moduleName}::${name}`,
          name,
          module: moduleName,
          description: `Function ${name} in module ${moduleName}`,
          parameters: params,
          returnType,
          requiresAdmin: true,
          visibility: "public",
          fileLocation: filePath,
        });
      }
    } catch (error) {
      console.error(`Error parsing file ${filePath}:`, error);
    }

    return functions;
  }

  /**
   * Extract module name from Move source
   */
  private extractModuleName(content: string): string {
    const moduleRegex = /module\s+(\w+)\s*::/;
    const match = moduleRegex.exec(content);
    return match ? match[1] : "unknown";
  }

  /**
   * Parse function parameters from parameter string
   */
  private parseParameters(paramsStr: string): ContractParam[] {
    const params: ContractParam[] = [];

    if (!paramsStr.trim()) {
      return params;
    }

    // Split by comma but respect nested angle brackets for generic types
    const paramParts = this.smartSplit(paramsStr, ",");

    for (const param of paramParts) {
      const trimmed = param.trim();
      if (!trimmed) continue;

      // Match "name: Type" or "name: &Type"
      const paramRegex = /([a-zA-Z_]\w*)\s*:\s*(&?\w+(?:<[^>]*>)?)/;
      const match = paramRegex.exec(trimmed);

      if (match) {
        params.push({
          name: match[1],
          type: match[2],
          isReference: match[2].startsWith("&"),
          isMutable: match[2].startsWith("&mut"),
        });
      }
    }

    return params;
  }

  /**
   * Smart split that respects angle brackets (for generics)
   */
  private smartSplit(str: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = "";
    let depth = 0;

    for (const char of str) {
      if (char === "<") {
        depth++;
      } else if (char === ">") {
        depth--;
      }

      if (char === delimiter && depth === 0) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    if (current) {
      result.push(current);
    }

    return result;
  }
}

/**
 * Scan Move contracts in the hello-world project
 */
export async function scanSuiStackContracts(): Promise<SmartContractFunction[]> {
  const contractPath = path.join(__dirname, "../../move/sources");

  const scanner = new MoveContractScanner(contractPath);
  return scanner.discoverFunctions();
}

/**
 * Get contract function by module and name
 */
export function getContractFunction(
  functions: SmartContractFunction[],
  module: string,
  name: string
): SmartContractFunction | undefined {
  return functions.find((fn) => fn.module === module && fn.name === name);
}

/**
 * Filter functions by permission
 */
export function filterFunctionsByPermission(
  functions: SmartContractFunction[],
  requiresAdmin: boolean
): SmartContractFunction[] {
  return functions.filter((fn) => fn.requiresAdmin === requiresAdmin);
}
