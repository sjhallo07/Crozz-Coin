// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#[cfg(test)]
module token_factory::token_creator_tests {
  use token_factory::token_creator::{
    Self,
    TokenMetadata,
    TokenConfig,
  };
  use std::string;
  use sui::test_scenario::{Self, Scenario};

  // ============================================================================
  // Test Helpers
  // ============================================================================

  fun create_test_scenario(): Scenario {
    test_scenario::begin(@0xA)
  }

  fun test_token_name(): string::String {
    string::utf8(b"Test Token")
  }

  fun test_token_symbol(): string::String {
    string::utf8(b"TST")
  }

  fun test_module_name(): string::String {
    string::utf8(b"test_token")
  }

  fn test_description(): string::String {
    string::utf8(b"A test token for unit testing")
  }

  fn test_icon_url(): string::String {
    string::utf8(b"https://example.com/icon.png")
  }

  // ============================================================================
  // Token Creation Tests
  // ============================================================================

  #[test]
  fun test_token_creation() {
    let mut scenario = create_test_scenario();
    let ctx = test_scenario::ctx(&mut scenario);

    let (metadata, config) = token_creator::create_token(
      test_token_name(),
      test_token_symbol(),
      9,
      test_description(),
      test_icon_url(),
      test_module_name(),
      1_000_000_000,
      true,
      false,
      false,
      @0xB,
      @0xC,
      ctx,
    );

    assert!(token_creator::get_name(&metadata) == test_token_name());
    assert!(token_creator::get_symbol(&metadata) == test_token_symbol());
    assert!(token_creator::get_decimals(&metadata) == 9);
  }

  #[test]
  fun test_token_with_stablecoin_decimals() {
    let mut scenario = create_test_scenario();
    let ctx = test_scenario::ctx(&mut scenario);

    let (metadata, _config) = token_creator::create_token(
      string::utf8(b"USD Coin"),
      string::utf8(b"USDC"),
      6,
      test_description(),
      test_icon_url(),
      string::utf8(b"usdc"),
      1_000_000_000_000,
      true,
      true,
      true,
      @0xB,
      @0xC,
      ctx,
    );

    assert!(token_creator::get_decimals(&metadata) == 6);
  }

  #[test]
  #[expected_failure(abort_code = token_creator::E_INVALID_DECIMALS)]
  fun test_invalid_decimals_too_high() {
    let mut scenario = create_test_scenario();
    let ctx = test_scenario::ctx(&mut scenario);

    let (_metadata, _config) = token_creator::create_token(
      test_token_name(),
      test_token_symbol(),
      10, // Invalid: > 9
      test_description(),
      test_icon_url(),
      test_module_name(),
      1_000_000_000,
      true,
      false,
      false,
      @0xB,
      @0xC,
      ctx,
    );
  }

  #[test]
  #[expected_failure(abort_code = token_creator::E_TEXT_TOO_LONG)]
  fun test_token_name_too_long() {
    let mut scenario = create_test_scenario();
    let ctx = test_scenario::ctx(&mut scenario);

    // Create a name longer than 100 chars
    let long_name = string::utf8(
      b"This is a very long token name that exceeds the maximum allowed length of one hundred characters and should fail"
    );

    let (_metadata, _config) = token_creator::create_token(
      long_name,
      test_token_symbol(),
      9,
      test_description(),
      test_icon_url(),
      test_module_name(),
      1_000_000_000,
      true,
      false,
      false,
      @0xB,
      @0xC,
      ctx,
    );
  }

  // ============================================================================
  // Pause/Unpause Tests
  // ============================================================================

  #[test]
  fun test_pause_token() {
    let mut scenario = create_test_scenario();
    let ctx = test_scenario::ctx(&mut scenario);

    let (_metadata, mut config) = token_creator::create_token(
      test_token_name(),
      test_token_symbol(),
      9,
      test_description(),
      test_icon_url(),
      test_module_name(),
      1_000_000_000,
      true,
      false,
      true, // pausable
      @0xA, // treasury holder is test sender
      @0xC,
      ctx,
    );

    assert!(!token_creator::is_paused(&config));

    token_creator::pause_token(&mut config, test_scenario::ctx(&mut scenario));

    assert!(token_creator::is_paused(&config));
  }

  #[test]
  fun test_unpause_token() {
    let mut scenario = create_test_scenario();
    let ctx = test_scenario::ctx(&mut scenario);

    let (_metadata, mut config) = token_creator::create_token(
      test_token_name(),
      test_token_symbol(),
      9,
      test_description(),
      test_icon_url(),
      test_module_name(),
      1_000_000_000,
      true,
      false,
      true,
      @0xA,
      @0xC,
      ctx,
    );

    token_creator::pause_token(&mut config, test_scenario::ctx(&mut scenario));
    assert!(token_creator::is_paused(&config));

    token_creator::unpause_token(&mut config, test_scenario::ctx(&mut scenario));
    assert!(!token_creator::is_paused(&config));
  }

  #[test]
  #[expected_failure(abort_code = token_creator::E_NO_PERMISSION)]
  fun test_pause_non_pausable_token() {
    let mut scenario = create_test_scenario();
    let ctx = test_scenario::ctx(&mut scenario);

    let (_metadata, mut config) = token_creator::create_token(
      test_token_name(),
      test_token_symbol(),
      9,
      test_description(),
      test_icon_url(),
      test_module_name(),
      1_000_000_000,
      true,
      false,
      false, // not pausable
      @0xA,
      @0xC,
      ctx,
    );

    token_creator::pause_token(&mut config, test_scenario::ctx(&mut scenario));
  }

  // ============================================================================
  // Freeze/Unfreeze Tests
  // ============================================================================

  #[test]
  fun test_freeze_address() {
    let mut scenario = create_test_scenario();
    let ctx = test_scenario::ctx(&mut scenario);

    let (_metadata, mut config) = token_creator::create_token(
      test_token_name(),
      test_token_symbol(),
      9,
      test_description(),
      test_icon_url(),
      test_module_name(),
      1_000_000_000,
      true,
      true, // freezable
      false,
      @0xA,
      @0xC,
      ctx,
    );

    let address_to_freeze = @0xD;
    assert!(!token_creator::is_address_frozen(&config, address_to_freeze));

    token_creator::freeze_address(
      &mut config,
      address_to_freeze,
      test_scenario::ctx(&mut scenario),
    );

    assert!(token_creator::is_address_frozen(&config, address_to_freeze));
  }

  #[test]
  fun test_unfreeze_address() {
    let mut scenario = create_test_scenario();
    let ctx = test_scenario::ctx(&mut scenario);

    let (_metadata, mut config) = token_creator::create_token(
      test_token_name(),
      test_token_symbol(),
      9,
      test_description(),
      test_icon_url(),
      test_module_name(),
      1_000_000_000,
      true,
      true,
      false,
      @0xA,
      @0xC,
      ctx,
    );

    let address = @0xD;

    token_creator::freeze_address(
      &mut config,
      address,
      test_scenario::ctx(&mut scenario),
    );
    assert!(token_creator::is_address_frozen(&config, address));

    token_creator::unfreeze_address(
      &mut config,
      address,
      test_scenario::ctx(&mut scenario),
    );
    assert!(!token_creator::is_address_frozen(&config, address));
  }

  #[test]
  fun test_freeze_multiple_addresses() {
    let mut scenario = create_test_scenario();
    let ctx = test_scenario::ctx(&mut scenario);

    let (_metadata, mut config) = token_creator::create_token(
      test_token_name(),
      test_token_symbol(),
      9,
      test_description(),
      test_icon_url(),
      test_module_name(),
      1_000_000_000,
      true,
      true,
      false,
      @0xA,
      @0xC,
      ctx,
    );

    let addr1 = @0xD;
    let addr2 = @0xE;
    let addr3 = @0xF;

    token_creator::freeze_address(&mut config, addr1, test_scenario::ctx(&mut scenario));
    token_creator::freeze_address(&mut config, addr2, test_scenario::ctx(&mut scenario));
    token_creator::freeze_address(&mut config, addr3, test_scenario::ctx(&mut scenario));

    assert!(token_creator::is_address_frozen(&config, addr1));
    assert!(token_creator::is_address_frozen(&config, addr2));
    assert!(token_creator::is_address_frozen(&config, addr3));

    let frozen = token_creator::get_frozen_addresses(&config);
    assert!(vector::length(&frozen) == 3);
  }

  // ============================================================================
  // Metadata Tests
  // ============================================================================

  #[test]
  fun test_metadata_is_mutable_by_default() {
    let mut scenario = create_test_scenario();
    let ctx = test_scenario::ctx(&mut scenario);

    let (metadata, _config) = token_creator::create_token(
      test_token_name(),
      test_token_symbol(),
      9,
      test_description(),
      test_icon_url(),
      test_module_name(),
      1_000_000_000,
      true,
      false,
      false,
      @0xB,
      @0xC,
      ctx,
    );

    assert!(token_creator::get_description(&metadata) == test_description());
  }

  #[test]
  fun test_update_metadata() {
    let mut scenario = create_test_scenario();
    let ctx = test_scenario::ctx(&mut scenario);

    let (mut metadata, _config) = token_creator::create_token(
      test_token_name(),
      test_token_symbol(),
      9,
      test_description(),
      test_icon_url(),
      test_module_name(),
      1_000_000_000,
      true,
      false,
      false,
      @0xB,
      @0xC,
      ctx,
    );

    let new_description = string::utf8(b"Updated description");
    let new_icon = string::utf8(b"https://example.com/new-icon.png");

    token_creator::update_metadata(
      &mut metadata,
      test_token_name(),
      new_description,
      new_icon,
      test_scenario::ctx(&mut scenario),
    );

    assert!(token_creator::get_description(&metadata) == new_description);
  }

  #[test]
  fun test_lock_metadata() {
    let mut scenario = create_test_scenario();
    let ctx = test_scenario::ctx(&mut scenario);

    let (mut metadata, _config) = token_creator::create_token(
      test_token_name(),
      test_token_symbol(),
      9,
      test_description(),
      test_icon_url(),
      test_module_name(),
      1_000_000_000,
      true,
      false,
      false,
      @0xB,
      @0xC,
      ctx,
    );

    token_creator::lock_metadata(&mut metadata, test_scenario::ctx(&mut scenario));

    // Metadata should now be immutable
    // Attempting to update would fail
  }

  // ============================================================================
  // Getter Tests
  // ============================================================================

  #[test]
  fun test_getters() {
    let mut scenario = create_test_scenario();
    let ctx = test_scenario::ctx(&mut scenario);

    let (metadata, config) = token_creator::create_token(
      test_token_name(),
      test_token_symbol(),
      9,
      test_description(),
      test_icon_url(),
      test_module_name(),
      1_000_000_000,
      true,
      false,
      false,
      @0xB,
      @0xC,
      ctx,
    );

    assert!(token_creator::get_name(&metadata) == test_token_name());
    assert!(token_creator::get_symbol(&metadata) == test_token_symbol());
    assert!(token_creator::get_decimals(&metadata) == 9);
    assert!(token_creator::get_description(&metadata) == test_description());
    assert!(token_creator::get_icon_url(&metadata) == test_icon_url());
    assert!(!token_creator::is_paused(&config));
  }

  // ============================================================================
  // Edge Case Tests
  // ============================================================================

  #[test]
  fun test_zero_decimals() {
    let mut scenario = create_test_scenario();
    let ctx = test_scenario::ctx(&mut scenario);

    let (metadata, _config) = token_creator::create_token(
      test_token_name(),
      test_token_symbol(),
      0, // NFT-like token
      test_description(),
      test_icon_url(),
      test_module_name(),
      18_400_000_000_000_000_000,
      true,
      false,
      false,
      @0xB,
      @0xC,
      ctx,
    );

    assert!(token_creator::get_decimals(&metadata) == 0);
  }

  #[test]
  fun test_all_features_enabled() {
    let mut scenario = create_test_scenario();
    let ctx = test_scenario::ctx(&mut scenario);

    let (metadata, _config) = token_creator::create_token(
      test_token_name(),
      test_token_symbol(),
      6,
      test_description(),
      test_icon_url(),
      test_module_name(),
      1_000_000_000_000,
      true, // mintable
      true, // freezable
      true, // pausable
      @0xA,
      @0xC,
      ctx,
    );

    assert!(token_creator::get_decimals(&metadata) == 6);
  }

  #[test]
  fun test_no_features_enabled() {
    let mut scenario = create_test_scenario();
    let ctx = test_scenario::ctx(&mut scenario);

    let (metadata, _config) = token_creator::create_token(
      test_token_name(),
      test_token_symbol(),
      9,
      test_description(),
      test_icon_url(),
      test_module_name(),
      1_000_000_000,
      false, // not mintable
      false, // not freezable
      false, // not pausable
      @0xB,
      @0xC,
      ctx,
    );

    assert!(token_creator::get_decimals(&metadata) == 9);
  }
}
