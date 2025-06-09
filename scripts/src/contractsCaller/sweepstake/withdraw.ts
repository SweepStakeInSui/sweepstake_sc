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
  const adminCap = config.adminCapSweepTake
  const module_address = config.moduleAddress
  const tx = new Transaction()
  tx.moveCall({
    typeArguments: [coin_type],
    arguments: [
      tx.object(adminCap),
      tx.object(sweepstake_id),
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
  const txb = await client.waitForTransaction(submittedTx)

  const events = await client.queryEvents({
    query: {
      Transaction: txb.digest,
    },
  })
  // @ts-ignore
  console.log('Withdraw event', events.data[0].parsedJson)
  //ex
  // Withdraw event
  // {
  //   amount: '1000',
  //   coin: 'SUI',
  //   owner: '0x3be3b80978680228b4c472fd208e9503b92b22a6fefc7fd74c4651f2c302b544'
  // }
}
