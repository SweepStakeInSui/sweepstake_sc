import { Transaction } from '@mysten/sui/transactions';
import { AppConfig } from '../../config.js';

export const createWithdrawRequest = async (
    config: AppConfig,
    treasuryId: string,
    to: string,
    amount: string,
    deadline: number
) => {
    const tx = new Transaction();
    
    tx.moveCall({
        target: `${config.moduleAddress}::governance::create_withdraw_request`,
        arguments: [
            tx.object(treasuryId),
            tx.pure.address(to),
            tx.pure.u64(amount),
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