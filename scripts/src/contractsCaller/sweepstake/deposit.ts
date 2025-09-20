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
  const admin_keypair = config.admin

  const nodeClient = config.shinamiClient
  const client = config.client
  const gasStationClient = config.gasStationClient
  const module_address = config.moduleAddress

  const user_coins_id = await nodeClient.getCoins({
    owner: sender,
    coinType: coin_type,
  })
  console.log(user_coins_id)
  const tx = new  Transaction();


  const first_coin = user_coins_id.data[0].coinObjectId
  for (const coin of user_coins_id.data) {
    if (coin.coinObjectId != first_coin) {
      tx.mergeCoins(first_coin, [coin.coinObjectId])
    }
  }
  const [coin] = tx.splitCoins(
    first_coin,
    [tx.pure.u64(amount)]
  )
  tx.setSender(user_keypair.toSuiAddress())
  tx.moveCall({
    typeArguments: [coin_type],
    arguments: [tx.object(sweepstakes_id), coin],
    target: `${module_address}::sweepstake::deposit`,
  })
  tx.setGasBudget(3000000)
  tx.setGasOwner(admin_keypair.toSuiAddress())

  let txbuild = await tx.build({client})
  const userSignature = await tx.sign({
    signer: user_keypair
  })
  const adminSignature = await tx.sign({
    signer: admin_keypair,
  })
  const submittedTx = await client.executeTransactionBlock({
    transactionBlock: txbuild,
    signature: [userSignature.signature, adminSignature.signature],
  })
  const txb = await client.waitForTransaction(submittedTx)




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
