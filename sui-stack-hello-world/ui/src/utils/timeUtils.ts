/**
 * Sui On-Chain Time Utilities
 * TypeScript utilities for working with Clock and Epoch timestamps
 */

import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Sui Clock singleton address
 * This is the ONLY Clock instance in Sui
 */
export const CLOCK_OBJECT_ID = '0x6';

/**
 * Time constants
 */
export const TIME_CONSTANTS = {
  MS_PER_SECOND: 1000,
  MS_PER_MINUTE: 60000,
  MS_PER_HOUR: 3600000,
  MS_PER_DAY: 86400000,
  MS_PER_WEEK: 604800000,
  
  SECONDS_PER_MINUTE: 60,
  SECONDS_PER_HOUR: 3600,
  SECONDS_PER_DAY: 86400,
  
  // Sui-specific
  CHECKPOINT_FREQUENCY_MS: 250, // ~0.25 seconds
  EPOCH_DURATION_MS: 86400000,  // ~24 hours
};

// ============================================================================
// CLOCK UTILITIES
// ============================================================================

/**
 * Clock transaction builder
 */
export class ClockTransactionBuilder {
  private tx: Transaction;

  constructor() {
    this.tx = new Transaction();
  }

  /**
   * Add Clock object to transaction
   * @returns Clock argument for use in moveCall
   */
  addClockArgument() {
    return this.tx.object(CLOCK_OBJECT_ID);
  }

  /**
   * Call a function that requires Clock
   */
  callWithClock(
    target: string,
    args: any[] = [],
    typeArguments: string[] = []
  ) {
    const clockArg = this.addClockArgument();
    
    this.tx.moveCall({
      target,
      arguments: [...args, clockArg],
      typeArguments,
    });

    return this;
  }

  /**
   * Get the built transaction
   */
  build(): Transaction {
    return this.tx;
  }
}

/**
 * Query current Clock timestamp
 */
export async function getCurrentClockTimestamp(
  client: SuiClient
): Promise<number> {
  try {
    const clockObject = await client.getObject({
      id: CLOCK_OBJECT_ID,
      options: { showContent: true }
    });

    if (clockObject.data?.content?.dataType === 'moveObject') {
      const fields = clockObject.data.content.fields as any;
      return Number(fields.timestamp_ms);
    }

    throw new Error('Failed to read Clock timestamp');
  } catch (error) {
    console.error('Error reading Clock:', error);
    throw error;
  }
}

/**
 * Wait for next checkpoint (Clock update)
 * Useful for testing time-dependent logic
 */
export async function waitForNextCheckpoint(
  client: SuiClient,
  timeoutMs: number = 5000
): Promise<number> {
  const startTime = await getCurrentClockTimestamp(client);
  const endTime = Date.now() + timeoutMs;

  while (Date.now() < endTime) {
    const currentTime = await getCurrentClockTimestamp(client);
    if (currentTime > startTime) {
      return currentTime;
    }
    // Wait ~checkpoint duration before checking again
    await new Promise(resolve => setTimeout(resolve, TIME_CONSTANTS.CHECKPOINT_FREQUENCY_MS));
  }

  throw new Error('Timeout waiting for checkpoint');
}

// ============================================================================
// TIME FORMATTING
// ============================================================================

/**
 * Format milliseconds to human-readable duration
 */
export function formatDuration(ms: number): string {
  const days = Math.floor(ms / TIME_CONSTANTS.MS_PER_DAY);
  const hours = Math.floor((ms % TIME_CONSTANTS.MS_PER_DAY) / TIME_CONSTANTS.MS_PER_HOUR);
  const minutes = Math.floor((ms % TIME_CONSTANTS.MS_PER_HOUR) / TIME_CONSTANTS.MS_PER_MINUTE);
  const seconds = Math.floor((ms % TIME_CONSTANTS.MS_PER_MINUTE) / TIME_CONSTANTS.MS_PER_SECOND);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.length > 0 ? parts.join(' ') : '0s';
}

/**
 * Format timestamp to ISO string
 */
export function formatTimestamp(timestampMs: number): string {
  return new Date(timestampMs).toISOString();
}

/**
 * Format timestamp to localized string
 */
export function formatTimestampLocalized(timestampMs: number, locale: string = 'en-US'): string {
  return new Date(timestampMs).toLocaleString(locale);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(timestampMs: number, currentMs?: number): string {
  const now = currentMs || Date.now();
  const diffMs = now - timestampMs;

  if (diffMs < 0) {
    return 'in the future';
  }

  const diffSeconds = Math.floor(diffMs / TIME_CONSTANTS.MS_PER_SECOND);
  const diffMinutes = Math.floor(diffMs / TIME_CONSTANTS.MS_PER_MINUTE);
  const diffHours = Math.floor(diffMs / TIME_CONSTANTS.MS_PER_HOUR);
  const diffDays = Math.floor(diffMs / TIME_CONSTANTS.MS_PER_DAY);

  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

// ============================================================================
// COOLDOWN UTILITIES
// ============================================================================

/**
 * Check if cooldown has expired
 */
export function isCooldownExpired(
  lastActionMs: number,
  cooldownDurationMs: number,
  currentMs: number
): boolean {
  const timePassed = currentMs - lastActionMs;
  return timePassed >= cooldownDurationMs;
}

/**
 * Get remaining cooldown time
 */
export function getRemainingCooldown(
  lastActionMs: number,
  cooldownDurationMs: number,
  currentMs: number
): number {
  const timePassed = currentMs - lastActionMs;
  const remaining = cooldownDurationMs - timePassed;
  return Math.max(0, remaining);
}

/**
 * Calculate cooldown progress (0-1)
 */
export function getCooldownProgress(
  lastActionMs: number,
  cooldownDurationMs: number,
  currentMs: number
): number {
  const timePassed = currentMs - lastActionMs;
  const progress = timePassed / cooldownDurationMs;
  return Math.min(1, Math.max(0, progress));
}

// ============================================================================
// TIMELOCK UTILITIES
// ============================================================================

/**
 * Check if timelock has expired
 */
export function isTimelockExpired(
  unlockTimeMs: number,
  currentMs: number
): boolean {
  return currentMs >= unlockTimeMs;
}

/**
 * Get remaining timelock duration
 */
export function getRemainingTimelock(
  unlockTimeMs: number,
  currentMs: number
): number {
  const remaining = unlockTimeMs - currentMs;
  return Math.max(0, remaining);
}

/**
 * Calculate timelock progress (0-1)
 */
export function getTimelockProgress(
  lockTimeMs: number,
  unlockTimeMs: number,
  currentMs: number
): number {
  const duration = unlockTimeMs - lockTimeMs;
  const elapsed = currentMs - lockTimeMs;
  const progress = elapsed / duration;
  return Math.min(1, Math.max(0, progress));
}

// ============================================================================
// EPOCH UTILITIES
// ============================================================================

/**
 * Calculate days until next epoch
 */
export function getDaysUntilNextEpoch(currentEpochStartMs: number): number {
  const nextEpochMs = currentEpochStartMs + TIME_CONSTANTS.EPOCH_DURATION_MS;
  const nowMs = Date.now();
  const remainingMs = nextEpochMs - nowMs;
  return Math.max(0, remainingMs / TIME_CONSTANTS.MS_PER_DAY);
}

/**
 * Check if enough time has passed since epoch start
 */
export function hasEpochTimePassed(
  currentEpochStartMs: number,
  requiredDurationMs: number
): boolean {
  const nowMs = Date.now();
  const elapsedMs = nowMs - currentEpochStartMs;
  return elapsedMs >= requiredDurationMs;
}

/**
 * Get current epoch number estimate
 * Note: This is approximate - actual epoch from chain is authoritative
 */
export function estimateEpochNumber(genesisTimestampMs: number, currentMs: number): number {
  const elapsedMs = currentMs - genesisTimestampMs;
  return Math.floor(elapsedMs / TIME_CONSTANTS.EPOCH_DURATION_MS);
}

// ============================================================================
// NOTE: React hooks are available in hooks/useTime.ts
// ============================================================================

export default {
  CLOCK_OBJECT_ID,
  TIME_CONSTANTS,
  ClockTransactionBuilder,
  getCurrentClockTimestamp,
  waitForNextCheckpoint,
  formatDuration,
  formatTimestamp,
  formatTimestampLocalized,
  getRelativeTime,
  isCooldownExpired,
  getRemainingCooldown,
  getCooldownProgress,
  isTimelockExpired,
  getRemainingTimelock,
  getTimelockProgress,
  getDaysUntilNextEpoch,
  hasEpochTimePassed,
  estimateEpochNumber,
};
