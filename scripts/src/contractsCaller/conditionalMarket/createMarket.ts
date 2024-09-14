import { Transaction } from '@mysten/sui/transactions'
import { AppConfig } from '../../config'

export async function createMarket(
  config: AppConfig,
  name: string,
  description: string,
  condition: string,
  start_time: string,
  end_time: string
) {
  const client = config.client
  const admin = config.admin
  const adminCap = config.adminCapConditional
  const module_address = config.moduleAddress

  const tx = new Transaction()

  tx.moveCall({
    arguments: [
      tx.object(adminCap),
      tx.pure.string(name),
      tx.pure.string(description),
      tx.pure.string(condition),
      tx.pure.u64(start_time),
      tx.pure.u64(end_time),
    ],
    target: `${module_address}::conditional_market::create_market`,
  })
  tx.setGasBudget(10000000)
  const txb = await client.signAndExecuteTransaction({
    signer: admin,
    transaction: tx,
  })
  const events = await client.queryEvents({
    query: {
      Transaction: txb.digest,
    },
  })
  // @ts-ignore
  console.log('Create market', events.data[0].parsedJson) // Get the latest event
  //ex
  // Create market
  // {
  //   id: '0x943bfbd5ecc597e3a9944327490db0f67b8c492ce5dac58e953d418d8576fc3d'
  // }
}
