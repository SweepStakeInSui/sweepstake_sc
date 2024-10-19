/// Oracle service module for sweepstake contract
module sweepstake::oracle_service {
    use std::string::{String, utf8};

    use sui::dynamic_object_field;

    #[test_only]
    use sui::test_scenario;
    #[test_only]
    use sui::test_utils::destroy;

    // Error codes
    const EMarketNotResolved: u64 = 1001;

    public struct OracleService has key {
        id: UID,
        /// Address of the oracle
        address: address,
        /// Name of the oracle
        name: String,
        /// Description of the oracle
        description: String,
    }

    public struct MarketOracle has key, store {
        id: UID,
        /// Market id
        market_id: String,
        /// Condition_id
        condition_id: String,
        /// is active
        is_active: bool,
        /// is resolved
        is_resolved: bool,
        /// result "Bool for now"
        result: bool,
    }

    public struct AdminCap has key, store {
        id: UID,
    }

    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx)
        };
        transfer::transfer(admin_cap, ctx.sender());
        transfer::share_object(OracleService {
            id: object::new(ctx),
            address: ctx.sender(),
            name: utf8(b"Oracle for Sweepstake"),
            description: utf8(b"Oracle Sweepstake is a service that provides data for the sweepstake contract"),
        });
    }

    public fun add_market(
        _: &AdminCap,
        oracle: &mut OracleService,
        market_id: String,
        condition_id: String,
        ctx: &mut TxContext,
    ) {
        dynamic_object_field::add(
            &mut oracle.id,
            market_id,
            MarketOracle {
                id: object::new(ctx),
                market_id,
                condition_id,
                is_active: true,
                is_resolved: false,
                result: false,
            }
        )
    }

    public fun resolve_market(
        _: &AdminCap,
        oracle: &mut OracleService,
        market_id: String,
        result: bool,
    ) {
        let market = dynamic_object_field::borrow_mut<String, MarketOracle>(&mut oracle.id, market_id);
        market.is_resolved = true;
        market.result = result;
    }

    public fun get_market_result(
        oracle: &OracleService,
        market_id: String,
    ): bool {
        let market = dynamic_object_field::borrow<String, MarketOracle>(&oracle.id, market_id);
        assert!(market.is_resolved, EMarketNotResolved);
        market.result
    }

    public fun get_market_is_resolved(
        oracle: &OracleService,
        market_id: String,
    ): bool {
        let market = dynamic_object_field::borrow<String, MarketOracle>(&oracle.id, market_id);
        market.is_resolved
    }

    // === Testing ===
    #[test_only] const ADMIN: address = @0xAD;

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }

    #[test]
    fun test_oracle() {
        let mut test = test_scenario::begin(ADMIN);
        {
            init_for_testing(test_scenario::ctx(&mut test));
        };
        test_scenario::next_tx(&mut test, ADMIN);
        let admin_cap = test_scenario::take_from_sender<AdminCap>(&test);
        let mut oracle_service = test_scenario::take_shared<OracleService>(&test);

        add_market(
            &admin_cap,
            &mut oracle_service,
            utf8(b"1"),
            utf8(b"1"),
            test_scenario::ctx(&mut test)
        );

        let market = dynamic_object_field::borrow<String, MarketOracle>(&oracle_service.id, utf8(b"1"));
        assert!(market.market_id == utf8(b"1"));

        resolve_market(
            &admin_cap,
            &mut oracle_service,
            utf8(b"1"),
            true
        );
        assert!(get_market_result(&oracle_service, utf8(b"1")) == true);

        destroy(admin_cap);
        destroy(oracle_service);
        test_scenario::end(test);
    }
}
