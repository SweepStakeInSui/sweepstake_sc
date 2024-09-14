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
    #[test_only]
    use sui::tx_context::epoch_timestamp_ms;
    #[test_only]
    use std::debug::print;


    // Bet object
    public struct Market has key, store {
        id: UID,
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
    public struct NewMarket has copy, drop {
        id: ID,
    }


    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx)
        };
        transfer::transfer(admin_cap, ctx.sender());
    }

    // Create a new market
    entry fun create_market(
        _: &AdminCap,
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
        emit(NewMarket { id: uid_to_inner(&object_id) });
        let address = object::uid_to_address(&object_id);
        let market = Market {
            id: object_id,
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

    entry fun mint(
        _: &AdminCap,
        market: &mut Market,
        user_yes: address,
        amount_yes: u64,
        user_no: address,
        amount_no: u64
    ) {
        if (!market.yes_users.contains(&user_yes)) {
            market.yes_users.insert(user_yes, amount_yes);
        } else {
            let balance = market.yes_users.get_idx(&user_yes);
            let new_balance = balance + amount_yes;
            market.yes_users.remove(&user_yes);
            market.yes_users.insert(user_yes, new_balance);
        };

        if (!market.no_users.contains(&user_no)) {
            market.no_users.insert(user_no, amount_no);
        } else {
            let balance = market.no_users.get_idx(&user_no);
            let new_balance = balance + amount_no;
            market.no_users.remove(&user_no);
            market.no_users.insert(user_no, new_balance);
        };
    }

    entry fun transfer_yes_token(_: &AdminCap, market: &mut Market, buyer: address, seller: address, amount: u64) {
        assert!(
            market.yes_users.contains(&seller) && market.yes_users.get_idx(&seller) >= amount,
            ENotEnoughBalance
        );
        let balance = market.yes_users.get_idx(&seller);
        let new_balance = balance - amount;
        market.yes_users.remove(&seller);
        market.yes_users.insert(seller, new_balance);

        if (!market.yes_users.contains(&buyer)) {
            market.yes_users.insert(buyer, amount);
        } else {
            let balance = market.yes_users.get_idx(&buyer);
            let new_balance = balance + amount;
            market.yes_users.remove(&buyer);
            market.yes_users.insert(buyer, new_balance);
        };
    }

    entry fun transfer_no_token(_: &AdminCap, market: &mut Market, buyer: address, seller: address, amount: u64) {
        assert!(market.no_users.contains(&seller) && market.no_users.get_idx(&seller) >= amount, ENotEnoughBalance);
        let balance = market.no_users.get_idx(&seller);
        let new_balance = balance - amount;
        market.no_users.remove(&seller);
        market.no_users.insert(seller, new_balance);

        if (!market.no_users.contains(&buyer)) {
            market.no_users.insert(buyer, amount);
        } else {
            let balance = market.no_users.get_idx(&buyer);
            let new_balance = balance + amount;
            market.no_users.remove(&buyer);
            market.no_users.insert(buyer, new_balance);
        };
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
        print(&block_time);

        let market = create_market(&admin_cap,utf8(b"Rain"), utf8(b"Will it rain tomorrow?"), utf8(b"yes or no"), block_time + 1, block_time + 2000, ts::ctx(&mut test));
        let market2 = create_market(&admin_cap, utf8(b"Rain11"),utf8(b"Will it rain y?"), utf8(b"yes or no"), block_time + 1, block_time + 2000, ts::ctx(&mut test));
        ts::next_tx(&mut test, ADMIN);
        print(&market);
        print(&market2);
        {
            let market_id1 =  object::id_from_address(market);
            let mut market1 = ts::take_from_sender_by_id<Market>(&mut test, market_id1);
            assert!(market1.description == utf8(b"Will it rain tomorrow?"));
            print(&market1.start_time);
            mint(&admin_cap, &mut market1, ALICE, 100, BOB, 200);
            let alice_balance = check_yes_balance(&market1, ALICE);
            let bob_balance = check_no_balance(&market1, BOB);
            assert!(alice_balance == 100);
            assert!(bob_balance == 200);
            ts::return_to_sender(&mut test,market1);
        };
        ts::next_tx(&mut test, ADMIN);
        {
            let market_id1 =  object::id_from_address(market);
            let mut market1 = ts::take_from_address_by_id<Market>(&mut test,ADMIN, market_id1);


            ts::return_to_sender(&mut test,market1);

        };

        destroy(admin_cap);
        ts::end(test);
    }
}
