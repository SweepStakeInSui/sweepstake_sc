import {Transaction} from '@mysten/sui/transactions'
import * as console from 'node:console'
import {AppConfig} from '../../config.js'
import { bcs } from '@mysten/sui/bcs';
import pkg from 'js-sha3';
const { keccak256 } = pkg;
import { fromHex } from '@mysten/bcs';


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

    const pub_key = admin_keypair.getPublicKey().toRawBytes();
    console.log(pub_key);
    const message = sign('withdraw',user,amount, user, 1751211486000);
    const signMessage = await admin_keypair.sign(message);



    const tx = new Transaction()

    tx.setSender(user);
    tx.moveCall({
        typeArguments: [coin_type],
        arguments: [
          tx.object(sweepstake_id),
          tx.pure.string('withdraw'),
          tx.pure.u64(amount),
          tx.pure.address(user),
          tx.pure.u64(1751211486000),
          tx.pure(bcs.vector(bcs.u8()).serialize(signMessage).toBytes()),
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
}

function sign(withdrawid: string, from: string, amount: string, to: string, deadline: number) {
  const withdrawData = bcs.struct('WithDrawData', {
    withdraw_id: bcs.string(),
    from: bcs.Address,
    amount: bcs.u64(),
    to: bcs.Address,
    deadline: bcs.u64(),
  });
  const withDrawDataByte = withdrawData.serialize({withdraw_id: withdrawid,from: from, amount: amount, to: to, deadline: deadline }).toBytes();
  const hash = keccak256(withDrawDataByte);
  return fromHex(hash);
}