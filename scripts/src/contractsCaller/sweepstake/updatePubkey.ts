import { Transaction } from '@mysten/sui/transactions';
import { AppConfig } from '../../config.js';

export async function updateAdminPubkey(config: AppConfig, treasury_id: string, coin_type: string) {
  const client = config.client
  const admin = config.admin
  const adminCap = config.adminCapSweepTake
  const module_address = config.moduleAddress

  // Get admin public key
  const admin_pubkey = admin.getPublicKey().toRawBytes();
  console.log('Admin pubkey:', admin_pubkey);
  
  const tx = new Transaction()

  tx.moveCall({
    typeArguments: [coin_type],
    arguments: [tx.object(treasury_id), tx.pure(admin_pubkey), tx.object(adminCap)],
    target: `${module_address}::sweepstake::update_admin_pubkey`,
  })
  tx.setGasBudget(10000000)
  const submittedTx = await client.signAndExecuteTransaction({
    signer: admin,
    transaction: tx,
  })
  const txb = await client.waitForTransaction(submittedTx)

  console.log('Updated admin pubkey for treasury:', treasury_id)
  console.log('Transaction digest:', txb.digest)
}
