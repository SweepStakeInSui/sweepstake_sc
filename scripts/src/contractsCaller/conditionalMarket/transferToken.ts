import { Transaction } from '@mysten/sui/transactions'
import { AppConfig } from '../../config'

//This use for fill order in conditional market

export async function transfer_yes_token(
  config: AppConfig,
  market_id: string,
  buyer: string,
  seller: string,
  amount: string
) {
  const client = config.client
  const admin = config.admin
  const adminCap = config.adminCap
  const module_address = config.moduleAddress

  const tx = new Transaction()

  tx.moveCall({
    arguments: [
      tx.object(adminCap),
      tx.object(market_id),
      tx.pure.address(buyer),
      tx.pure.address(seller),
      tx.pure.u64(amount),
    ],
    target: `${module_address}::conditional_market::transfer_yes_token`,
  })
  tx.setGasBudget(10000000)
  const submittedTx = await client.signAndExecuteTransaction({
    signer: admin,
    transaction: tx,
  })
  await client.waitForTransaction(submittedTx)
}

export async function transfer_no_token(
  config: AppConfig,
  market_id: string,
  buyer: string,
  seller: string,
  amount: string
) {
  const client = config.client
  const admin = config.admin
  const adminCap = config.adminCap
  const module_address = config.moduleAddress

  const tx = new Transaction()

  tx.moveCall({
    arguments: [
      tx.object(adminCap),
      tx.object(market_id),
      tx.pure.address(buyer),
      tx.pure.address(seller),
      tx.pure.u64(amount),
    ],
    target: `${module_address}::conditional_market::transfer_no_token`,
  })
  tx.setGasBudget(10000000)
  const submittedTx = await client.signAndExecuteTransaction({
    signer: admin,
    transaction: tx,
  })
  await client.waitForTransaction(submittedTx)
}

export async function transfer_token(
  config: AppConfig,
  market_id: string,
  buyer: string,
  seller: string,
  amount: string,
  type_token: boolean
) {
  if (type_token) {
    await transfer_yes_token(config, market_id, buyer, seller, amount)
  } else {
    await transfer_no_token(config, market_id, buyer, seller, amount)
  }
}
