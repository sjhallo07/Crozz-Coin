/**
 * Sui Transaction React Hooks
 * React hooks for signing and executing transactions
 */

import { useState, useCallback } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Secp256k1Keypair } from '@mysten/sui/keypairs/secp256k1';
import { Secp256r1Keypair } from '@mysten/sui/keypairs/secp256r1';
import { TransactionBuilder, SerialBatchExecutor, getReferenceGasPrice } from '../utils/transactionUtils';

type Keypair = Ed25519Keypair | Secp256k1Keypair | Secp256r1Keypair;

// ============================================================================
// useTransaction Hook
// ============================================================================

/**
 * Hook for signing and executing a single transaction
 */
export function useTransaction(
  client: SuiClient | null,
  keypair: Keypair | null
): {
  sign: (tx: Transaction) => Promise<string>;
  execute: (tx: Transaction) => Promise<any>;
  loading: boolean;
  error: string | null;
  reset: () => void;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sign = useCallback(
    async (tx: Transaction): Promise<string> => {
      if (!keypair) {
        throw new Error('Keypair not available');
      }

      try {
        setLoading(true);
        setError(null);

        const bytes = await tx.build();
        const signature = (await keypair.signTransaction(bytes)).signature;

        return signature;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [keypair]
  );

  const execute = useCallback(
    async (tx: Transaction): Promise<any> => {
      if (!client || !keypair) {
        throw new Error('Client or keypair not available');
      }

      try {
        setLoading(true);
        setError(null);

        const builder = new TransactionBuilder(client, keypair);
        const result = await builder.execute();

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, keypair]
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return { sign, execute, loading, error, reset };
}

// ============================================================================
// useGasEstimate Hook
// ============================================================================

/**
 * Hook for estimating gas cost of a transaction
 */
export function useGasEstimate(client: SuiClient | null): {
  estimate: (tx: Transaction) => Promise<number>;
  refPrice: bigint | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refPrice, setRefPrice] = useState<bigint | null>(null);

  const estimate = useCallback(
    async (tx: Transaction): Promise<number> => {
      if (!client) {
        throw new Error('Client not available');
      }

      try {
        setLoading(true);
        setError(null);

        // Get reference gas price
        const price = await getReferenceGasPrice(client);
        setRefPrice(price);

        // Build transaction to estimate
        const bytes = await tx.build();

        // Gas estimation: roughly 1000 units per KB
        const estimatedGas = Math.ceil(bytes.length / 1024) * 1000;
        const gasCost = estimatedGas * Number(price);

        return gasCost;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
    setRefPrice(null);
  }, []);

  return { estimate, refPrice, loading, error, reset };
}

// ============================================================================
// useBatchTransaction Hook
// ============================================================================

/**
 * Hook for executing multiple transactions
 */
export function useBatchTransaction(
  client: SuiClient | null,
  keypair: Keypair | null
): {
  execute: (
    builders: Array<(tx: Transaction) => void>,
    options?: {
      gasBudget?: number;
      gasPrice?: number;
      stopOnError?: boolean;
    }
  ) => Promise<any[]>;
  loading: boolean;
  error: string | null;
  progress: number;
  reset: () => void;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const execute = useCallback(
    async (
      builders: Array<(tx: Transaction) => void>,
      options?: {
        gasBudget?: number;
        gasPrice?: number;
        stopOnError?: boolean;
      }
    ): Promise<any[]> => {
      if (!client || !keypair) {
        throw new Error('Client or keypair not available');
      }

      try {
        setLoading(true);
        setError(null);
        setProgress(0);

        const executor = new SerialBatchExecutor(client, keypair);
        const results = await executor.executeBatch(builders, options);

        setProgress(100);
        return results;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, keypair]
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
    setProgress(0);
  }, []);

  return { execute, loading, error, progress, reset };
}

// ============================================================================
// useTransactionHistory Hook
// ============================================================================

/**
 * Hook for tracking transaction history
 */
export function useTransactionHistory(address: string | null, client: SuiClient | null): {
  transactions: any[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clear: () => void;
} {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!address || !client) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const txs = await client.queryTransactionBlocks({
        filter: {
          FromAddress: address,
        },
        limit: 50,
      });

      setTransactions(txs.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [address, client]);

  const clear = useCallback(() => {
    setTransactions([]);
    setError(null);
  }, []);

  return { transactions, loading, error, refresh, clear };
}

// ============================================================================
// useKeypairManager Hook
// ============================================================================

/**
 * Hook for managing keypairs
 */
export function useKeypairManager(): {
  keypair: Keypair | null;
  address: string | null;
  setKeypair: (keypair: Keypair) => void;
  generateRandom: (scheme: 'ed25519' | 'secp256k1' | 'secp256r1') => void;
  importFromHex: (hex: string, scheme: 'ed25519' | 'secp256k1' | 'secp256r1') => void;
  importFromMnemonic: (
    mnemonic: string,
    scheme: 'ed25519' | 'secp256k1' | 'secp256r1',
    derivationPath?: string
  ) => void;
  clear: () => void;
  error: string | null;
} {
  const [keypair, setKeypair] = useState<Keypair | null>(null);
  const [error, setError] = useState<string | null>(null);

  const address = keypair ? keypair.getPublicKey().toSuiAddress() : null;

  const generateRandom = useCallback(
    (scheme: 'ed25519' | 'secp256k1' | 'secp256r1') => {
      try {
        setError(null);

        let newKeypair: Keypair;
        switch (scheme) {
          case 'ed25519':
            newKeypair = new Ed25519Keypair();
            break;
          case 'secp256k1':
            newKeypair = new Secp256k1Keypair();
            break;
          case 'secp256r1':
            newKeypair = new Secp256r1Keypair();
            break;
        }

        setKeypair(newKeypair);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      }
    },
    []
  );

  const importFromHex = useCallback(
    (hex: string, scheme: 'ed25519' | 'secp256k1' | 'secp256r1') => {
      try {
        setError(null);

        let newKeypair: Keypair;
        switch (scheme) {
          case 'ed25519':
            newKeypair = Ed25519Keypair.fromSecretKey(
              new Uint8Array(Buffer.from(hex.replace('0x', ''), 'hex'))
            );
            break;
          case 'secp256k1':
            newKeypair = Secp256k1Keypair.fromSecretKey(
              new Uint8Array(Buffer.from(hex.replace('0x', ''), 'hex'))
            );
            break;
          case 'secp256r1':
            newKeypair = Secp256r1Keypair.fromSecretKey(
              new Uint8Array(Buffer.from(hex.replace('0x', ''), 'hex'))
            );
            break;
        }

        setKeypair(newKeypair);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      }
    },
    []
  );

  const importFromMnemonic = useCallback(
    (
      mnemonic: string,
      scheme: 'ed25519' | 'secp256k1' | 'secp256r1',
      derivationPath?: string
    ) => {
      try {
        setError(null);

        let newKeypair: Keypair;
        switch (scheme) {
          case 'ed25519':
            newKeypair = Ed25519Keypair.deriveKeypair(mnemonic, derivationPath);
            break;
          case 'secp256k1':
            newKeypair = Secp256k1Keypair.deriveKeypair(mnemonic, derivationPath);
            break;
          case 'secp256r1':
            newKeypair = Secp256r1Keypair.deriveKeypair(mnemonic, derivationPath);
            break;
        }

        setKeypair(newKeypair);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setKeypair(null);
    setError(null);
  }, []);

  return {
    keypair,
    address,
    setKeypair,
    generateRandom,
    importFromHex,
    importFromMnemonic,
    clear,
    error,
  };
}

// ============================================================================
// useTransactionProgress Hook
// ============================================================================

/**
 * Hook for tracking transaction progress
 */
export function useTransactionProgress(
  client: SuiClient | null,
  txDigest: string | null
): {
  status: 'pending' | 'success' | 'failed' | null;
  block: any | null;
  loading: boolean;
  error: string | null;
  checkStatus: () => Promise<void>;
  reset: () => void;
} {
  const [status, setStatus] = useState<'pending' | 'success' | 'failed' | null>(
    null
  );
  const [block, setBlock] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    if (!client || !txDigest) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const tx = await client.getTransactionBlock({
        digest: txDigest,
        options: {
          showEffects: true,
          showInput: true,
        },
      });

      setBlock(tx);

      if (tx.effects?.status.status === 'success') {
        setStatus('success');
      } else if (tx.effects?.status.status === 'failure') {
        setStatus('failed');
      } else {
        setStatus('pending');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [client, txDigest]);

  const reset = useCallback(() => {
    setStatus(null);
    setBlock(null);
    setError(null);
  }, []);

  return { status, block, loading, error, checkStatus, reset };
}

export default {
  useTransaction,
  useGasEstimate,
  useBatchTransaction,
  useTransactionHistory,
  useKeypairManager,
  useTransactionProgress,
};
