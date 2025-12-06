/**
 * Sui On-Chain Time Access Configuration
 * Based on: https://docs.sui.io/guides/developer/sui-101/access-time
 * 
 * Sui provides two methods for accessing time:
 * 1. Clock module - Near real-time (~0.25s updates via checkpoints)
 * 2. Epoch timestamps - Updates every ~24 hours when epoch changes
 */

// ============================================================================
// CLOCK MODULE REFERENCE
// ============================================================================

export const CLOCK_CONFIG = {
  title: "sui::clock::Clock Module",
  description: "Immutable Clock instance for near real-time timestamps",

  /**
   * The singleton Clock object address
   * This is the ONLY Clock instance in Sui - you cannot create new ones
   */
  CLOCK_ADDRESS: "0x6",

  /**
   * Update frequency
   * Clock updates with every network checkpoint
   */
  UPDATE_FREQUENCY: {
    description: "Updates with each checkpoint via Mysticeti consensus",
    rate: "~0.25 seconds (4 checkpoints/second)",
    dashboard: "https://metrics.sui.io/public-dashboards/4ceb11cc210d4025b122294586961169"
  },

  /**
   * Usage requirements
   */
  REQUIREMENTS: {
    parameterType: "Immutable reference (&Clock)",
    notAllowed: [
      "Mutable reference (&mut Clock) - Validators will refuse",
      "Value (Clock) - Package publish will fail"
    ],
    consensusRequired: true,
    reason: "Clock is a shared object, requires consensus sequencing",
    fastpathCompatible: false
  },

  /**
   * Transaction characteristics
   */
  TRANSACTION_BEHAVIOR: {
    withinTransaction: "timestamp_ms() always returns same value",
    acrossTransactions: "Monotonic - timestamp never decreases",
    guarantee: "Successive transactions see >= timestamp"
  }
};

// ============================================================================
// MOVE CODE EXAMPLES
// ============================================================================

export const CLOCK_MOVE_EXAMPLES = {
  title: "Clock Module Move Examples",

  /**
   * Basic Clock usage - Emit event with timestamp
   */
  basicUsage: {
    description: "Access Clock and emit timestamp event",
    sourceFile: "examples/move/basics/sources/clock.move",
    code: `module basics::clock;

use sui::clock::Clock;
use sui::event;

public struct TimeEvent has copy, drop, store {
    timestamp_ms: u64,
}

entry fun access(clock: &Clock) {
    event::emit(TimeEvent { timestamp_ms: clock.timestamp_ms() });
}`,
    explanation: [
      "1. Import sui::clock::Clock module",
      "2. Define TimeEvent struct with timestamp_ms field",
      "3. Create entry function that takes immutable Clock reference",
      "4. Call clock.timestamp_ms() to get current timestamp",
      "5. Emit event with timestamp"
    ]
  },

  /**
   * Clock timestamp extraction function
   */
  timestampFunction: {
    description: "Extract unix timestamp in milliseconds",
    sourceFile: "crates/sui-framework/packages/sui-framework/sources/clock.move",
    code: `public fun timestamp_ms(clock: &Clock): u64 {
    clock.timestamp_ms
}`,
    returns: "u64 - Unix timestamp in milliseconds"
  },

  /**
   * Time-based game logic example
   */
  gameCooldown: {
    description: "Implement cooldown mechanism using Clock",
    code: `module game::cooldown;

use sui::clock::{Self, Clock};

public struct Player has key, store {
    id: UID,
    last_action_ms: u64,
    cooldown_duration_ms: u64,
}

public fun can_act(player: &Player, clock: &Clock): bool {
    let current_time = clock::timestamp_ms(clock);
    let time_passed = current_time - player.last_action_ms;
    time_passed >= player.cooldown_duration_ms
}

public entry fun perform_action(
    player: &mut Player,
    clock: &Clock,
    ctx: &mut TxContext
) {
    assert!(can_act(player, clock), EStillInCooldown);
    
    // Update last action time
    player.last_action_ms = clock::timestamp_ms(clock);
    
    // Perform action logic...
}`,
    useCase: "Game actions with cooldown periods"
  },

  /**
   * Time-locked asset example
   */
  timelock: {
    description: "Lock assets until specific timestamp",
    code: `module defi::timelock;

use sui::clock::{Self, Clock};
use sui::coin::{Self, Coin};
use sui::sui::SUI;

public struct TimeLock<phantom T> has key {
    id: UID,
    locked_coin: Coin<T>,
    unlock_time_ms: u64,
    owner: address,
}

public fun create_timelock<T>(
    coin: Coin<T>,
    unlock_time_ms: u64,
    owner: address,
    ctx: &mut TxContext
): TimeLock<T> {
    TimeLock {
        id: object::new(ctx),
        locked_coin: coin,
        unlock_time_ms,
        owner,
    }
}

public fun unlock<T>(
    timelock: TimeLock<T>,
    clock: &Clock,
    ctx: &TxContext
): Coin<T> {
    let TimeLock { id, locked_coin, unlock_time_ms, owner } = timelock;
    
    // Verify caller is owner
    assert!(tx_context::sender(ctx) == owner, ENotOwner);
    
    // Verify time has passed
    let current_time = clock::timestamp_ms(clock);
    assert!(current_time >= unlock_time_ms, EStillLocked);
    
    object::delete(id);
    locked_coin
}`,
    useCase: "Vesting schedules, escrow, time-based releases"
  }
};

// ============================================================================
// CLI USAGE EXAMPLES
// ============================================================================

export const CLOCK_CLI_USAGE = {
  title: "CLI Commands for Clock-based Transactions",

  /**
   * Basic Clock access call
   */
  basicCall: {
    description: "Call entry function with Clock parameter",
    command: "sui client call --package <PACKAGE_ID> --module 'clock' --function 'access' --args '0x6'",
    note: "Pass 0x6 as the Clock address argument"
  },

  /**
   * With custom gas budget
   */
  withGasBudget: {
    description: "Specify custom gas budget (optional since v1.24.1)",
    command: "sui client call --package <PACKAGE_ID> --module 'clock' --function 'access' --args '0x6' --gas-budget 10000000",
    note: "--gas-budget is optional since Sui v1.24.1"
  },

  /**
   * Multiple arguments with Clock
   */
  multipleArgs: {
    description: "Call function with Clock and other parameters",
    command: "sui client call --package <PACKAGE_ID> --module 'game' --function 'perform_action' --args <PLAYER_ID> '0x6'",
    note: "Clock is typically the last parameter"
  },

  /**
   * TypeScript SDK usage
   */
  typescriptSDK: {
    description: "Call Clock-based function via TypeScript SDK",
    code: `import { Transaction } from '@mysten/sui/transactions';

const tx = new Transaction();

tx.moveCall({
  target: \`\${packageId}::clock::access\`,
  arguments: [
    tx.object('0x6'), // Clock object
  ],
});

const result = await client.signAndExecuteTransaction({
  transaction: tx,
  signer: keypair,
});`
  }
};

// ============================================================================
// TESTING UTILITIES
// ============================================================================

export const CLOCK_TESTING = {
  title: "Clock Testing Utilities",
  description: "Test-only functions for Clock manipulation",

  /**
   * Test-only Clock functions from sui-framework
   */
  testFunctions: {
    create_for_testing: {
      signature: "public fun create_for_testing(ctx: &mut TxContext): Clock",
      description: "Create a Clock instance for testing",
      code: `Clock {
    id: object::new(ctx),
    timestamp_ms: 0,
}`
    },

    share_for_testing: {
      signature: "public fun share_for_testing(clock: Clock)",
      description: "Share Clock as shared object in tests"
    },

    increment_for_testing: {
      signature: "public fun increment_for_testing(clock: &mut Clock, tick: u64)",
      description: "Increment Clock timestamp by tick milliseconds"
    },

    set_for_testing: {
      signature: "public fun set_for_testing(clock: &mut Clock, timestamp_ms: u64)",
      description: "Set Clock to specific timestamp (must be >= current)",
      assertion: "timestamp_ms >= clock.timestamp_ms"
    },

    destroy_for_testing: {
      signature: "public fun destroy_for_testing(clock: Clock)",
      description: "Destroy Clock after testing"
    }
  },

  /**
   * Example test
   */
  testExample: {
    description: "Basic Clock testing pattern",
    sourceFile: "crates/sui-framework/packages/sui-framework/tests/clock_tests.move",
    code: `#[test_only]
module sui::clock_tests;

use sui::clock;

#[test]
fun creating_a_clock_and_incrementing_it() {
    let mut ctx = tx_context::dummy();
    let mut clock = clock::create_for_testing(&mut ctx);

    clock.increment_for_testing(42);
    assert!(clock.timestamp_ms() == 42);

    clock.set_for_testing(50);
    assert!(clock.timestamp_ms() == 50);

    clock.destroy_for_testing();
}`,
    steps: [
      "1. Create dummy transaction context",
      "2. Create Clock for testing (starts at 0)",
      "3. Increment by 42ms",
      "4. Assert timestamp is 42",
      "5. Set to 50ms",
      "6. Assert timestamp is 50",
      "7. Cleanup by destroying Clock"
    ]
  },

  /**
   * Testing time-dependent logic
   */
  timeDependentTest: {
    description: "Test cooldown mechanism",
    code: `#[test]
fun test_cooldown_mechanism() {
    let mut ctx = tx_context::dummy();
    let mut clock = clock::create_for_testing(&mut ctx);
    
    let mut player = Player {
        id: object::new(&mut ctx),
        last_action_ms: 0,
        cooldown_duration_ms: 1000, // 1 second cooldown
    };
    
    // First action should succeed
    assert!(can_act(&player, &clock), 0);
    player.last_action_ms = clock::timestamp_ms(&clock);
    
    // Immediate second action should fail
    assert!(!can_act(&player, &clock), 1);
    
    // After cooldown, should succeed
    clock.increment_for_testing(1000);
    assert!(can_act(&player, &clock), 2);
    
    // Cleanup
    let Player { id, last_action_ms: _, cooldown_duration_ms: _ } = player;
    object::delete(id);
    clock.destroy_for_testing();
}`
  }
};

// ============================================================================
// EPOCH TIMESTAMPS
// ============================================================================

export const EPOCH_TIMESTAMP_CONFIG = {
  title: "Epoch Timestamp Access",
  description: "Alternative time source with ~24 hour updates",

  /**
   * Basic configuration
   */
  characteristics: {
    updateFrequency: "~24 hours (when epoch changes)",
    granularity: "Milliseconds (u64)",
    format: "Unix timestamp",
    consensusRequired: false,
    fastpathCompatible: true,
    precision: "Start of current epoch"
  },

  /**
   * When to use
   */
  useCases: {
    preferEpochTimestamp: [
      "Single-owner fastpath transactions",
      "Don't need near real-time precision",
      "Daily/weekly game resets",
      "Epoch-based rewards distribution",
      "Long-term time locks (days/weeks/months)"
    ],
    preferClock: [
      "Need sub-second precision",
      "Cooldown mechanisms (seconds/minutes)",
      "Trading/auction deadlines",
      "Real-time game mechanics",
      "Precise time measurements"
    ]
  },

  /**
   * TxContext function
   */
  accessFunction: {
    signature: "public fun epoch_timestamp_ms(_self: &TxContext): u64",
    sourceFile: "crates/sui-framework/packages/sui-framework/sources/tx_context.move",
    code: `public fun epoch_timestamp_ms(_self: &TxContext): u64 {
    native_epoch_timestamp_ms()
}`,
    usage: "let current_epoch_start = tx_context::epoch_timestamp_ms(ctx);"
  },

  /**
   * Move example
   */
  moveExample: {
    description: "Daily reward claim using epoch timestamps",
    code: `module game::daily_rewards;

use sui::tx_context::{Self, TxContext};

const MS_PER_DAY: u64 = 86400000; // 24 hours in milliseconds

public struct Player has key {
    id: UID,
    last_claim_epoch_ms: u64,
}

public fun can_claim_daily_reward(player: &Player, ctx: &TxContext): bool {
    let current_epoch_ms = tx_context::epoch_timestamp_ms(ctx);
    let time_since_claim = current_epoch_ms - player.last_claim_epoch_ms;
    time_since_claim >= MS_PER_DAY
}

public entry fun claim_daily_reward(
    player: &mut Player,
    ctx: &mut TxContext
) {
    assert!(can_claim_daily_reward(player, ctx), EAlreadyClaimed);
    
    player.last_claim_epoch_ms = tx_context::epoch_timestamp_ms(ctx);
    
    // Distribute reward...
}`,
    useCase: "Daily login rewards, weekly quests, epoch-based distributions"
  },

  /**
   * Testing with epoch timestamps
   */
  testing: {
    description: "Test scenario with epoch time progression",
    sourceFile: "crates/sui-framework/packages/sui-framework/sources/test/test_scenario.move",
    function: {
      signature: "public fun later_epoch(scenario: &mut Scenario, delta_ms: u64, sender: address): TransactionEffects",
      description: "Advance epoch and increment timestamp",
      behavior: [
        "Finishes current transaction",
        "Finishes current epoch",
        "Increments timestamp by delta_ms",
        "Starts new epoch"
      ]
    },
    code: `#[test]
fun test_daily_reward_with_epoch() {
    let admin = @0xAD;
    let player_addr = @0xCAFE;
    
    let mut scenario = test_scenario::begin(admin);
    
    // Create player
    {
        let mut ctx = test_scenario::ctx(&mut scenario);
        let player = Player {
            id: object::new(&mut ctx),
            last_claim_epoch_ms: 0,
        };
        transfer::transfer(player, player_addr);
    };
    
    // First claim should succeed
    test_scenario::next_tx(&mut scenario, player_addr);
    {
        let mut player = test_scenario::take_from_sender<Player>(&scenario);
        let ctx = test_scenario::ctx(&mut scenario);
        assert!(can_claim_daily_reward(&player, ctx), 0);
        claim_daily_reward(&mut player, ctx);
        test_scenario::return_to_sender(&scenario, player);
    };
    
    // Advance time by 1 day
    let effects = test_scenario::later_epoch(
        &mut scenario,
        86400000, // 24 hours in ms
        player_addr
    );
    
    // Second claim should succeed after 24 hours
    {
        let mut player = test_scenario::take_from_sender<Player>(&scenario);
        let ctx = test_scenario::ctx(&mut scenario);
        assert!(can_claim_daily_reward(&player, ctx), 1);
        test_scenario::return_to_sender(&scenario, player);
    };
    
    test_scenario::end(scenario);
}`
  }
};

// ============================================================================
// COMPARISON AND BEST PRACTICES
// ============================================================================

export const TIME_ACCESS_COMPARISON = {
  title: "Clock vs Epoch Timestamp Comparison",

  comparisonTable: [
    {
      aspect: "Update Frequency",
      clock: "~0.25 seconds (checkpoints)",
      epochTimestamp: "~24 hours (epochs)"
    },
    {
      aspect: "Consensus Required",
      clock: "Yes (shared object)",
      epochTimestamp: "No (from TxContext)"
    },
    {
      aspect: "Fastpath Compatible",
      clock: "No",
      epochTimestamp: "Yes"
    },
    {
      aspect: "Precision",
      clock: "Near real-time",
      epochTimestamp: "Epoch start time"
    },
    {
      aspect: "Gas Cost",
      clock: "Higher (consensus)",
      epochTimestamp: "Lower (no consensus)"
    },
    {
      aspect: "Use Case",
      clock: "Real-time mechanics",
      epochTimestamp: "Daily/weekly events"
    }
  ],

  bestPractices: {
    choosing: [
      "✅ Use Clock for second/minute precision",
      "✅ Use Epoch timestamps for hour/day precision",
      "✅ Consider gas costs vs precision needs",
      "✅ Use Epoch timestamps for single-owner fastpath",
      "✅ Use Clock when exact timing critical"
    ],

    implementation: [
      "✅ Always pass Clock as immutable reference (&Clock)",
      "✅ Pass Clock as last parameter in entry functions",
      "✅ Cache timestamp if needed multiple times in same tx",
      "✅ Use test utilities for comprehensive testing",
      "✅ Document which time source your module uses"
    ],

    performance: [
      "✅ Epoch timestamps are cheaper (no consensus)",
      "✅ Clock access adds ~0.25s latency (checkpoint time)",
      "✅ Consider batching Clock-dependent operations",
      "✅ Profile gas costs in testnet before mainnet"
    ],

    testing: [
      "✅ Test both time progression and edge cases",
      "✅ Test cooldown boundaries (exactly at limit)",
      "✅ Test wraparound scenarios for long durations",
      "✅ Use increment_for_testing for fine control",
      "✅ Use later_epoch for epoch-based logic"
    ]
  }
};

// ============================================================================
// CROZZ-SPECIFIC TIME USAGE
// ============================================================================

export const CROZZ_TIME_STRATEGY = {
  title: "CROZZ Time Management Strategy",

  gameplayMechanics: {
    realTime: {
      uses: "Clock module",
      examples: [
        "Combat cooldowns (5-60 seconds)",
        "Auction countdowns",
        "Time-limited events (hours)",
        "Trading windows",
        "Quick-time events"
      ],
      precision: "Sub-second when needed"
    },

    epochBased: {
      uses: "Epoch timestamps",
      examples: [
        "Daily login rewards",
        "Weekly tournaments",
        "Season changes",
        "Monthly leaderboard resets",
        "Staking reward calculations"
      ],
      precision: "Daily granularity sufficient"
    }
  },

  implementation: {
    cooldownSystem: "Use Clock - players expect instant response",
    rewardDistribution: "Use Epoch timestamps - lower gas costs",
    marketOperations: "Use Clock - precise expiration times",
    seasonalEvents: "Use Epoch timestamps - day-level precision OK",
    stakingRewards: "Use Epoch timestamps - calculated per epoch"
  },

  gasOptimization: {
    strategy: "Hybrid approach",
    details: [
      "Use Clock only when sub-hour precision required",
      "Use Epoch timestamps for all daily+ mechanics",
      "Batch Clock-dependent operations when possible",
      "Cache Clock reads within transaction",
      "Profile real gas costs in testnet"
    ]
  }
};

export default {
  CLOCK_CONFIG,
  CLOCK_MOVE_EXAMPLES,
  CLOCK_CLI_USAGE,
  CLOCK_TESTING,
  EPOCH_TIMESTAMP_CONFIG,
  TIME_ACCESS_COMPARISON,
  CROZZ_TIME_STRATEGY
};
