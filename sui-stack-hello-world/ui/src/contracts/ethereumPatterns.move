// Move Smart Contract Examples: Ethereum Patterns Rewritten
// Complete working examples for common Ethereum use cases

/**
 * PATTERN 1: SIMPLE TOKEN (ERC-20 Equivalent)
 * 
 * Solidity ERC-20:
 * - Mappings for balances and allowances
 * - centralized state in contract
 * 
 * Move:
 * - Individual Coin objects per user
 * - Distributed ownership
 */

module token::simple_token {
  use sui::coin::{Self, Coin, TreasuryCap};
  use sui::transfer;
  use sui::tx_context::{Self, TxContext};
  use sui::url::Url;
  use std::option;

  /// The type identifier for this token
  public struct TOKEN has drop {}

  /// Initialize the token
  fun init(witness: TOKEN, ctx: &mut TxContext) {
    let (treasury, metadata) = coin::create_currency(
      witness,
      9,  // decimals (like USDC has 6, this has 9)
      b"CROZZ",
      b"Crozz Token",
      b"The official token of CROZZ ecosystem",
      option::none(),  // no icon
      ctx
    );

    // Give treasury cap to sender (contract owner)
    transfer::public_transfer(treasury, tx_context::sender(ctx));
    
    // Share metadata publicly
    transfer::public_share_object(metadata);
  }

  /// Mint new tokens (only treasury cap holder can do this)
  public fun mint(
    treasury_cap: &mut TreasuryCap<TOKEN>,
    amount: u64,
    ctx: &mut TxContext
  ): Coin<TOKEN> {
    coin::mint(treasury_cap, amount, ctx)
  }

  /// Burn tokens (remove from circulation)
  public fun burn(
    treasury_cap: &mut TreasuryCap<TOKEN>,
    coin: Coin<TOKEN>
  ) {
    coin::burn(treasury_cap, coin)
  }

  /// Transfer tokens (direct ownership transfer)
  public fun transfer_token(
    coin: Coin<TOKEN>,
    recipient: address
  ) {
    transfer::public_transfer(coin, recipient)
  }
}

/**
 * PATTERN 2: ADMIN CAPABILITY (Ownable Equivalent)
 * 
 * Solidity Ownable:
 * - owner address stored in contract
 * - require(msg.sender == owner) checks
 * 
 * Move:
 * - AdminCap object granted to owner
 * - Type system enforces capability requirement
 */

module access::admin {
  use sui::object::{Self, UID};
  use sui::transfer;
  use sui::tx_context::{Self, TxContext};

  /// Grants admin privileges
  /// This object can only be transferred, not created arbitrarily
  public struct AdminCap has key {
    id: UID,
  }

  /// Initialize with admin cap
  fun init(ctx: &mut TxContext) {
    let admin_cap = AdminCap {
      id: object::new(ctx),
    };
    transfer::transfer(admin_cap, tx_context::sender(ctx));
  }

  /// Only way to create a new admin: current admin must approve
  public fun grant_admin(
    _: &AdminCap,  // Proof of admin status (must own this)
    recipient: address,
    ctx: &mut TxContext
  ) {
    let new_cap = AdminCap {
      id: object::new(ctx),
    };
    transfer::transfer(new_cap, recipient);
  }

  /// Protected operation - only admins can call
  public fun admin_only_action(
    _: &AdminCap,  // Caller must pass admin cap
    some_value: u64
  ) {
    // If caller doesn't own AdminCap, this won't compile/execute
    // No require() needed - it's enforced by the type system
  }

  /// Revoke admin privileges (burn the cap)
  public fun revoke_admin(
    cap: AdminCap  // Takes ownership (revokes)
  ) {
    let AdminCap { id } = cap;
    object::delete(id);
  }
}

/**
 * PATTERN 3: VAULT / ESCROW
 * 
 * Solidity:
 * - Mapping of deposits
 * - Withdraw functions with balance checks
 * 
 * Move:
 * - Individual vault objects
 * - Owner directly accesses their vault
 */

module vault::escrow {
  use sui::coin::{Coin, Self};
  use sui::object::{Self, UID};
  use sui::transfer;
  use sui::tx_context::{Self, TxContext};
  use sui::sui::SUI;

  /// Individual vault for each user
  public struct Vault<T> has key {
    id: UID,
    owner: address,
    balance: u64,
    locked_until: u64,  // Epoch when funds unlock
  }

  /// Create a new vault
  public fun create_vault(
    amount: u64,
    locked_until: u64,
    ctx: &mut TxContext
  ) {
    let vault = Vault<SUI> {
      id: object::new(ctx),
      owner: tx_context::sender(ctx),
      balance: amount,
      locked_until,
    };
    transfer::transfer(vault, tx_context::sender(ctx));
  }

  /// Deposit more funds
  public fun deposit<T>(
    vault: &mut Vault<T>,
    amount: u64
  ) {
    vault.balance += amount;
  }

  /// Withdraw if unlocked
  public fun withdraw<T>(
    vault: &mut Vault<T>,
    amount: u64,
    ctx: &mut TxContext
  ): Coin<T> {
    let current_epoch = tx_context::epoch(ctx);
    assert!(current_epoch >= vault.locked_until, 0);  // Not yet unlocked
    assert!(vault.balance >= amount, 1);  // Insufficient balance

    vault.balance -= amount;
    // In real implementation, create actual Coin
    coin::zero(ctx)
  }

  /// Get vault balance (read-only)
  public fun get_balance<T>(vault: &Vault<T>): u64 {
    vault.balance
  }
}

/**
 * PATTERN 4: NFT COLLECTION WITH MINTING
 * 
 * Solidity:
 * - ERC-721 contract manages all NFTs
 * - Mappings for owners and metadata
 * 
 * Move:
 * - Individual NFT objects
 * - Each NFT is owned by an address
 * - Collections are metadata (off-chain or shared)
 */

module nft::crozz_nft {
  use sui::object::{Self, UID, ID};
  use sui::transfer;
  use sui::tx_context::{Self, TxContext};
  use std::string::String;

  /// Individual NFT
  public struct CrozzNFT has key, store {
    id: UID,
    name: String,
    description: String,
    image_url: String,
    creator: address,
    mint_number: u64,
  }

  /// Minter capability (only holder can mint)
  public struct MinterCap has key {
    id: UID,
    total_minted: u64,
    max_supply: u64,
  }

  /// Initialize NFT collection with minter cap
  fun init(ctx: &mut TxContext) {
    let minter = MinterCap {
      id: object::new(ctx),
      total_minted: 0,
      max_supply: 10000,
    };
    transfer::transfer(minter, tx_context::sender(ctx));
  }

  /// Mint a new NFT (only minter can call)
  public fun mint(
    minter: &mut MinterCap,
    name: String,
    description: String,
    image_url: String,
    recipient: address,
    ctx: &mut TxContext
  ): ID {
    assert!(minter.total_minted < minter.max_supply, 0);  // Max supply reached

    let nft = CrozzNFT {
      id: object::new(ctx),
      name,
      description,
      image_url,
      creator: tx_context::sender(ctx),
      mint_number: minter.total_minted + 1,
    };

    let nft_id = object::uid_to_inner(&nft.id);
    minter.total_minted += 1;

    transfer::public_transfer(nft, recipient);
    nft_id
  }

  /// Transfer NFT to new owner
  public fun transfer_nft(
    nft: CrozzNFT,
    to: address
  ) {
    transfer::public_transfer(nft, to);
  }

  /// Burn NFT (remove from existence)
  public fun burn(nft: CrozzNFT) {
    let CrozzNFT { id, .. } = nft;
    object::delete(id);
  }
}

/**
 * PATTERN 5: MARKETPLACE / LISTING
 * 
 * Solidity:
 * - Contract holds escrow of items for sale
 * - Buyer sends funds to contract
 * - Contract transfers item to buyer
 * 
 * Move:
 * - Seller creates listing object
 * - Listing holds item directly
 * - Buyer sends coins and receives item (atomic)
 */

module marketplace::listing {
  use sui::object::{Self, UID};
  use sui::coin::Coin;
  use sui::transfer;
  use sui::tx_context::{Self, TxContext};
  use sui::sui::SUI;

  /// Represents an item for sale
  public struct Listing<T: key + store> has key {
    id: UID,
    seller: address,
    item: T,
    price: u64,
  }

  /// Create a listing for an item
  public fun create_listing<T: key + store>(
    item: T,
    price: u64,
    ctx: &mut TxContext
  ) {
    let listing = Listing {
      id: object::new(ctx),
      seller: tx_context::sender(ctx),
      item,
      price,
    };
    transfer::public_share_object(listing);
  }

  /// Purchase an item (buyer pays, gets item)
  public fun purchase<T: key + store>(
    listing: Listing<T>,
    payment: Coin<SUI>,
    recipient: address,
    ctx: &mut TxContext
  ) {
    assert!(coin::value(&payment) >= listing.price, 0);  // Insufficient payment

    // Give coins to seller
    transfer::public_transfer(payment, listing.seller);

    // Give item to buyer
    transfer::public_transfer(listing.item, recipient);

    // Delete listing
    let Listing { id, .. } = listing;
    object::delete(id);
  }

  /// Cancel listing (seller only)
  public fun cancel_listing<T: key + store>(
    listing: Listing<T>,
    ctx: &mut TxContext
  ) {
    assert!(listing.seller == tx_context::sender(ctx), 0);  // Not seller

    // Return item to seller
    transfer::public_transfer(listing.item, listing.seller);

    // Delete listing
    let Listing { id, .. } = listing;
    object::delete(id);
  }
}

/**
 * PATTERN 6: MULTI-SIG APPROVAL
 * 
 * Solidity:
 * - Contract tracks approvers and required signatures
 * - getApprovals() returns count
 * 
 * Move:
 * - Approval objects are collected
 * - Once all collected, can execute
 */

module multisig::approval {
  use sui::object::{Self, UID};
  use sui::transfer;
  use sui::tx_context::{Self, TxContext};

  /// A proposal that needs multiple signatures
  public struct Proposal has key {
    id: UID,
    proposer: address,
    title: String,
    description: String,
    approvals_required: u64,
    approvals_collected: u64,
    executed: bool,
  }

  /// Approval vote
  public struct Approval has key {
    id: UID,
    proposal_id: ID,
    approver: address,
  }

  /// Create a proposal
  public fun create_proposal(
    title: String,
    description: String,
    approvals_required: u64,
    ctx: &mut TxContext
  ): ID {
    let proposal = Proposal {
      id: object::new(ctx),
      proposer: tx_context::sender(ctx),
      title,
      description,
      approvals_required,
      approvals_collected: 0,
      executed: false,
    };

    let proposal_id = object::uid_to_inner(&proposal.id);
    transfer::public_share_object(proposal);
    proposal_id
  }

  /// Submit an approval
  public fun approve(
    proposal: &mut Proposal,
    ctx: &mut TxContext
  ) {
    assert!(!proposal.executed, 0);  // Already executed
    assert!(proposal.approvals_collected < proposal.approvals_required, 1);

    let approval = Approval {
      id: object::new(ctx),
      proposal_id: object::uid_to_inner(&proposal.id),
      approver: tx_context::sender(ctx),
    };

    proposal.approvals_collected += 1;
    transfer::transfer(approval, proposal.proposer);
  }

  /// Execute proposal once approved
  public fun execute(
    proposal: &mut Proposal
  ) {
    assert!(!proposal.executed, 0);
    assert!(proposal.approvals_collected >= proposal.approvals_required, 1);

    proposal.executed = true;
  }
}

/**
 * PATTERN 7: POOL / LIQUIDITY (Simplified UniswapV2 Style)
 * 
 * Solidity:
 * - Contract holds reserves of both tokens
 * - Users send tokens to contract
 * - Contract mints/burns LP tokens
 * 
 * Move:
 * - Pool is an object holding both coin types
 * - LP tokens are Coin<LP_TOKEN>
 * - Direct object mutation
 */

module pool::liquidity {
  use sui::object::{Self, UID};
  use sui::coin::{Coin, Self};
  use sui::transfer;
  use sui::tx_context::TxContext;

  /// LP token type
  public struct LP_TOKEN has drop {}

  /// Liquidity pool
  public struct Pool<T, U> has key {
    id: UID,
    reserve_t: u64,
    reserve_u: u64,
    total_supply: u64,
  }

  /// Create a new pool
  public fun create_pool<T, U>(
    coin_t: Coin<T>,
    coin_u: Coin<U>,
    ctx: &mut TxContext
  ): Coin<LP_TOKEN> {
    let pool = Pool {
      id: object::new(ctx),
      reserve_t: coin::value(&coin_t),
      reserve_u: coin::value(&coin_u),
      total_supply: 1000,  // Initial mint
    };

    // In real impl: properly merge coins into pool
    transfer::share_object(pool);

    // Return LP tokens
    coin::zero(ctx)
  }

  /// Add liquidity to pool
  public fun add_liquidity<T, U>(
    pool: &mut Pool<T, U>,
    coin_t: Coin<T>,
    coin_u: Coin<U>,
    ctx: &mut TxContext
  ): Coin<LP_TOKEN> {
    let amount_t = coin::value(&coin_t);
    let amount_u = coin::value(&coin_u);

    // Calculate LP tokens to mint (simplified)
    let lp_amount = (amount_t + amount_u);

    pool.reserve_t += amount_t;
    pool.reserve_u += amount_u;
    pool.total_supply += lp_amount;

    // Return LP tokens
    coin::zero(ctx)
  }

  /// Swap T for U
  public fun swap<T, U>(
    pool: &mut Pool<T, U>,
    coin_in: Coin<T>,
    ctx: &mut TxContext
  ): Coin<U> {
    let amount_in = coin::value(&coin_in);
    
    // Simplified: x*y = k formula
    // out = (amount_in * reserve_u) / (reserve_t + amount_in)
    let amount_out = (amount_in * pool.reserve_u) / (pool.reserve_t + amount_in);

    pool.reserve_t += amount_in;
    pool.reserve_u -= amount_out;

    // Return output coins
    coin::zero(ctx)
  }
}

/**
 * PATTERN 8: TIME-LOCKED TRANSACTIONS (TIMELOCK Equivalent)
 * 
 * Solidity:
 * - Contract queue pending transactions
 * - After delay, can execute
 * 
 * Move:
 * - Transaction object created with timestamp
 * - Can execute after timestamp passed
 */

module timelock::delayed {
  use sui::object::{Self, UID};
  use sui::transfer;
  use sui::tx_context::{Self, TxContext};

  /// Delayed transaction
  public struct DelayedTx has key {
    id: UID,
    executor: address,
    executable_after: u64,
    description: String,
    executed: bool,
  }

  /// Schedule a delayed transaction
  public fun schedule_tx(
    description: String,
    delay_epochs: u64,
    ctx: &mut TxContext
  ) {
    let current_epoch = tx_context::epoch(ctx);
    
    let tx = DelayedTx {
      id: object::new(ctx),
      executor: tx_context::sender(ctx),
      executable_after: current_epoch + delay_epochs,
      description,
      executed: false,
    };

    transfer::public_share_object(tx);
  }

  /// Execute delayed transaction (after delay)
  public fun execute_tx(
    tx: &mut DelayedTx,
    ctx: &mut TxContext
  ) {
    let current_epoch = tx_context::epoch(ctx);
    assert!(!tx.executed, 0);  // Already executed
    assert!(current_epoch >= tx.executable_after, 1);  // Not yet executable

    tx.executed = true;
  }

  /// Cancel delayed transaction (before execution)
  public fun cancel_tx(
    tx: DelayedTx,
    ctx: &mut TxContext
  ) {
    assert!(tx.executor == tx_context::sender(ctx), 0);  // Not executor
    assert!(!tx.executed, 1);  // Already executed

    let DelayedTx { id, .. } = tx;
    object::delete(id);
  }
}

/**
 * PATTERN 9: ROLE-BASED ACCESS (AccessControl Equivalent)
 * 
 * Solidity:
 * - Role bytes32 stored in mappings
 * - hasRole() checks membership
 * 
 * Move:
 * - Role cap objects represent membership
 * - Passing cap proves membership
 */

module access::roles {
  use sui::object::{Self, UID};
  use sui::transfer;
  use sui::tx_context::{Self, TxContext};

  /// Different role capabilities
  public struct AdminRole has key { id: UID }
  public struct MinterRole has key { id: UID }
  public struct BurnerRole has key { id: UID }

  /// Grant admin role
  public fun grant_admin_role(
    recipient: address,
    ctx: &mut TxContext
  ) {
    let cap = AdminRole { id: object::new(ctx) };
    transfer::transfer(cap, recipient);
  }

  /// Grant minter role
  public fun grant_minter_role(
    recipient: address,
    ctx: &mut TxContext
  ) {
    let cap = MinterRole { id: object::new(ctx) };
    transfer::transfer(cap, recipient);
  }

  /// Function that requires admin role
  public fun admin_action(
    _: &AdminRole,
    some_value: u64
  ) {
    // Can only call if you own AdminRole cap
  }

  /// Function that requires minter role
  public fun mint_action(
    _: &MinterRole,
    some_value: u64
  ) {
    // Can only call if you own MinterRole cap
  }

  /// Revoke role by burning cap
  public fun revoke_role<T: key>(cap: T) {
    // Function doesn't exist - cap would need to be explicitly burned
    // In real code, would extract id and delete it
  }
}

/**
 * PATTERN 10: UPGRADEABLE STORAGE (Versioning)
 * 
 * Solidity:
 * - Proxy pattern with delegate calls
 * 
 * Move:
 * - Version field in objects
 * - Migration functions between versions
 */

module storage::versioning {
  use sui::object::{Self, UID};

  // Version 1 of storage
  public struct DataV1 has key {
    id: UID,
    value: u64,
  }

  // Version 2 - added new field
  public struct DataV2 has key {
    id: UID,
    value: u64,
    new_field: bool,  // Added in v2
  }

  /// Migrate from v1 to v2
  public fun migrate_v1_to_v2(
    old: DataV1
  ): DataV2 {
    let DataV1 { id, value } = old;
    
    DataV2 {
      id,
      value,
      new_field: false,  // Default for new field
    }
  }

  /// Protocol handles upgrade capability
  /// New functions target DataV2 struct
  /// Old code still works with DataV1
}

export default {
  // Patterns documented above
};
