import { Transaction } from '@mysten/sui/transactions'
import { AppConfig } from '../../config'

//This use for fill order in conditional market

export async function transfer_token(
  config: AppConfig,
  market_id: string,
  order_id: string,
  maker: string,
  taker: string,
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
      tx.pure.string(order_id),
      tx.pure.address(maker),
      tx.pure.u64(0),
      tx.pure.address(taker),
      tx.pure.u64(amount),
      tx.pure.bool(type_coin),
      // 1 = Transfer
      tx.pure.u64(1)
    ],
    target: `${module_address}::conditional_market::execute_order`,
  })
  tx.setGasBudget(10000000)
  let submittedTx = await client.signAndExecuteTransaction({
    signer: admin,
    transaction: tx,
  })
  submittedTx = await client.waitForTransaction(submittedTx)

  const events = await client.queryEvents({
    query: {
      Transaction: submittedTx.digest,
    },
  })

  console.log('Transfer', events.data[0].parsedJson) // Get the latest event
}

