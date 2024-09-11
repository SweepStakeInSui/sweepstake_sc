import { Transaction } from '@mysten/sui/transactions'
import * as console from 'node:console'
import { AppConfig } from '../config'

export async function create_new_withdraw(config: AppConfig) {
  const client = config.client
  const admin = config.admin

  const tx = new Transaction()
  tx.moveCall({
    typeArguments: ['0x2::sui::SUI'],
    arguments: [
      tx.object(''),
      tx.object('0xf6a9f4b35ef36a0ddcd5e0fb572c875187fe849981fddc17eb865f968983ba7f'),
      tx.pure.u64('100000'),
      tx.pure.address('0x3be3b80978680228b4c472fd208e9503b92b22a6fefc7fd74c4651f2c302b544'),
    ],
    target:
      '0xbb44b6f24e2100fa0d380b879cbfed228f0dc5efd800ad760272584d7f73507::bet_marketplace::withdraw',
  })
  tx.setGasBudget(3000000)
  const submittedTx = await client.signAndExecuteTransaction({
    signer: admin,
    transaction: tx,
  })
  console.log(submittedTx.transaction)
  await client.waitForTransaction(submittedTx)
}
