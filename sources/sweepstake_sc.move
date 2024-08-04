module sweepstake_sc::betting {
    use sui::dynamic_object_field as ofield;
    use sui::coin::{Self, Coin};
    use sui::bag::{Bag, Self};
    use sui::table::{Table, Self};

    const EAmountIncorrect: u64 = 1000;
    const ENotOwner: u64 = 1001;

    public struct Betting<phantom COIN> has key {
        id: UID,
        items: Bag,
        payments: Table<address, Coin<COIN>>
    }

    public struct Listing has key, store {
        id: UID,
        ask: u64,
        owner: address,
    }

    public fun create<COIN>(ctx: &mut TxContext) {
        let id = object::new(ctx);
        let items = bag::new(ctx);
        let payments = table::new<address, Coin<COIN>>(ctx);
        transfer::share_object(Betting<COIN> { 
            id, 
            items,
            payments
        })
    }

    public fun list<T: key + store, COIN>(
        betting: &mut Betting<COIN>,
        item: T,
        ask: u64,
        ctx: &mut TxContext
    ) {
        let item_id = object::id(&item);
        let mut listing = Listing {
            ask,
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
        };

        ofield::add(&mut listing.id, true, item);
        bag::add(&mut betting.items, item_id, listing)
    }

    fun buy<T: key + store, COIN>(
        betting: &mut Betting<COIN>,
        item_id: ID,
        paid: Coin<COIN>,
    ): T {
        let Listing {
            mut id,
            ask,
            owner
        } = bag::remove(&mut betting.items, item_id);

        assert!(ask == coin::value(&paid), EAmountIncorrect);

        // Check if there's already a Coin hanging and merge `paid` with it.
        // Otherwise attach `paid` to the `Betting` under owner's `address`.
        if (table::contains<address, Coin<COIN>>(&betting.payments, owner)) {
            coin::join(
                table::borrow_mut<address, Coin<COIN>>(&mut betting.payments, owner),
                paid
            )
        } else {
            table::add(&mut betting.payments, owner, paid)
        };

        let item = ofield::remove(&mut id, true);
        object::delete(id);
        item
    }

    public fun buy_and_take<T: key + store, COIN>(
        betting: &mut Betting<COIN>,
        item_id: ID,
        paid: Coin<COIN>,
        ctx: &mut TxContext
    ) {
        transfer::public_transfer(
            buy<T, COIN>(betting, item_id, paid),
            tx_context::sender(ctx)
        )
    }

    fun take_profits<COIN>(
        betting: &mut Betting<COIN>,
        ctx: &TxContext
    ): Coin<COIN> {
        table::remove<address, Coin<COIN>>(&mut betting.payments, tx_context::sender(ctx))
    }

    #[lint_allow(self_transfer)]
    public fun take_profits_and_keep<COIN>(
        betting: &mut Betting<COIN>,
        ctx: &mut TxContext
    ) {
        transfer::public_transfer(
            take_profits(betting, ctx),
            tx_context::sender(ctx)
        )
    }
}