// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * ESCROW EXAMPLES - ADDRESS-OWNED vs SHARED OBJECT
 * 
 * These are TypeScript/Move pseudo-code examples showing the two main
 * escrow patterns from Sui documentation:
 * https://docs.sui.io/guides/developer/sui-101/object-ownership
 * 
 * See GitHub references:
 * - Fastpath: github.com/MystenLabs/sui/blob/main/examples/trading/contracts/escrow/sources/owned.move
 * - Consensus: github.com/MystenLabs/sui/blob/main/examples/trading/contracts/escrow/sources/shared.move
 */

/**
 * PART 1: LOCK MODULE (Used by both patterns)
 * 
 * Provides tamper-proof locking mechanism
 */
export const LOCK_MODULE = {
  description:
    "Core locking primitive that prevents modification without key. " +
    "Key ID serves as proof of original object identity.",

  interface: `
    module escrow::lock {
      // Primitive wrapper + key pair
      public fun lock<T: store>(obj: T, ctx: &mut TxContext): (Locked<T>, Key)
      public fun unlock<T: store>(locked: Locked<T>, key: Key): T
    }
  `,

  key_property:
    "Locked values cannot be modified except by unlocking first. " +
    "Tampering detected by remembering the ID of the key it was locked with.",

  use_in_escrow:
    "Prevents parties from changing object value after locking. " +
    "Custodian/contract verifies key IDs match to prevent silent tampering.",
};

/**
 * PART 2A: FASTPATH ESCROW (Address-Owned Objects)
 * 
 * Requires trusted third-party custodian
 */
export const FASTPATH_ESCROW_EXAMPLE = {
  scenario:
    "Alice and Bob want to swap coins. They trust custodian C to hold objects but not to steal them.",

  three_phase_protocol: {
    phase_1_lock: `
      PHASE 1: LOCK
      Alice: coin_a = lock(asset_a) -> (locked_a, key_a)
      Bob:   coin_b = lock(asset_b) -> (locked_b, key_b)
      
      Can unlock at any time to preserve liveness if other party stalls
    `,

    phase_2_register: `
      PHASE 2: REGISTER WITH CUSTODIAN
      Alice: create_escrow(
        locked: locked_a,
        key: key_a,
        exchange_key: id(key_b),  // ID of key that locked Bob's object
        recipient: Bob,
        custodian: C
      )
      -> Escrow<AssetA> transferred to C
      
      Bob: create_escrow(
        locked: locked_b,
        key: key_b,
        exchange_key: id(key_a),  // ID of key that locked Alice's object
        recipient: Alice,
        custodian: C
      )
      -> Escrow<AssetB> transferred to C
      
      Now C holds both Escrow objects
    `,

    phase_3_swap: `
      PHASE 3: CUSTODIAN EXECUTES SWAP
      Custodian C: swap(escrow_a, escrow_b)
      
      Checks:
      ✓ sender_a == recipient_b (Alice wants to give to Bob)
      ✓ sender_b == recipient_a (Bob wants to give to Alice)
      ✓ escrowed_key_a == exchange_key_b (Assets match)
      ✓ escrowed_key_b == exchange_key_a (Mutual match)
      
      If all checks pass:
      - AssetA transferred to Alice
      - AssetB transferred to Bob
      - Both Escrow objects deleted
    `,
  },

  move_code_structure: {
    Locked: {
      definition: "opaque struct Locked<T: store> { ... }",
      purpose: "Prevents anyone from accessing T without the corresponding Key",
      properties: "Cannot be destructed, only accessed via unlock(locked, key)",
    },

    Key: {
      definition: "struct Key has key, store { id: UID }",
      purpose: "Unique identifier that corresponds to one Locked<T>",
      usage: "consumed by unlock() to extract T from Locked<T>",
    },

    Escrow: {
      definition: `struct Escrow<T: key + store> has key {
  id: UID,
  sender: address,           // Original owner of escrowed object
  recipient: address,        // Intended recipient of escrowed object
  exchange_key: ID,          // ID of key needed from other party
  escrowed_key: ID,          // ID of key that locked this object
  escrowed: T,               // The actual object
}`,
      stored: "Transferred to and held by custodian",
      access: "Only custodian (owner) can call swap() or return_to_sender()",
    },
  },

  function_swap: {
    signature: "public fun swap<T, U>(obj1: Escrow<T>, obj2: Escrow<U>)",
    preconditions: [
      "Called by custodian (owner)",
      "obj1 and obj2 are matching escrow requests",
    ],
    verification: [
      "obj1.sender == obj2.recipient",
      "obj2.sender == obj1.recipient",
      "obj1.escrowed_key == obj2.exchange_key",
      "obj2.escrowed_key == obj1.exchange_key",
    ],
    effects: "Atomically transfers obj1.escrowed to obj1.recipient and vice versa",
  },

  function_return_to_sender: {
    signature: "public fun return_to_sender<T>(obj: Escrow<T>)",
    preconditions: ["Called by custodian"],
    effects: "Returns escrowed object to original sender (cancels swap)",
    use_case: "Preserves liveness if other party abandons swap",
  },

  tamper_detection_example: {
    scenario: "Bob tries to reduce the value of asset_b after locking",
    steps: [
      "Bob: (locked_b, key_b) = lock(asset_b) with 100 coins",
      "Bob: unlock(locked_b, key_b) -> asset_b with 100 coins",
      "Bob: modifies asset_b, splits it: split(asset_b, 50) -> coin (50 removed)",
      "Bob: (locked_b', key_b') = lock(asset_b with 50 coins)",
      "Bob sends escrow with key_b' ID (NOT key_b ID)",
    ],
    detection:
      "Custodian's swap() checks: Alice's exchange_key = id(key_b) " +
      "but Bob's escrowed_key = id(key_b') -> MISMATCH",
    result: "Swap reverts; Alice's asset returned safely",
    conclusion: "Lock mechanism prevents silent tampering via key ID mismatch",
  },

  tradeoffs: {
    advantages: [
      "Very low latency (no consensus required)",
      "Lower gas costs than consensus path",
      "Simple for users with trusted custodian",
    ],
    disadvantages: [
      "Requires trusted third-party custodian",
      "More transaction steps (lock, register, swap)",
      "More complex protocol (3 phases)",
      "Custodian could theoretically stall or refuse",
    ],
  },
};

/**
 * PART 2B: CONSENSUS ESCROW (Shared Objects)
 * 
 * Trustless two-party swap using shared objects
 */
export const CONSENSUS_ESCROW_EXAMPLE = {
  scenario:
    "Alice and Bob want to swap coins without trusting any third party. " +
    "They use Mysticeti consensus to coordinate atomically.",

  two_phase_protocol: {
    phase_1_alice_creates: `
      PHASE 1: ALICE CREATES SHARED ESCROW
      Alice: 
        1. Decides to trade asset_a for Bob's asset_b
        2. Locks asset_b (conceptually): knows key_b ID she needs from Bob
        3. Creates shared Escrow<AssetA>:
           - sender = Alice
           - recipient = Bob
           - exchange_key = id(key_b)  // ID of key that will lock Bob's asset
           - stored in DOF: EscrowedObjectKey -> asset_a
        4. Calls transfer::public_share_object(escrow)
        
      Result: Escrow accessible by anyone but only Bob can complete swap
      Benefit: No custodian needed; on-chain settlement
    `,

    phase_2_bob_responds: `
      PHASE 2: BOB COMPLETES SWAP
      Bob:
        1. Sees Alice's public Escrow (queryable via GraphQL)
        2. Locks his asset_b: lock(asset_b) -> (locked_b, key_b)
        3. Calls escrow.swap(key_b, locked_b):
           
      Move checks in swap():
      ✓ recipient == tx context sender  // Only Bob can call
      ✓ exchange_key == id(key_b)       // Key must match what Alice specified
      ✓ locked_b unlocks to asset_b     // Key signature valid
      
      If all checks pass:
        - asset_a extracted from Escrow
        - Escrow deleted
        - locked_b unlocked -> asset_b sent to Alice
        - asset_a returned to Bob
      
      Result: Atomic swap via Mysticeti consensus
    `,
  },

  move_code_structure: {
    Escrow_Shared: {
      definition: `struct Escrow<phantom T: key + store> has key, store {
  id: UID,
  sender: address,           // Alice (creator, will receive T)
  recipient: address,        // Bob (intended counterparty)
  exchange_key: ID,          // ID of key Bob will provide
  // T (asset_a) stored as Dynamic Object Field
}`,
      shared: "transfer::public_share_object(escrow) makes it globally accessible",
      storage:
        "Uses Dynamic Object Fields (DOF) so nested object remains queryable",
      visibility:
        "Anyone can read Escrow state; Move code enforces write permissions",
    },

    swap_function: {
      signature: "public fun swap<T, U>(mut escrow: Escrow<T>, key: Key, locked: Locked<U>, ctx: &TxContext): T",
      preconditions: [
        "Only recipient can call (checked in Move code)",
        "key ID must match escrow's exchange_key",
        "locked must be valid (matches key)",
      ],
      effects: [
        "Removes T from Escrow DOF",
        "Deletes Escrow object",
        "Sends locked.unlock(key) -> U to original sender (Alice)",
        "Returns T to caller (Bob)",
      ],
      atomicity: "All effects occur atomically via Mysticeti consensus",
    },

    return_to_sender_function: {
      signature: "public fun return_to_sender<T>(mut escrow: Escrow<T>, ctx: &TxContext): T",
      preconditions: ["Only sender (Alice) can call"],
      effects: [
        "Removes T from Escrow DOF",
        "Deletes Escrow object",
        "Returns T to sender",
      ],
      use_case: "Alice can cancel escrow if Bob never responds (preserves liveness)",
    },
  },

  event_system: {
    EscrowCreated: {
      emitted: "When Alice creates shared Escrow",
      fields: "escrow_id, key_id, sender, recipient, item_id",
      query:
        "Off-chain indexer can listen for this event to surface pending escrows to Bob",
    },

    EscrowSwapped: {
      emitted: "When Bob completes swap",
      fields: "escrow_id",
      use: "Notify both parties and indexers that swap succeeded",
    },

    EscrowCancelled: {
      emitted: "When Alice cancels escrow via return_to_sender",
      fields: "escrow_id",
      use: "Notify Bob that this escrow is no longer available",
    },
  },

  advantages_over_fastpath: {
    no_custodian: "Fully trustless; Move code + Mysticeti enforce correctness",
    fewer_steps: "Alice creates, Bob swaps (no custodian coordination needed)",
    on_chain_settlement: "Settlement happens immediately on-chain",
    programmable: "Alice and Bob directly interact with escrow via public functions",
    queryable: "Escrow state queryable via GraphQL; transparent to both parties",
    atomic_finality:
      "Mysticeti orders all operations atomically; no race conditions",
  },

  tradeoffs: {
    higher_latency: "Consensus adds ~0.5-1.5s latency vs fastpath",
    higher_gas: "Shared object versioning overhead costs more gas",
    contention_risk:
      "If escrow is very popular, contention on shared object could increase latency",
  },

  comparison_with_fastpath: {
    custody: "Consensus: On-chain code. Fastpath: Trusted custodian service.",
    steps:
      "Consensus: 2 phases (create, swap). Fastpath: 3+ phases (lock, register, swap).",
    trust:
      "Consensus: Only Mysticeti consensus. Fastpath: Custodian + consensus.",
    finality:
      "Consensus: ~1-2s (consensus). Fastpath: ~0.5s (no consensus needed).",
    gas: "Consensus: Higher. Fastpath: Lower.",
    best_for:
      "Consensus: Multi-party coordination without trust. Fastpath: Personal assets, latency-critical.",
  },
};

/**
 * ESCROW DECISION FRAMEWORK FOR DEVELOPERS
 */
export const ESCROW_DECISION_TREE = {
  questions: [
    {
      question: "Do you have a trusted intermediary (custodian)?",
      yes_answer: "Consider Fastpath Escrow for lower latency and gas (phase 1: lock, phase 2: register, phase 3: swap)",
      no_answer: "Use Consensus Escrow for trustless settlement via Mysticeti",
    },
    {
      question: "Is latency critical (<1 second)?",
      yes_answer: "Fastpath Escrow provides ~0.5s finality (no consensus); accept custodian requirement",
      no_answer: "Consensus Escrow provides ~1-2s finality; eliminates custodian dependency",
    },
    {
      question: "Is gas cost the primary concern?",
      yes_answer: "Fastpath Escrow has ~10-20% lower gas than consensus (no shared object overhead)",
      no_answer: "Consensus Escrow is acceptable; pay for atomicity and trustlessness",
    },
    {
      question: "Do you need atomic multi-party updates?",
      yes_answer: "Consensus Escrow is mandatory; fastpath cannot coordinate atomically without custodian",
      no_answer: "Fastpath Escrow sufficient; simpler protocol with trusted custodian",
    },
  ],

  recommendation_matrix: {
    low_latency_with_custodian: "Fastpath Escrow",
    low_latency_no_custodian: "Fastpath Escrow (with on-chain custodian contract)",
    atomic_trustless: "Consensus Escrow",
    personal_assets: "Fastpath (address-owned)",
  },
};

/**
 * CROZZ dApp ESCROW RECOMMENDATIONS
 */
export const CROZZ_ESCROW_IMPLEMENTATION = {
  player_trades: {
    pattern: "Consensus Escrow (Shared Object)",
    reasoning:
      "CROZZ players should be able to trade without trusting a custodian. " +
      "Mysticeti consensus provides atomic, trustless settlement.",
    benefits: [
      "No custodian service required",
      "Full transparency on-chain",
      "Atomic execution prevents partial trades",
      "Events emit for UI notification",
    ],
    flow: `
      1. Alice creates Escrow<GameItem>:
         - Offers her item_a
         - Specifies Bob as recipient
         - Specifies id(key_b) as required key from Bob
         - Makes Escrow shared
      
      2. Bob sees public Escrow via GraphQL
      
      3. Bob locks his item_b: lock(item_b) -> (locked_b, key_b)
      
      4. Bob calls escrow.swap(key_b, locked_b)
         - Move verifies Bob is recipient
         - Move verifies key_b ID matches
         - All checks pass -> atomic swap
      
      5. Result: Alice gets item_b, Bob gets item_a
    `,
  },

  npc_trades: {
    pattern: "Fastpath Escrow (Address-Owned) with Trusted NPC Contract",
    reasoning:
      "NPC trades are controlled by CROZZ protocol; " +
      "can use lower-latency fastpath with contract-as-custodian.",
    benefits: [
      "Faster finality for better UX",
      "Lower gas costs",
      "Contract enforces trade rules",
    ],
  },

  auction_system: {
    pattern: "Consensus (Shared Object)",
    reasoning:
      "Auction state must be accessible by many bidders; needs shared object versioning.",
    structure: `
      shared Auction {
        item: T,
        highest_bid: u64,
        highest_bidder: address,
        end_time: u64,
      }
    `,
    atomicity: "Each bid updates highest_bid atomically via Mysticeti",
  },

  escrow_testing_checklist: [
    "Lock mechanism prevents tampering (key ID mismatch scenario)",
    "Only authorized parties can call swap() or return_to_sender()",
    "Events emit correctly for off-chain indexing",
    "Atomic guarantees hold (no partial swaps)",
    "Liveness preserved (parties can recover objects if counterparty stalls)",
  ],
};
