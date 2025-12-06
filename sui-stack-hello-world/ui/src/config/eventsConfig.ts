/**
 * Sui Events Configuration
 * Implements event emission, querying, and monitoring patterns
 * Based on: https://docs.sui.io/guides/developer/sui-101/using-events
 */

// ============================================================================
// EVENT STRUCTURE AND TYPES
// ============================================================================

/**
 * Core event structure that represents an event on the Sui network
 * Attributes match the Move event::emit structure
 */
export const EVENT_STRUCTURE = {
  description: "Complete event object structure in Sui",
  attributes: {
    id: {
      type: "object",
      description: "Transaction digest ID and event sequence",
      properties: {
        txDigest: "string - transaction digest",
        eventSeq: "string - event sequence number"
      }
    },
    packageId: {
      type: "string",
      description: "Object ID of the package that emits the event"
    },
    transactionModule: {
      type: "string",
      description: "Module that performs the transaction"
    },
    sender: {
      type: "string",
      description: "Sui network address that triggered the event"
    },
    type: {
      type: "string",
      description: "Type of event being emitted (format: package::module::EventName)",
      example: "0x158f2027f60c89bb91526d9bf08831d27f5a0fcb0f74e6698b9f0e1fb2be5d05::deepbook_utils::DepositAsset"
    },
    parsedJson: {
      type: "object",
      description: "JSON object describing the event payload"
    },
    bcs: {
      type: "string",
      description: "Binary canonical serialization value"
    },
    timestampMs: {
      type: "string",
      description: "Unix epoch timestamp in milliseconds"
    }
  }
};

// ============================================================================
// MOVE EVENT EMISSION PATTERNS
// ============================================================================

/**
 * Lock-based event emission pattern
 * Used for escrow and secure object transactions
 */
export const LOCK_EVENT_EMISSION = {
  title: "Lock Event Emission Pattern",
  description: "Emit events when locking objects for secure transactions",
  moveCode: `
use sui::event;
use sui::object::{Self, UID};
use sui::tx_context::TxContext;
use sui::dof;

public struct Locked<T: key + store> has key {
    id: UID,
    key: ID,
}

public struct Key has key {
    id: UID,
}

public struct LockCreated has copy, drop {
    lock_id: ID,
    key_id: ID,
    creator: address,
    item_id: ID,
}

public struct LockDestroyed has copy, drop {
    lock_id: ID,
}

public fun lock<T: key + store>(obj: T, ctx: &mut TxContext): (Locked<T>, Key) {
    let key = Key { id: object::new(ctx) };
    let mut lock = Locked {
        id: object::new(ctx),
        key: object::id(&key),
    };

    // Emit event when lock is created
    event::emit(LockCreated {
        lock_id: object::id(&lock),
        key_id: object::id(&key),
        creator: ctx.sender(),
        item_id: object::id(&obj),
    });

    dof::add(&mut lock.id, LockedObjectKey {}, obj);

    (lock, key)
}

public fun unlock<T: key + store>(locked: Locked<T>, _key: Key, ctx: &mut TxContext): T {
    let Locked { id, key } = locked;
    let obj = dof::remove(&mut id, LockedObjectKey {});
    
    // Emit event when lock is destroyed
    event::emit(LockDestroyed {
        lock_id: object::id(&id),
    });
    
    object::delete(id);
    obj
}
  `,
  characteristics: [
    "Events fired at creation and destruction of locks",
    "Includes creator address, object IDs, and key relationships",
    "Enables tracking of locked objects throughout their lifecycle",
    "Uses copy + drop for event types (required for emit)"
  ]
};

/**
 * Game state event emission pattern
 * Used for game creation and state changes
 */
export const GAME_STATE_EVENT_EMISSION = {
  title: "Game State Event Emission",
  description: "Emit events for game creation, moves, and completion",
  moveCode: `
use sui::event;

public struct GameCreated has copy, drop {
    game_id: ID,
    creator: address,
    size: u8,
    timestamp: u64,
}

public struct MoveMade has copy, drop {
    game_id: ID,
    player: address,
    position: u8,
    outcome: u8, // 0 = ongoing, 1 = won, 2 = lost
}

public struct GameFinished has copy, drop {
    game_id: ID,
    winner: address,
    final_outcome: u8,
}

public fun create_game(size: u8, ctx: &mut TxContext) -> Game {
    let game = Game {
        id: object::new(ctx),
        // ... game initialization
    };
    
    event::emit(GameCreated {
        game_id: object::id(&game),
        creator: ctx.sender(),
        size,
        timestamp: ctx.epoch(),
    });
    
    game
}

public fun make_move(game: &mut Game, position: u8, ctx: &TxContext) {
    // ... move logic
    
    event::emit(MoveMade {
        game_id: object::id(game),
        player: ctx.sender(),
        position,
        outcome: outcome_value,
    });
}
  `,
  characteristics: [
    "Track game lifecycle events (creation, moves, completion)",
    "Include player addresses and game outcomes",
    "Emit outcome states (ongoing, won, lost)",
    "Enable real-time game status monitoring"
  ]
};

/**
 * Trade/Escrow event emission pattern
 * Used for atomic swaps and trustless trades
 */
export const TRADE_EVENT_EMISSION = {
  title: "Trade/Escrow Event Emission",
  description: "Emit events for escrow creation, swaps, and cancellations",
  moveCode: `
use sui::event;

public struct EscrowCreated has copy, drop {
    escrow_id: ID,
    sender: address,
    locked_asset_id: ID,
    recipient: address,
}

public struct EscrowSwapped has copy, drop {
    escrow_id: ID,
    sender: address,
    recipient: address,
    asset_received: ID,
}

public struct EscrowCancelled has copy, drop {
    escrow_id: ID,
    sender: address,
    refunded_asset: ID,
}

public fun create_escrow<T: key + store>(
    asset: T,
    recipient: address,
    ctx: &mut TxContext
): EscrowContainer<T> {
    let escrow = EscrowContainer {
        id: object::new(ctx),
        sender: ctx.sender(),
        recipient,
        asset_id: object::id(&asset),
    };
    
    event::emit(EscrowCreated {
        escrow_id: object::id(&escrow),
        sender: ctx.sender(),
        locked_asset_id: object::id(&asset),
        recipient,
    });
    
    escrow
}

public fun swap<T: key + store, U: key + store>(
    escrow: EscrowContainer<T>,
    payment: U,
    ctx: &mut TxContext
): (T, U) {
    let asset = escrow.asset;
    
    event::emit(EscrowSwapped {
        escrow_id: object::id(&escrow),
        sender: escrow.sender,
        recipient: ctx.sender(),
        asset_received: object::id(&payment),
    });
    
    (asset, payment)
}

public fun cancel_escrow<T: key + store>(
    escrow: EscrowContainer<T>,
    ctx: &TxContext
): T {
    let asset = escrow.asset;
    
    event::emit(EscrowCancelled {
        escrow_id: object::id(&escrow),
        sender: escrow.sender,
        refunded_asset: object::id(&asset),
    });
    
    asset
}
  `,
  characteristics: [
    "Track escrow lifecycle (creation, swap, cancellation)",
    "Include participant addresses and asset IDs",
    "Enable trustless trade monitoring",
    "Support atomic swap event auditing"
  ]
};

// ============================================================================
// EVENT QUERY FILTERS
// ============================================================================

/**
 * Event filtering options for querying events from the Sui network
 */
export const EVENT_FILTERS = {
  description: "Query filters for event filtering and retrieval",
  filters: {
    All: {
      query: { All: [] },
      description: "All events",
      use_case: "Get all events from the network (use with caution)"
    },
    Any: {
      query: { Any: "SuiEventFilter[]" },
      description: "Events emitted from any of the given filters",
      use_case: "Combine multiple filter conditions with OR logic"
    },
    Transaction: {
      query: { Transaction: "txDigest" },
      description: "Events emitted from the specified transaction",
      example: { Transaction: "DGUe2TXiJdN3FI6MH1FwghYbiHw+NKu8Nh579zdFtUk=" },
      use_case: "Query all events from a specific transaction"
    },
    MoveModule: {
      query: { MoveModule: { package: "packageId", module: "moduleName" } },
      description: "Events emitted from the specified Move module",
      example: { MoveModule: { package: "0x158f2027...", module: "deepbook_utils" } },
      use_case: "Query events from a specific package and module"
    },
    MoveEventModule: {
      query: { MoveEventModule: { package: "packageId", module: "moduleName" } },
      description: "Events emitted and defined on the specified Move module",
      example: { MoveEventModule: { package: "0x158f2027...", module: "nft" } },
      use_case: "Query events defined in a specific module (more precise than MoveModule)"
    },
    MoveEventType: {
      query: { MoveEventType: "::nft::MintNFTEvent" },
      description: "Move struct name of the event",
      example: { MoveEventType: "::deepbook_utils::DepositAsset" },
      use_case: "Query events by specific event type"
    },
    Sender: {
      query: { Sender: "address" },
      description: "Query by sender address",
      example: { Sender: "0x008e9c621f4fdb210b873aab59a1e5bf32ddb1d33ee85eb069b348c234465106" },
      use_case: "Get all events triggered by a specific address"
    },
    TimeRange: {
      query: { TimeRange: { startTime: 1669039504014, endTime: 1669039604014 } },
      description: "Return events emitted in [start_time, end_time] interval",
      use_case: "Query events within a specific time range"
    }
  }
};

// ============================================================================
// TYPESCRIPT SDK EVENT QUERYING
// ============================================================================

/**
 * TypeScript SDK event query examples
 * Using @mysten/sui/client
 */
export const TYPESCRIPT_EVENT_QUERIES = {
  description: "TypeScript SDK patterns for querying events",
  
  queryEventsBasic: {
    title: "Basic Event Query",
    description: "Query events from a specific transaction",
    code: `
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

const client = new SuiClient({ url: getFullnodeUrl("mainnet") });

// Query events from a specific transaction
const eventsResult = await client.queryEvents({
  query: { Transaction: txDigest },
});

console.log("Events:", eventsResult.data);
    `
  },

  queryEventsByModule: {
    title: "Query Events by Module",
    description: "Get all events emitted from a specific module",
    code: `
const eventsResult = await client.queryEvents({
  query: {
    MoveModule: {
      package: "0x158f2027f60c89bb91526d9bf08831d27f5a0fcb0f74e6698b9f0e1fb2be5d05",
      module: "deepbook_utils"
    }
  },
  limit: 50,
});

console.log("DeepBook events:", eventsResult.data);
    `
  },

  queryEventsByType: {
    title: "Query Events by Type",
    description: "Filter events by specific event type",
    code: `
const eventsResult = await client.queryEvents({
  query: {
    MoveEventType: "::clob_v2::OrderFilled"
  },
  limit: 10,
  order: "ascending",
});

console.log("Order filled events:", eventsResult.data);
    `
  },

  queryEventsBySender: {
    title: "Query Events by Sender",
    description: "Get all events triggered by a specific address",
    code: `
const eventsResult = await client.queryEvents({
  query: {
    Sender: "0x8b35e67a519fffa11a9c74f169228ff1aa085f3a3d57710af08baab8c02211b9"
  },
  limit: 100,
});

console.log("Events from sender:", eventsResult.data);
    `
  },

  queryEventsWithPagination: {
    title: "Query Events with Pagination",
    description: "Paginate through events using cursor",
    code: `
let cursor = null;
let allEvents = [];

while (true) {
  const result = await client.queryEvents({
    query: { MoveModule: { package, module } },
    cursor,
    limit: 50,
    order: "ascending",
  });

  allEvents = allEvents.concat(result.data);

  if (!result.hasNextPage) break;
  cursor = result.nextCursor;
}

console.log(\`Retrieved \${allEvents.length} events\`);
    `
  },

  queryEventsInTransaction: {
    title: "Query Events After Transaction",
    description: "Execute a transaction and query its events",
    code: `
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
const client = useSuiClient();

const tx = new Transaction();
tx.moveCall({
  target: \`\${packageId}::\${module}::create_game\`,
  arguments: [tx.pure.u64(1)],
});

const txResult = await signAndExecute({ transaction: tx });

await client.waitForTransaction({ digest: txResult.digest });

const eventsResult = await client.queryEvents({
  query: { Transaction: txResult.digest },
});

if (eventsResult.data.length > 0) {
  const event = eventsResult.data[0];
  console.log("Event type:", event.type);
  console.log("Event data:", event.parsedJson);
}
    `
  }
};

// ============================================================================
// EVENT MONITORING AND POLLING
// ============================================================================

/**
 * Event monitoring configuration for continuous event tracking
 */
export const EVENT_MONITORING = {
  description: "Configuration for monitoring and polling events",
  
  pollingStrategy: {
    interval_ms: 1000,
    description: "Poll every 1 second for new events",
    adaptive: "Increase interval if no events, decrease if events found"
  },

  eventTrackerConfig: {
    title: "Event Tracker Configuration",
    description: "Structure for tracking specific event types",
    interface: `
interface EventTracker {
  type: string; // "package::module" format
  filter: SuiEventFilter; // Query filter
  callback: (events: SuiEvent[], type: string) => Promise<void>;
}
    `,
    example: {
      type: "0x158f2027f60c89bb91526d9bf08831d27f5a0fcb0f74e6698b9f0e1fb2be5d05::lock",
      filter: {
        MoveEventModule: {
          package: "0x158f2027f60c89bb91526d9bf08831d27f5a0fcb0f74e6698b9f0e1fb2be5d05",
          module: "lock"
        }
      },
      callback: "handleLockObjects" // Process lock events
    }
  },

  handlerPattern: {
    title: "Event Handler Pattern",
    description: "Process events and update database",
    code: `
import { SuiEvent } from "@mysten/sui/client";
import { prisma } from "../db";

type LockEvent = LockCreated | LockDestroyed;

type LockCreated = {
  creator: string;
  lock_id: string;
  key_id: string;
  item_id: string;
};

type LockDestroyed = {
  lock_id: string;
};

export const handleLockObjects = async (
  events: SuiEvent[],
  type: string
) => {
  const updates: Record<string, any> = {};

  for (const event of events) {
    if (!event.type.startsWith(type)) {
      throw new Error("Invalid event module origin");
    }

    const data = event.parsedJson as LockEvent;
    const isDeletionEvent = !("key_id" in data);

    if (!Object.hasOwn(updates, data.lock_id)) {
      updates[data.lock_id] = { objectId: data.lock_id };
    }

    if (isDeletionEvent) {
      updates[data.lock_id].deleted = true;
    } else {
      updates[data.lock_id].keyId = data.key_id;
      updates[data.lock_id].creator = data.creator;
      updates[data.lock_id].itemId = data.item_id;
    }
  }

  // Upsert to database
  const promises = Object.values(updates).map((update) =>
    prisma.locked.upsert({
      where: { objectId: update.objectId },
      create: update,
      update,
    })
  );

  await Promise.all(promises);
};
    `
  }
};

// ============================================================================
// GRAPHQL EVENT QUERYING
// ============================================================================

/**
 * GraphQL queries for event querying
 * Early-stage feature in Sui
 */
export const GRAPHQL_EVENT_QUERIES = {
  description: "GraphQL examples for querying events",
  note: "Early-stage feature - details may change",

  queryEventsByType: {
    title: "Query Events by Type",
    query: `
{
  events(
    filter: {
      eventType: "0x3164fcf73eb6b41ff3d2129346141bd68469964c2d95a5b1533e8d16e6ea6e13::Market::ChangePriceEvent<0x2::sui::SUI>"
    }
  ) {
    nodes {
      sendingModule {
        name
        package { digest }
      }
      sender {
        address
      }
      timestamp
      contents {
        type {
          repr
        }
        json
      }
      bcs
    }
  }
}
    `
  },

  queryEventsBySender: {
    title: "Filter Events by Sender",
    query: `
query ByTxSender {
  events(
    first: 1
    filter: {
      sender: "0xdff57c401e125a7e0e06606380560b459a179aacd08ed396d0162d57dbbdadfb"
    }
  ) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      sendingModule {
        name
      }
      contents {
        type {
          repr
        }
        json
      }
      sender {
        address
      }
      timestamp
      bcs
    }
  }
}
    `
  },

  typeScriptGraphQLExample: {
    title: "TypeScript GraphQL Integration",
    code: `
import { createGraphQLClient } from "@mysten/sui/graphql";

const client = createGraphQLClient({
  url: "https://graphql-mainnet.sui.io",
});

// Query events using GraphQL
const result = await client.query({
  query: \`
    query {
      events(
        filter: {
          eventType: "0x...::ModuleName::EventName"
        }
      ) {
        nodes {
          timestamp
          sender { address }
          contents { json }
        }
      }
    }
  \`,
});

console.log("Events:", result.data);
    `
  }
};

// ============================================================================
// CROZZ ECOSYSTEM EVENT STRATEGY
// ============================================================================

/**
 * CROZZ-specific event implementation strategy
 */
export const CROZZ_EVENT_STRATEGY = {
  description: "Event implementation strategy for CROZZ ecosystem",
  
  gameEvents: {
    title: "Game Events",
    events: [
      {
        name: "GameCreated",
        trigger: "When a new game instance is created",
        payload: ["game_id", "creator", "size", "difficulty", "timestamp"],
        use_case: "Track new game launches and difficulty distribution"
      },
      {
        name: "MoveMade",
        trigger: "When a player makes a move",
        payload: ["game_id", "player", "position", "outcome_code", "move_hash"],
        use_case: "Analyze player strategies and success rates"
      },
      {
        name: "GameFinished",
        trigger: "When a game completes (win/loss)",
        payload: ["game_id", "winner", "final_outcome", "duration", "reward"],
        use_case: "Track game completions and player achievements"
      },
      {
        name: "AchievementUnlocked",
        trigger: "When a player unlocks an achievement",
        payload: ["game_id", "player", "achievement_id", "milestone"],
        use_case: "Monitor achievement progression"
      }
    ]
  },

  tradeEvents: {
    title: "Trade/Escrow Events",
    events: [
      {
        name: "PlayerTradeInitiated",
        trigger: "When a player initiates a trade with another player",
        payload: ["trade_id", "initiator", "recipient", "offered_items", "requested_items"],
        use_case: "Track peer-to-peer trades and item distribution"
      },
      {
        name: "TradeCompleted",
        trigger: "When a trade is atomically executed",
        payload: ["trade_id", "initiator", "recipient", "items_exchanged"],
        use_case: "Record successful exchanges"
      },
      {
        name: "TradeCancelled",
        trigger: "When a trade is cancelled or expires",
        payload: ["trade_id", "canceller", "reason"],
        use_case: "Track cancelled trades and analyze patterns"
      },
      {
        name: "NPCTradeCompleted",
        trigger: "When an NPC trade is executed",
        payload: ["npc_id", "player", "items_given", "items_received"],
        use_case: "Monitor NPC economy and item flows"
      }
    ]
  },

  nftEvents: {
    title: "NFT/Item Events",
    events: [
      {
        name: "ItemMinted",
        trigger: "When a game item is created/minted",
        payload: ["item_id", "item_type", "rarity", "creator", "timestamp"],
        use_case: "Track item creation rates and rarity distribution"
      },
      {
        name: "ItemTransferred",
        trigger: "When an item changes ownership",
        payload: ["item_id", "from", "to", "price_paid"],
        use_case: "Monitor item market activity"
      },
      {
        name: "ItemBurned",
        trigger: "When an item is destroyed/burned",
        payload: ["item_id", "item_type", "owner"],
        use_case: "Track item destruction and deflation mechanics"
      }
    ]
  },

  poolEvents: {
    title: "Liquidity Pool Events",
    events: [
      {
        name: "LiquidityAdded",
        trigger: "When liquidity is added to a pool",
        payload: ["pool_id", "provider", "amount_coin1", "amount_coin2"],
        use_case: "Track liquidity provision"
      },
      {
        name: "LiquidityRemoved",
        trigger: "When liquidity is withdrawn",
        payload: ["pool_id", "provider", "amount_removed"],
        use_case: "Monitor pool participation"
      },
      {
        name: "SwapExecuted",
        trigger: "When a swap occurs in the pool",
        payload: ["pool_id", "trader", "asset_in", "asset_out", "price"],
        use_case: "Track trading volume and price movements"
      }
    ]
  },

  monitoringStrategy: {
    title: "CROZZ Event Monitoring Strategy",
    approach: "Hybrid polling + custom indexer",
    implementation: [
      {
        phase: "Real-time critical events",
        method: "Custom Sui indexer",
        events: ["GameFinished", "TradeCompleted", "NPCTradeCompleted"],
        latency: "< 500ms",
        use_case: "Immediate reward distribution, leaderboard updates"
      },
      {
        phase: "Frequent events",
        method: "Polling every 5-10 seconds",
        events: ["MoveMade", "SwapExecuted", "ItemTransferred"],
        latency: "5-10 seconds",
        use_case: "Analytics, audit logs, market data"
      },
      {
        phase: "Infrequent events",
        method: "Polling every 1-5 minutes",
        events: ["ItemMinted", "AchievementUnlocked", "LiquidityAdded"],
        latency: "1-5 minutes",
        use_case: "Statistics, trending data"
      }
    ]
  }
};

// ============================================================================
// EVENT INDEXING AND DATABASE SCHEMA
// ============================================================================

/**
 * Suggested database schema for event storage and indexing
 */
export const EVENT_DATABASE_SCHEMA = {
  description: "Database schema for persisting and querying events",
  
  tables: {
    events: {
      description: "Core events table",
      schema: `
CREATE TABLE events (
  id STRING PRIMARY KEY, -- txDigest + eventSeq
  tx_digest STRING NOT NULL,
  event_seq INTEGER NOT NULL,
  package_id STRING NOT NULL,
  transaction_module STRING NOT NULL,
  sender STRING NOT NULL,
  event_type STRING NOT NULL,
  parsed_json JSON NOT NULL,
  bcs STRING NOT NULL,
  timestamp_ms BIGINT NOT NULL,
  block_height BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_tx_digest (tx_digest),
  INDEX idx_event_type (event_type),
  INDEX idx_sender (sender),
  INDEX idx_timestamp (timestamp_ms),
  INDEX idx_package (package_id, transaction_module)
);
      `
    },

    lockEvents: {
      description: "Specific table for lock-related events",
      schema: `
CREATE TABLE lock_events (
  lock_id STRING PRIMARY KEY,
  creator STRING NOT NULL,
  key_id STRING,
  item_id STRING,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  deleted_at TIMESTAMP,
  tx_digest STRING NOT NULL,
  FOREIGN KEY (tx_digest) REFERENCES events(tx_digest)
);
      `
    },

    gameEvents: {
      description: "Specific table for game-related events",
      schema: `
CREATE TABLE game_events (
  game_id STRING NOT NULL,
  player STRING NOT NULL,
  event_type STRING NOT NULL, -- "created", "move", "finished"
  outcome INTEGER, -- 0: ongoing, 1: won, 2: lost
  timestamp BIGINT NOT NULL,
  tx_digest STRING NOT NULL,
  parsed_data JSON,
  PRIMARY KEY (game_id, event_type, timestamp),
  FOREIGN KEY (tx_digest) REFERENCES events(tx_digest),
  INDEX idx_player (player),
  INDEX idx_game (game_id)
);
      `
    },

    tradeEvents: {
      description: "Specific table for trade/escrow events",
      schema: `
CREATE TABLE trade_events (
  trade_id STRING PRIMARY KEY,
  initiator STRING NOT NULL,
  recipient STRING,
  event_type STRING NOT NULL, -- "initiated", "completed", "cancelled"
  offered_items JSON,
  requested_items JSON,
  timestamp BIGINT NOT NULL,
  tx_digest STRING NOT NULL,
  status STRING NOT NULL, -- "pending", "completed", "cancelled"
  FOREIGN KEY (tx_digest) REFERENCES events(tx_digest),
  INDEX idx_initiator (initiator),
  INDEX idx_recipient (recipient),
  INDEX idx_status (status)
);
      `
    },

    eventCursors: {
      description: "Cursor tracking for polling resumption",
      schema: `
CREATE TABLE event_cursors (
  id STRING PRIMARY KEY, -- tracker type identifier
  tx_digest STRING NOT NULL,
  event_seq INTEGER NOT NULL,
  last_processed_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  UNIQUE KEY unique_cursor (tx_digest, event_seq)
);
      `
    }
  }
};

// ============================================================================
// EVENT PROCESSING PATTERNS
// ============================================================================

/**
 * Common patterns for processing events
 */
export const EVENT_PROCESSING_PATTERNS = {
  description: "Proven patterns for event handling and processing",

  batchProcessing: {
    title: "Batch Event Processing",
    description: "Group events by type and process in batches",
    benefits: ["Reduced database round-trips", "Better performance", "Atomic updates"],
    pattern: `
async function processEventBatch(events: SuiEvent[]) {
  const eventsByType = new Map<string, SuiEvent[]>();
  
  // Group events by type
  for (const event of events) {
    if (!eventsByType.has(event.type)) {
      eventsByType.set(event.type, []);
    }
    eventsByType.get(event.type)!.push(event);
  }
  
  // Process each type with its handler
  await Promise.all(
    Array.from(eventsByType.entries()).map(([type, typeEvents]) =>
      processEventType(type, typeEvents)
    )
  );
}
    `
  },

  idempotentProcessing: {
    title: "Idempotent Event Processing",
    description: "Ensure events can be reprocessed without side effects",
    benefits: ["Fault tolerance", "Replay capability", "At-least-once delivery"],
    pattern: `
async function processEvent(event: SuiEvent) {
  // Check if already processed
  const existing = await db.events.findUnique({
    where: { id: event.id.txDigest + event.id.eventSeq }
  });
  
  if (existing) {
    console.log("Event already processed, skipping");
    return;
  }
  
  // Process and mark as processed atomically
  await db.transaction(async (tx) => {
    await handleEventLogic(event);
    await tx.processedEvents.create({
      data: {
        txDigest: event.id.txDigest,
        eventSeq: event.id.eventSeq,
      }
    });
  });
}
    `
  },

  timeWindowAggregation: {
    title: "Time-Window Event Aggregation",
    description: "Aggregate events over time windows for analytics",
    benefits: ["Efficient analytics", "Reduced storage", "Real-time dashboards"],
    pattern: `
async function aggregateEvents(startTime: number, endTime: number) {
  const events = await db.events.findMany({
    where: {
      timestamp_ms: {
        gte: startTime,
        lte: endTime
      }
    }
  });
  
  const aggregates = {
    totalEvents: events.length,
    eventsByType: {},
    eventsBySender: {},
    uniqueSenders: new Set(),
  };
  
  for (const event of events) {
    aggregates.eventsByType[event.event_type] ??= 0;
    aggregates.eventsByType[event.event_type]++;
    
    aggregates.eventsBySender[event.sender] ??= 0;
    aggregates.eventsBySender[event.sender]++;
    
    aggregates.uniqueSenders.add(event.sender);
  }
  
  return {
    ...aggregates,
    uniqueSenderCount: aggregates.uniqueSenders.size,
    timeWindow: { startTime, endTime }
  };
}
    `
  },

  deadLetterQueue: {
    title: "Dead Letter Queue Pattern",
    description: "Handle failed event processing gracefully",
    benefits: ["Prevents data loss", "Error visibility", "Retry capability"],
    pattern: `
async function processEventWithDLQ(event: SuiEvent) {
  try {
    await handleEventLogic(event);
    await db.processedEvents.create({ data: { eventId: event.id } });
  } catch (error) {
    console.error("Error processing event:", error);
    
    // Move to dead letter queue for manual inspection
    await db.deadLetterQueue.create({
      data: {
        event: JSON.stringify(event),
        error: error.message,
        retryCount: 0,
        status: "pending"
      }
    });
    
    // Alert monitoring system
    await notifyError({ eventId: event.id, error });
  }
}

async function processDeadLetterQueue() {
  const failedEvents = await db.deadLetterQueue.findMany({
    where: { status: "pending", retryCount: { lt: 3 } }
  });
  
  for (const item of failedEvents) {
    try {
      await handleEventLogic(JSON.parse(item.event));
      await db.deadLetterQueue.update({
        where: { id: item.id },
        data: { status: "resolved" }
      });
    } catch (error) {
      await db.deadLetterQueue.update({
        where: { id: item.id },
        data: { retryCount: item.retryCount + 1 }
      });
    }
  }
}
    `
  }
};

export default {
  EVENT_STRUCTURE,
  LOCK_EVENT_EMISSION,
  GAME_STATE_EVENT_EMISSION,
  TRADE_EVENT_EMISSION,
  EVENT_FILTERS,
  TYPESCRIPT_EVENT_QUERIES,
  EVENT_MONITORING,
  GRAPHQL_EVENT_QUERIES,
  CROZZ_EVENT_STRATEGY,
  EVENT_DATABASE_SCHEMA,
  EVENT_PROCESSING_PATTERNS
};
