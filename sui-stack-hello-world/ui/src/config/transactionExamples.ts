/**
 * Sui Transaction Examples
 * Move code examples and TypeScript patterns for transaction construction
 */

// ============================================================================
// MOVE CODE EXAMPLES
// ============================================================================

export const TRANSACTION_MOVE_EXAMPLES = {
  /**
   * Simple coin transfer
   * Demonstrates basic object passing and transfer_objects
   */
  SIMPLE_TRANSFER: `
module transaction_examples::transfer {
  use sui::coin::{Coin};
  use sui::sui::SUI;
  use sui::transfer;

  public fun transfer_sui(coin: Coin<SUI>, recipient: address) {
    transfer::public_transfer(coin, recipient);
  }
}
  `,

  /**
   * Game action with state update
   * Demonstrates mutable reference and event emission
   */
  GAME_ACTION: `
module crozz::game_action {
  use sui::object::{Object, UID};
  use sui::tx_context::{TxContext};
  use sui::event;

  struct GameState has key {
    id: UID,
    player: address,
    position: u64,
    score: u64,
  }

  struct MoveEvent has copy, drop {
    player: address,
    from_position: u64,
    to_position: u64,
  }

  public fun make_move(
    game: &mut GameState,
    new_position: u64,
    ctx: &TxContext,
  ) {
    let old_position = game.position;
    game.position = new_position;
    game.score = game.score + 1;

    event::emit(MoveEvent {
      player: game.player,
      from_position: old_position,
      to_position: new_position,
    });
  }
}
  `,

  /**
   * Multi-call transaction
   * Demonstrates multiple operations in single transaction
   */
  MULTI_CALL: `
module transaction_examples::multi_call {
  use sui::coin::{Coin};
  use sui::sui::SUI;
  use sui::transfer;

  struct Result has drop {
    success: bool,
  }

  public fun multi_operation(
    coin1: Coin<SUI>,
    coin2: Coin<SUI>,
    recipient: address,
  ): Result {
    // Operation 1: Merge coins
    let mut coin1 = coin1;
    coin1.join(coin2);

    // Operation 2: Transfer
    transfer::public_transfer(coin1, recipient);

    Result { success: true }
  }
}
  `,

  /**
   * Cooldown system
   * Demonstrates time-based mechanics with Clock
   */
  COOLDOWN_SYSTEM: `
module crozz::cooldown {
  use sui::object::{Object, UID};
  use sui::clock::Clock;
  use sui::tx_context::{TxContext};

  struct CooldownState has key {
    id: UID,
    last_action: u64,
    cooldown_duration: u64,
  }

  public fun can_perform_action(
    state: &CooldownState,
    clock: &Clock,
  ): bool {
    let current_time = clock.timestamp_ms();
    let next_available = state.last_action + state.cooldown_duration;
    current_time >= next_available
  }

  public fun perform_action(
    state: &mut CooldownState,
    clock: &Clock,
    ctx: &TxContext,
  ) {
    assert!(can_perform_action(state, clock), 1);
    state.last_action = clock.timestamp_ms();
  }
}
  `,

  /**
   * Multisig transaction
   * Demonstrates approval pattern
   */
  MULTISIG_APPROVAL: `
module crozz::multisig {
  use sui::object::{Object, UID};
  use std::vector;

  struct MultiSigApproval has key {
    id: UID,
    approvers: vector<address>,
    required_approvals: u64,
    approvals: vector<address>,
  }

  public fun add_approval(
    approval: &mut MultiSigApproval,
    approver: address,
  ) {
    assert!(!vector::contains(&approval.approvals, &approver), 1);
    vector::push_back(&mut approval.approvals, approver);
  }

  public fun is_approved(approval: &MultiSigApproval): bool {
    vector::length(&approval.approvals) >= approval.required_approvals
  }
}
  `,

  /**
   * Gas-efficient batch operations
   * Demonstrates vector operations
   */
  BATCH_OPERATIONS: `
module transaction_examples::batch {
  use sui::coin::{Coin};
  use sui::sui::SUI;
  use sui::transfer;
  use std::vector;

  public fun batch_transfer(
    coins: vector<Coin<SUI>>,
    recipients: vector<address>,
  ) {
    assert!(vector::length(&coins) == vector::length(&recipients), 1);

    let mut i = 0;
    while (i < vector::length(&coins)) {
      let coin = vector::pop_back(&mut coins);
      let recipient = vector::pop_back(&mut recipients);
      transfer::public_transfer(coin, recipient);
      i = i + 1;
    };
  }
}
  `,
};

// ============================================================================
// TYPESCRIPT TRANSACTION EXAMPLES
// ============================================================================

export const TRANSACTION_TYPESCRIPT_EXAMPLES = {
  /**
   * Simple SUI transfer
   */
  SIMPLE_TRANSFER: `
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

async function transferSUI(
  client: SuiClient,
  keypair: Ed25519Keypair,
  recipient: string,
  amount: number,
) {
  const tx = new Transaction();
  const [coin] = tx.splitCoins(tx.gas, [tx.pure(amount)]);
  tx.transferObjects([coin], tx.pure(recipient));

  const bytes = await tx.build({ client });
  const signature = await keypair.signTransaction(bytes);

  return await client.executeTransactionBlock({
    transactionBlock: bytes,
    signature: signature.signature,
  });
}
  `,

  /**
   * Game action with event
   */
  GAME_ACTION: `
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';

async function makeGameMove(
  client: SuiClient,
  keypair: Ed25519Keypair,
  gameStateId: string,
  newPosition: number,
) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: 'crozz::game_action::make_move',
    arguments: [
      tx.object(gameStateId),
      tx.pure(newPosition),
    ],
  });

  const bytes = await tx.build({ client });
  const signature = await keypair.signTransaction(bytes);

  return await client.executeTransactionBlock({
    transactionBlock: bytes,
    signature: signature.signature,
  });
}
  `,

  /**
   * Multi-call transaction
   */
  MULTI_CALL: `
import { Transaction } from '@mysten/sui/transactions';

async function performMultiCall(
  client: SuiClient,
  keypair: Ed25519Keypair,
  coin1Id: string,
  coin2Id: string,
  recipient: string,
) {
  const tx = new Transaction();

  // Step 1: Merge coins
  tx.moveCall({
    target: '0x2::coin::join',
    typeArguments: ['0x2::sui::SUI'],
    arguments: [
      tx.object(coin1Id),
      tx.object(coin2Id),
    ],
  });

  // Step 2: Transfer
  tx.moveCall({
    target: '0x2::transfer::public_transfer',
    typeArguments: ['0x2::sui::SUI'],
    arguments: [
      tx.object(coin1Id),
      tx.pure(recipient),
    ],
  });

  const bytes = await tx.build({ client });
  const signature = await keypair.signTransaction(bytes);

  return await client.executeTransactionBlock({
    transactionBlock: bytes,
    signature: signature.signature,
  });
}
  `,

  /**
   * Cooldown check before action
   */
  COOLDOWN_ACTION: `
import { Transaction } from '@mysten/sui/transactions';

async function performActionWithCooldown(
  client: SuiClient,
  keypair: Ed25519Keypair,
  cooldownStateId: string,
) {
  const tx = new Transaction();

  // Check cooldown
  const canPerform = tx.moveCall({
    target: 'crozz::cooldown::can_perform_action',
    arguments: [
      tx.object(cooldownStateId),
      tx.object('0x6'), // Clock singleton
    ],
  });

  // Perform action only if cooldown passed
  tx.moveCall({
    target: 'crozz::cooldown::perform_action',
    arguments: [
      tx.object(cooldownStateId),
      tx.object('0x6'), // Clock singleton
    ],
  });

  const bytes = await tx.build({ client });
  const signature = await keypair.signTransaction(bytes);

  return await client.executeTransactionBlock({
    transactionBlock: bytes,
    signature: signature.signature,
  });
}
  `,

  /**
   * Batch operations
   */
  BATCH_OPERATIONS: `
import { Transaction } from '@mysten/sui/transactions';

async function batchTransfer(
  client: SuiClient,
  keypair: Ed25519Keypair,
  coinIds: string[],
  recipients: string[],
) {
  const tx = new Transaction();

  tx.moveCall({
    target: 'transaction_examples::batch::batch_transfer',
    typeArguments: ['0x2::sui::SUI'],
    arguments: [
      tx.pure(coinIds.map(id => tx.object(id))),
      tx.pure(recipients),
    ],
  });

  const bytes = await tx.build({ client });
  const signature = await keypair.signTransaction(bytes);

  return await client.executeTransactionBlock({
    transactionBlock: bytes,
    signature: signature.signature,
  });
}
  `,

  /**
   * Using TransactionBuilder class
   */
  TRANSACTION_BUILDER: `
import { TransactionBuilder } from './utils/transactionUtils';

async function executeWithBuilder(
  client: SuiClient,
  keypair: Ed25519Keypair,
  recipient: string,
  amount: number,
) {
  const builder = new TransactionBuilder(client, keypair);

  builder
    .setGasBudget(1000000)
    .addMoveCall(
      '0x2::transfer::public_transfer',
      [recipient, amount],
      ['0x2::sui::SUI']
    );

  return await builder.execute();
}
  `,

  /**
   * Batch execution with serial executor
   */
  SERIAL_EXECUTION: `
import { SerialBatchExecutor } from './utils/transactionUtils';

async function executeTransactionBatch(
  client: SuiClient,
  keypair: Ed25519Keypair,
  recipients: string[],
) {
  const executor = new SerialBatchExecutor(client, keypair);

  const builders = recipients.map(recipient => (tx: Transaction) => {
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(1000000000)]);
    tx.transferObjects([coin], tx.pure(recipient));
  });

  const results = await executor.executeBatch(builders, {
    gasBudget: 1000000,
    stopOnError: false,
  });

  return results;
}
  `,

  /**
   * React hook usage
   */
  REACT_HOOK_USAGE: `
import { useTransaction } from './hooks/useTransaction';

function TransactionComponent() {
  const { sign, execute, loading, error } = useTransaction(client, keypair);

  const handleTransfer = async () => {
    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(1000000000)]);
    tx.transferObjects([coin], tx.pure(recipient));

    try {
      const result = await execute(tx);
      console.log('Success:', result);
    } catch (err) {
      console.error('Failed:', err);
    }
  };

  return (
    <button onClick={handleTransfer} disabled={loading}>
      {loading ? 'Executing...' : 'Transfer'}
    </button>
  );
}
  `,
};

// ============================================================================
// BEST PRACTICE PATTERNS
// ============================================================================

export const TRANSACTION_PATTERNS = {
  /**
   * Safe transaction wrapper with retry logic
   */
  SAFE_EXECUTION: `
async function safeExecute<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    delayMs?: number;
  }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const delayMs = options?.delayMs ?? 1000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
    }
  }

  throw new Error('Max retries exceeded');
}
  `,

  /**
   * Transaction validation before submission
   */
  VALIDATION: `
async function validateAndExecute(
  client: SuiClient,
  tx: Transaction,
  keypair: Ed25519Keypair,
): Promise<any> {
  // 1. Build transaction bytes
  const bytes = await tx.build({ client });
  
  // 2. Sign transaction
  const signature = await keypair.signTransaction(bytes);
  
  // 3. Verify signature
  const isValid = await keypair
    .getPublicKey()
    .verifyTransaction(bytes, signature.signature);
  
  if (!isValid) {
    throw new Error('Signature verification failed');
  }

  // 4. Execute transaction
  return await client.executeTransactionBlock({
    transactionBlock: bytes,
    signature: signature.signature,
  });
}
  `,

  /**
   * Gas optimization pattern
   */
  GAS_OPTIMIZATION: `
async function optimizeGas(
  client: SuiClient,
  tx: Transaction,
): Promise<number> {
  const refPrice = await getReferenceGasPrice(client);
  
  // Build to get transaction size
  const bytes = await tx.build({ client });
  
  // Estimate gas units (1000 units per KB, minimum 2000)
  const txSizeKb = bytes.length / 1024;
  const gasUnits = Math.max(2000, Math.ceil(txSizeKb * 1000));
  
  // Set budget with 20% buffer
  const gasBudget = Math.ceil(gasUnits * parseInt(refPrice) * 1.2);
  
  tx.setGasBudget(gasBudget);
  return gasBudget;
}
  `,

  /**
   * Transaction monitoring pattern
   */
  MONITORING: `
async function executeAndMonitor(
  client: SuiClient,
  tx: Transaction,
  keypair: Ed25519Keypair,
  maxWaitMs?: number,
): Promise<any> {
  const maxWait = maxWaitMs ?? 60000; // 1 minute
  
  // Execute transaction
  const result = await client.executeTransactionBlock({
    transactionBlock: await tx.build({ client }),
    signature: (await keypair.signTransaction(
      await tx.build({ client })
    )).signature,
  });

  const txDigest = result.digest;
  const startTime = Date.now();

  // Poll for completion
  while (Date.now() - startTime < maxWait) {
    const tx = await client.getTransactionBlock({
      digest: txDigest,
      options: { showEffects: true },
    });

    if (tx.effects?.status.status === 'success') {
      return tx;
    } else if (tx.effects?.status.status === 'failure') {
      throw new Error(\`Transaction failed: \${tx.effects.status.error}\`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('Transaction timeout');
}
  `,
};

export default {
  TRANSACTION_MOVE_EXAMPLES,
  TRANSACTION_TYPESCRIPT_EXAMPLES,
  TRANSACTION_PATTERNS,
};
