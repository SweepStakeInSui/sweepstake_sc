import { Transaction } from '@mysten/sui/transactions';
import { AppConfig } from '../../config';

export async function claimReward(
    config: AppConfig,
    object_id: string,
    market_id: string,
    winner: boolean
) {
    const client = config.client
    const admin = config.admin
    const module_address = config.moduleAddress
    const adminCap = config.adminCapConditional

    const tx = new Transaction()

    tx.moveCall({
        arguments: [
            tx.object(adminCap),
            tx.object(object_id),
            tx.pure.string(market_id),
            tx.pure.bool(winner)
        ],
        target: `${module_address}::conditional_market::claim_reward`,
    })
    tx.setGasBudget(10000000)
    let txb = await client.signAndExecuteTransaction({
        signer: admin,
        transaction: tx,
    })
    txb = await client.waitForTransaction(txb)
    const events = await client.queryEvents({
        query: {
            Transaction: txb.digest,
        },
    })
    console.log('Claim reward', events.data[0].parsedJson.winners)
}