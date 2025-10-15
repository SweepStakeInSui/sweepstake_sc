import { Transaction } from '@mysten/sui/transactions';
import { AppConfig } from '../../config.js';

export const createChangePubkeyRequest = async (
    config: AppConfig,
    treasuryId: string,
    newPubkey: string,
    deadline: number
) => {
    const tx = new Transaction();
    
    tx.moveCall({
        target: `${config.moduleAddress}::governance::create_change_pubkey_request`,
        arguments: [
            tx.object(treasuryId),
            tx.pure.string(newPubkey),
            tx.pure.u64(deadline)
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