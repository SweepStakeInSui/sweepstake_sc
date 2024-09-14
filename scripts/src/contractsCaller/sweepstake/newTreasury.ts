import { Transaction } from '@mysten/sui/transactions'
import * as console from 'node:console'
import { AppConfig } from '../../config'

export async function newTreasury(config: AppConfig, coin_type: string) {
  const client = config.client
  const admin = config.admin
  const admincap = config.adminCapSweepTake
  const module_address = config.moduleAddress

  const tx = new Transaction()

  tx.moveCall({
    typeArguments: [coin_type],
    arguments: [tx.object(admincap)],
    target: `${module_address}::sweepstake::new_treasury`,
  })
  tx.setGasBudget(10000000)
  const submittedTx = await client.signAndExecuteTransaction({
    signer: admin,
    transaction: tx,
  })
  await client.waitForTransaction(submittedTx)

  const events = await client.queryEvents({
    query: {
      Sender: admin.toSuiAddress(),
    },
  })
  // @ts-ignore
  console.log('new treasury id', events.data[0].parsedJson.id)
  //Ex for usdc
  // 0xbc9160f1b500bd678df864140db84c19a93cd10aaddaa5d37acc0163555db449
}
