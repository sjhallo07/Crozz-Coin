/**
 * Sui Event Handlers and Polling System
 * Implements event querying, polling, and processing logic
 * Based on: https://docs.sui.io/guides/developer/sui-101/using-events
 */

import { SuiClient, SuiEvent, SuiEventFilter, EventId } from "@mysten/sui/client";

// ============================================================================
// EVENT HANDLER TYPES AND INTERFACES
// ============================================================================

/**
 * Interface for event tracking configuration
 */
export interface EventTracker {
  type: string; // "package::module" format
  filter: SuiEventFilter;
  callback: (events: SuiEvent[], type: string) => Promise<void>;
  enabled: boolean;
  lastProcessedCursor?: EventId;
}

/**
 * Event processing result
 */
export interface EventProcessingResult {
  cursor: EventId | null | undefined;
  hasNextPage: boolean;
  eventsProcessed: number;
  error?: string;
}

/**
 * Event polling configuration
 */
export interface PollingConfig {
  intervalMs: number;
  maxEventsPerQuery: number;
  enableAdaptivePolling: boolean;
  minIntervalMs: number;
  maxIntervalMs: number;
  retryAttempts: number;
  retryDelayMs: number;
}

// ============================================================================
// LOCK EVENT HANDLERS
// ============================================================================

/**
 * Lock event types from Move
 */
export type LockEvent = LockCreated | LockDestroyed;

export interface LockCreated {
  creator: string;
  lock_id: string;
  key_id: string;
  item_id: string;
}

export interface LockDestroyed {
  lock_id: string;
}

/**
 * Handler for lock-related events
 * Updates database with lock state changes
 */
export const handleLockObjects = async (
  events: SuiEvent[],
  type: string
): Promise<void> => {
  const updates: Record<string, any> = {};

  for (const event of events) {
    // Validate event type
    if (!event.type.startsWith(type)) {
      throw new Error(`Invalid event module origin: expected ${type}, got ${event.type}`);
    }

    const data = event.parsedJson as LockEvent;
    const isDeletionEvent = !("key_id" in data);

    // Initialize update record if not exists
    if (!Object.prototype.hasOwnProperty.call(updates, data.lock_id)) {
      updates[data.lock_id] = {
        objectId: data.lock_id,
        txDigest: event.id.txDigest,
        eventSeq: event.id.eventSeq,
        timestamp: event.timestampMs,
      };
    }

    // Handle deletion event
    if (isDeletionEvent) {
      updates[data.lock_id].deleted = true;
      updates[data.lock_id].deletedAt = event.timestampMs;
      continue;
    }

    // Handle creation event
    updates[data.lock_id].keyId = (data as LockCreated).key_id;
    updates[data.lock_id].creator = (data as LockCreated).creator;
    updates[data.lock_id].itemId = (data as LockCreated).item_id;
    updates[data.lock_id].createdAt = event.timestampMs;
  }

  // Process updates (in real implementation, would use database)
  console.log(`[Lock Handler] Processing ${Object.keys(updates).length} lock updates`);
  
  // Example: would upsert to database
  for (const [lockId, update] of Object.entries(updates)) {
    console.log(`  Lock ${lockId}:`, update);
  }
};

// ============================================================================
// ESCROW EVENT HANDLERS
// ============================================================================

/**
 * Escrow/Trade event types
 */
export interface EscrowCreatedEvent {
  escrow_id: string;
  sender: string;
  locked_asset_id: string;
  recipient: string;
}

export interface EscrowSwappedEvent {
  escrow_id: string;
  sender: string;
  recipient: string;
  asset_received: string;
}

export interface EscrowCancelledEvent {
  escrow_id: string;
  sender: string;
  refunded_asset: string;
}

export type EscrowEvent = EscrowCreatedEvent | EscrowSwappedEvent | EscrowCancelledEvent;

/**
 * Handler for escrow/trade events
 */
export const handleEscrowObjects = async (
  events: SuiEvent[],
  type: string
): Promise<void> => {
  const escrowUpdates: Record<string, any> = {};
  const tradeHistory: any[] = [];

  for (const event of events) {
    if (!event.type.startsWith(type)) {
      throw new Error(`Invalid event module origin: expected ${type}, got ${event.type}`);
    }

    const data = event.parsedJson as EscrowEvent;

    if (!Object.prototype.hasOwnProperty.call(escrowUpdates, data.escrow_id)) {
      escrowUpdates[data.escrow_id] = {
        escrowId: data.escrow_id,
        sender: data.sender,
        status: "pending",
        events: [],
      };
    }

    // Handle different event types
    if ("locked_asset_id" in data) {
      // EscrowCreatedEvent
      escrowUpdates[data.escrow_id].status = "created";
      escrowUpdates[data.escrow_id].recipient = (data as EscrowCreatedEvent).recipient;
      escrowUpdates[data.escrow_id].lockedAssetId = (data as EscrowCreatedEvent).locked_asset_id;
      escrowUpdates[data.escrow_id].createdAt = event.timestampMs;
    } else if ("asset_received" in data) {
      // EscrowSwappedEvent
      escrowUpdates[data.escrow_id].status = "swapped";
      escrowUpdates[data.escrow_id].assetReceived = (data as EscrowSwappedEvent).asset_received;
      escrowUpdates[data.escrow_id].completedAt = event.timestampMs;

      // Record in trade history
      tradeHistory.push({
        escrowId: data.escrow_id,
        initiator: data.sender,
        counterparty: (data as EscrowSwappedEvent).recipient,
        asset: (data as EscrowSwappedEvent).asset_received,
        timestamp: event.timestampMs,
        txDigest: event.id.txDigest,
      });
    } else {
      // EscrowCancelledEvent
      escrowUpdates[data.escrow_id].status = "cancelled";
      escrowUpdates[data.escrow_id].cancelledAt = event.timestampMs;
    }

    escrowUpdates[data.escrow_id].events.push({
      type: event.type,
      timestamp: event.timestampMs,
    });
  }

  console.log(`[Escrow Handler] Processing ${Object.keys(escrowUpdates).length} escrows`);
  console.log(`[Escrow Handler] Trade history entries: ${tradeHistory.length}`);
  
  for (const [escrowId, update] of Object.entries(escrowUpdates)) {
    console.log(`  Escrow ${escrowId}:`, update);
  }
};

// ============================================================================
// GAME STATE EVENT HANDLERS
// ============================================================================

/**
 * Game event types
 */
export interface GameCreatedEvent {
  game_id: string;
  creator: string;
  size: number;
  timestamp: number;
}

export interface GameMoveMadeEvent {
  game_id: string;
  player: string;
  position: number;
  outcome: number; // 0 = ongoing, 1 = won, 2 = lost
}

export interface GameFinishedEvent {
  game_id: string;
  winner: string;
  final_outcome: number;
}

export type GameEvent = GameCreatedEvent | GameMoveMadeEvent | GameFinishedEvent;

/**
 * Handler for game events
 */
export const handleGameEvents = async (
  events: SuiEvent[],
  type: string
): Promise<void> => {
  const gameUpdates: Record<string, any> = {};
  const moves: any[] = [];
  const completions: any[] = [];

  for (const event of events) {
    if (!event.type.startsWith(type)) {
      throw new Error(`Invalid event module origin: expected ${type}, got ${event.type}`);
    }

    const data = event.parsedJson as GameEvent;

    if (!Object.prototype.hasOwnProperty.call(gameUpdates, data.game_id)) {
      gameUpdates[data.game_id] = {
        gameId: data.game_id,
        status: "unknown",
        moveCount: 0,
      };
    }

    // Handle different event types
    if ("size" in data) {
      // GameCreatedEvent
      gameUpdates[data.game_id].creator = (data as GameCreatedEvent).creator;
      gameUpdates[data.game_id].size = (data as GameCreatedEvent).size;
      gameUpdates[data.game_id].createdAt = (data as GameCreatedEvent).timestamp;
      gameUpdates[data.game_id].status = "active";
    } else if ("position" in data) {
      // GameMoveMadeEvent
      const moveData = data as GameMoveMadeEvent;
      gameUpdates[data.game_id].lastMoveBy = moveData.player;
      gameUpdates[data.game_id].lastMoveAt = event.timestampMs;
      gameUpdates[data.game_id].moveCount++;

      moves.push({
        gameId: data.game_id,
        player: moveData.player,
        position: moveData.position,
        outcome: moveData.outcome,
        timestamp: event.timestampMs,
      });

      if (moveData.outcome !== 0) {
        gameUpdates[data.game_id].status = moveData.outcome === 1 ? "won" : "lost";
      }
    } else if ("winner" in data) {
      // GameFinishedEvent
      const finishData = data as GameFinishedEvent;
      gameUpdates[data.game_id].winner = finishData.winner;
      gameUpdates[data.game_id].finalOutcome = finishData.final_outcome;
      gameUpdates[data.game_id].finishedAt = event.timestampMs;
      gameUpdates[data.game_id].status = "finished";

      completions.push({
        gameId: data.game_id,
        winner: finishData.winner,
        outcome: finishData.final_outcome,
        timestamp: event.timestampMs,
      });
    }
  }

  console.log(`[Game Handler] Processing ${Object.keys(gameUpdates).length} games`);
  console.log(`[Game Handler] Moves recorded: ${moves.length}`);
  console.log(`[Game Handler] Games completed: ${completions.length}`);

  for (const [gameId, update] of Object.entries(gameUpdates)) {
    console.log(`  Game ${gameId}:`, update);
  }
};

// ============================================================================
// GENERIC EVENT PROCESSOR
// ============================================================================

/**
 * Generic event processor with error handling and retry logic
 */
export class EventProcessor {
  private client: SuiClient;
  private config: PollingConfig;
  private trackers: Map<string, EventTracker>;
  private isRunning: boolean = false;

  constructor(client: SuiClient, config: Partial<PollingConfig> = {}) {
    this.client = client;
    this.config = {
      intervalMs: 1000,
      maxEventsPerQuery: 100,
      enableAdaptivePolling: true,
      minIntervalMs: 100,
      maxIntervalMs: 30000,
      retryAttempts: 3,
      retryDelayMs: 1000,
      ...config,
    };
    this.trackers = new Map();
  }

  /**
   * Register an event tracker
   */
  registerTracker(tracker: EventTracker): void {
    this.trackers.set(tracker.type, tracker);
    console.log(`[EventProcessor] Registered tracker for ${tracker.type}`);
  }

  /**
   * Execute a single event query with retry logic
   */
  private async executeEventQuery(
    tracker: EventTracker,
    cursor: EventId | null | undefined
  ): Promise<EventProcessingResult> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        const result = await this.client.queryEvents({
          query: tracker.filter,
          cursor,
          limit: this.config.maxEventsPerQuery,
          order: "ascending",
        });

        if (result.data.length > 0 || result.hasNextPage) {
          // Process events through callback
          await tracker.callback(result.data, tracker.type);

          return {
            cursor: result.nextCursor,
            hasNextPage: result.hasNextPage,
            eventsProcessed: result.data.length,
          };
        }

        return {
          cursor,
          hasNextPage: false,
          eventsProcessed: 0,
        };
      } catch (error) {
        lastError = error as Error;
        console.error(
          `[EventProcessor] Query attempt ${attempt + 1}/${this.config.retryAttempts} failed:`,
          lastError.message
        );

        if (attempt < this.config.retryAttempts - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.config.retryDelayMs * Math.pow(2, attempt))
          );
        }
      }
    }

    return {
      cursor,
      hasNextPage: false,
      eventsProcessed: 0,
      error: lastError?.message || "Unknown error",
    };
  }

  /**
   * Run event processing job for a single tracker
   */
  private async runTrackerJob(tracker: EventTracker, cursor: EventId | null | undefined) {
    if (!tracker.enabled) {
      return;
    }

    const result = await this.executeEventQuery(tracker, cursor);

    if (result.error) {
      console.error(`[EventProcessor] Error processing ${tracker.type}:`, result.error);
    }

    if (result.eventsProcessed > 0) {
      console.log(
        `[EventProcessor] ${tracker.type}: processed ${result.eventsProcessed} events`
      );
    }

    // Update cursor for next poll
    if (result.cursor && result.eventsProcessed > 0) {
      tracker.lastProcessedCursor = result.cursor;
    }

    // Schedule next poll with adaptive interval
    const nextInterval = result.hasNextPage
      ? this.config.minIntervalMs // Poll faster if more events available
      : this.config.intervalMs;

    setTimeout(() => {
      this.runTrackerJob(tracker, result.cursor);
    }, nextInterval);
  }

  /**
   * Start event processing for all trackers
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn("[EventProcessor] Already running");
      return;
    }

    this.isRunning = true;
    console.log("[EventProcessor] Starting event processing...");

    // Start polling job for each tracker
    for (const [, tracker] of this.trackers) {
      this.runTrackerJob(tracker, tracker.lastProcessedCursor);
    }
  }

  /**
   * Stop event processing
   */
  stop(): void {
    this.isRunning = false;
    console.log("[EventProcessor] Event processing stopped");
  }

  /**
   * Get current status
   */
  getStatus(): {
    isRunning: boolean;
    trackers: Array<{
      type: string;
      enabled: boolean;
      lastCursor?: EventId | null;
    }>;
  } {
    return {
      isRunning: this.isRunning,
      trackers: Array.from(this.trackers.values()).map((t) => ({
        type: t.type,
        enabled: t.enabled,
        lastCursor: t.lastProcessedCursor,
      })),
    };
  }
}

// ============================================================================
// CROZZ SPECIFIC EVENT PROCESSORS
// ============================================================================

/**
 * Create a complete CROZZ event processor with all game/trade handlers
 */
export const createCrozzEventProcessor = (client: SuiClient, packageId: string) => {
  const processor = new EventProcessor(client, {
    intervalMs: 5000,
    maxEventsPerQuery: 50,
    enableAdaptivePolling: true,
  });

  // Register lock event tracker
  processor.registerTracker({
    type: `${packageId}::lock`,
    filter: {
      MoveEventModule: {
        package: packageId,
        module: "lock",
      },
    },
    callback: handleLockObjects,
    enabled: true,
  });

  // Register escrow event tracker
  processor.registerTracker({
    type: `${packageId}::shared`,
    filter: {
      MoveEventModule: {
        package: packageId,
        module: "shared",
      },
    },
    callback: handleEscrowObjects,
    enabled: true,
  });

  // Register game event tracker
  processor.registerTracker({
    type: `${packageId}::game`,
    filter: {
      MoveEventModule: {
        package: packageId,
        module: "game",
      },
    },
    callback: handleGameEvents,
    enabled: true,
  });

  return processor;
};

// ============================================================================
// EVENT QUERY BUILDERS
// ============================================================================

/**
 * Utility class for building event queries
 */
export class EventQueryBuilder {
  /**
   * Query events by transaction digest
   */
  static byTransaction(txDigest: string): SuiEventFilter {
    return { Transaction: txDigest };
  }

  /**
   * Query events from a specific module
   */
  static byModule(packageId: string, module: string): SuiEventFilter {
    return {
      MoveModule: {
        package: packageId,
        module,
      },
    };
  }

  /**
   * Query events of a specific type
   */
  static byEventType(eventType: string): SuiEventFilter {
    return { MoveEventType: eventType };
  }

  /**
   * Query events by sender address
   */
  static bySender(sender: string): SuiEventFilter {
    return { Sender: sender };
  }

  /**
   * Query events in a time range
   */
  static byTimeRange(startTime: number | string, endTime: number | string): SuiEventFilter {
    return {
      TimeRange: {
        startTime: typeof startTime === "number" ? startTime.toString() : startTime,
        endTime: typeof endTime === "number" ? endTime.toString() : endTime,
      },
    };
  }

  /**
   * Combine multiple filters with OR logic
   */
  static any(...filters: SuiEventFilter[]): SuiEventFilter {
    return { Any: filters };
  }
}

// ============================================================================
// EVENT STATISTICS AND MONITORING
// ============================================================================

/**
 * Event processing statistics
 */
export interface EventStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySender: Record<string, number>;
  eventsPerSecond: number;
  lastProcessedTime: number;
}

/**
 * Collector for event statistics
 */
export class EventStatsCollector {
  private events: SuiEvent[] = [];
  private startTime: number = Date.now();

  addEvents(events: SuiEvent[]): void {
    this.events.push(...events);
  }

  getStats(): EventStats {
    const eventsByType: Record<string, number> = {};
    const eventsBySender: Record<string, number> = {};

    for (const event of this.events) {
      eventsByType[event.type] = (eventsByType[event.type] ?? 0) + 1;
      eventsBySender[event.sender] = (eventsBySender[event.sender] ?? 0) + 1;
    }

    const elapsedSeconds = (Date.now() - this.startTime) / 1000;

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySender,
      eventsPerSecond: this.events.length / elapsedSeconds,
      lastProcessedTime: Date.now(),
    };
  }

  reset(): void {
    this.events = [];
    this.startTime = Date.now();
  }
}

export default {
  EventProcessor,
  EventQueryBuilder,
  EventStatsCollector,
  createCrozzEventProcessor,
  handleLockObjects,
  handleEscrowObjects,
  handleGameEvents,
};
