// module sweepstake::conditional_token {
//     use std::address;
//     use sui::event::emit;
//     use sui::object;
//     use sui::transfer::share_object;
//     use sui::tx_context::TxContext;
//     use sui::vec_map;
//     use sui::vec_map::VecMap;
//
//     // Error codes
//     const ENotEnoughBalance: u64 = 1001;
//     const ETokenNotInBet: u64 = 1002;
//
//     // Events
//     public struct MintOutcomeToken has copy, drop {
//         id: UID,
//         bet_address: address,
//         amount: u64,
//     }
//
//     public struct AdminCap has key {
//         id: UID,
//     }
//
//     public struct OutcomeToken has key, store {
//         id: UID,
//         /// Bet id that this token is associated with
//         bet_address: address,
//         /// Outcome of the bet
//         conditional: bool,
//         /// Balance of token
//         amount: VecMap<address, u64>
//     }
//
//     fun init(ctx: &mut TxContext) {
//         transfer::transfer(AdminCap {
//             id: object::new(ctx),
//         }, ctx.sender());
//     }
//
//     public fun new(_: &AdminCap, bet_address: address, conditional: bool, ctx: &mut TxContext): OutcomeToken {
//         let outcome_token = OutcomeToken {
//             id: object::new(ctx),
//             bet_address,
//             conditional,
//             amount: vec_map::empty<address, u64>()
//         };
//         share_object(outcome_token);
//         outcome_token
//     }
//
//     public fun get_balance(outcome_token: &OutcomeToken, ctx: &TxContext): u64 {
//         let sender = ctx.sender();
//         outcome_token.amount.get_idx(&sender)
//     }
//
//     public fun get_bet_id(outcome_token: &OutcomeToken): address {
//         outcome_token.bet_address
//     }
//
//
//     public fun mint(_: &AdminCap, outcome_token: &mut OutcomeToken, amount: u64, sender: address) {
//         if ( !outcome_token.amount.contains(&sender)) {
//             outcome_token.amount.insert(sender, amount);
//         } else {
//             let balance = outcome_token.amount.get_idx(&sender);
//             let new_balance = balance + amount;
//             outcome_token.amount.remove(&sender);
//             outcome_token.amount.insert(sender, new_balance);
//         };
//     }
//
//     public fun burn(_: &AdminCap, outcome_token: &mut OutcomeToken, amount: u64, sender: address) {
//         assert!(outcome_token.amount.contains(&sender) && outcome_token.amount.get_idx(&sender) >= amount, ENotEnoughBalance);
//         let balance = outcome_token.amount.get_idx(&sender);
//         let new_balance = balance - amount;
//         outcome_token.amount.remove(&sender);
//         outcome_token.amount.insert(sender, new_balance);
//     }
//
//     public fun fill_order(_: &AdminCap,
//                      bet_address: address,
//                      outcome_token: &mut OutcomeToken,
//                      seller: address,
//                      buyer: address,
//                      amount: u64
//     ) {
//         assert!(outcome_token.bet_address == bet_address, ETokenNotInBet);
//         burn(_, outcome_token, amount, seller);
//         mint(_, outcome_token, amount, buyer);
//     }
// }
