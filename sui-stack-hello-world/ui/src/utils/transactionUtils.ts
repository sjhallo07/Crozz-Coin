/**
 * Sui Transaction Signing and Execution Utilities
 * TypeScript utilities for constructing, signing, and executing transactions
 */

import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Secp256k1Keypair } from '@mysten/sui/keypairs/secp256k1';
import { Secp256r1Keypair } from '@mysten/sui/keypairs/secp256r1';

// ============================================================================
// KEYPAIR FACTORY
// ============================================================================

/**
 * Factory for creating keypairs of different signature schemes
 */
export class KeypairFactory {
  /**
   * Generate random Ed25519 keypair
   */
  static generateEd25519(): Ed25519Keypair {
    return new Ed25519Keypair();
  }

  /**
   * Generate random Secp256k1 keypair
   */
  static generateSecp256k1(): Secp256k1Keypair {
    return new Secp256k1Keypair();
  }

  /**
   * Generate random Secp256r1 keypair
   */
  static generateSecp256r1(): Secp256r1Keypair {
    return new Secp256r1Keypair();
  }

  /**
   * Import Ed25519 keypair from hex string
   */
  static importEd25519(hexPrivateKey: string): Ed25519Keypair {
    const bytes = new Uint8Array(
      Buffer.from(hexPrivateKey.replace('0x', ''), 'hex')
    );
    return Ed25519Keypair.fromSecretKey(bytes);
  }

  /**
   * Import Secp256k1 keypair from hex string
   */
  static importSecp256k1(hexPrivateKey: string): Secp256k1Keypair {
    const bytes = new Uint8Array(
      Buffer.from(hexPrivateKey.replace('0x', ''), 'hex')
    );
    return Secp256k1Keypair.fromSecretKey(bytes);
  }

  /**
   * Import Secp256r1 keypair from hex string
   */
  static importSecp256r1(hexPrivateKey: string): Secp256r1Keypair {
    const bytes = new Uint8Array(
      Buffer.from(hexPrivateKey.replace('0x', ''), 'hex')
    );
    return Secp256r1Keypair.fromSecretKey(bytes);
  }

  /**
   * Derive Ed25519 keypair from BIP39 mnemonic
   */
  static deriveEd25519(
    mnemonic: string,
    derivationPath?: string
  ): Ed25519Keypair {
    return Ed25519Keypair.deriveKeypair(mnemonic, derivationPath);
  }

  /**
   * Derive Secp256k1 keypair from BIP39 mnemonic
   */
  static deriveSecp256k1(
    mnemonic: string,
    derivationPath?: string
  ): Secp256k1Keypair {
    return Secp256k1Keypair.deriveKeypair(mnemonic, derivationPath);
  }

  /**
   * Derive Secp256r1 keypair from BIP39 mnemonic
   */
  static deriveSecp256r1(
    mnemonic: string,
    derivationPath?: string
  ): Secp256r1Keypair {
    return Secp256r1Keypair.deriveKeypair(mnemonic, derivationPath);
  }
}

// ============================================================================
// TRANSACTION BUILDER
// ============================================================================

/**
 * Enhanced transaction builder with signing and execution
 */
export class TransactionBuilder {
  private tx: Transaction;
  private keypair: Ed25519Keypair | Secp256k1Keypair | Secp256r1Keypair;
  private client: SuiClient;

  constructor(
    client: SuiClient,
    keypair: Ed25519Keypair | Secp256k1Keypair | Secp256r1Keypair
  ) {
    this.tx = new Transaction();
    this.keypair = keypair;
    this.client = client;
    
    // Set sender from keypair
    const publicKey = keypair.getPublicKey();
    this.tx.setSender(publicKey.toSuiAddress());
  }

  /**
   * Get the current transaction
   */
  getTransaction(): Transaction {
    return this.tx;
  }

  /**
   * Set gas budget
   */
  setGasBudget(budget: number): this {
    this.tx.setGasBudget(budget);
    return this;
  }

  /**
   * Set gas price
   */
  setGasPrice(price: number): this {
    this.tx.setGasPrice(price);
    return this;
  }

  /**
   * Add a move call to the transaction
   */
  addMoveCall(
    target: string,
    args?: unknown[],
    typeArgs?: string[]
  ): this {
    this.tx.moveCall({
      target,
      arguments: args?.map(arg => 
        typeof arg === 'object' ? arg : arg
      ) as any[],
      typeArguments: typeArgs,
    });
    return this;
  }

  /**
   * Build and sign the transaction
   */
  async buildAndSign(): Promise<{
    bytes: Uint8Array;
    signature: string;
  }> {
    const bytes = await this.tx.build();
    const signature = (await this.keypair.signTransaction(bytes)).signature;
    return { bytes, signature };
  }

  /**
   * Build, sign, and execute the transaction
   */
  async execute(): Promise<any> {
    const { bytes, signature } = await this.buildAndSign();

    // Verify locally
    const isValid = await this.keypair
      .getPublicKey()
      .verifyTransaction(bytes, signature);

    if (!isValid) {
      throw new Error('Signature verification failed');
    }

    // Execute
    return await this.client.executeTransactionBlock({
      transactionBlock: bytes,
      signature,
    });
  }
}

// ============================================================================
// BATCH TRANSACTION EXECUTOR
// ============================================================================

/**
 * Execute multiple transactions from same sender sequentially
 */
export class SerialBatchExecutor {
  private client: SuiClient;
  private keypair: Ed25519Keypair | Secp256k1Keypair | Secp256r1Keypair;
  private senderAddress: string;

  constructor(
    client: SuiClient,
    keypair: Ed25519Keypair | Secp256k1Keypair | Secp256r1Keypair
  ) {
    this.client = client;
    this.keypair = keypair;
    this.senderAddress = keypair.getPublicKey().toSuiAddress();
  }

  /**
   * Execute a single transaction
   */
  async executeTransaction(
    transactionBuilder: (tx: Transaction) => void,
    options?: {
      gasBudget?: number;
      gasPrice?: number;
      verifySignature?: boolean;
    }
  ): Promise<any> {
    const tx = new Transaction();
    tx.setSender(this.senderAddress);

    if (options?.gasBudget) tx.setGasBudget(options.gasBudget);
    if (options?.gasPrice) tx.setGasPrice(options.gasPrice);

    // Build transaction
    transactionBuilder(tx);

    const bytes = await tx.build();
    const signature = (await this.keypair.signTransaction(bytes)).signature;

    // Verify if requested
    if (options?.verifySignature !== false) {
      const isValid = await this.keypair
        .getPublicKey()
        .verifyTransaction(bytes, signature);

      if (!isValid) {
        throw new Error('Signature verification failed');
      }
    }

    // Execute
    return await this.client.executeTransactionBlock({
      transactionBlock: bytes,
      signature,
    });
  }

  /**
   * Execute multiple transactions sequentially
   */
  async executeBatch(
    builders: Array<(tx: Transaction) => void>,
    options?: {
      gasBudget?: number;
      gasPrice?: number;
      stopOnError?: boolean;
    }
  ): Promise<any[]> {
    const results: any[] = [];

    for (let i = 0; i < builders.length; i++) {
      try {
        const result = await this.executeTransaction(builders[i], {
          gasBudget: options?.gasBudget,
          gasPrice: options?.gasPrice,
        });
        results.push({
          index: i,
          success: true,
          result,
        });
      } catch (error) {
        const errorResult = {
          index: i,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
        results.push(errorResult);

        if (options?.stopOnError) {
          break;
        }
      }
    }

    return results;
  }
}

// ============================================================================
// TRANSACTION UTILITIES
// ============================================================================

/**
 * Get sender address from keypair
 */
export function getSenderAddress(
  keypair: Ed25519Keypair | Secp256k1Keypair | Secp256r1Keypair
): string {
  return keypair.getPublicKey().toSuiAddress();
}

/**
 * Get public key from keypair
 */
export function getPublicKey(
  keypair: Ed25519Keypair | Secp256k1Keypair | Secp256r1Keypair
): string {
  return keypair.getPublicKey().toSuiAddress();
}

/**
 * Sign transaction bytes with keypair
 */
export async function signTransaction(
  keypair: Ed25519Keypair | Secp256k1Keypair | Secp256r1Keypair,
  transactionBytes: Uint8Array
): Promise<string> {
  const signature = await keypair.signTransaction(transactionBytes);
  return signature.signature;
}

/**
 * Verify transaction signature
 */
export async function verifyTransaction(
  keypair: Ed25519Keypair | Secp256k1Keypair | Secp256r1Keypair,
  transactionBytes: Uint8Array,
  signature: string
): Promise<boolean> {
  return await keypair
    .getPublicKey()
    .verifyTransaction(transactionBytes, signature);
}

// ============================================================================
// GAS UTILITIES
// ============================================================================

/**
 * Get current reference gas price
 */
export async function getReferenceGasPrice(client: SuiClient): Promise<bigint> {
  const price = await client.getReferenceGasPrice();
  return price;
}

/**
 * Get gas coins for address
 */
export async function getGasCoins(
  client: SuiClient,
  address: string
): Promise<any[]> {
  const coins = await client.getCoins({
    owner: address,
  });
  return coins.data;
}

/**
 * Find best gas coin for transaction
 */
export async function findBestGasCoin(
  client: SuiClient,
  address: string,
  minBalance?: number
): Promise<any | null> {
  const coins = await getGasCoins(client, address);
  
  if (coins.length === 0) {
    return null;
  }

  // Find largest coin
  let bestCoin = coins[0];
  let maxBalance = BigInt(coins[0].balance);

  for (const coin of coins.slice(1)) {
    const balance = BigInt(coin.balance);
    if (minBalance && balance < BigInt(minBalance)) {
      continue;
    }
    if (balance > maxBalance) {
      maxBalance = balance;
      bestCoin = coin;
    }
  }

  if (minBalance && BigInt(bestCoin.balance) < BigInt(minBalance)) {
    return null;
  }

  return bestCoin;
}

// ============================================================================
// REACT HOOKS
// ============================================================================

/**
 * React hook for managing transaction signing
 * Note: Actual implementation in hooks/useTransaction.ts
 */
export interface UseTransactionResult {
  sign: (tx: Transaction) => Promise<string>;
  execute: (tx: Transaction) => Promise<any>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export default {
  KeypairFactory,
  TransactionBuilder,
  SerialBatchExecutor,
  getSenderAddress,
  getPublicKey,
  signTransaction,
  verifyTransaction,
  getReferenceGasPrice,
  getGasCoins,
  findBestGasCoin,
};
