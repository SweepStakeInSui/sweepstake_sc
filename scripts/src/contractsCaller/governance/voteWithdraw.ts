import { Transaction } from '@mysten/sui/transactions';
import { AppConfig } from '../../config.js';

export const voteWithdraw = async (
    config: AppConfig,
    treasuryId: string,
    requestId: string,
    clockId: string
) => {
    const tx = new Transaction();
    
    tx.moveCall({
        target: `${config.moduleAddress}::governance::vote_withdraw`,
        arguments: [
            tx.object(treasuryId),
            tx.object(requestId),
            tx.object(clockId)
        ]
    });
    tx.setGasBudget(10000000);

    const result = await config.client.signAndExecuteTransaction({
        transaction: tx,
        signer: config.admin,
        options: {
            showEffects: true,
            showObjectChanges: true,
        },
    });

    return result;
};