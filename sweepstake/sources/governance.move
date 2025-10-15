module sweepstake::governance {
    use std::vector;
    use sui::clock::{Clock, timestamp_ms};
    use sui::object;
    use sui::transfer::share_object;
    use sweepstake::sweepstake::{Treasury, set_treasury_pubkey, withdraw_from_treasury, is_treasury_admin, num_treasury_admins};
    use sweepstake::admin::is_admin;

    const EDeadlineExpired: u64 = 0x100;
    const EInvalidAdminSig: u64 = 0x101;
    const EAlreadyExecuted: u64 = 0x102;
    const ENotEnoughAdmin: u64 = 0x103;

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

    public fun create_change_pubkey_request<T>(
        treasury: &Treasury<T>,
        new_pubkey: vector<u8>,
        deadline: u64,
        ctx: &mut TxContext
    ) {
        assert!(is_treasury_admin(treasury, ctx.sender()), EInvalidAdminSig);
        let req = ChangePubkeyRequest {
            id: object::new(ctx),
            new_pubkey,
            voters: vector[],
            deadline,
            is_executed: false,
        };
        share_object(req)
    }

    public fun vote_change_pubkey<T>(
        treasury: &Treasury<T>,
        request: &mut ChangePubkeyRequest,
        clock: &Clock,
        ctx: &TxContext,
    ) {
        let now = timestamp_ms(clock);
        assert!(request.deadline > now, EDeadlineExpired);
        assert!(is_treasury_admin(treasury, ctx.sender()), EInvalidAdminSig);
        vector::push_back(&mut request.voters, ctx.sender());
    }

    public fun execute_change_pubkey<T>(
        treasury: &mut Treasury<T>,
        request: &mut ChangePubkeyRequest,
        ctx: &TxContext
    ) {
        assert!(is_treasury_admin(treasury, ctx.sender()), EInvalidAdminSig);
        assert!(!request.is_executed, EAlreadyExecuted);
        let votes = vector::length(&request.voters);
        assert!(votes > 2 * num_treasury_admins(treasury) / 3, ENotEnoughAdmin);

        set_treasury_pubkey(treasury, request.new_pubkey);
        request.is_executed = true;
    }

    public fun create_withdraw_request<T>(
        treasury: &Treasury<T>,
        to: address,
        amount: u64,
        deadline: u64,
        ctx: &mut TxContext
    ) {
        assert!(is_treasury_admin(treasury, ctx.sender()), EInvalidAdminSig);
        let req = WithDrawRequest {
            id: object::new(ctx),
            to,
            amount,
            voters: vector::empty<address>(),
            deadline,
            is_executed: false,
        };
        share_object(req)
    }

    public fun vote_withdraw<T>(
        treasury: &Treasury<T>,
        request: &mut WithDrawRequest,
        clock: &Clock,
        ctx: &TxContext,
    ) {
        let now = timestamp_ms(clock);
        assert!(request.deadline > now, EDeadlineExpired);
        assert!(is_treasury_admin(treasury, ctx.sender()), EInvalidAdminSig);
        vector::push_back(&mut request.voters, ctx.sender());
    }

    public fun execute_withdraw<T>(
        treasury: &mut Treasury<T>,
        request: &mut WithDrawRequest,
        ctx: &mut TxContext
    ) {
        assert!(!request.is_executed, EAlreadyExecuted);
        let votes = vector::length(&request.voters);
        assert!(votes > 2 * num_treasury_admins(treasury) / 3, ENotEnoughAdmin);

        withdraw_from_treasury(treasury, request.to, request.amount, ctx);
        request.is_executed = true;
    }
}


