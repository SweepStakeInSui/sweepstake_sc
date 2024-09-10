module sweepstake::bet_marketplace {
    use std::string::String;
    use sui::balance;

    use sui::balance::Balance;
    use sui::coin::{Self, Coin};
    use sui::event::emit;
    use sui::object;
    use sui::sui::SUI;
    use sui::transfer::{public_transfer, share_object};
    #[test_only]
    use std::string::utf8;

    #[test_only]
    use sui::sui::SUI;
    #[test_only]
    use sui::test_utils::{destroy};
    #[test_only]
    use sui::test_scenario as ts;
    #[test_only]
    use 0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::Coin::COIN as USDC;


    // Error codes
    const EInsufficientBalanceUser: u64 = 1001;
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

    // Deposit event
    public struct Deposit has copy, drop {
        coin: String,
        amount: u64,
    }

    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx)
        };
        new_treasury<SUI>(&admin_cap, ctx);

        transfer::transfer(admin_cap, ctx.sender());

    }

    // Admin will call this function to create a new sweepstake_pair deposit currency
    public fun new_treasury<T>(_: &AdminCap, ctx: &mut TxContext) {
        // Create a new sweepstake
        let sweepstake = Sweepstake<T> {
            id: object::new(ctx),
            balance: balance::zero<T>(),
        };
        share_object(sweepstake);
    }

    //Todo: Try to wrap amount to the deposit in SDk
    entry fun deposit<T>(
        sweepstake: &mut Sweepstake<T>,
        deposit: &mut Coin<T>,
        name: String,
        amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(deposit.value() >= amount, EInsufficientBalanceUser);
        let payment = deposit.split(amount, ctx);
        let balance = coin::into_balance(payment);
        sweepstake.balance.join(balance);


        emit(Deposit {
            coin: name,
            amount,
        });
    }


    entry fun withdraw<T>(
        _: &AdminCap,
        sweepstake: &mut Sweepstake<T>,
        amount: u64,
        to: address,
        ctx: &mut TxContext
    ) {
        assert!(sweepstake.balance.value() >= amount, EInsufficientBalanceAdmin);

        let withdraw = sweepstake.balance.split(amount);

        let coin = coin::from_balance<T>(withdraw, ctx);
        public_transfer(coin, to);
    }


    // === Tests ===
    #[test_only] const ADMIN: address = @0xAD;
    #[test_only] const ALICE: address = @0xA;

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

        new_treasury<SUI>(&admin_cap, ts::ctx(&mut test));
        new_treasury<USDC>(&admin_cap, ts::ctx(&mut test));
        //
        //PLayer ALICE deposits 50 SUI
        {
            ts::next_tx(&mut test, ALICE);

            let mut pay = coin::mint_for_testing<SUI>(100, ts::ctx(&mut test));
            let mut sweepstake = ts::take_shared<Sweepstake<SUI>>(&test);
            deposit<SUI>(&mut sweepstake, &mut pay, utf8(b"SUI"), 50, ts::ctx(&mut test));
            assert!(sweepstake.balance.value() == 50);

            destroy(pay);
            ts::return_shared(sweepstake);
            ts::next_tx(&mut test, ADMIN);
        };


        //Test deposit another token
        ts::next_tx(&mut test, ALICE);
        {
            let mut usdc = coin::mint_for_testing<USDC>(1000, ts::ctx(&mut test));
            let mut sweepstake = ts::take_shared<Sweepstake<USDC>>(&test);
            deposit<USDC>(&mut sweepstake, &mut usdc, utf8(b"USDT"), 50, ts::ctx(&mut test));
            assert!(sweepstake.balance.value() == 50);

            ts::return_shared(sweepstake);
            destroy(usdc);
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

            let mut pay = coin::mint_for_testing<SUI>(100, ts::ctx(&mut test));
            let mut sweepstake = ts::take_shared<Sweepstake<SUI>>(&test);
            deposit<SUI>(&mut sweepstake, &mut pay, utf8(b"SUI"), 50, ts::ctx(&mut test));
            assert!(sweepstake.balance.value() == 50);


            ts::return_shared(sweepstake);
            destroy(pay);
        };

        //Player ALICE withdraw 40 SUI
        ts::next_tx(&mut test, ADMIN);
        {
            let mut sweepstake = ts::take_shared<Sweepstake<SUI>>(&test);
            withdraw(&admin_cap, &mut sweepstake, 40, ALICE, ts::ctx(&mut test));
            assert!(sweepstake.balance.value() == 10);

            ts::return_shared(sweepstake);
        };

        ts::return_to_sender(&test, admin_cap);
        ts::end(test);
    }
}
