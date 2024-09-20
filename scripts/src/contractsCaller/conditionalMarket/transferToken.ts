import { Transaction } from '@mysten/sui/transactions'
import { AppConfig } from '../../config'

//This use for fill order in conditional market

export async function transfer_token(
  config: AppConfig,
  market_id: string,
  buyer: string,
  seller: string,
  amount: string,
  type_coin: boolean
) {
  const client = config.client
  const admin = config.admin
  const adminCap = config.adminCapConditional
  const module_address = config.moduleAddress

  const tx = new Transaction()

  tx.moveCall({
    arguments: [
      tx.object(adminCap),
      tx.object(market_id),
      tx.pure.address(buyer),
      tx.pure.address(seller),
      tx.pure.u64(amount),
      tx.pure.bool(type_coin)
    ],
    target: `${module_address}::conditional_market::transfer_token`,
  })
  tx.setGasBudget(10000000)
  const submittedTx = await client.signAndExecuteTransaction({
    signer: admin,
    transaction: tx,
  })
  await client.waitForTransaction(submittedTx)
}

