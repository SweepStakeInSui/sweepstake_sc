module sweepstake::sweepstake {
    use std::string::{String, utf8};
    use std::vector::append;
    use sui::balance;
    use sui::balance::Balance;
    use sui::bcs::to_bytes;
    use sui::coin::{Self, Coin};
    use sui::event::emit;
    use sui::sui::SUI;
    use sui::table;
    use sui::transfer::{public_transfer, share_object};
    use sui::ed25519;
    use sui::hash;
    use sui::tx_context::{epoch_timestamp_ms};

    #[test_only]
    use sui::test_utils::{destroy};
    #[test_only]
    use sui::test_scenario as ts;


    // Error codes
    const EInsufficientBalance: u64 = 1002;
    const EDeadlineExpired: u64 = 1003;
    const EInvalidAdminSig: u64 = 1004;

    // AdminCap object
    public struct AdminCap has key {
        id: UID,
    }

    // treasury object
    public struct Treasury<phantom T> has key {
        id: UID,
        /// Balance of the treasurysu
        balance: Balance<T>,
        /// Metadata of the crurrency
        coin_name: String,
        /// Balance of users
        user_balances: table::Table<address, u64>,
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
        withdraw_id: String,
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
            user_balances: table::new<address, u64>(ctx),
        };

        share_object(treasury);
    }

    entry fun deposit<T>(
        treasury: &mut Treasury<T>,
        deposit: Coin<T>,
        ctx: &TxContext
    ) {
        let name = treasury.coin_name;
        let amount = deposit.value();
        coin::put(&mut treasury.balance, deposit);

        if (!table::contains(&treasury.user_balances, ctx.sender())) {
            table::add(&mut treasury.user_balances, ctx.sender(), 0);
        };

        let old_balance = table::remove(&mut treasury.user_balances, ctx.sender());
        table::add(&mut treasury.user_balances, ctx.sender(), old_balance + amount);

        emit(DepositEvent {
            owner: ctx.sender(),
            coin: name,
            amount,
        });
    }

    entry fun withdraw<T>(
        treasury: &mut Treasury<T>,
        withdraw_id: String,
        amount: u64,
        to: address,
        deadline: u64,
        admin_pk: vector<u8>,
        admin_sig: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(ctx.epoch_timestamp_ms() <= deadline, EDeadlineExpired);
        let message = hash_withdraw_request(withdraw_id, amount, to, deadline);

        let ok = ed25519::ed25519_verify(&admin_sig, &admin_pk, &message);
        assert!(ok, EInvalidAdminSig);

        let user_balance = table::borrow_mut(&mut treasury.user_balances, to);
        assert!(*user_balance >= amount, EInsufficientBalance);

        *user_balance = *user_balance - amount;

        let name = treasury.coin_name;
        let withdraw = treasury.balance.split(amount);

        let coin = coin::from_balance<T>(withdraw, ctx);
        public_transfer(coin, to);

        emit(WithdrawEvent {
            withdraw_id,
            owner: to,
            coin: name,
            amount,
        })
    }

    public fun get_balance<T>(treasury: &Treasury<T>, owner: address): u64 {
        *table::borrow(&treasury.user_balances, owner)
    }

    fun hash_withdraw_request(
        withdraw_id: String,
        amount: u64,
        to: address,
        deadline: u64
    ): vector<u8> {
        let mut bytes = vector<u8>[];
        append(&mut bytes, to_bytes(&withdraw_id));
        append(&mut bytes, to_bytes(&amount));
        append(&mut bytes, to_bytes(&to));
        append(&mut bytes, to_bytes(&deadline));
        hash::keccak256(&bytes)
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

        new_treasury<USDC>(&admin_cap, utf8(b"USDC"), ts::ctx(&mut test));
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

        new_treasury<SUI>(&admin_cap, utf8(b"SUI"), ts::ctx(&mut test));

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


            let admin_key = ts::new_ed25519_private_key();
            let pubkey = test_scenario::get_ed25519_public_key(&admin_key);
            let sig = test_scenario::sign_ed25519(&admin_key, &msg);


            withdraw(&mut treasury, utf8(b"123-abc"), 40, ALICE, ts::ctx(&mut test));
            assert!(treasury.balance.value() == 10);

            ts::return_shared(treasury);
        };

        ts::return_to_sender(&test, admin_cap);
        ts::end(test);
    }
}
