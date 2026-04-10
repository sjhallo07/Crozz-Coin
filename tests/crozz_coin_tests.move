#[test_only]
module crozz_coin::crozz_coin_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{TreasuryCap, CoinMetadata};
    use crozz_coin::crozz_coin::{Self, CROZZ_COIN, AdminCap};

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    const DEPLOYER: address = @0xDEAD;
    const ALICE: address   = @0xABCD;
    const BOB: address     = @0x1234;

    /// Run the package init and return a started scenario.
    fun deploy(): Scenario {
        let mut scenario = ts::begin(DEPLOYER);
        {
            crozz_coin::test_init(ts::ctx(&mut scenario));
        };
        scenario
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    #[test]
    fun test_deployer_receives_caps() {
        let mut scenario = deploy();

        ts::next_tx(&mut scenario, DEPLOYER);
        {
            assert!(ts::has_most_recent_for_sender<TreasuryCap<CROZZ_COIN>>(&scenario), 0);
            assert!(ts::has_most_recent_for_sender<AdminCap>(&scenario), 1);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_metadata_frozen() {
        let mut scenario = deploy();

        ts::next_tx(&mut scenario, DEPLOYER);
        {
            // CoinMetadata should exist as a shared / frozen object.
            assert!(ts::has_most_recent_immutable<CoinMetadata<CROZZ_COIN>>(&scenario), 0);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_mint_and_total_supply() {
        let mut scenario = deploy();

        // Mint 1 000 CROZZ (9 decimals) to Alice.
        let mint_amount: u64 = 1_000_000_000_000; // 1 000 CROZZ

        ts::next_tx(&mut scenario, DEPLOYER);
        {
            let mut cap = ts::take_from_sender<TreasuryCap<CROZZ_COIN>>(&scenario);

            crozz_coin::mint(&mut cap, mint_amount, ALICE, ts::ctx(&mut scenario));

            assert!(crozz_coin::total_supply(&cap) == mint_amount, 0);

            ts::return_to_sender(&scenario, cap);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_mint_to_many() {
        let mut scenario = deploy();

        ts::next_tx(&mut scenario, DEPLOYER);
        {
            let mut cap = ts::take_from_sender<TreasuryCap<CROZZ_COIN>>(&scenario);

            let amounts    = vector[500_000_000_000u64, 300_000_000_000u64];
            let recipients = vector[ALICE, BOB];

            crozz_coin::mint_to_many(&mut cap, amounts, recipients, ts::ctx(&mut scenario));

            assert!(crozz_coin::total_supply(&cap) == 800_000_000_000, 0);

            ts::return_to_sender(&scenario, cap);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_burn_reduces_supply() {
        let mut scenario = deploy();
        let mint_amount: u64 = 1_000_000_000_000;
        let burn_amount: u64 =   400_000_000_000;

        // Mint to Alice.
        ts::next_tx(&mut scenario, DEPLOYER);
        {
            let mut cap = ts::take_from_sender<TreasuryCap<CROZZ_COIN>>(&scenario);
            crozz_coin::mint(&mut cap, mint_amount, ALICE, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, cap);
        };

        // Alice burns part of her balance.
        ts::next_tx(&mut scenario, ALICE);
        {
            let mut cap = ts::take_from_address<TreasuryCap<CROZZ_COIN>>(&scenario, DEPLOYER);
            let alice_coin = ts::take_from_sender<sui::coin::Coin<CROZZ_COIN>>(&scenario);

            // Split off the burn portion.
            let to_burn = sui::coin::split(&mut alice_coin, burn_amount, ts::ctx(&mut scenario));

            let burned = crozz_coin::burn(&mut cap, to_burn);
            assert!(burned == burn_amount, 0);
            assert!(crozz_coin::total_supply(&cap) == mint_amount - burn_amount, 1);

            ts::return_to_address(DEPLOYER, cap);
            ts::return_to_sender(&scenario, alice_coin);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_lock_treasury_destroys_cap() {
        let mut scenario = deploy();

        ts::next_tx(&mut scenario, DEPLOYER);
        {
            let admin_cap   = ts::take_from_sender<AdminCap>(&scenario);
            let treasury_cap = ts::take_from_sender<TreasuryCap<CROZZ_COIN>>(&scenario);

            crozz_coin::lock_treasury(&admin_cap, treasury_cap);

            ts::return_to_sender(&scenario, admin_cap);
        };

        // After locking, the TreasuryCap should no longer be owned by anyone.
        ts::next_tx(&mut scenario, DEPLOYER);
        {
            assert!(!ts::has_most_recent_for_sender<TreasuryCap<CROZZ_COIN>>(&scenario), 0);
        };

        ts::end(scenario);
    }
}
