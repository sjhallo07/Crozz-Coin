module crozz_coin::crozz_coin {
    use sui::coin::{Self as sui_coin, Coin, TreasuryCap};
    use sui::coin_registry;
    use sui::event;

    const E_NOT_ADMIN: u64 = 0;
    const E_TREASURY_CAP_MISMATCH: u64 = 1;
    const E_PAUSED: u64 = 2;
    const E_ZERO_AMOUNT: u64 = 3;
    const VERSION: u64 = 1;

    /// Token witness used during module initialization.
    /// The fully qualified coin type becomes:
    /// `0xPACKAGE::crozz_coin::CROZZ_COIN`
    public struct CROZZ_COIN has drop {}

    /// Grants the owner the right to operate the CROZZ admin flow.
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Shared object exposed to the whole network so wallets and indexers can
    /// inspect the administrative state of the token.
    public struct TreasuryState has key, store {
        id: UID,
        admin: address,
        treasury_cap_id: ID,
        total_minted: u64,
        total_burned: u64,
        is_paused: bool,
        version: u64,
    }

    public struct MintEvent has copy, drop {
        recipient: address,
        amount: u64,
        total_minted: u64,
    }

    public struct BurnEvent has copy, drop {
        amount: u64,
        total_burned: u64,
    }

    public struct PauseEvent has copy, drop {
        admin: address,
        is_paused: bool,
    }

    public struct AdminTransferredEvent has copy, drop {
        previous_admin: address,
        new_admin: address,
    }

    /// Called once when the package is published.
    fun init(witness: CROZZ_COIN, ctx: &mut TxContext) {
        let (builder, treasury) = coin_registry::new_currency_with_otw(
            witness,
            9,
            b"CROZZ".to_string(),
            b"CROZZ COIN 2.0".to_string(),
            b"The ultimate decentralized CROZZ token on the Sui Blockchain".to_string(),
            b"https://crozzcoin.com/wp-content/uploads/2025/08/cropped-logo-no-background-270x270.png"
                .to_string(),
            ctx,
        );
        let sender = tx_context::sender(ctx);
        let treasury_cap_id = object::id(&treasury);
        let admin_cap = AdminCap { id: object::new(ctx) };
        let treasury_state = TreasuryState {
            id: object::new(ctx),
            admin: sender,
            treasury_cap_id,
            total_minted: 0,
            total_burned: 0,
            is_paused: false,
            version: VERSION,
        };

        coin_registry::finalize_and_delete_metadata_cap(builder, ctx);
        transfer::public_transfer(admin_cap, sender);
        transfer::share_object(treasury_state);
        transfer::public_transfer(treasury, sender);
    }

    /// Mint new CROZZ coins to a recipient.
    public fun mint(
        admin_cap: &AdminCap,
        treasury_cap: &mut TreasuryCap<CROZZ_COIN>,
        treasury_state: &mut TreasuryState,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        assert_admin(admin_cap, treasury_state, ctx);
        assert!(amount > 0, E_ZERO_AMOUNT);
        assert!(!treasury_state.is_paused, E_PAUSED);
        assert!(object::id(treasury_cap) == treasury_state.treasury_cap_id, E_TREASURY_CAP_MISMATCH);

        sui_coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
        treasury_state.total_minted = treasury_state.total_minted + amount;

        event::emit(MintEvent {
            recipient,
            amount,
            total_minted: treasury_state.total_minted,
        });
    }

    /// Burn CROZZ coins from an owned coin object.
    public fun burn(
        admin_cap: &AdminCap,
        treasury_cap: &mut TreasuryCap<CROZZ_COIN>,
        treasury_state: &mut TreasuryState,
        coin_to_burn: Coin<CROZZ_COIN>,
        ctx: &TxContext,
    ) {
        let amount = sui_coin::value(&coin_to_burn);

        assert_admin(admin_cap, treasury_state, ctx);
        assert!(amount > 0, E_ZERO_AMOUNT);
        assert!(!treasury_state.is_paused, E_PAUSED);
        assert!(object::id(treasury_cap) == treasury_state.treasury_cap_id, E_TREASURY_CAP_MISMATCH);

        sui_coin::burn(treasury_cap, coin_to_burn);
        treasury_state.total_burned = treasury_state.total_burned + amount;

        event::emit(BurnEvent {
            amount,
            total_burned: treasury_state.total_burned,
        });
    }

    /// Pause or unpause admin operations. While paused, mint and burn abort.
    public fun set_pause(
        admin_cap: &AdminCap,
        treasury_state: &mut TreasuryState,
        is_paused: bool,
        ctx: &TxContext,
    ) {
        assert_admin(admin_cap, treasury_state, ctx);
        treasury_state.is_paused = is_paused;

        event::emit(PauseEvent {
            admin: tx_context::sender(ctx),
            is_paused,
        });
    }

    /// Rotate the admin address while keeping the same capability object.
    public fun transfer_admin(
        admin_cap: AdminCap,
        treasury_state: &mut TreasuryState,
        new_admin: address,
        ctx: &TxContext,
    ) {
        let previous_admin = treasury_state.admin;
        assert_admin(&admin_cap, treasury_state, ctx);
        treasury_state.admin = new_admin;

        event::emit(AdminTransferredEvent {
            previous_admin,
            new_admin,
        });

        transfer::public_transfer(admin_cap, new_admin);
    }

    fun assert_admin(_: &AdminCap, treasury_state: &TreasuryState, ctx: &TxContext) {
        assert!(tx_context::sender(ctx) == treasury_state.admin, E_NOT_ADMIN);
    }
}
