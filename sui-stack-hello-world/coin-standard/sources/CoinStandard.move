module coin_standard::coin_standard_demo {
    use sui::ascii;
    use sui::coin;
    use sui::object::{Self, UID};
    use sui::option;
    use sui::string;
    use sui::transfer;
    use sui::tx_context::{self, TxContext};
    use sui::url;

    /// Marker type for the demo coin.
    struct DemoCoin has drop, store {}

    /// Holds the TreasuryCap so the publisher can manage supply.
    struct TreasuryWrapper has key {
        id: UID,
        cap: coin::TreasuryCap<DemoCoin>,
    }

    /// Initialize the coin, returning a `TreasuryWrapper` to the sender and
    /// freezing metadata so it cannot be mutated.
    public entry fun init(ctx: &mut TxContext) {
        let symbol: ascii::String = ascii::string(b"DEMO");
        let name: string::String = string::utf8(b"Demo Coin");
        let description: string::String = string::utf8(b"Sample coin using Sui coin standard");
        let icon_url = option::none<url::Url>();

        let (cap, metadata) = coin::create_currency<DemoCoin>(
            9,              // decimals
            symbol,
            name,
            description,
            icon_url,
            ctx,
        );

        // Freeze metadata so display information cannot change.
        transfer::public_freeze_object(metadata);

        // Send the treasury capability to the publisher so they control supply.
        let wrapper = TreasuryWrapper { id: object::new(ctx), cap };
        transfer::transfer(wrapper, tx_context::sender(ctx));
    }

    /// Mint new coins. Requires the TreasuryWrapper, which holds the TreasuryCap.
    public entry fun mint(wrapper: &mut TreasuryWrapper, amount: u64, ctx: &mut TxContext): coin::Coin<DemoCoin> {
        coin::mint(&mut wrapper.cap, amount, ctx)
    }

    /// Burn coins, reducing supply. Requires the TreasuryWrapper.
    public entry fun burn(wrapper: &mut TreasuryWrapper, c: coin::Coin<DemoCoin>) {
        coin::burn(&mut wrapper.cap, c);
    }
}
