import { buildGaslessTransaction, createSuiClient, GasStationClient } from '@shinami/clients/sui'
import { AppConfig } from '../../config'
import { Transaction } from '@mysten/sui/transactions'

export async function deposit(
  config: AppConfig,
  sweepstakes_id: string,
  sender: string,
  coin_type: string,
  amount: string
) {
  // user_keypair is the user's keypair, set in here for test-only.
  const user_keypair = config.user

  const nodeClient = config.shinamiClient
  const gasStationClient = config.gasStationClient
  const module_address = config.moduleAddress
  const coin_name = coin_type.split('::').pop() || ''
  const user_coins_id = await nodeClient.getCoins({
    owner: user_keypair.toSuiAddress(),
    coinType: coin_type,
  })
  const user_coin_id = user_coins_id.data[0]?.coinObjectId ?? ''
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

  ///TODO: Need to send it to FE for user sign
  const senderSig = await Transaction.from(sponsoredResponse?.txBytes).sign({
    signer: user_keypair,
  })

  //TODO: Return back the senderSig from FE and execute the transaction
  await nodeClient.executeTransactionBlock({
    transactionBlock: sponsoredResponse?.txBytes,
    signature: [senderSig?.signature, sponsoredResponse?.signature],
  })

  const events = await nodeClient.queryEvents({
    query: {
      Sender: sender,
    },
  })
  // @ts-ignore
  console.log('deposit', events.data[0].parsedJson) // Get the latest event
  //ex:
  // deposit
  // {
  //   amount: '11000',
  //   coin: 'SUI',
  //   owner: '0x3be3b80978680228b4c472fd208e9503b92b22a6fefc7fd74c4651f2c302b544'
  // }

}
