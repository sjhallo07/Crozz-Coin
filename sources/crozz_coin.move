/// CROZZ COIN 2.0 — Fungible token on the Sui Network.
///
/// Key properties
/// --------------
/// • Symbol  : CROZZ
/// • Decimals: 9
/// • Supply  : Controlled by the holder of `TreasuryCap<CROZZ_COIN>`;
///             the cap can be frozen after the initial mint to make the
///             supply permanently fixed.
///
/// Deployment flow
/// ---------------
/// 1. Publish the package — `init` runs automatically and sends the
///    `TreasuryCap` and `AdminCap` to the publisher's address.
/// 2. Call `mint` (or `mint_to_many`) to distribute the initial supply.
/// 3. Call `lock_treasury` to irreversibly destroy the `TreasuryCap` and
///    make the coin deflationary-only.
/// 4. Use `burn` to reduce the circulating supply at any time.
module crozz_coin::crozz_coin {
    use std::ascii;
    use std::option;
    use std::string;
    use sui::balance;
    use sui::coin::{Self, Coin, TreasuryCap, CoinMetadata};
    use sui::object;
    use sui::url;

    // -------------------------------------------------------------------------
    // One-Time Witness
    // -------------------------------------------------------------------------

    /// The OTW type — must match the module name in SCREAMING_SNAKE_CASE.
    public struct CROZZ_COIN has drop {}

    // -------------------------------------------------------------------------
    // Admin capability
    // -------------------------------------------------------------------------

    /// Grants administrative rights (e.g. updating metadata, locking the
    /// treasury).  Separate from `TreasuryCap` so that metadata can still
    /// be updated after the supply is locked.
    public struct AdminCap has key, store {
        id: UID,
    }

    // -------------------------------------------------------------------------
    // Error codes
    // -------------------------------------------------------------------------

    const ELengthMismatch: u64 = 0;

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    const DECIMALS: u8 = 9;
    const SYMBOL: vector<u8> = b"CROZZ";
    const NAME: vector<u8> = b"Crozz Coin";
    const DESCRIPTION: vector<u8> = b"CROZZ COIN 2.0 — the official community coin on the Sui Network.";
    const ICON_URL: vector<u8> = b"https://raw.githubusercontent.com/sjhallo07/Crozz-Coin/main/assets/icon.png";

    // -------------------------------------------------------------------------
    // Init
    // -------------------------------------------------------------------------

    /// Called once at publish time.  Creates the coin currency, freezes the
    /// public metadata object, and transfers both caps to the deployer.
    fun init(witness: CROZZ_COIN, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            DECIMALS,
            SYMBOL,
            NAME,
            DESCRIPTION,
            option::some(url::new_unsafe_from_bytes(ICON_URL)),
            ctx,
        );

        // Freeze metadata so that it is permanently readable on-chain.
        transfer::public_freeze_object(metadata);

        // Send the treasury cap to the deployer.
        transfer::public_transfer(treasury_cap, ctx.sender());

        // Create and send an admin cap to the deployer.
        let admin_cap = AdminCap { id: object::new(ctx) };
        transfer::public_transfer(admin_cap, ctx.sender());
    }

    // -------------------------------------------------------------------------
    // Minting
    // -------------------------------------------------------------------------

    /// Mint `amount` CROZZ (in base units) and transfer them to `recipient`.
    public fun mint(
        treasury_cap: &mut TreasuryCap<CROZZ_COIN>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
    }

    /// Mint `amount` CROZZ and return the coin object to the caller instead
    /// of transferring directly (useful for composability).
    public fun mint_coin(
        treasury_cap: &mut TreasuryCap<CROZZ_COIN>,
        amount: u64,
        ctx: &mut TxContext,
    ): Coin<CROZZ_COIN> {
        coin::mint(treasury_cap, amount, ctx)
    }

    /// Batch-mint to multiple recipients in a single transaction.
    /// `amounts` and `recipients` must have the same length.
    public fun mint_to_many(
        treasury_cap: &mut TreasuryCap<CROZZ_COIN>,
        amounts: vector<u64>,
        recipients: vector<address>,
        ctx: &mut TxContext,
    ) {
        assert!(amounts.length() == recipients.length(), ELengthMismatch);
        let mut i = 0;
        while (i < amounts.length()) {
            coin::mint_and_transfer(treasury_cap, amounts[i], recipients[i], ctx);
            i = i + 1;
        }
    }

    // -------------------------------------------------------------------------
    // Burning
    // -------------------------------------------------------------------------

    /// Burn a `Coin<CROZZ_COIN>` object, permanently removing it from supply.
    public fun burn(
        treasury_cap: &mut TreasuryCap<CROZZ_COIN>,
        coin_in: Coin<CROZZ_COIN>,
    ): u64 {
        coin::burn(treasury_cap, coin_in)
    }

    // -------------------------------------------------------------------------
    // Supply lock
    // -------------------------------------------------------------------------

    /// Irreversibly destroy the `TreasuryCap`, making no further minting
    /// possible.  The coin becomes deflationary (burn-only) afterwards.
    public fun lock_treasury(
        _: &AdminCap,
        treasury_cap: TreasuryCap<CROZZ_COIN>,
    ) {
        let TreasuryCap { id, total_supply } = treasury_cap;
        object::delete(id);
        balance::destroy_supply(total_supply);
    }

    // -------------------------------------------------------------------------
    // Metadata helpers (require AdminCap)
    // -------------------------------------------------------------------------

    /// Update the on-chain description (e.g. for versioned announcements).
    public fun update_description(
        _: &AdminCap,
        metadata: &mut CoinMetadata<CROZZ_COIN>,
        description: string::String,
    ) {
        coin::update_description(metadata, description);
    }

    /// Update the icon URL.
    public fun update_icon_url(
        _: &AdminCap,
        metadata: &mut CoinMetadata<CROZZ_COIN>,
        new_url: ascii::String,
    ) {
        coin::update_icon_url(metadata, new_url);
    }

    // -------------------------------------------------------------------------
    // View helpers
    // -------------------------------------------------------------------------

    /// Return the current total supply in base units.
    public fun total_supply(treasury_cap: &TreasuryCap<CROZZ_COIN>): u64 {
        coin::total_supply(treasury_cap)
    }

    // -------------------------------------------------------------------------
    // Test-only helpers
    // -------------------------------------------------------------------------

    #[test_only]
    /// Expose `init` for use in unit tests.
    public fun test_init(ctx: &mut TxContext) {
        init(CROZZ_COIN {}, ctx);
    }
}
