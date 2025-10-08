module sweepstake::admin {
    use std::vector;
    use sui::object;
    use sui::transfer::share_object;

    const ENOT_ADMIN: u64 = 0x1;

    public struct Admin has key,store {
        id: UID,
        addresses: vector<address>,
        is_init: bool,
    }

    public struct ChangeAdminRequest has key {
        id: UID,
        address: address,
        deadline: u64,
    }

    public fun create_admin(ctx: &mut TxContext): Admin {
        let id = object::new(ctx);
        Admin {
            id,
            addresses: vector::empty<address>(),
            is_init: false,
        }
    }

    public fun create_add_admin_request(admin: &mut Admin, address: address, deadline: u64, ctx: &mut TxContext) {
        assert!(admin.is_init, ENOT_ADMIN);
        assert!(!vector::contains(&admin.addresses, &address), 0x2);
        let request = ChangeAdminRequest {
            id: object::new(ctx),
            address,
            deadline,
        };
        share_object(request);
    }

    public fun vote_add_admin(admin: &mut Admin, request: &mut ChangeAdminRequest) {
        assert!(admin.is_init, ENOT_ADMIN);
        assert!(!vector::contains(&admin.addresses, &request.address), 0x2);
        vector::push_back(&mut admin.addresses, request.address);
    }

    public fun num_of_admin(admin: &Admin): u64 {
        assert!(admin.is_init, ENOT_ADMIN);
        vector::length(&admin.addresses)
    }

    public fun is_admin(admin: &Admin, address: address): bool {
        assert!(admin.is_init, ENOT_ADMIN);
        vector::contains(&admin.addresses, &address)
    }

    public fun add_admin(admin: &mut Admin, address: vector<address>) {
        assert!(!admin.is_init, 0x2);
        vector::append(&mut admin.addresses, address);
        admin.is_init = true;
    }

    public fun is_init(admin: &Admin): bool {
        admin.is_init
    }
}