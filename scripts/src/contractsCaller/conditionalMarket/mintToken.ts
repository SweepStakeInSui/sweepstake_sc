import { Transaction } from '@mysten/sui/transactions'
import { AppConfig } from '../../config'

export async function mintToken(
  config: AppConfig,
  market_id: string,
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
      tx.pure.address(user_yes),
      tx.pure.u64(amount_yes),
      tx.pure.address(user_no),
      tx.pure.u64(amount_no),
    ],
    target: `${module_address}::conditional_market::mint`,
  })
  tx.setGasBudget(10000000)
  const submittedTx = await client.signAndExecuteTransaction({
    signer: admin,
    transaction: tx,
  })
  await client.waitForTransaction(submittedTx)
}
