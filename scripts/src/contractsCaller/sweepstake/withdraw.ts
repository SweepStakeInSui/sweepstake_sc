import { Transaction } from '@mysten/sui/transactions'
import * as console from 'node:console'
import { AppConfig } from '../../config'

export async function withdraw(
  config: AppConfig,
  sweepstake_id: string,
  user: string,
  coin_type: string,
  amount: string
) {
  const client = config.client
  const admin = config.admin
  const admincap = config.adminCap
  const module_address = config.moduleAddress
  const coin_name = coin_type.split('::').pop() || ''
  const tx = new Transaction()
  tx.moveCall({
    typeArguments: [coin_type],
    arguments: [
      tx.object(admincap),
      tx.object(sweepstake_id),
      tx.pure.string(coin_name),
      tx.pure.u64(amount),
      tx.pure.address(user),
    ],
    target: `${module_address}::sweepstake::withdraw`,
  })
  tx.setGasBudget(3000000)
  const submittedTx = await client.signAndExecuteTransaction({
    signer: admin,
    transaction: tx,
  })
  await client.waitForTransaction(submittedTx)
}
