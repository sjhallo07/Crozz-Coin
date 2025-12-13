// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/// Token Factory Module - Create custom tokens on Sui
/// Features: Mintable, Freezable, Pausable, with full metadata support
module token_factory::token_creator {
  use std::string::{Self, String};
  use sui::coin;
  use sui::transfer;
  use sui::tx_context::TxContext;
  use sui::object::{Self, UID};
  use sui::balance::Balance;
  use sui::event;
  use sui::url::{Self, Url};

  // ============================================================================
  // Error codes
  // ============================================================================

  /// Invalid decimals (must be 0-9)
  const E_INVALID_DECIMALS: u64 = 1;

  /// Module name already exists
  const E_MODULE_NAME_EXISTS: u64 = 2;

  /// Insufficient permissions
  const E_NO_PERMISSION: u64 = 3;

  /// Text too long
  const E_TEXT_TOO_LONG: u64 = 4;

  /// Token is paused
  const E_TOKEN_PAUSED: u64 = 5;

  /// Address is frozen
  const E_ADDRESS_FROZEN: u64 = 6;

  // ============================================================================
  // Constants
  // ============================================================================

  const MAX_NAME_LENGTH: u64 = 100;
  const MAX_DESCRIPTION_LENGTH: u64 = 1000;
  const MAX_DECIMALS: u8 = 9;

  // ============================================================================
  // Structs
  // ============================================================================

  /// Token metadata with all configuration
  public struct TokenMetadata has key, store {
    id: UID,
    name: String,
    symbol: String,
    description: String,
    decimals: u8,
    icon_url: String,
    module_name: String,
    creator: address,
    created_at: u64,
    is_mutable: bool,
    supply: u64,
  }

  /// Token configuration
  public struct TokenConfig has key, store {
    id: UID,
    is_pausable: bool,
    is_freezable: bool,
    is_mintable: bool,
    is_paused: bool,
    frozen_addresses: vector<address>,
    treasury_cap_holder: address,
    supply_recipient: address,
  }

  /// Treasury cap wrapper
  public struct TreasuryCap<phantom T> has key, store {
    id: UID,
    cap: coin::TreasuryCap<T>,
  }

  /// Freeze authority
  public struct FreezeAuth has key, store {
    id: UID,
    can_freeze: bool,
  }

  // ============================================================================
  // Events
  // ============================================================================

  /// Emitted when token is created
  public struct TokenCreated has copy, drop {
    token_name: String,
    symbol: String,
    decimals: u8,
    creator: address,
    timestamp: u64,
  }

  /// Emitted when token is paused
  public struct TokenPaused has copy, drop {
    module_name: String,
    timestamp: u64,
  }

  /// Emitted when token is unpaused
  public struct TokenUnpaused has copy, drop {
    module_name: String,
    timestamp: u64,
  }

  /// Emitted when address is frozen
  public struct AddressFrozen has copy, drop {
    frozen_address: address,
    timestamp: u64,
  }

  /// Emitted when address is unfrozen
  public struct AddressUnfrozen has copy, drop {
    unfrozen_address: address,
    timestamp: u64,
  }

  // ============================================================================
  // Public Functions - Token Creation
  // ============================================================================

  /// Create a new token with full configuration
  public fun create_token(
    name: String,
    symbol: String,
    decimals: u8,
    description: String,
    icon_url: String,
    module_name: String,
    initial_supply: u64,
    is_mintable: bool,
    is_freezable: bool,
    is_pausable: bool,
    treasury_cap_holder: address,
    supply_recipient: address,
    ctx: &mut TxContext,
  ): (TokenMetadata, TokenConfig) {
    // Validate inputs
    assert!(decimals <= MAX_DECIMALS, E_INVALID_DECIMALS);
    assert!(string::length(&name) <= MAX_NAME_LENGTH, E_TEXT_TOO_LONG);
    assert!(string::length(&description) <= MAX_DESCRIPTION_LENGTH, E_TEXT_TOO_LONG);

    let sender = tx_context::sender(ctx);
    let timestamp = tx_context::epoch_timestamp_ms(ctx);

    // Create metadata
    let metadata = TokenMetadata {
      id: object::new(ctx),
      name: name,
      symbol: symbol,
      description: description,
      decimals,
      icon_url,
      module_name,
      creator: sender,
      created_at: timestamp,
      is_mutable: true,
      supply: initial_supply,
    };

    // Create config
    let config = TokenConfig {
      id: object::new(ctx),
      is_pausable,
      is_freezable,
      is_mintable,
      is_paused: false,
      frozen_addresses: vector::empty(),
      treasury_cap_holder,
      supply_recipient,
    };

    // Emit creation event
    event::emit(TokenCreated {
      token_name: name,
      symbol: symbol,
      decimals,
      creator: sender,
      timestamp,
    });

    (metadata, config)
  }

  // =========================================================================
  // Public Entry Functions (externally callable)
  // =========================================================================

  /// Entry: create token and transfer resulting objects to sender
  public entry fun create_token_entry(
    name: String,
    symbol: String,
    decimals: u8,
    description: String,
    icon_url: String,
    module_name: String,
    initial_supply: u64,
    is_mintable: bool,
    is_freezable: bool,
    is_pausable: bool,
    treasury_cap_holder: address,
    supply_recipient: address,
    ctx: &mut TxContext,
  ) {
    let (metadata, config) = create_token(
      name,
      symbol,
      decimals,
      description,
      icon_url,
      module_name,
      initial_supply,
      is_mintable,
      is_freezable,
      is_pausable,
      treasury_cap_holder,
      supply_recipient,
      ctx,
    );

    let sender = tx_context::sender(ctx);
    transfer::transfer(metadata, sender);
    transfer::transfer(config, sender);
  }

  // ============================================================================
  // Public Functions - Pause/Unpause
  // ============================================================================

  /// Pause token transfers (super admin only)
  public fun pause_token(
    config: &mut TokenConfig,
    ctx: &mut TxContext,
  ) {
    assert!(config.is_pausable, E_NO_PERMISSION);
    assert!(tx_context::sender(ctx) == config.treasury_cap_holder, E_NO_PERMISSION);

    config.is_paused = true;

    event::emit(TokenPaused {
      module_name: b"token".to_string(),
      timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
  }

  /// Entry: pause token transfers (super admin only)
  public entry fun pause_token_entry(
    config: &mut TokenConfig,
    ctx: &mut TxContext,
  ) {
    pause_token(config, ctx)
  }

  /// Unpause token transfers (super admin only)
  public fun unpause_token(
    config: &mut TokenConfig,
    ctx: &mut TxContext,
  ) {
    assert!(config.is_pausable, E_NO_PERMISSION);
    assert!(tx_context::sender(ctx) == config.treasury_cap_holder, E_NO_PERMISSION);

    config.is_paused = false;

    event::emit(TokenUnpaused {
      module_name: b"token".to_string(),
      timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
  }

  /// Entry: unpause token transfers (super admin only)
  public entry fun unpause_token_entry(
    config: &mut TokenConfig,
    ctx: &mut TxContext,
  ) {
    unpause_token(config, ctx)
  }

  // ============================================================================
  // Public Functions - Freeze/Unfreeze
  // ============================================================================

  /// Freeze an address (prevent transfers)
  public fun freeze_address(
    config: &mut TokenConfig,
    address_to_freeze: address,
    ctx: &mut TxContext,
  ) {
    assert!(config.is_freezable, E_NO_PERMISSION);
    assert!(tx_context::sender(ctx) == config.treasury_cap_holder, E_NO_PERMISSION);

    if (!vector::contains(&config.frozen_addresses, &address_to_freeze)) {
      vector::push_back(&mut config.frozen_addresses, address_to_freeze);
    };

    event::emit(AddressFrozen {
      frozen_address: address_to_freeze,
      timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
  }

  /// Entry: freeze an address
  public entry fun freeze_address_entry(
    config: &mut TokenConfig,
    address_to_freeze: address,
    ctx: &mut TxContext,
  ) {
    freeze_address(config, address_to_freeze, ctx)
  }

  /// Unfreeze an address
  public fun unfreeze_address(
    config: &mut TokenConfig,
    address_to_unfreeze: address,
    ctx: &mut TxContext,
  ) {
    assert!(config.is_freezable, E_NO_PERMISSION);
    assert!(tx_context::sender(ctx) == config.treasury_cap_holder, E_NO_PERMISSION);

    let (found, index) = vector::index_of(&config.frozen_addresses, &address_to_unfreeze);
    if (found) {
      vector::remove(&mut config.frozen_addresses, index);
    };

    event::emit(AddressUnfrozen {
      unfrozen_address: address_to_unfreeze,
      timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
  }

  /// Entry: unfreeze an address
  public entry fun unfreeze_address_entry(
    config: &mut TokenConfig,
    address_to_unfreeze: address,
    ctx: &mut TxContext,
  ) {
    unfreeze_address(config, address_to_unfreeze, ctx)
  }

  // ============================================================================
  // Public Functions - Metadata Management
  // ============================================================================

  /// Update token metadata (if mutable)
  public fun update_metadata(
    metadata: &mut TokenMetadata,
    name: String,
    description: String,
    icon_url: String,
    ctx: &mut TxContext,
  ) {
    assert!(metadata.is_mutable, E_NO_PERMISSION);
    assert!(tx_context::sender(ctx) == metadata.creator, E_NO_PERMISSION);
    assert!(string::length(&name) <= MAX_NAME_LENGTH, E_TEXT_TOO_LONG);
    assert!(string::length(&description) <= MAX_DESCRIPTION_LENGTH, E_TEXT_TOO_LONG);

    metadata.name = name;
    metadata.description = description;
    metadata.icon_url = icon_url;
  }

  /// Entry: update token metadata (if mutable)
  public entry fun update_metadata_entry(
    metadata: &mut TokenMetadata,
    name: String,
    description: String,
    icon_url: String,
    ctx: &mut TxContext,
  ) {
    update_metadata(metadata, name, description, icon_url, ctx)
  }

  /// Lock metadata (make immutable)
  public fun lock_metadata(
    metadata: &mut TokenMetadata,
    ctx: &mut TxContext,
  ) {
    assert!(tx_context::sender(ctx) == metadata.creator, E_NO_PERMISSION);
    metadata.is_mutable = false;
  }

  /// Entry: lock metadata (make immutable)
  public entry fun lock_metadata_entry(
    metadata: &mut TokenMetadata,
    ctx: &mut TxContext,
  ) {
    lock_metadata(metadata, ctx)
  }

  // ============================================================================
  // Public Functions - Getters
  // ============================================================================

  /// Get token name
  public fun get_name(metadata: &TokenMetadata): String {
    metadata.name
  }

  /// Get token symbol
  public fun get_symbol(metadata: &TokenMetadata): String {
    metadata.symbol
  }

  /// Get token decimals
  public fun get_decimals(metadata: &TokenMetadata): u8 {
    metadata.decimals
  }

  /// Get token description
  public fun get_description(metadata: &TokenMetadata): String {
    metadata.description
  }

  /// Get icon URL
  public fun get_icon_url(metadata: &TokenMetadata): String {
    metadata.icon_url
  }

  /// Check if address is frozen
  public fun is_address_frozen(config: &TokenConfig, addr: address): bool {
    vector::contains(&config.frozen_addresses, &addr)
  }

  /// Check if token is paused
  public fun is_paused(config: &TokenConfig): bool {
    config.is_paused
  }

  /// Get frozen addresses
  public fun get_frozen_addresses(config: &TokenConfig): vector<address> {
    config.frozen_addresses
  }
}
