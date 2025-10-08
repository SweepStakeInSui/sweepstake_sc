import { Transaction } from '@mysten/sui/transactions';
import { AppConfig } from '../../config.js';
import { bcs } from '@mysten/sui/bcs';

export async function newTreasury(config: AppConfig, coin_type: string) {
  const client = config.client
  const admin = config.admin
  const adminCap = config.adminCapSweepTake
  const module_address = config.moduleAddress

  const coinName = coin_type.split('::').pop() || ''
  console.log('coinName', coinName);
  
  // Get admin public key
  const admin_pubkey = admin.getPublicKey().toRawBytes();
  console.log('Admin pubkey:', admin_pubkey);
  
  const tx = new Transaction()

  tx.moveCall({
    typeArguments: [coin_type],
    arguments: [tx.object(adminCap), tx.pure.string(coinName), tx.pure(bcs.vector(bcs.u8()).serialize(admin_pubkey).toBytes())],
    target: `${module_address}::sweepstake::new_treasury`   ,
  })
  tx.setGasBudget(10000000)
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
  console.log('new treasury id', events.data[0].parsedJson.id)
  //Ex for usdc
  // 0xbc9160f1b500bd678df864140db84c19a93cd10aaddaa5d37acc0163555db449
}
