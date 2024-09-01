import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";

function suiClientInit() {
  const client = new SuiClient({ url: getFullnodeUrl("testnet") });
  return client;
}
const sender = Ed25519Keypair.fromSecretKey(decodeSuiPrivateKey("").secretKey);

async function createBet() {
  const client = suiClientInit();
  const tx = new Transaction();

  const description = "Just Bet";
  const startDate = "1";
  const endDate = "100";
  tx.moveCall({
    target:
      "0x621c091c3eb8b07b3df5833d27d1e77d0600ebcb92ea997234d622be1c56bf9e::bet_marketplace::create_bet",
    arguments: [
      tx.object(description),
      tx.object(startDate),
      tx.object(endDate),
    ],
  });
  tx.setGasBudget(100000000);
  const submittedTx = await client.signAndExecuteTransaction({
    signer: sender,
    transaction: tx,
  });
  await client.waitForTransaction({ digest: submittedTx.digest });
}

createBet();
