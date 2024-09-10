import { PUBLISHED_AT } from '..'
import { String } from '../../_dependencies/source/0x1/string/structs'
import { obj, pure } from '../../_framework/util'
import { Transaction, TransactionArgument, TransactionObjectInput } from '@mysten/sui/transactions'

export interface DepositArgs {
  sweepstake: TransactionObjectInput
  deposit: TransactionObjectInput
  name: string | TransactionArgument
  amount: bigint | TransactionArgument
}

export function deposit(tx: Transaction, typeArg: string, args: DepositArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bet_marketplace::deposit`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.sweepstake),
      obj(tx, args.deposit),
      pure(tx, args.name, `${String.$typeName}`),
      pure(tx, args.amount, `u64`),
    ],
  })
}

export function init(tx: Transaction) {
  return tx.moveCall({ target: `${PUBLISHED_AT}::bet_marketplace::init`, arguments: [] })
}

export function newTreasury(tx: Transaction, typeArg: string, adminCap: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bet_marketplace::new_treasury`,
    typeArguments: [typeArg],
    arguments: [obj(tx, adminCap)],
  })
}

export interface WithdrawArgs {
  adminCap: TransactionObjectInput
  sweepstake: TransactionObjectInput
  amount: bigint | TransactionArgument
  to: string | TransactionArgument
}

export function withdraw(tx: Transaction, typeArg: string, args: WithdrawArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bet_marketplace::withdraw`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.adminCap),
      obj(tx, args.sweepstake),
      pure(tx, args.amount, `u64`),
      pure(tx, args.to, `address`),
    ],
  })
}
