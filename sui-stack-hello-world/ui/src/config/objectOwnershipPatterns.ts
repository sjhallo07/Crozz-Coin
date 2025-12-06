// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * OBJECT OWNERSHIP PATTERNS
 * 
 * Deep dive into Sui object ownership models with Escrow example:
 * https://docs.sui.io/guides/developer/sui-101/object-ownership
 * 
 * Two main approaches:
 * 1. Fastpath Objects: Address-owned, single owner, low latency
 * 2. Consensus Objects: Shared, multiple owners, atomic consistency
 */

/**
 * FASTPATH OBJECTS (Address-Owned)
 * 
 * - Must be owned by single address or immutable
 * - Finalize without consensus (very low latency)
 * - Cannot be directly accessed by multiple parties
 * - Complex multi-party access requires off-chain coordination
 * - Lower gas cost and latency
 * - Suitable for personal assets, no multi-party logic
 */
export const FASTPATH_OBJECTS = {
  characteristics: {
    owner_constraint: "Single address or immutable",
    finality: "Fastpath (no consensus required)",
    latency: "~0.5s to finality",
    gas_cost: "Lower than consensus objects",
    multi_party: "Not directly supported; requires off-chain coordination",
    use_case: "Personal assets, individual accounts, high-frequency updates",
  },

  escrow_pattern: {
    name: "Fastpath Escrow (Address-Owned)",
    description:
      "Two-party swap using address-owned objects with trusted third-party custodian",
    custody_model: "Custodian (trusted third party) holds both objects in escrow",
    trust_assumption: "Custodian trusted for liveness (completing swaps), not safety",
    benefits: [
      "Very low latency (no consensus)",
      "Lower gas costs",
      "Simple for trusted mediators",
    ],
    tradeoffs: [
      "Requires trusted third party",
      "More transaction steps",
      "More complex custody handoff protocol",
    ],

    three_phases: {
      phase1: {
        title: "Lock Phase",
        description: "Both parties lock their objects, getting Locked<T> and Key",
        steps: [
          "Alice locks her object: lock(asset_a) -> (Locked<AssetA>, KeyA)",
          "Bob locks his object: lock(asset_b) -> (Locked<AssetB>, KeyB)",
          "Both parties can unlock if needed to preserve liveness",
          "Key ID is remembered for verification (cannot be modified post-lock)",
        ],
        benefit: "Proves object not tampered with before escrow registration",
      },

      phase2: {
        title: "Escrow Registration",
        description: "Both parties register Escrow objects with custodian",
        steps: [
          "Alice sends Escrow with (locked_asset_a, key_id_b, recipient_bob) to custodian",
          "Bob sends Escrow with (locked_asset_b, key_id_a, recipient_alice) to custodian",
          "Key is consumed to unlock, but its ID is remembered in Escrow",
          "Custodian holds both Escrow objects",
        ],
        safety: "Key IDs prevent object tampering; unique per lock",
      },

      phase3: {
        title: "Custodian Swap",
        description: "Custodian matches and swaps the escrowed objects",
        steps: [
          "Custodian checks sender/recipient match between two Escrows",
          "Custodian verifies exchange_key IDs match (object identity integrity)",
          "If all checks pass, swap is executed atomically",
          "Objects transferred to correct recipients",
        ],
        verification: [
          "sender1 == recipient2 (Alice wants to give to Bob)",
          "sender2 == recipient1 (Bob wants to give to Alice)",
          "escrowed_key1 == exchange_key2 (Objects match)",
          "escrowed_key2 == exchange_key1 (Mutual match)",
        ],
      },
    },

    code_structure: {
      Locked: {
        definition:
          "Opaque wrapper: public fun lock<T>(obj: T) -> (Locked<T>, Key)",
        purpose: "Prevents modification without unlocking (consumes key)",
        verification: "Key ID proves original object identity",
      },

      Key: {
        definition: "Unique identifier matching locked object",
        usage: "Consumed by unlock(locked, key) to get T back",
        security: "One-time use; tampering detected by ID mismatch",
      },

      Escrow: {
        definition: `struct Escrow<T> {
  sender: address,
  recipient: address,
  exchange_key: ID,         // ID of key needed from counterparty
  escrowed_key: ID,         // ID of key that locked this object
  escrowed: T,              // The actual object
}`,
        custody: "Custodian transfers Escrow object to self",
        atomicity: "Swap is atomic; either both succeed or both fail",
      },
    },

    tamper_detection: {
      scenario: "Bob unlocks, modifies asset_b, and re-locks",
      detection: "New lock produces different Key ID",
      result: "exchange_key check fails in swap verification",
      outcome: "Swap reverts; Alice's asset returns safely",
      conclusion: "Lock mechanism prevents silent tampering",
    },

    liveness_guarantees: {
      alice_perspective: "Can unlock and recover asset_a if Bob stalls",
      bob_perspective: "Can unlock and recover asset_b if Alice stalls",
      custodian_responsibility: "Must eventually return/swap escrowed objects",
      recovery: "return_to_sender() function allows cancellation",
    },
  },
};

/**
 * CONSENSUS OBJECTS (Shared Objects)
 * 
 * - Globally accessible for read/write by any transaction
 * - Require consensus to sequence and atomically apply transactions
 * - Support multi-party access coordination via Mysticeti
 * - Slightly higher gas cost and latency than fastpath
 * - Better for collaborative state, contracts, pools
 */
export const CONSENSUS_OBJECTS = {
  characteristics: {
    access_model: "Any transaction can read/write",
    consistency: "Atomic via Mysticeti consensus ordering",
    latency: "~1-2s to consensus finality (higher than fastpath)",
    gas_cost: "Higher than address-owned (consensus overhead)",
    multi_party: "Fully supported; coordination via consensus",
    use_case: "Contracts, shared state, coordination, liquidity pools",
  },

  escrow_pattern: {
    name: "Consensus Escrow (Shared Objects)",
    description: "Two-party swap using shared objects without trusted third party",
    custody_model: "Escrow object is shared on-chain; both parties access directly",
    trust_assumption: "None; only Move code enforces correctness",
    benefits: [
      "No trusted third party required",
      "Fewer transaction steps",
      "On-chain trust via consensus",
      "Scriptable by both parties",
    ],
    tradeoffs: [
      "Requires consensus (slightly higher latency)",
      "Higher gas cost",
      "More complex shared object logic",
    ],

    three_phases: {
      phase1: {
        title: "Bob Locks Object",
        description: "One party (Bob) locks their object",
        steps: [
          "Bob locks asset_b: lock(asset_b) -> (Locked<AssetB>, KeyB)",
          "Bob holds Locked<AssetB> and KeyB",
          "Bob can unlock if other party stalls to preserve liveness",
        ],
        asymmetry: "Only one party needs to lock initially",
      },

      phase2: {
        title: "Alice Creates Shared Escrow",
        description: "Other party (Alice) creates public shared Escrow object",
        steps: [
          "Alice creates Escrow<AssetA> with desired object",
          "Alice specifies recipient (Bob) and exchange_key (ID of KeyB)",
          "Alice makes Escrow publicly shared: transfer::public_share_object(escrow)",
          "Escrow accessible to anyone, but only correct parties can interact",
        ],
        visibility: "Escrow is globally readable/queryable",
        commitment: "Alice's asset locked at specific version waiting for Bob",
      },

      phase3: {
        title: "Bob Completes Swap",
        description: "Bob sends locked object and key to shared Escrow",
        steps: [
          "Bob calls escrow.swap(KeyB, Locked<AssetB>)",
          "Move code verifies Bob is recipient",
          "Move code verifies KeyB matches exchange_key",
          "If all checks pass, swap executes atomically",
          "Alice receives AssetB, Bob receives AssetA",
        ],
        atomicity: "All-or-nothing via Mysticeti consensus",
      },
    },

    code_structure: {
      Escrow_Shared: {
        definition: `struct Escrow<phantom T> has key, store {
  sender: address,           // Original creator (Alice)
  recipient: address,        // Intended swap counterparty (Bob)
  exchange_key: ID,          // ID of key needed from Bob
  // AssetA stored as Dynamic Object Field (queryable)
}`,
        storage: "Uses Dynamic Object Fields (DOF) for nested objects",
        accessibility: "Shared, so anyone can query current state",
      },

      swap_function: {
        definition: `public fun swap<T, U>(
  mut escrow: Escrow<T>,
  key: Key,
  locked: Locked<U>,
  ctx: &TxContext,
): T`,
        checks: [
          "recipient == ctx.sender() // Only Bob can call",
          "exchange_key == object::id(&key) // Key must match",
          "locked matches original asset_b",
        ],
        atomicity: "Consensus ensures all steps execute together",
      },

      return_to_sender: {
        description: "Creator (Alice) can cancel if Bob never responds",
        definition: `public fun return_to_sender(mut escrow: Escrow<T>, ctx: &TxContext): T`,
        check: "sender == ctx.sender() // Only Alice can cancel",
        liveness: "Preserves liveness if counterparty abandons swap",
      },
    },

    advantages_over_fastpath: {
      no_trusted_party: "Escrow enforced by Move code, not custodian",
      fewer_steps: "Alice creates escrow, Bob completes; no custodian coordination",
      on_chain_settlement: "Settlement happens on-chain directly",
      programmable: "Either party can call public functions per their role",
      atomic_finality: "One Mysticeti ordering for entire swap",
    },

    event_emission: {
      EscrowCreated: {
        emitted: "When Alice creates Escrow",
        data: "escrow_id, key_id, sender, recipient, item_id",
        use: "Off-chain indexing can track pending escrows",
      },

      EscrowSwapped: {
        emitted: "When Bob completes swap",
        data: "escrow_id",
        use: "Notify both parties swap succeeded",
      },

      EscrowCancelled: {
        emitted: "When Alice cancels escrow",
        data: "escrow_id",
        use: "Notify Bob escrow no longer available",
      },
    },
  },
};

/**
 * COMPARISON MATRIX
 * Fastpath vs Consensus Escrow
 */
export const OWNERSHIP_COMPARISON = {
  summary: {
    fastpath: "For latency-sensitive apps with trusted custodian or simple transfers",
    consensus: "For multi-party coordination without trust requirements",
  },

  detailed_comparison: [
    {
      aspect: "Finality Latency",
      fastpath: "~0.5s (no consensus needed)",
      consensus: "~1-2s (consensus required)",
      winner: "Fastpath by 2-4x",
    },
    {
      aspect: "Gas Cost",
      fastpath: "Lower (no consensus overhead)",
      consensus: "Higher (consensus + shared object versioning)",
      winner: "Fastpath by ~10-20%",
    },
    {
      aspect: "Multi-Party Coordination",
      fastpath: "Requires off-chain service or custodian",
      consensus: "Fully supported by Mysticeti",
      winner: "Consensus (trustless)",
    },
    {
      aspect: "Custody Trust",
      fastpath: "Trust custodian for liveness and safety",
      consensus: "Trust only Move code and consensus",
      winner: "Consensus (reduced trust)",
    },
    {
      aspect: "Transaction Steps",
      fastpath: "More (lock -> register -> swap -> return)",
      consensus: "Fewer (create shared -> swap)",
      winner: "Consensus (simpler)",
    },
    {
      aspect: "Off-Chain Service",
      fastpath: "Custodian service required",
      consensus: "None required",
      winner: "Consensus (simpler operations)",
    },
    {
      aspect: "Atomicity",
      fastpath: "Per-swap atomic; requires custodian verification",
      consensus: "Atomic via Mysticeti consensus",
      winner: "Consensus (protocol-enforced)",
    },
    {
      aspect: "Hot Object Contention",
      fastpath: "Not applicable (no shared access)",
      consensus: "Can cause latency if many txs hit same object",
      winner: "Fastpath (no contention possible)",
    },
  ],

  decision_framework: {
    use_fastpath_when: [
      "Minimizing latency is critical (gaming, HFT)",
      "Objects are personal (wallets, NFTs)",
      "You have trusted infrastructure (custodian)",
      "Simplicity of single-owner access is valuable",
      "Gas cost optimization is priority",
    ],

    use_consensus_when: [
      "Multiple parties need simultaneous access",
      "Trust model requires avoiding custodians",
      "Objects have shared state (contracts, pools)",
      "Programmable rules enforce correctness",
      "Audit trail via consensus is valuable",
    ],

    mixed_strategies: [
      "Fastpath for personal assets, consensus for pool/protocol state",
      "Consensus for escrow logic, fastpath for user wallets",
      "Fastpath objects with consensus wrapper for coordination",
    ],
  },
};

/**
 * IMPLEMENTATION GUIDANCE FOR CROZZ dApp
 * 
 * Suggested object ownership patterns:
 */
export const CROZZ_OWNERSHIP_STRATEGY = {
  game_items: {
    type: "Fastpath (address-owned)",
    reasoning:
      "Individual NFT game items are personal assets; no shared access needed",
    structure: "struct GameItem has key { id: UID, owner: address, ... }",
    transfers: "owner -> new_owner via transfer::transfer()",
  },

  game_state: {
    type: "Consensus (shared object)",
    reasoning: "Game world state accessed by multiple concurrent players",
    structure: "shared GameWorld { state: State, players: Table<address, Player> }",
    benefits: "Atomic transactions handle multi-player interactions",
  },

  player_accounts: {
    type: "Fastpath (address-owned)",
    reasoning: "Individual player progression; personal account",
    structure: "struct PlayerAccount has key { id: UID, owner: address, stats: Stats }",
    optimization: "No consensus overhead for personal account updates",
  },

  token_state: {
    type: "Consensus (shared object)",
    reasoning: "CROZZ token is protocol asset accessed by all",
    structure: "shared TokenConfig { supply: u64, minted: u64, metadata: ... }",
    benefits: "Atomic token operations with strong consistency",
  },

  escrow_trades: {
    type: "Consensus (shared object, minimal trust)",
    reasoning: "Player-to-player trades; no custodian required",
    structure: "shared Escrow<GameItem> for atomic trading",
    advantage: "More trustworthy than custodian-based fastpath escrow",
  },

  pool_contracts: {
    type: "Consensus (shared object)",
    reasoning: "Liquidity pool state accessed concurrently",
    structure: "shared LiquidityPool { reserves: (u64, u64), fee_structure: ... }",
    benefits: "Atomic swaps with consistent pricing",
  },
};

/**
 * OBJECT OWNERSHIP CHECKLIST FOR DEVELOPERS
 */
export const OWNERSHIP_CHECKLIST = {
  before_modeling: [
    "Is object accessed by single user or multiple?",
    "How latency-sensitive is the application?",
    "Do you have/trust a custodian service?",
    "What is the gas budget?",
    "Is atomicity across multiple parties required?",
  ],

  fastpath_requirements: [
    "Object must be owned by single address or immutable",
    "No concurrent multi-party transactions",
    "Acceptable to use trusted custodian for coordination",
    "Latency must be minimized (<1s target)",
  ],

  consensus_requirements: [
    "Design shared object with contention-aware logic",
    "Use versioning/epochs for consistency",
    "Implement efficient Move code (higher cost than fastpath)",
    "Accept slightly higher latency for atomicity",
  ],

  escrow_specific: [
    "Locked<T> + Key pattern prevents tampering",
    "Verify all key IDs in swap function",
    "Implement liveness recovery (return_to_sender)",
    "Test tampering detection (key mismatch scenarios)",
    "Consider event emission for off-chain tracking",
  ],
};
