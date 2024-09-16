import { buildGaslessTransaction } from '@shinami/clients/sui'
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
  const client = config.client
  const gasStationClient = config.gasStationClient
  const module_address = config.moduleAddress

  const user_coins_id = await nodeClient.getCoins({
    owner: sender,
    coinType: coin_type,
  })

  const gaslessTx = await buildGaslessTransaction(
    txb => {
      const first_coin = user_coins_id.data[0].coinObjectId
      for (const coin of user_coins_id.data) {
        if (coin.coinObjectId != first_coin) {
          txb.mergeCoins(first_coin, [coin.coinObjectId])
        }
      }
      const [coin] = txb.splitCoins(
        first_coin, // Get from user
        [txb.pure.u64(amount)]
      )
      txb.moveCall({
        typeArguments: [coin_type],
        arguments: [txb.object(sweepstakes_id), coin],
        target: `${module_address}::sweepstake::deposit`,
      })
    },
    { sui: nodeClient }
  )
  gaslessTx.sender = sender
  const sponsoredResponse = await gasStationClient.sponsorTransaction(gaslessTx)

  ///TODO: Need to send it to FE for user sign
  const senderSig = await Transaction.from(sponsoredResponse?.txBytes).sign({
    signer: user_keypair,
  })

  //TODO: Return back the senderSig from FE and execute the transaction
  const txb = await nodeClient.executeTransactionBlock({
    transactionBlock: sponsoredResponse?.txBytes,
    signature: [senderSig?.signature, sponsoredResponse?.signature],
  })

  const events = await client.queryEvents({
    query: {
      Transaction: txb.digest,
    },
  })
  console.log('deposit', events.data[0].parsedJson) // Get the latest event
  //ex:
  // deposit
  // {
  //   amount: '11000',
  //   coin: 'SUI',
  //   owner: '0x3be3b80978680228b4c472fd208e9503b92b22a6fefc7fd74c4651f2c302b544'
  // }
}
