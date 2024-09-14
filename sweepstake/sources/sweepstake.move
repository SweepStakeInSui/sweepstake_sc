module sweepstake::sweepstake {
    use std::string::String;
    use sui::balance;
    use sui::balance::Balance;
    use sui::coin::{Self, Coin};
    use sui::event::emit;
    use sui::sui::SUI;
    use sui::transfer::{public_transfer, share_object};
    #[test_only]
    use std::string::utf8;

    #[test_only]
    use sui::test_utils::{destroy};
    #[test_only]
    use sui::test_scenario as ts;


    // Error codes
    const EInsufficientBalanceAdmin: u64 = 1002;

    public struct AdminCap has key {
        id: UID,
    }

    // Sweepstake object
    public struct Sweepstake<phantom T> has key {
        id: UID,
        /// Balance of the sweepstake
        balance: Balance<T>,
    }


    // New treasury event
    public struct NewTreasury has copy, drop {
        id: ID,
    }

    // Deposit event
    public struct Deposit has copy, drop {
        owner: address,
        coin: String,
        amount: u64,
    }

    // Withdraw event
    public struct Withdraw has copy, drop {
        owner: address,
        coin: String,
        amount: u64,
    }

    // The sweepstake contract has SUI as default token
    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx)
        };
        new_treasury<SUI>(&admin_cap, ctx);

        transfer::transfer(admin_cap, ctx.sender());
    }

    // Admin will call this function to create a new sweepstake_pair deposit currency
    entry fun new_treasury<T>(_: &AdminCap, ctx: &mut TxContext) {
        // Create a new sweepstake
        let object_id = object::new(ctx);
        emit(NewTreasury {
            id: object::uid_to_inner(&object_id),
        });
        let sweepstake = Sweepstake<T> {
            id: object_id,
            balance: balance::zero<T>(),
        };

        share_object(sweepstake);
    }

    entry fun deposit<T>(
        sweepstake: &mut Sweepstake<T>,
        deposit: Coin<T>,
        name: String,
        ctx:  &TxContext
    ) {
        let amount = deposit.value();
        coin::put(&mut sweepstake.balance, deposit);

        emit(Deposit {
            owner: ctx.sender(),
            coin: name,
            amount,
        });
    }

    entry fun withdraw<T>(
        _: &AdminCap,
        sweepstake: &mut Sweepstake<T>,
        name_token: String,
        amount: u64,
        to: address,
        ctx: &mut TxContext
    ) {
        assert!(sweepstake.balance.value() >= amount, EInsufficientBalanceAdmin);

        let withdraw = sweepstake.balance.split(amount);

        let coin = coin::from_balance<T>(withdraw, ctx);
        public_transfer(coin, to);

        emit(Withdraw {
            owner: to,
            coin: name_token,
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
        //ADMIN creates a new sweepstake
        let mut test = ts::begin(ADMIN);
        {
            init_for_testing(ts::ctx(&mut test));
        };

        ts::next_tx(&mut test, ADMIN);
        let admin_cap = ts::take_from_sender<AdminCap>(&test);

        new_treasury<USDC>(&admin_cap, ts::ctx(&mut test));
        //
        //PLayer ALICE deposits 50 SUI
        {
            ts::next_tx(&mut test, ALICE);

            let pay = coin::mint_for_testing<SUI>(100, ts::ctx(&mut test));
            let mut sweepstake = ts::take_shared<Sweepstake<SUI>>(&test);
            deposit<SUI>(&mut sweepstake, pay, utf8(b"SUI"), ts::ctx(&mut test));
            assert!(sweepstake.balance.value() == 100);

            ts::return_shared(sweepstake);
            ts::next_tx(&mut test, ADMIN);
        };


        //Test deposit another token
        ts::next_tx(&mut test, ALICE);
        {
            let usdc = coin::mint_for_testing<USDC>(100, ts::ctx(&mut test));
            let mut sweepstake = ts::take_shared<Sweepstake<USDC>>(&test);
            deposit<USDC>(&mut sweepstake, usdc, utf8(b"USDT"), ts::ctx(&mut test));
            assert!(sweepstake.balance.value() == 100);

            ts::return_shared(sweepstake);
        };
        destroy(admin_cap);
        ts::end(test);
    }

    #[test]
    fun test_withdraw() {
        //ADMIN creates a new sweepstake
        let mut test = ts::begin(ADMIN);
        {
            init_for_testing(ts::ctx(&mut test));
        };

        ts::next_tx(&mut test, ADMIN);
        let admin_cap = ts::take_from_sender<AdminCap>(&test);

        new_treasury<SUI>(&admin_cap, ts::ctx(&mut test));

        //
        //PLayer ALICE deposits 50 SUI
        {
            ts::next_tx(&mut test, ALICE);

            let pay = coin::mint_for_testing<SUI>(50, ts::ctx(&mut test));
            let mut sweepstake = ts::take_shared<Sweepstake<SUI>>(&test);
            deposit<SUI>(&mut sweepstake, pay, utf8(b"SUI"), ts::ctx(&mut test));
            assert!(sweepstake.balance.value() == 50);

            ts::return_shared(sweepstake);
        };

        //Player ALICE withdraw 40 SUI
        ts::next_tx(&mut test, ADMIN);
        {
            let mut sweepstake = ts::take_shared<Sweepstake<SUI>>(&test);
            withdraw(&admin_cap, &mut sweepstake, utf8(b"SUI"), 40, ALICE, ts::ctx(&mut test));
            assert!(sweepstake.balance.value() == 10);

            ts::return_shared(sweepstake);
        };

        ts::return_to_sender(&test, admin_cap);
        ts::end(test);
    }
}
