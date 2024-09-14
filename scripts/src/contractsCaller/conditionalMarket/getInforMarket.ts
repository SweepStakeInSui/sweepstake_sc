import { Transaction } from '@mysten/sui/transactions'
import * as console from 'node:console'
import { AppConfig } from '../../config'

export async function checkYesBalance(config: AppConfig, market_id: string, user: string) {
  const client = config.client
  const admin = config.admin
  const admincap = config.adminCapConditional
  const module_address = config.moduleAddress

  const tx = new Transaction()

  tx.moveCall({
    arguments: [tx.object(market_id), tx.pure.address(user)],
    target: `${module_address}::conditional_market::check_yes_balance`,
  })
  tx.setGasBudget(10000000)
  const submittedTx = await client.devInspectTransactionBlock({
    sender: user,
    transactionBlock: tx,
  })
  const result = submittedTx.results.pop()
  if (result && result.returnValues) {
    const [byteArray] = result.returnValues[0]
    const buffer = Buffer.from(byteArray)
    const decodedValue = buffer.readBigUInt64LE()
    console.log(decodedValue.toString())
  } else {
    console.log('No return values found')
  }
}

export async function checkNoBalance(config: AppConfig, market_id: string, user: string) {
  const client = config.client
  const admin = config.admin
  const admincap = config.adminCapConditional
  const module_address = config.moduleAddress

  const tx = new Transaction()

  tx.moveCall({
    arguments: [tx.object(market_id), tx.pure.address(user)],
    target: `${module_address}::conditional_market::check_no_balance`,
  })
  tx.setGasBudget(10000000)
  const submittedTx = await client.devInspectTransactionBlock({
    sender: user,
    transactionBlock: tx,
  })
  const result = submittedTx.results.pop()
  if (result && result.returnValues) {
    const [byteArray] = result.returnValues[0]
    const buffer = Buffer.from(byteArray)
    const decodedValue = buffer.readBigUInt64LE()
    console.log(decodedValue.toString())
  } else {
    console.log('No return values found')
  }
}

export async function checkMarketInfo(config: AppConfig, market_id: string) {
  const client = config.client
  const module_address = config.moduleAddress

  const tx = new Transaction()

  tx.moveCall({
    arguments: [tx.object(market_id)],
    target: `${module_address}::conditional_market::get_market_info`,
  })
  tx.setGasBudget(10000000)
  const submittedTx = await client.devInspectTransactionBlock({
    transactionBlock: tx,
    sender: '0x3be3b80978680228b4c472fd208e9503b92b22a6fefc7fd74c4651f2c302b544',
  })
  const result = submittedTx.results.pop()
  if (result && result.returnValues) {
    const [descriptionArray] = result.returnValues[0]
    const [conditionsArray] = result.returnValues[1]
    const [startTimeArray] = result.returnValues[2]
    const [endTimeArray] = result.returnValues[3]

    const description = Buffer.from(descriptionArray).toString('utf8')
    const conditions = Buffer.from(conditionsArray).toString('utf8')
    const startTime = Buffer.from(startTimeArray).readBigUInt64LE()
    const endTime = Buffer.from(endTimeArray).readBigUInt64LE()

    console.log('Description:', description)
    console.log('Conditions:', conditions)
    console.log('Start Time:', startTime.toString())
    console.log('End Time:', endTime.toString())
  } else {
    console.log('No return values found')
  }
}
