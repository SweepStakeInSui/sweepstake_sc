import { Transaction } from '@mysten/sui/transactions'
import * as console from 'node:console'
import { AppConfig, createAppConfig } from '../config'

async function create_new_treasury(config: AppConfig) {
  let client = config.client
  let admin = config.admin

  const tx = new Transaction()

  tx.moveCall({
    typeArguments: ['0x2::sui::SUI'],
    arguments: [tx.object('0x7ad3afed742cdd5a41aff9ef3d91206af921fc2dfd5ce2f183ec0a00a0b26d79')],
    target:
      '0xbb44b6f24e2100fa0d380b879cbfed228f0dc5efd800ad760272584d7f73507::bet_marketplace::new_treasury',
  })
  tx.setGasBudget(3000000)
  const submittedTx = await client.signAndExecuteTransaction({
    signer: admin,
    transaction: tx,
  })
  console.log(submittedTx.transaction)
  await client.waitForTransaction(submittedTx)
}
