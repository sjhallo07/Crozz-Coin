module crozz_coin::crozz_coin {
    use std::option;
    use sui::coin::{Self, TreasuryCap};

    public struct CROZZ_COIN has drop {}

    fun init(witness: CROZZ_COIN, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness,
            9,
            b"CROZZ",
            b"Crozz Coin",
            b"CROZZ COIN 2.0 - A next-generation token on the Sui Network",
            option::none(),
            ctx,
        );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, ctx.sender());
    }

    public entry fun mint(
        treasury_cap: &mut TreasuryCap<CROZZ_COIN>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
    }

    public entry fun burn(
        treasury_cap: &mut TreasuryCap<CROZZ_COIN>,
        coin: coin::Coin<CROZZ_COIN>,
    ) {
        coin::burn(treasury_cap, coin);
    }
}
