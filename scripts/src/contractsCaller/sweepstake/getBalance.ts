import {AppConfig} from "../../config.js";
import {Transaction} from "@mysten/sui/transactions";

export async function checkBalance(config: AppConfig
, sweepstake_id: string, user: string, coin_type: string) {
  const client = config.client
  const module_address = config.moduleAddress

  const tx = new Transaction()

  tx.moveCall({
    typeArguments: [coin_type],
    arguments: [tx.object(sweepstake_id),tx.pure.address('0x0')],
    target: `${module_address}::sweepstake::get_balance`,
  })
  tx.setGasBudget(10000000)
  const submittedTx = await client.devInspectTransactionBlock({
    sender: user,
    transactionBlock: tx,
  })
  const result = submittedTx.results?.pop()
  // console.log(result?.returnValues);
  if (result && result.returnValues) {
    const [byteArray] = result.returnValues[0]
    const buffer = Buffer.from(byteArray)
    const decodedValue = buffer.readBigUInt64LE()
    console.log(decodedValue.toString())
  } else {
    console.log('No return values found')
  }
}