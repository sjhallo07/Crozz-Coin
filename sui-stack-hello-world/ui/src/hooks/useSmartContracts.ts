/**
 * Smart Contract Interaction Hooks
 * 
 * Provides React hooks for interacting with Move smart contracts:
 * - Greeting Module: Create and manage shared greetings
 * - Token Creator Module: Create and manage custom tokens
 */

import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState, useCallback } from 'react';

// ============================================================================
// Greeting Contract Hooks
// ============================================================================

interface UseGreetingParams {
  packageId: string;
}

interface UseGreetingReturn {
  loading: boolean;
  error: Error | null;
  createGreeting: () => Promise<void>;
  updateGreeting: (greetingId: string, newText: string) => Promise<void>;
  transferOwnership: (greetingId: string, newOwner: string) => Promise<void>;
}

/**
 * Hook for Greeting smart contract interactions
 * 
 * Functions:
 * - createGreeting(): Create a new shared greeting with "Hello world!"
 * - updateGreeting(greetingId, newText): Update greeting text (max 280 chars)
 * - transferOwnership(greetingId, newOwner): Transfer greeting ownership
 */
export const useGreeting = ({ packageId }: UseGreetingParams): UseGreetingReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const createGreeting = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const tx = new Transaction();
      
      // Call hello_world::greeting::new
      tx.moveCall({
        target: `${packageId}::greeting::new`,
        arguments: [],
      });

      await signAndExecute({
        transaction: tx,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create greeting'));
    } finally {
      setLoading(false);
    }
  }, [packageId, signAndExecute]);

  const updateGreeting = useCallback(
    async (greetingId: string, newText: string) => {
      try {
        setLoading(true);
        setError(null);

        // Validate text length
        if (newText.length > 280) {
          throw new Error('Text exceeds maximum length of 280 characters');
        }

        const tx = new Transaction();

        // Call hello_world::greeting::update_text
        tx.moveCall({
          target: `${packageId}::greeting::update_text`,
          arguments: [
            tx.object(greetingId),
            tx.pure.string(newText),
          ],
        });

        await signAndExecute({
          transaction: tx,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update greeting'));
      } finally {
        setLoading(false);
      }
    },
    [packageId, signAndExecute]
  );

  const transferOwnership = useCallback(
    async (greetingId: string, newOwner: string) => {
      try {
        setLoading(true);
        setError(null);

        const tx = new Transaction();

        // Call hello_world::greeting::transfer_ownership
        tx.moveCall({
          target: `${packageId}::greeting::transfer_ownership`,
          arguments: [
            tx.object(greetingId),
            tx.pure.address(newOwner),
          ],
        });

        await signAndExecute({
          transaction: tx,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to transfer ownership'));
      } finally {
        setLoading(false);
      }
    },
    [packageId, signAndExecute]
  );

  return { loading, error, createGreeting, updateGreeting, transferOwnership };
};

// ============================================================================
// Token Creator Contract Hooks
// ============================================================================

interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  description: string;
  iconUrl: string;
  moduleName: string;
  initialSupply: number;
  isMintable: boolean;
  isFreezable: boolean;
  isPausable: boolean;
  treasuryCapHolder: string;
  supplyRecipient: string;
}

interface UseTokenCreatorParams {
  packageId: string;
}

interface UseTokenCreatorReturn {
  loading: boolean;
  error: Error | null;
  createToken: (config: TokenConfig) => Promise<void>;
  pauseToken: (configId: string) => Promise<void>;
  unpauseToken: (configId: string) => Promise<void>;
  freezeAddress: (configId: string, addressToFreeze: string) => Promise<void>;
  unfreezeAddress: (configId: string, addressToUnfreeze: string) => Promise<void>;
  updateMetadata: (
    metadataId: string,
    name: string,
    description: string,
    iconUrl: string
  ) => Promise<void>;
  lockMetadata: (metadataId: string) => Promise<void>;
}

/**
 * Hook for Token Creator smart contract interactions
 * 
 * Functions:
 * - createToken(config): Create a new token with specified configuration
 * - pauseToken(configId): Pause token transfers (admin only)
 * - unpauseToken(configId): Unpause token transfers (admin only)
 * - freezeAddress(configId, address): Freeze an address (admin only)
 * - unfreezeAddress(configId, address): Unfreeze an address (admin only)
 * - updateMetadata(metadataId, name, description, iconUrl): Update token metadata
 * - lockMetadata(metadataId): Lock metadata (make immutable)
 */
export const useTokenCreator = ({ packageId }: UseTokenCreatorParams): UseTokenCreatorReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const createToken = useCallback(
    async (config: TokenConfig) => {
      try {
        setLoading(true);
        setError(null);

        // Validate inputs
        if (config.decimals < 0 || config.decimals > 9) {
          throw new Error('Decimals must be between 0 and 9');
        }
        if (config.name.length > 100) {
          throw new Error('Token name exceeds maximum length of 100 characters');
        }
        if (config.description.length > 1000) {
          throw new Error('Description exceeds maximum length of 1000 characters');
        }

        const tx = new Transaction();

        // Call token_factory::token_creator::create_token
        tx.moveCall({
          target: `${packageId}::token_creator::create_token`,
          arguments: [
            tx.pure.string(config.name),
            tx.pure.string(config.symbol),
            tx.pure.u8(config.decimals),
            tx.pure.string(config.description),
            tx.pure.string(config.iconUrl),
            tx.pure.string(config.moduleName),
            tx.pure.u64(config.initialSupply),
            tx.pure.bool(config.isMintable),
            tx.pure.bool(config.isFreezable),
            tx.pure.bool(config.isPausable),
            tx.pure.address(config.treasuryCapHolder),
            tx.pure.address(config.supplyRecipient),
          ],
        });

        await signAndExecute({
          transaction: tx,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create token'));
      } finally {
        setLoading(false);
      }
    },
    [packageId, signAndExecute]
  );

  const pauseToken = useCallback(
    async (configId: string) => {
      try {
        setLoading(true);
        setError(null);

        const tx = new Transaction();

        // Call token_factory::token_creator::pause_token
        tx.moveCall({
          target: `${packageId}::token_creator::pause_token`,
          arguments: [tx.object(configId)],
        });

        await signAndExecute({
          transaction: tx,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to pause token'));
      } finally {
        setLoading(false);
      }
    },
    [packageId, signAndExecute]
  );

  const unpauseToken = useCallback(
    async (configId: string) => {
      try {
        setLoading(true);
        setError(null);

        const tx = new Transaction();

        // Call token_factory::token_creator::unpause_token
        tx.moveCall({
          target: `${packageId}::token_creator::unpause_token`,
          arguments: [tx.object(configId)],
        });

        await signAndExecute({
          transaction: tx,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to unpause token'));
      } finally {
        setLoading(false);
      }
    },
    [packageId, signAndExecute]
  );

  const freezeAddress = useCallback(
    async (configId: string, addressToFreeze: string) => {
      try {
        setLoading(true);
        setError(null);

        const tx = new Transaction();

        // Call token_factory::token_creator::freeze_address
        tx.moveCall({
          target: `${packageId}::token_creator::freeze_address`,
          arguments: [
            tx.object(configId),
            tx.pure.address(addressToFreeze),
          ],
        });

        await signAndExecute({
          transaction: tx,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to freeze address'));
      } finally {
        setLoading(false);
      }
    },
    [packageId, signAndExecute]
  );

  const unfreezeAddress = useCallback(
    async (configId: string, addressToUnfreeze: string) => {
      try {
        setLoading(true);
        setError(null);

        const tx = new Transaction();

        // Call token_factory::token_creator::unfreeze_address
        tx.moveCall({
          target: `${packageId}::token_creator::unfreeze_address`,
          arguments: [
            tx.object(configId),
            tx.pure.address(addressToUnfreeze),
          ],
        });

        await signAndExecute({
          transaction: tx,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to unfreeze address'));
      } finally {
        setLoading(false);
      }
    },
    [packageId, signAndExecute]
  );

  const updateMetadata = useCallback(
    async (metadataId: string, name: string, description: string, iconUrl: string) => {
      try {
        setLoading(true);
        setError(null);

        // Validate inputs
        if (name.length > 100) {
          throw new Error('Token name exceeds maximum length of 100 characters');
        }
        if (description.length > 1000) {
          throw new Error('Description exceeds maximum length of 1000 characters');
        }

        const tx = new Transaction();

        // Call token_factory::token_creator::update_metadata
        tx.moveCall({
          target: `${packageId}::token_creator::update_metadata`,
          arguments: [
            tx.object(metadataId),
            tx.pure.string(name),
            tx.pure.string(description),
            tx.pure.string(iconUrl),
          ],
        });

        await signAndExecute({
          transaction: tx,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update metadata'));
      } finally {
        setLoading(false);
      }
    },
    [packageId, signAndExecute]
  );

  const lockMetadata = useCallback(
    async (metadataId: string) => {
      try {
        setLoading(true);
        setError(null);

        const tx = new Transaction();

        // Call token_factory::token_creator::lock_metadata
        tx.moveCall({
          target: `${packageId}::token_creator::lock_metadata`,
          arguments: [tx.object(metadataId)],
        });

        await signAndExecute({
          transaction: tx,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to lock metadata'));
      } finally {
        setLoading(false);
      }
    },
    [packageId, signAndExecute]
  );

  return {
    loading,
    error,
    createToken,
    pauseToken,
    unpauseToken,
    freezeAddress,
    unfreezeAddress,
    updateMetadata,
    lockMetadata,
  };
};
