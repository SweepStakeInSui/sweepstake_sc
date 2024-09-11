import { Transaction } from '@mysten/sui/transactions'
import { AppConfig } from '../config'
import { fromB64, toB64 } from '../utils'
export async function deposit(
  config: AppConfig,
  sender: string,
  admincap_id: string,
  coin_name: string,
  coin_identity: string,
  amount: string
) {
  const client = config.client
  const enokiClient = config.enokiClient
  const admin = config.admin
  const module_address = config.moduleAddress
  const tx = new Transaction()
  const [coin] = tx.splitCoins(
    tx.object('0x0000000000000000000000000000000000000000000000000000000000000002'),
    [tx.pure.u64(amount)]
  )
  tx.moveCall({
    typeArguments: [coin_identity],
    arguments: [tx.object(admincap_id), coin, tx.pure.string(coin_name)],
    target: `${module_address}::bet_marketplace::deposit`,
  })

  const txBytes = await tx.build({
    client: client,
    onlyTransactionKind: true,
  })
  const sponsored = await enokiClient.createSponsoredTransaction({
    network: 'testnet',
    sender: admin.toSuiAddress(),
    transactionKindBytes: toB64(txBytes),
    allowedMoveCallTargets: [`${module_address}::bet_marketplace::deposit`],
    allowedAddresses: [sender],
  })

  const { signature } = await admin.signTransaction(fromB64(sponsored.bytes))

  await enokiClient.executeSponsoredTransaction({
    digest: sponsored.digest,
    signature,
  })
}
