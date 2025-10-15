import { Transaction } from '@mysten/sui/transactions';
import { AppConfig } from '../../config.js';

export const executeChangePubkey = async (
    config: AppConfig,
    treasuryId: string,
    requestId: string
) => {
    const tx = new Transaction();
    
    tx.moveCall({
        target: `${config.moduleAddress}::governance::execute_change_pubkey`,
        arguments: [
            tx.object(treasuryId),
            tx.object(requestId)
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