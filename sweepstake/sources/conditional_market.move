module sweepstake::conditional_market {
    use std::string::String;

    use sui::event::emit;
    use sui::object::uid_to_inner;
    use sui::vec_map;
    use sui::vec_map::VecMap;

    #[test_only]
    use std::string::utf8;


    #[test_only]
    use sui::test_scenario as ts;
    #[test_only]
    use sui::test_utils::destroy;

    // Bet object
    public struct Market has key, store {
        /// Object ID
        id: UID,
        /// Address of creator,
        creator: address,
        ///Name of the bet
        name: String,
        /// Description of the bet
        description: String,
        /// Conditions of the bet
        conditions: String,
        /// Start time of the bet
        start_time: u64,
        /// End time of the bet
        end_time: u64,
        yes_users: VecMap<address, u64>,
        no_users: VecMap<address, u64>,
    }

    public struct AdminCap has key {
        id: UID,
    }


    // Error codes
    const ENotEnoughBalance: u64 = 1001;
    const EInvalidTimeArg: u64 = 1002;


    // Events
    public struct NewMarketEvent has copy, drop {
        object_id: ID,
        id: String
    }

    public struct MintYesEvent has copy, drop {
        order_id: String,
        user_yes: address,
        amount_yes: u64
    }

    public struct MintNoEvent has copy, drop {
        order_id: String,
        user_no: address,
        amount_no: u64
    }

    public struct TransferEvent has copy, drop {
        maker_order_id: String,
        maker: address,
        taker_order_id: String,
        taker: address,
        amount: u64,
        coin_type: bool
    }

    public struct MergeEvent has copy, drop {
        order_id_yes: String,
        user_yes: address,
        amount_yes: u64,
        order_id_no: String,
        user_no: address,
        amount_no: u64
    }



    // Type of the order
    const Mint: u64 = 0;
    const Transfer: u64 = 1;
    const Merge: u64 = 2;



    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx)
        };
        transfer::transfer(admin_cap, ctx.sender());
    }

    // Create a new market
    entry fun create_market(
        _: &AdminCap,
        id: String,
        creator: address,
        name: String,
        description: String,
        conditions: String,
        start_time: u64,
        end_time: u64,
        ctx: &mut TxContext
    ): address {
        assert!(start_time > ctx.epoch_timestamp_ms(), EInvalidTimeArg);
        assert!(end_time > start_time, EInvalidTimeArg);

        let object_id = object::new(ctx);
        emit(NewMarketEvent { object_id: uid_to_inner(&object_id), id });
        let address = object::uid_to_address(&object_id);
        let market = Market {
            id: object_id,
            creator,
            name,
            description,
            conditions,
            start_time,
            end_time,
            yes_users: vec_map::empty(),
            no_users: vec_map::empty(),
        };
        transfer::transfer(market, ctx.sender());
        address
    }

    public fun check_yes_balance(market: &Market, user_address: address): u64 {
        let yes_users = market.yes_users;
        let amount = if (yes_users.contains(&user_address)) yes_users.get(&user_address) else &0;
        *amount
    }

    public fun check_no_balance(market: &Market, user_address: address): u64 {
        let no_users = market.no_users;
        let amount = if (no_users.contains(&user_address)) no_users.get(&user_address) else &0;
        *amount
    }

    public fun get_market_info(market: &Market): (String, String, String, u64, u64) {
        (market.name, market.description, market.conditions, market.start_time, market.end_time)
    }

    public fun get_description(market: &Market): String {
        market.description
    }

    public fun get_conditions(market: &Market): String {
        market.conditions
    }

    public fun get_yes_users(market: &Market): VecMap<address, u64> {
        market.yes_users
    }

    public fun get_no_users(market: &Market): VecMap<address, u64> {
        market.no_users
    }

    fun mint(
        market: &mut Market,
        order_id_yes: String,
        user_yes: address,
        amount_yes: u64,
        order_id_no: String,
        user_no: address,
        amount_no: u64
    ) {
        if (!market.yes_users.contains(&user_yes)) {
            market.yes_users.insert(user_yes, amount_yes);
        } else {
            let balance = *market.yes_users.get(&user_yes);
            let new_balance = balance + amount_yes;
            market.yes_users.remove(&user_yes);
            market.yes_users.insert(user_yes, new_balance);
        };

        emit(MintYesEvent { order_id: order_id_yes, user_yes, amount_yes });

        if (!market.no_users.contains(&user_no)) {
            market.no_users.insert(user_no, amount_no);
        } else {
            let balance = *market.no_users.get(&user_no);
            let new_balance = balance + amount_no;
            market.no_users.remove(&user_no);
            market.no_users.insert(user_no, new_balance);
        };

        emit(MintNoEvent { order_id: order_id_no, user_no, amount_no });
    }

    fun transfer(
        market: &mut Market,
        maker_order_id: String,
        maker: address,
        taker_order_id: String,
        taker: address,
        amount: u64,
        coin_type: bool
    ){
        if (coin_type) {
            let balance = check_yes_balance(market, maker);
            assert!(
                balance >= amount, ENotEnoughBalance
            );
            let new_balance = balance - amount;
            market.yes_users.remove(&maker);
            market.yes_users.insert(maker, new_balance);
            if (!market.yes_users.contains(&taker)) {
                market.yes_users.insert(taker, amount);
            } else {
                let balance = *market.yes_users.get(&taker);
                let new_balance = balance + amount;
                market.yes_users.remove(&taker);
                market.yes_users.insert(taker, new_balance);
            };
        } else {
            let balance = check_no_balance(market, maker);
            assert!(
                balance >= amount, ENotEnoughBalance
            );
            let new_balance = balance - amount;
            market.no_users.remove(&maker);
            market.no_users.insert(maker, new_balance);

            if (!market.no_users.contains(&taker)) {
                market.no_users.insert(taker, amount);
            } else {
                let balance = *market.no_users.get(&taker);
                let new_balance = balance + amount;
                market.no_users.remove(&taker);
                market.no_users.insert(taker, new_balance);
            };
        };

        emit(TransferEvent { maker_order_id, maker, taker_order_id, taker, amount, coin_type });
    }

    fun burn(
        market: &mut Market,
        order_id_yes: String,
        user_yes: address,
        amount_yes: u64,
        order_id_no: String,
        user_no: address,
        amount_no: u64
    ) {
        let balance_yes = check_yes_balance(market, user_yes);
        let balance_no = check_no_balance(market, user_no);
        assert!(
            balance_yes >= amount_yes && balance_no >= amount_no, ENotEnoughBalance
        );
        let new_balance_yes = balance_yes - amount_yes;
        let new_balance_no = balance_no - amount_no;
        market.yes_users.remove(&user_yes);
        market.yes_users.insert(user_yes, new_balance_yes);
        market.no_users.remove(&user_no);
        market.no_users.insert(user_no, new_balance_no);

        emit( MergeEvent { order_id_yes, user_yes, amount_yes, order_id_no, user_no, amount_no });
    }



    entry fun execute_order(
        _: &AdminCap,
        market: &mut Market,
        maker_order_id: String,
        maker: address,
        amount_marker: u64,
        taker_order_id: String,
        taker: address,
        amount_taker: u64,
        type_coin: bool,
        type_order: u64
    ) {
        if (type_order == Mint) {
            // maker is yes_user, taker is no_user
            mint(market, maker_order_id, maker, amount_marker, taker_order_id, taker, amount_taker);
        } else if (type_order == Transfer) {
            // amount_taker is amount of token
            transfer(market, maker_order_id, maker, taker_order_id, taker, amount_taker, type_coin);
        } else if (type_order == Merge) {
            // maker is yes_user, taker is no_user
            burn(market, maker_order_id, maker, amount_marker, taker_order_id, taker, amount_taker);
        }
    }

    // === Tests ===
    #[test_only] const ADMIN: address = @0xAD;
    #[test_only] const ALICE: address = @0xA;
    #[test_only] const BOB: address = @0xB;

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }

    #[test]
    fun test_create_market() {
        let mut test = ts::begin(ADMIN);
        {
            init_for_testing(ts::ctx(&mut test));
        };
        ts::next_tx(&mut test, ADMIN);
        let admin_cap = ts::take_from_sender<AdminCap>(&test);

        let block_time = ts::ctx(&mut test).epoch_timestamp_ms();

        let market = create_market(
            &admin_cap,
            utf8(b"2"),
            ALICE,
            utf8(b"Rain"),
            utf8(b"Will it rain tomorrow?"),
            utf8(b"yes or no"),
            block_time + 1,
            block_time + 2000,
            ts::ctx(&mut test)
        );
        let market2 = create_market(
            &admin_cap,
            utf8(b"2"),
            BOB,
            utf8(b"Rain11"),
            utf8(b"Will it rain y?"),
            utf8(b"yes or no"),
            block_time + 1,
            block_time + 2000,
            ts::ctx(&mut test)
        );
        ts::next_tx(&mut test, ADMIN);
        {
            let market_id1 = object::id_from_address(market);
            let market_id2 = object::id_from_address(market2);
            let mut market1 = ts::take_from_sender_by_id<Market>(&test, market_id1);
            assert!(market1.description == utf8(b"Will it rain tomorrow?"));
            let market2 = ts::take_from_sender_by_id<Market>(&test, market_id2);
            assert!(market2.description == utf8(b"Will it rain y?"));

            // execute_order(&admin_cap, &mut market1, utf8(b"123") , ALICE, 100, BOB, 200, true, Mint);
            let alice_balance = check_yes_balance(&market1, ALICE);
            let bob_balance = check_no_balance(&market1, BOB);
            assert!(alice_balance == 100);
            assert!(bob_balance == 200);

            ts::return_to_sender(&test, market1);
            destroy(market2);
        };
        ts::next_tx(&mut test, ADMIN);
        {
            let market_id1 = object::id_from_address(market);
            let mut market1 = ts::take_from_address_by_id<Market>(&test, ADMIN, market_id1);
            let alice_balance = check_yes_balance(&market1, ALICE);
            let bob_balance = check_no_balance(&market1, BOB);
            assert!(alice_balance == 100);
            assert!(bob_balance == 200);
            // execute_order(&admin_cap,  &mut market1, utf8(b"123"), ALICE,0, BOB, 60, true, Transfer);
            let alice_balance = check_yes_balance(&market1, ALICE);
            let bob_balance = check_yes_balance(&market1, BOB);
            assert!(alice_balance == 40);
            assert!(bob_balance == 60);
            // execute_order(&admin_cap, &mut market1, utf8(b"123"), ALICE, 40, BOB, 10, true, Transfer);
            let alice_balance = check_yes_balance(&market1, ALICE);
            let bob_balance = check_yes_balance(&market1, BOB);
            assert!(alice_balance == 30);
            assert!(bob_balance == 70);
            // execute_order(&admin_cap, &mut market1, utf8(b"123"), ALICE, 100, BOB, 200, true, Mint);
            let alice_balance = check_yes_balance(&market1, ALICE);
            let bob_balance = check_no_balance(&market1, BOB);
            assert!(alice_balance == 130);
            assert!(bob_balance == 400);
            ts::return_to_sender(&test, market1);
        };

        destroy(admin_cap);
        ts::end(test);
    }
}
