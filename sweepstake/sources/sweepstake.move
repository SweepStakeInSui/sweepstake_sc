module sweepstake::sweepstake {
    use std::string::{String, utf8};
    use std::vector;
    use sui::balance;
    use sui::balance::Balance;
    use sui::bcs::to_bytes;
    use sui::clock::{Clock, timestamp_ms};
    use sui::coin::{Self, Coin};
    use sui::event::emit;
    use sui::sui::SUI;
    use sui::table;
    use sui::transfer::{public_transfer, share_object};
    use sui::ed25519;
    use sui::hash;
    use sui::object::uid_to_inner;
    use sui::vec_map::VecMap;
    use sui::vec_map;
    use sweepstake::admin;
    use sweepstake::admin::{Admin, is_admin, is_init, add_admin, num_of_admin};


    // Error codes
    const EInsufficientBalance: u64 = 1002;
    const EDeadlineExpired: u64 = 1003;
    const EInvalidAdminSig: u64 = 1004;
    const ENotEnoughBalance: u64 = 1005;
    const EInvalidTimeArg: u64 = 1006;
    const EAlreadyClaimed: u64 = 1007;
    const EWrongMarketId: u64 = 1008;
    const ENotEnoughAdmin: u64 = 1009;
    const EInvalidMarketId: u64 = 1010;

    // Type of the order
    const Mint: u64 = 0;
    const Transfer: u64 = 1;
    const Merge: u64 = 2;

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
        /// Admin
        admin: Admin,
        /// pubkey
        pubkey: vector<u8>,
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

    public struct WithDrawer has copy, drop {
        withdraw_id: String,
        from: address,
        amount: u64,
        to: address,
        deadline: u64,
    }

    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx)
        };
        transfer::transfer(admin_cap, ctx.sender());
    }

    // Function to update admin public key for existing treasury
    entry fun update_admin_pubkey<T>(treasury: &mut Treasury<T>, new_pubkey: vector<u8>, _: &AdminCap) {
        treasury.pubkey = new_pubkey;
    }

    // Admin will call this function to create a new treasury_pair deposit currency
    entry fun new_treasury<T>(_: &AdminCap, coin_name: String, admin_pubkey: vector<u8>, ctx: &mut TxContext) {
        // Create a new treasury
        let object_id = object::new(ctx);
        // Emit new treasury's id event
        emit(NewTreasuryEvent {
            id: uid_to_inner(&object_id),
        });

        let admin = admin::create_admin(ctx);
        // Init the contract balance
        let mut user_balances = table::new<address, u64>(ctx);
        table::add(&mut user_balances, @sweepstake, 0);

        // Share the treasury object
        let treasury = Treasury<T> {
            id: object_id,
            balance: balance::zero<T>(),
            coin_name,
            user_balances,
            admin,
            pubkey: admin_pubkey,
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
        admin_sig: vector<u8>,
        ctx: &mut TxContext
    ) {
        let user_balance = table::borrow_mut(&mut treasury.user_balances, ctx.sender());
        assert!(*user_balance >= amount, EInsufficientBalance);

        let withdrawer = WithDrawer {
            withdraw_id,
            from: ctx.sender(),
            amount,
            to,
            deadline,
        };

        let byte_data = to_bytes(&withdrawer);
        let hash_data = hash::keccak256(&byte_data);
        let ok = ed25519::ed25519_verify(&admin_sig, &treasury.pubkey, &hash_data);
        assert!(ok, EInvalidAdminSig);

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

    //===================MARKET ===================//

    public struct Market has key, store {
        /// Object ID
        id: UID,
        /// Market id
        market_id: String,
        /// Address of creator,
        creator: address,
        ///Name of the bet
        name: String,
        /// Conditions of the bet
        conditions: String,
        /// Start time of the bet
        start_time: u64,
        /// End time of the bet
        end_time: u64,
        /// Users who bet yes and their amount
        yes_users: VecMap<address, u64>,
        /// Users who bet no and their amount
        no_users: VecMap<address, u64>,
        /// isClaimed
        isClaimed: bool,
        /// winner of the bet default is false
        winner: bool,
    }

    // Events
    public struct NewMarketEvent has copy, drop {
        object_id: ID,
        market_id: String,
    }

    public struct MintEvent has copy, drop {
        order_id_yes: String,
        user_yes: address,
        amount_yes: u64,
        order_id_no: String,
        user_no: address,
        amount_no: u64,
    }

    public struct TransferEvent has copy, drop {
        maker_order_id: String,
        maker: address,
        taker_order_id: String,
        taker: address,
        amount: u64,
        coin_type: bool,
    }

    public struct MergeEvent has copy, drop {
        order_id_yes: String,
        user_yes: address,
        amount_yes: u64,
        order_id_no: String,
        user_no: address,
        amount_no: u64,
    }

    public struct ClaimEvent has copy, drop {
        market_id: String,
        winners: VecMap<address, u64>,
    }

    // Create a new market
    entry fun create_market<T>(
        _: &AdminCap,
        id: vector<String>,
        creator: address,
        name: vector<String>,
        conditions: String,
        start_time: u64,
        end_time: u64,
        treasury: &mut Treasury<T>,
        ctx: &mut TxContext,
    ) {
        let user_balance = table::borrow_mut(&mut treasury.user_balances, creator);
        let length = vector::length(&id);

        assert!(length == vector::length(&name), EInvalidMarketId);
        assert!(end_time > start_time, EInvalidTimeArg);
        assert!(*user_balance > length * 5_000_000, ENotEnoughBalance);

        *user_balance = *user_balance - length * 5_000_000;

        let contract_balance = table::borrow_mut(&mut treasury.user_balances, @sweepstake);
        *contract_balance = *contract_balance + length * 5_000_000;

        let mut i = 0;
        while (i < length) {
            let object_id = object::new(ctx);
            emit(NewMarketEvent { object_id: uid_to_inner(&object_id), market_id: id[i] });
            let market = Market {
                id: object_id,
                market_id: id[i],
                creator,
                name: name[i],
                conditions,
                start_time,
                end_time,
                yes_users: vec_map::empty(),
                no_users: vec_map::empty(),
                isClaimed: false,
                winner: false,
            };
            transfer::transfer(market, ctx.sender());
            i = i + 1;
        }
    }


    fun mint(
        market: &mut Market,
        order_id_yes: String,
        user_yes: address,
        amount_yes: u64,
        order_id_no: String,
        user_no: address,
        amount_no: u64,
    ) {
        if (!market.yes_users.contains(&user_yes)) {
            market.yes_users.insert(user_yes, amount_yes);
        } else {
            let balance = *market.yes_users.get(&user_yes);
            let new_balance = balance + amount_yes;
            market.yes_users.remove(&user_yes);
            market.yes_users.insert(user_yes, new_balance);
        };

        if (!market.no_users.contains(&user_no)) {
            market.no_users.insert(user_no, amount_no);
        } else {
            let balance = *market.no_users.get(&user_no);
            let new_balance = balance + amount_no;
            market.no_users.remove(&user_no);
            market.no_users.insert(user_no, new_balance);
        };

        emit(MintEvent { order_id_yes, user_yes, amount_yes, order_id_no, user_no, amount_no });
    }

    fun transfer(
        market: &mut Market,
        maker_order_id: String,
        maker: address,
        taker_order_id: String,
        taker: address,
        amount: u64,
        coin_type: bool,
    ) {
        if (coin_type) {
            let balance = check_yes_balance(market, maker);
            assert!(balance >= amount, ENotEnoughBalance);
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
            assert!(balance >= amount, ENotEnoughBalance);
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
        amount_no: u64,
    ) {
        let balance_yes = check_yes_balance(market, user_yes);
        let balance_no = check_no_balance(market, user_no);
        assert!(balance_yes >= amount_yes && balance_no >= amount_no, ENotEnoughBalance);
        let new_balance_yes = balance_yes - amount_yes;
        let new_balance_no = balance_no - amount_no;
        market.yes_users.remove(&user_yes);
        market.yes_users.insert(user_yes, new_balance_yes);
        market.no_users.remove(&user_no);
        market.no_users.insert(user_no, new_balance_no);

        emit(MergeEvent { order_id_yes, user_yes, amount_yes, order_id_no, user_no, amount_no });
    }

    entry fun execute_order<T>(
        _: &AdminCap,
        market: &mut Market,
        maker_order_id: String,
        maker: address,
        amount_marker: u64,
        taker_order_id: String,
        taker: address,
        amount_taker: u64,
        type_coin: bool,
        type_order: u64,
        price: u64,
        treasury: &mut Treasury<T>,
    ) {
        assert!(market.isClaimed == false, EAlreadyClaimed);
        if (type_order == Mint) {
            // maker is yes_user, taker is no_user
            let maker_balance = &mut treasury.user_balances[maker];
            *maker_balance = *maker_balance - amount_marker * price;
            let taker_balance = &mut treasury.user_balances[taker];
            *taker_balance = *taker_balance - amount_taker * price;
            mint(market, maker_order_id, maker, amount_marker, taker_order_id, taker, amount_taker);
        } else if (type_order == Transfer) {
            // amount_taker is amount of token
            let maker_balance = &mut treasury.user_balances[maker];
            assert!(*maker_balance >= amount_marker * price, ENotEnoughBalance);
            *maker_balance = *maker_balance + amount_marker * price;
            let taker_balance = &mut treasury.user_balances[taker];
            assert!(*taker_balance >= amount_taker * price, ENotEnoughBalance);
            *taker_balance = *taker_balance - amount_taker * price;
            transfer(market, maker_order_id, maker, taker_order_id, taker, amount_taker, type_coin);
        } else if (type_order == Merge) {
            // maker is yes_user, taker is no_user
            let maker_balance = &mut treasury.user_balances[maker];
            *maker_balance = *maker_balance + amount_marker * price;
            let taker_balance = &mut treasury.user_balances[taker];
            *taker_balance = *taker_balance + amount_taker * price;
            burn(market, maker_order_id, maker, amount_marker, taker_order_id, taker, amount_taker);
        }
    }

    entry fun claim_reward<T>(_: &AdminCap, market: &mut Market, market_id: String, winner: bool, treasury: &mut Treasury<T>,) {
        assert!(market.market_id == market_id, EWrongMarketId);
        assert!(market.isClaimed == false, EAlreadyClaimed);

        market.isClaimed = true;
        if (winner) {
            market.winner = true;

            let mut winners = &market.yes_users.keys();
            let len = vector::length(winners);
            let mut i = 0;
            while (i < len) {
                let user = winners[i];
                let amount = *market.yes_users.get(&user);

                if (!table::contains(&treasury.user_balances, user)) {
                    table::add(&mut treasury.user_balances, user, 0);
                };
                let old_balance = table::remove(&mut treasury.user_balances, user);
                table::add(&mut treasury.user_balances, user, old_balance + amount * 1_000_000);

                i = i + 1;
            };

        } else {
            market.winner = false;

            let mut winners = &market.no_users.keys();
            let len = vector::length(winners);
            let mut i = 0;
            while (i < len) {
                let user = winners[i];
                let amount = *market.yes_users.get(&user);

                if (!table::contains(&treasury.user_balances, user)) {
                    table::add(&mut treasury.user_balances, user, 0);
                };
                let old_balance = table::remove(&mut treasury.user_balances, user);
                table::add(&mut treasury.user_balances, user, old_balance + amount * 1_000_000);

                i = i + 1;
            };
        }
    }

    //=================== ADMIN ===================//

    public struct ChangePubkeyRequest has key {
        id: UID,
        new_pubkey: vector<u8>,
        voters: vector<address>,
        deadline: u64,
        is_executed: bool,
    }

    public struct WithDrawRequest has key {
        id: UID,
        to: address,
        amount: u64,
        voters: vector<address>,
        deadline: u64,
        is_executed: bool,
    }


    public fun init_admin<T>(
        admin_cap: &mut AdminCap,
        treasury: &mut Treasury<T>,
        admin_addresses: vector<address>,
    ) {
        assert!(is_init(&treasury.admin), 0x1);
        assert!(vector::length(&admin_addresses) >= 3, ENotEnoughAdmin);
        add_admin(&mut treasury.admin, admin_addresses);
    }

    public fun create_change_pubkey_request<T>(
        treasury: &mut Treasury<T>,
        new_pubkey: vector<u8>,
        deadline: u64,
        ctx: &mut TxContext
    ) {
        assert!(is_admin(&treasury.admin, ctx.sender()), EInvalidAdminSig);

        let request = ChangePubkeyRequest {
            id: object::new(ctx),
            new_pubkey,
            voters: vector[],
            deadline,
            is_executed: false,
        };

        share_object(request)
    }

    public fun vote_change_pubkey<T>(
        treasury: &mut Treasury<T>,
        request: &mut ChangePubkeyRequest,
        ctx: &TxContext,
        clock: &Clock,
    ) {
        let current_time = timestamp_ms(clock);
        assert!(request.deadline > current_time, EDeadlineExpired);
        assert!(admin::is_admin(&treasury.admin,ctx.sender()), EInvalidAdminSig);
        vector::push_back(&mut request.voters, ctx.sender());
    }

    public fun execute_change_pubkey<T>(
        treasury: &mut Treasury<T>,
        request: &mut ChangePubkeyRequest,
        ctx: &TxContext
    ) {
        assert!(admin::is_admin(&treasury.admin, ctx.sender()), EInvalidAdminSig);
        assert!(!request.is_executed, 0x2);
        let length = vector::length(&request.voters);

        assert!(length> 2 * num_of_admin(&treasury.admin) / 3, ENotEnoughAdmin);

        // Change the pubkey of the treasury
        treasury.pubkey = request.new_pubkey;
        request.is_executed = true;
    }

    public fun create_withdraw_request<T>(
        treasury: &mut Treasury<T>,
        to: address,
        amount: u64,
        deadline: u64,
        ctx: &mut TxContext
    ) {
        assert!(is_admin(&treasury.admin, ctx.sender()), EInvalidAdminSig);
        let request = WithDrawRequest {
            id: object::new(ctx),
            to,
            amount,
            voters: vector::empty<address>(),
            deadline,
            is_executed: false,
        };

        share_object(request)
    }

    public fun vote_withdraw<T>(
        treasury: &mut Treasury<T>,
        request: &mut WithDrawRequest,
        ctx: &TxContext,
        clock: &Clock,
    ) {
        let current_time = timestamp_ms(clock);
        assert!(request.deadline > current_time, EDeadlineExpired);
        assert!(admin::is_admin(&treasury.admin, ctx.sender()), EInvalidAdminSig);
        vector::push_back(&mut request.voters, ctx.sender());
    }

    public fun execute_withdraw<T>(
        treasury: &mut Treasury<T>,
        request: &WithDrawRequest,
        ctx: &mut TxContext
    ) {
        assert!(admin::is_admin(&treasury.admin, ctx.sender()), EInvalidAdminSig);
        assert!(!request.is_executed, 0x2);
        let length = vector::length(&request.voters);

        assert!(length > 2 * num_of_admin(&treasury.admin) / 3, ENotEnoughAdmin);

        // Withdraw the amount from the treasury
        let user_balance = table::borrow_mut(&mut treasury.user_balances, @sweepstake);
        assert!(*user_balance >= request.amount, EInsufficientBalance);
        *user_balance = *user_balance - request.amount;

        let withdraw = treasury.balance.split(request.amount);
        let coin = coin::from_balance<T>(withdraw, ctx);
        public_transfer(coin, request.to);
    }

    // =================== GETTER ===================//
    public fun get_admin_pubkey<T>(treasury: &Treasury<T>): vector<u8>  {
        treasury.pubkey
    }

    public fun get_balance<T>(treasury: &Treasury<T>, user: address): u64 {
        let user_balances = &treasury.user_balances;
        let amount = if (table::contains(user_balances, user)) table::borrow(user_balances, user) else &0;
        *amount
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

    public fun get_market_info(market: &Market): (String, String, u64, u64) {
        (market.name, market.conditions, market.start_time, market.end_time)
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
}
