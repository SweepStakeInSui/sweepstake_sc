module sweepstake::sweepstake {
    use std::string::{String, utf8};
    use sui::balance;
    use sui::balance::Balance;
    use sui::coin::{Self, Coin};
    use sui::event::emit;
    use sui::sui::SUI;
    use sui::transfer::{public_transfer, share_object};

    #[test_only]
    use sui::test_utils::{destroy};
    #[test_only]
    use sui::test_scenario as ts;


    // Error codes
    const EInsufficientBalanceAdmin: u64 = 1002;

    // AdminCap object
    public struct AdminCap has key {
        id: UID,
    }

    // treasury object
    public struct Treasury<phantom T> has key {
        id: UID,
        /// Balance of the treasury
        balance: Balance<T>,
        /// Metadata of the crurrency
        coin_name: String
    }


    // New treasury event
    public struct NewTreasuryEvent has copy, drop {
        id: ID,
    }

    // Deposit event
    public struct DepositEvent has copy, drop {
        owner: address,
        coin: String,
        amount: u64,
    }

    // Withdraw event
    public struct WithdrawEvent has copy, drop {
        owner: address,
        coin: String,
        amount: u64,
    }

    // The treasury contract has SUI as default token
    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx)
        };
        new_treasury<SUI>(&admin_cap, utf8(b"SUI"), ctx);
        transfer::transfer(admin_cap, ctx.sender());
    }

    // Admin will call this function to create a new treasury_pair deposit currency
    entry fun new_treasury<T>(_: &AdminCap, coin_name: String, ctx: &mut TxContext) {
        // Create a new treasury
        let object_id = object::new(ctx);
        // Emit new treasury's id event
        emit(NewTreasuryEvent {
            id: object::uid_to_inner(&object_id),
        });
        // Share the treasury object
        let treasury = Treasury<T> {
            id: object_id,
            balance: balance::zero<T>(),
            coin_name,
        };

        share_object(treasury);
    }

    entry fun deposit<T>(
        treasury: &mut Treasury<T>,
        deposit: Coin<T>,
        ctx:  &TxContext
    ) {
        let name = treasury.coin_name;
        let amount = deposit.value();
        coin::put(&mut treasury.balance, deposit);

        emit(DepositEvent {
            owner: ctx.sender(),
            coin: name,
            amount,
        });
    }

    entry fun withdraw<T>(
        _: &AdminCap,
        treasury: &mut Treasury<T>,
        amount: u64,
        to: address,
        ctx: &mut TxContext
    ) {
        assert!(treasury.balance.value() >= amount, EInsufficientBalanceAdmin);
        let name = treasury.coin_name;
        let withdraw = treasury.balance.split(amount);

        let coin = coin::from_balance<T>(withdraw, ctx);
        public_transfer(coin, to);

        emit(WithdrawEvent {
            owner: to,
            coin: name,
            amount,
        })
    }


    // === Tests ===
    #[test_only] const ADMIN: address = @0xAD;
    #[test_only] const ALICE: address = @0xA;

    #[test_only]
    public struct USDC has drop {}

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }

    #[test]
    fun test_deposit() {
        //ADMIN creates a new treasury
        let mut test = ts::begin(ADMIN);
        {
            init_for_testing(ts::ctx(&mut test));
        };

        ts::next_tx(&mut test, ADMIN);
        //NOTE: With new MetadataCoin type, we can't test this function.
        let admin_cap = ts::take_from_sender<AdminCap>(&test);

        new_treasury<USDC>(&admin_cap,utf8(b"USDC") ,ts::ctx(&mut test));
        //
        //PLayer ALICE deposits 50 SUI
        {
            ts::next_tx(&mut test, ALICE);

            let pay = coin::mint_for_testing<SUI>(100, ts::ctx(&mut test));
            let mut treasury = ts::take_shared<Treasury<SUI>>(&test);
            deposit<SUI>(&mut treasury, pay, ts::ctx(&mut test));
            assert!(treasury.balance.value() == 100);

            ts::return_shared(treasury);
            ts::next_tx(&mut test, ADMIN);
        };


        //Test deposit another token
        ts::next_tx(&mut test, ALICE);
        {
            let usdc = coin::mint_for_testing<USDC>(100, ts::ctx(&mut test));
            let mut treasury = ts::take_shared<Treasury<USDC>>(&test);
            deposit<USDC>(&mut treasury, usdc, ts::ctx(&mut test));
            assert!(treasury.balance.value() == 100);

            ts::return_shared(treasury);
        };
        destroy(admin_cap);
        ts::end(test);
    }

    #[test]
    fun test_withdraw() {
        //ADMIN creates a new treasury
        let mut test = ts::begin(ADMIN);
        {
            init_for_testing(ts::ctx(&mut test));
        };

        ts::next_tx(&mut test, ADMIN);
        let admin_cap = ts::take_from_sender<AdminCap>(&test);

        new_treasury<SUI>(&admin_cap,utf8(b"SUI") ,ts::ctx(&mut test));

        //
        //PLayer ALICE deposits 50 SUI
        {
            ts::next_tx(&mut test, ALICE);

            let pay = coin::mint_for_testing<SUI>(50, ts::ctx(&mut test));
            let mut treasury = ts::take_shared<Treasury<SUI>>(&test);
            deposit<SUI>(&mut treasury, pay, ts::ctx(&mut test));
            assert!(treasury.balance.value() == 50);

            ts::return_shared(treasury);
        };

        //Player ALICE withdraw 40 SUI
        ts::next_tx(&mut test, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury<SUI>>(&test);
            withdraw(&admin_cap, &mut treasury, 40, ALICE, ts::ctx(&mut test));
            assert!(treasury.balance.value() == 10);

            ts::return_shared(treasury);
        };

        ts::return_to_sender(&test, admin_cap);
        ts::end(test);
    }
}
