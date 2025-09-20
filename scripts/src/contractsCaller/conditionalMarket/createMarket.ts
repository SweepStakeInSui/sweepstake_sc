import { Transaction } from '@mysten/sui/transactions';
import { AppConfig } from '../../config.js';
import { bcs } from '@mysten/sui/bcs';


export async function createMarket(
  config: AppConfig,
  id: string[],
  creator: string,
  name: string[],
  conditions: string,
  start_time: string | number | bigint,
  end_time: string | number | bigint,
  treasury: string,
  coin_type: string
) {
  const client = config.client
  const admin = config.admin
  const adminCap = config.adminCapConditional
  const module_address = config.moduleAddress

  const tx = new Transaction()

  const idVecBytes = bcs.vector(bcs.string()).serialize(id).toBytes()
  const nameVecBytes = bcs.vector(bcs.string()).serialize(name).toBytes()

  tx.moveCall({
    typeArguments: [coin_type],
    arguments: [
      tx.object(adminCap),
      tx.pure(idVecBytes),
      tx.pure.address(creator),
      tx.pure(nameVecBytes),
      tx.pure.string(conditions),
      tx.pure.u64(12345),
      tx.pure.u64(123456),
      tx.object(treasury),
    ],
    target: `${module_address}::sweepstake::create_market`,
  })
  tx.setGasBudget(10000000)
  let txb = await client.signAndExecuteTransaction({
    signer: admin,
    transaction: tx,
  })
  txb = await client.waitForTransaction(txb)
  const events = await client.queryEvents({
    query: {
      Transaction: txb.digest,
    },
  })
  console.log('Create market', events.data[0].parsedJson) // Get the latest event
  //ex
  // Create market
  // {
  //   id: '0x943bfbd5ecc597e3a9944327490db0f67b8c492ce5dac58e953d418d8576fc3d'
  // }
}
