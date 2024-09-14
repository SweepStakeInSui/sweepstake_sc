import { Transaction } from '@mysten/sui/transactions'
import { AppConfig } from '../../config'

export async function createMarket(
  config: AppConfig,
  description: string,
  condition: string,
  start_time: string,
  end_time: string
) {
  const client = config.client
  const admin = config.admin
  const adminCap = config.adminCap
  const module_address = config.moduleAddress

  const tx = new Transaction()

  tx.moveCall({
    arguments: [
      tx.object(adminCap),
      tx.pure.string(description),
      tx.pure.string(condition),
      tx.pure.u64(start_time),
      tx.pure.u64(end_time),
    ],
    target: `${module_address}::conditional_market::create_market`,
  })
  tx.setGasBudget(10000000)
  const submittedTx = await client.signAndExecuteTransaction({
    signer: admin,
    transaction: tx,
  })
  await client.waitForTransaction(submittedTx)
}
