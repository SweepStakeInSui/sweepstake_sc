import { Transaction } from '@mysten/sui/transactions'
import { AppConfig } from '../../config'

export async function mintToken(
  config: AppConfig,
  market_id: string,
  order_id: string,
  user_yes: string,
  amount_yes: string,
  user_no: string,
  amount_no: string
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
      tx.pure.address(user_yes),
      tx.pure.u64(amount_yes),
      tx.pure.address(user_no),
      tx.pure.u64(amount_no),
      // true or false doesn't matter
      tx.pure.bool(true),
      // 0 = Mint
      tx.pure.u64(0)
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

  console.log('Mint', events.data[0].parsedJson, events.data[1].parsedJson)
  // Get the latest event

}
