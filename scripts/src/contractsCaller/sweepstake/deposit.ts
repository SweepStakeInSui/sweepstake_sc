import { buildGaslessTransaction, createSuiClient, GasStationClient } from '@shinami/clients/sui'
import { AppConfig } from '../../config'
import { Transaction } from '@mysten/sui/transactions'

const nodeClient = createSuiClient('sui_testnet_0e45dbbb403f380943036c9bc168f895')
const gasStationClient = new GasStationClient('sui_testnet_0e45dbbb403f380943036c9bc168f895')

export async function deposit(
  config: AppConfig,
  sweepstakes_id: string,
  sender: string,
  coin_type: string,
  amount: string
) {
  const user_keypair = config.user

  const module_address = config.moduleAddress
  const coin_name = coin_type.split('::').pop() || ''
  const user_coins_id = await nodeClient.getCoins({
    owner: user_keypair.toSuiAddress(),
    coinType: coin_type,
  })
  const user_coin_id = user_coins_id.data.pop()?.coinObjectId ?? ''
  const gaslessTx = await buildGaslessTransaction(
    txb => {
      const [coin] = txb.splitCoins(
        user_coin_id, // Get from user
        [txb.pure.u64(amount)]
      )
      txb.moveCall({
        typeArguments: [coin_type],
        arguments: [txb.object(sweepstakes_id), coin, txb.pure.string(coin_name)],
        target: `${module_address}::sweepstake::deposit`,
      })
    },
    { sui: nodeClient }
  )
  gaslessTx.sender = user_keypair.toSuiAddress()
  const sponsoredResponse = await gasStationClient.sponsorTransaction(gaslessTx)
  const senderSig = await Transaction.from(sponsoredResponse?.txBytes).sign({
    signer: user_keypair,
  })
  const executeResponse = await nodeClient.executeTransactionBlock({
    transactionBlock: sponsoredResponse?.txBytes,
    signature: [senderSig?.signature, sponsoredResponse?.signature],
  })

  console.log('execute', executeResponse)
  const events = await nodeClient.queryEvents({
    query: {
      Sender: user_keypair.toSuiAddress(),
    },
  })
  // @ts-ignore
  console.log('event-list', events.data[0].parsedJson) // Get the lastest event
}
