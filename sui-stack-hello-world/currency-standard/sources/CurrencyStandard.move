module currency_standard::currency_demo {
    use sui::coin;
    use sui::coin_registry;
    use sui::object::{Self, UID};
    use sui::string;
    use sui::transfer;
    use sui::tx_context::{self, TxContext};

    /// Marker type for the demo currency created via Coin Registry.
    public struct CurrCoin has key, store {}

    /// Wrapper that holds the TreasuryCap so the publisher can mint/burn.
    public struct TreasuryWrapper has key {
        id: UID,
        cap: coin::TreasuryCap<CurrCoin>,
    }

    /// Initialize a currency using the Coin Registry (standard flow, no OTW).
    /// This creates:
    /// - A shared `Currency<CurrCoin>` object registered in the registry.
    /// - A `TreasuryCap` sent to the publisher.
    /// - A `MetadataCap` sent to the publisher (can be deleted if you want immutability).
    public entry fun init(ctx: &mut TxContext) {
        let (mut builder, cap) = coin_registry::new_currency<CurrCoin>(
            &mut coin_registry::registry_mut(),
            9, // decimals
            b"CURRCOIN".to_string(),
            b"Registry Coin".to_string(),
            b"Sample currency using Coin Registry".to_string(),
            b"".to_string(), // icon URL (optional)
            ctx,
        );

        // Optional: enforce burn-only or fixed supply here (requires mint before fixing).
        // Example to set burn-only after minting some supply:
        // coin_registry::CurrencyInitializer::make_supply_burn_only(&mut builder, cap); // consumes cap
        // For demo keep flexible supply; cap is retained for mint/burn.

        // Finalize to share Currency and receive MetadataCap.
        let metadata_cap = coin_registry::finalize(builder, ctx);

        // Send TreasuryCap and MetadataCap to publisher (transaction sender).
        let wrapper = TreasuryWrapper { id: object::new(ctx), cap };
        let sender = tx_context::sender(ctx);
        transfer::transfer(wrapper, sender);
        transfer::transfer(metadata_cap, sender);
    }

    /// Mint new coins (requires TreasuryWrapper/TreasuryCap owner).
    public entry fun mint(wrapper: &mut TreasuryWrapper, amount: u64, ctx: &mut TxContext): coin::Coin<CurrCoin> {
        coin::mint(&mut wrapper.cap, amount, ctx)
    }

    /// Burn coins (requires TreasuryWrapper/TreasuryCap owner).
    public entry fun burn(wrapper: &mut TreasuryWrapper, c: coin::Coin<CurrCoin>) {
        coin::burn(&mut wrapper.cap, c);
    }
}
