/**
 * React Hooks for Sui On-Chain Time
 * Hooks for Clock timestamps, cooldowns, and timelocks
 */

import { useEffect, useState } from 'react';
import { SuiClient } from '@mysten/sui/client';
import {
  getCurrentClockTimestamp,
  isCooldownExpired,
  getRemainingCooldown,
  getCooldownProgress,
  isTimelockExpired,
  getRemainingTimelock,
  getTimelockProgress,
  formatDuration,
} from '../utils/timeUtils';

// ============================================================================
// CLOCK TIMESTAMP HOOK
// ============================================================================

export interface UseClockTimestampResult {
  timestamp: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * React hook for Clock timestamp with auto-refresh
 * 
 * @param client - SuiClient instance
 * @param refreshIntervalMs - How often to refresh (default: 1000ms)
 * @returns Current Clock timestamp, loading state, and error
 * 
 * @example
 * ```tsx
 * const { timestamp, loading, error } = useClockTimestamp(client, 1000);
 * 
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 * 
 * return <div>Current time: {timestamp}ms</div>;
 * ```
 */
export function useClockTimestamp(
  client: SuiClient | null,
  refreshIntervalMs: number = 1000
): UseClockTimestampResult {
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimestamp = async () => {
    if (!client) return;

    try {
      const ts = await getCurrentClockTimestamp(client);
      setTimestamp(ts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!client) return;

    let mounted = true;

    const wrappedFetch = async () => {
      if (!mounted) return;
      await fetchTimestamp();
    };

    // Initial fetch
    wrappedFetch();

    // Setup interval for refresh
    const interval = setInterval(wrappedFetch, refreshIntervalMs);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [client, refreshIntervalMs]);

  return { timestamp, loading, error, refetch: fetchTimestamp };
}

// ============================================================================
// COOLDOWN HOOK
// ============================================================================

export interface UseCooldownResult {
  remaining: number;
  progress: number;
  expired: boolean;
  formattedRemaining: string;
}

/**
 * React hook for cooldown tracking with live updates
 * 
 * @param lastActionMs - Timestamp of last action
 * @param cooldownDurationMs - Cooldown duration in milliseconds
 * @param updateIntervalMs - How often to update (default: 100ms)
 * @returns Cooldown state with remaining time and progress
 * 
 * @example
 * ```tsx
 * const { remaining, progress, expired, formattedRemaining } = useCooldown(
 *   lastActionTime,
 *   60000 // 1 minute cooldown
 * );
 * 
 * return (
 *   <div>
 *     <div>Status: {expired ? 'Ready!' : 'Cooling down...'}</div>
 *     <div>Remaining: {formattedRemaining}</div>
 *     <ProgressBar value={progress * 100} />
 *   </div>
 * );
 * ```
 */
export function useCooldown(
  lastActionMs: number,
  cooldownDurationMs: number,
  updateIntervalMs: number = 100
): UseCooldownResult {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    // Check if already expired
    const initialExpired = isCooldownExpired(lastActionMs, cooldownDurationMs, Date.now());
    if (initialExpired) {
      return; // Don't start interval if already expired
    }

    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      // Stop interval when expired
      const expired = isCooldownExpired(lastActionMs, cooldownDurationMs, now);
      if (expired) {
        clearInterval(interval);
      }
    }, updateIntervalMs);

    return () => clearInterval(interval);
  }, [lastActionMs, cooldownDurationMs, updateIntervalMs]);

  const remaining = getRemainingCooldown(lastActionMs, cooldownDurationMs, currentTime);
  const progress = getCooldownProgress(lastActionMs, cooldownDurationMs, currentTime);
  const expired = isCooldownExpired(lastActionMs, cooldownDurationMs, currentTime);

  return {
    remaining,
    progress,
    expired,
    formattedRemaining: formatDuration(remaining),
  };
}

// ============================================================================
// TIMELOCK HOOK
// ============================================================================

export interface UseTimelockResult {
  remaining: number;
  progress: number;
  expired: boolean;
  formattedRemaining: string;
  unlockDate: Date;
}

/**
 * React hook for timelock tracking with live updates
 * 
 * @param lockTimeMs - Timestamp when locked
 * @param unlockTimeMs - Timestamp when unlocks
 * @param updateIntervalMs - How often to update (default: 1000ms)
 * @returns Timelock state with remaining time and progress
 * 
 * @example
 * ```tsx
 * const { remaining, progress, expired, formattedRemaining, unlockDate } = useTimelock(
 *   lockTime,
 *   unlockTime
 * );
 * 
 * return (
 *   <div>
 *     <div>Status: {expired ? 'Unlocked!' : 'Locked'}</div>
 *     <div>Unlocks: {unlockDate.toLocaleString()}</div>
 *     <div>Remaining: {formattedRemaining}</div>
 *     <ProgressBar value={progress * 100} />
 *   </div>
 * );
 * ```
 */
export function useTimelock(
  lockTimeMs: number,
  unlockTimeMs: number,
  updateIntervalMs: number = 1000
): UseTimelockResult {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    // Check if already expired
    const initialExpired = isTimelockExpired(unlockTimeMs, Date.now());
    if (initialExpired) {
      return; // Don't start interval if already expired
    }

    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      // Stop interval when expired
      const expired = isTimelockExpired(unlockTimeMs, now);
      if (expired) {
        clearInterval(interval);
      }
    }, updateIntervalMs);

    return () => clearInterval(interval);
  }, [unlockTimeMs, updateIntervalMs]);

  const remaining = getRemainingTimelock(unlockTimeMs, currentTime);
  const progress = getTimelockProgress(lockTimeMs, unlockTimeMs, currentTime);
  const expired = isTimelockExpired(unlockTimeMs, currentTime);

  return {
    remaining,
    progress,
    expired,
    formattedRemaining: formatDuration(remaining),
    unlockDate: new Date(unlockTimeMs),
  };
}

// ============================================================================
// COUNTDOWN HOOK
// ============================================================================

export interface UseCountdownResult {
  remaining: number;
  expired: boolean;
  formattedRemaining: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * React hook for countdown to specific timestamp
 * 
 * @param targetTimeMs - Target timestamp
 * @param updateIntervalMs - How often to update (default: 1000ms)
 * @returns Countdown state with time components
 * 
 * @example
 * ```tsx
 * const { expired, days, hours, minutes, seconds } = useCountdown(auctionEndTime);
 * 
 * if (expired) return <div>Auction ended!</div>;
 * 
 * return (
 *   <div>
 *     Time remaining: {days}d {hours}h {minutes}m {seconds}s
 *   </div>
 * );
 * ```
 */
export function useCountdown(
  targetTimeMs: number,
  updateIntervalMs: number = 1000
): UseCountdownResult {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      // Stop when expired
      if (now >= targetTimeMs) {
        clearInterval(interval);
      }
    }, updateIntervalMs);

    return () => clearInterval(interval);
  }, [targetTimeMs, updateIntervalMs]);

  const remaining = Math.max(0, targetTimeMs - currentTime);
  const expired = currentTime >= targetTimeMs;

  const seconds = Math.floor((remaining / 1000) % 60);
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));

  return {
    remaining,
    expired,
    formattedRemaining: formatDuration(remaining),
    days,
    hours,
    minutes,
    seconds,
  };
}

// ============================================================================
// CURRENT TIME HOOK
// ============================================================================

/**
 * Simple hook that updates current timestamp at interval
 * Useful for relative time displays
 * 
 * @param updateIntervalMs - How often to update (default: 1000ms)
 * @returns Current timestamp
 * 
 * @example
 * ```tsx
 * const now = useCurrentTime(1000);
 * 
 * return <div>Last updated: {getRelativeTime(lastUpdateTime, now)}</div>;
 * ```
 */
export function useCurrentTime(updateIntervalMs: number = 1000): number {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, updateIntervalMs);

    return () => clearInterval(interval);
  }, [updateIntervalMs]);

  return currentTime;
}

export default {
  useClockTimestamp,
  useCooldown,
  useTimelock,
  useCountdown,
  useCurrentTime,
};
