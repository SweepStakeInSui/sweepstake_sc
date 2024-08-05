module sweepstake_sc::bet_marketplace {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::ed25519;
    use sui::event;
    use sui::table::{Self, Table};
    use sui::balance::{Self, Balance};
    use sui::bcs;

    // Error codes
    const EInvalidSignature: u64 = 0;
    const EInsufficientBalance: u64 = 1;
    const EBetInactive: u64 = 2;
    const EInvalidPosition: u64 = 3;
    const EBetAlreadyClosed: u64 = 4;

    // Bet positions
    const POSITION_BUY: u8 = 0;
    const POSITION_SELL: u8 = 1;

    // Bet object
    public struct Bet has key {
        id: UID,
        creator: address,
        description: vector<u8>,
        total_amount: u64,
        is_active: bool,
        balance: Balance<SUI>,
        positions: Table<address, u8>,
        amounts: Table<address, u64>,
    }

    // Events
    public struct BetCreated has copy, drop {
        bet_id: address,
        creator: address,
        description: vector<u8>,
    }

    public struct PositionTaken has copy, drop {
        bet_id: address,
        better: address,
        position: u8,
        amount: u64,
    }

    public struct WinningsClaimed has copy, drop {
        bet_id: address,
        winner: address,
        amount: u64,
    }

    // Create a new bet
    public entry fun create_bet(
        description: vector<u8>,
        ctx: &mut TxContext
    ) {
        let bet = Bet {
            id: object::new(ctx),
            creator: tx_context::sender(ctx),
            description,
            total_amount: 0,
            is_active: true,
            balance: balance::zero(),
            positions: table::new(ctx),
            amounts: table::new(ctx),
        };

        let bet_id = object::uid_to_address(&bet.id);
        transfer::share_object(bet);

        event::emit(BetCreated {
            bet_id,
            creator: tx_context::sender(ctx),
            description,
        });
    }

    // Take a position in the bet
    public entry fun take_position(
        bet: &mut Bet,
        position: u8,
        payment: &mut Coin<SUI>,
        amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(bet.is_active, EBetInactive);
        assert!(position == POSITION_BUY || position == POSITION_SELL, EInvalidPosition);
        assert!(coin::value(payment) >= amount, EInsufficientBalance);

        let better = tx_context::sender(ctx);

        // Transfer SUI to the bet's balance
        let paid = coin::split(payment, amount, ctx);
        let paid_balance = coin::into_balance(paid);
        balance::join(&mut bet.balance, paid_balance);

        // Record the position and amount
        if (table::contains(&bet.positions, better)) {
            // If the better already has a position, add to their existing amount
            let existing_amount = table::remove(&mut bet.amounts, better);
            table::add(&mut bet.amounts, better, existing_amount + amount);
        } else {
            // If it's a new position, add both position and amount
            table::add(&mut bet.positions, better, position);
            table::add(&mut bet.amounts, better, amount);
        };

        bet.total_amount = bet.total_amount + amount;

        event::emit(PositionTaken {
            bet_id: object::uid_to_address(&bet.id),
            better,
            position,
            amount,
        });
    }

    // Claim winnings
    public entry fun claim_winnings(
        bet: &mut Bet,
        signature: vector<u8>,
        public_key: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(!bet.is_active, EBetInactive);
        
        let claimer = tx_context::sender(ctx);
        assert!(table::contains(&bet.positions, claimer), EInvalidPosition);

        let amount = *table::borrow(&bet.amounts, claimer);
        // let position = *table::borrow(&bet.positions, claimer);

        // Verify the signature
        let message = bcs::to_bytes(&amount);
        assert!(
            ed25519::ed25519_verify(&signature, &public_key, &message),
            EInvalidSignature
        );

        // Transfer winnings
        let winnings_balance = balance::split(&mut bet.balance, amount);
        let winnings_coin = coin::from_balance(winnings_balance, ctx);
        transfer::public_transfer(winnings_coin, claimer);

        // Remove the position and amount records
        table::remove(&mut bet.positions, claimer);
        table::remove(&mut bet.amounts, claimer);

        event::emit(WinningsClaimed {
            bet_id: object::uid_to_address(&bet.id),
            winner: claimer,
            amount,
        });
    }

    // Close the bet (only callable by the creator)
    public entry fun close_bet(bet: &mut Bet, ctx: &mut TxContext) {
        assert!(tx_context::sender(ctx) == bet.creator, 0);
        assert!(bet.is_active, EBetAlreadyClosed);

        bet.is_active = false;
    }
}