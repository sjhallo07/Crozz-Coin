// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/// This example demonstrates an improved shared greeting with security features.
/// Features:
/// - anyone can create and share a Greeting object
/// - everyone can update the text of the Greeting object
/// - validation of text length (max 280 characters)
/// - events for tracking all changes
/// - optional ownership control
module hello_world::greeting {
  use std::string;
  use sui::event;

  // ============================================================================
  // Error codes
  // ============================================================================
  
  /// Text exceeds maximum allowed length
  const E_TEXT_TOO_LONG: u64 = 1;
  
  /// Only owner can perform this action
  const E_NOT_OWNER: u64 = 2;
  
  /// Maximum text length (like Twitter)
  const MAX_TEXT_LENGTH: u64 = 280;

  // ============================================================================
  // Structs
  // ============================================================================

  /// A shared greeting with ownership tracking
  public struct Greeting has key {
    id: UID,
    text: string::String,
    owner: address,
    created_at: u64,
    updated_count: u64,
  }

  // ============================================================================
  // Events
  // ============================================================================

  /// Emitted when a new greeting is created
  public struct GreetingCreated has copy, drop {
    greeting_id: ID,
    owner: address,
    text: string::String,
    timestamp: u64,
  }

  /// Emitted when greeting text is updated
  public struct GreetingUpdated has copy, drop {
    greeting_id: ID,
    old_text: string::String,
    new_text: string::String,
    updated_by: address,
    update_count: u64,
    timestamp: u64,
  }

  /// Emitted when ownership is transferred
  public struct OwnershipTransferred has copy, drop {
    greeting_id: ID,
    old_owner: address,
    new_owner: address,
    timestamp: u64,
  }

  // ============================================================================
  // Public Functions
  // ============================================================================
 
  /// Creates a globally shared Greeting object initialized with "Hello world!"
  /// Anyone can create a greeting and becomes its owner
  public fun new(ctx: &mut TxContext) { 
    let sender = tx_context::sender(ctx);
    let greeting_id = object::new(ctx);
    let id_copy = object::uid_to_inner(&greeting_id);
    let text = b"Hello world!".to_string();
    let timestamp = tx_context::epoch_timestamp_ms(ctx);
    
    let new_greeting = Greeting { 
      id: greeting_id,
      text,
      owner: sender,
      created_at: timestamp,
      updated_count: 0,
    };

    // Emit creation event
    event::emit(GreetingCreated {
      greeting_id: id_copy,
      owner: sender,
      text: b"Hello world!".to_string(),
      timestamp,
    });

    transfer::share_object(new_greeting);
  }

  /// Updates text of Greeting object with validation
  /// Anyone can update, but length is validated
  public fun update_text(greeting: &mut Greeting, new_text: string::String, ctx: &mut TxContext) {
    // Validate text length
    assert!(string::length(&new_text) <= MAX_TEXT_LENGTH, E_TEXT_TOO_LONG);
    
    let old_text = greeting.text;
    greeting.text = new_text;
    greeting.updated_count = greeting.updated_count + 1;

    // Emit update event
    event::emit(GreetingUpdated {
      greeting_id: object::uid_to_inner(&greeting.id),
      old_text,
      new_text,
      updated_by: tx_context::sender(ctx),
      update_count: greeting.updated_count,
      timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
  }

  /// Updates text - only owner can call this version
  /// Use this for controlled access
  public fun update_text_owner_only(
    greeting: &mut Greeting, 
    new_text: string::String, 
    ctx: &mut TxContext
  ) {
    let sender = tx_context::sender(ctx);
    assert!(greeting.owner == sender, E_NOT_OWNER);
    
    // Validate text length
    assert!(string::length(&new_text) <= MAX_TEXT_LENGTH, E_TEXT_TOO_LONG);
    
    let old_text = greeting.text;
    greeting.text = new_text;
    greeting.updated_count = greeting.updated_count + 1;

    // Emit update event
    event::emit(GreetingUpdated {
      greeting_id: object::uid_to_inner(&greeting.id),
      old_text,
      new_text,
      updated_by: sender,
      update_count: greeting.updated_count,
      timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
  }

  /// Transfers ownership of the greeting to a new owner
  /// Only current owner can transfer
  public fun transfer_ownership(
    greeting: &mut Greeting,
    new_owner: address,
    ctx: &mut TxContext
  ) {
    let sender = tx_context::sender(ctx);
    assert!(greeting.owner == sender, E_NOT_OWNER);
    
    let old_owner = greeting.owner;
    greeting.owner = new_owner;

    // Emit ownership transfer event
    event::emit(OwnershipTransferred {
      greeting_id: object::uid_to_inner(&greeting.id),
      old_owner,
      new_owner,
      timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
  }

  // ============================================================================
  // Getter Functions
  // ============================================================================

  /// Get the text of a greeting
  public fun text(greeting: &Greeting): string::String {
    greeting.text
  }

  /// Get the owner of a greeting
  public fun owner(greeting: &Greeting): address {
    greeting.owner
  }

  /// Get creation timestamp
  public fun created_at(greeting: &Greeting): u64 {
    greeting.created_at
  }

  /// Get update count
  public fun update_count(greeting: &Greeting): u64 {
    greeting.updated_count
  }

  // ============================================================================
  // Test Functions
  // ============================================================================

  #[test_only]
  public fun new_for_testing(ctx: &mut TxContext): Greeting {
    Greeting {
      id: object::new(ctx),
      text: b"Test greeting".to_string(),
      owner: tx_context::sender(ctx),
      created_at: 0,
      updated_count: 0,
    }
  }
}
