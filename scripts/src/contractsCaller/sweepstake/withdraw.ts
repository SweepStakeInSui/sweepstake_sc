import {Transaction} from '@mysten/sui/transactions'
import * as console from 'node:console'
import {AppConfig} from '../../config'
import {toBigEndianBytes} from "@mysten/sui/zklogin";
import {toBytes} from "@mysten/bcs";

export async function withdraw(
    config: AppConfig,
    sweepstake_id: string,
    user: string,
    coin_type: string,
    amount: string
) {
    const client = config.client
    const admin_keypair = config.admin
    const user_keypair = config.user
    const adminCap = config.adminCapSweepTake
    const module_address = config.moduleAddress

    const tx = new Transaction()

    tx.setSender(user);
    tx.moveCall({
        typeArguments: [coin_type],
        arguments: [
            tx.object(sweepstake_id),
            tx.pure.string('withdraw'),
            tx.pure.u64(amount),
            tx.pure.address(user),
        ],
        target: `${module_address}::sweepstake::withdraw`,
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
    // @ts-ignore
    console.log('Withdraw event', events.data[0].parsedJson)
    //ex
    // Withdraw event
    // {
    //   amount: '1000',
    //   coin: 'SUI',
    //   owner: '0x3be3b80978680228b4c472fd208e9503b92b22a6fefc7fd74c4651f2c302b544'
    // }
}

export function hashWithdrawRequest(
    withdrawid: string,
    amount: string,
    to: string,
    deadline: string
): string {
    const encoder = new TextEncoder();
    const withdrawIdBytes = encoder.encode(withdrawid);
    const amountBytes = toBigEndianBytes(BigInt(amount), 8);
    const toBytesVec = toBytes(to, 'address');
    const deadlineBytes = toBigEndianBytes(BigInt(deadline), 8);

    const combined = new Uint8Array(
        withdrawIdBytes.length + amountBytes.length + toBytesVec.length + deadlineBytes.length
    );
    combined.set(withdrawIdBytes, 0);
    combined.set(amountBytes, withdrawIdBytes.length);
    combined.set(toBytesVec, withdrawIdBytes.length + amountBytes.length);
    combined.set(deadlineBytes, withdrawIdBytes.length + amountBytes.length + toBytesVec.length);

    return sha3_256(combined);
}
