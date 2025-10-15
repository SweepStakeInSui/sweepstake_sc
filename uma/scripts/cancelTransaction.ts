import { ethers } from 'ethers';

async function cancelTransaction() {
  // Private key from the user
  const privateKey = '1c57ff2d3bec34595621305745c8c0a810cefbec86c7d935dba858e747484e4e';
  
  // Amoy network configuration
  const amoyRpcUrl = 'https://polygon-amoy.g.alchemy.com/v2/t58CEbd5i8VAjEucW24Fr';
  const chainId = 80002;
  
  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider(amoyRpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log('Wallet address:', wallet.address);
  
  try {
    // Get current nonce
    const nonce = await wallet.getNonce();
    console.log('Current nonce:', nonce);
    
    // Get current gas price
    const gasPrice = await provider.getFeeData();
    console.log('Current gas price:', ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'), 'gwei');
    
    // Create a transaction with the same nonce but higher gas price
    // This will replace the pending transaction
    const cancelTx = {
      to: wallet.address, // Send to self (no value transfer)
      value: ethers.parseEther('0'), // No value
      gasLimit: 21000, // Standard gas limit for simple transfer
      gasPrice: gasPrice.gasPrice ? gasPrice.gasPrice * 2n : ethers.parseUnits('50', 'gwei'), // Double the gas price
      nonce: nonce,
      chainId: chainId
    };
    
    console.log('Cancellation transaction details:');
    console.log('- To:', cancelTx.to);
    console.log('- Value:', ethers.formatEther(cancelTx.value), 'ETH');
    console.log('- Gas Limit:', cancelTx.gasLimit.toString());
    console.log('- Gas Price:', ethers.formatUnits(cancelTx.gasPrice, 'gwei'), 'gwei');
    console.log('- Nonce:', cancelTx.nonce);
    
    // Sign and send the transaction
    const signedTx = await wallet.signTransaction(cancelTx);
    const txResponse = await provider.broadcastTransaction(signedTx);
    
    console.log('\n✅ Cancellation transaction sent!');
    console.log('Transaction hash:', txResponse.hash);
    console.log('View on Amoy Explorer: https://amoy.polygonscan.com/tx/' + txResponse.hash);
    
    // Wait for transaction to be mined
    console.log('\n⏳ Waiting for transaction to be mined...');
    const receipt = await txResponse.wait();
    
    console.log('✅ Transaction mined!');
    if (receipt) {
      console.log('Block number:', receipt.blockNumber);
      console.log('Gas used:', receipt.gasUsed.toString());
    }
    
  } catch (error) {
    console.error('❌ Error canceling transaction:', error);
    
    if (error instanceof Error) {
      // Check if it's a nonce error
      if (error.message.includes('nonce')) {
        console.log('\n💡 Tip: If you see a nonce error, the transaction might already be processed or you may need to wait a bit longer.');
      }
    }
  }
}

// Alternative method: Speed up transaction with higher gas price
async function speedUpTransaction() {
  const privateKey = '1c57ff2d3bec34595621305745c8c0a810cefbec86c7d935dba858e747484e4e';
  const amoyRpcUrl = 'https://frequent-crimson-sound.matic-amoy.quiknode.pro/d1c9b783388cb314524b8993816a42233b9d577d';
  const chainId = 80002;
  
  const provider = new ethers.JsonRpcProvider(amoyRpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log('Wallet address:', wallet.address);
  
  try {
    const nonce = await wallet.getNonce();
    const gasPrice = await provider.getFeeData();
    
    // Create a transaction with higher gas price to speed up
    const speedUpTx = {
      to: wallet.address,
      value: ethers.parseEther('0'),
      gasLimit: 21000,
      gasPrice: gasPrice.gasPrice ? gasPrice.gasPrice * 3n : ethers.parseUnits('75', 'gwei'), // Triple the gas price
      nonce: nonce,
      chainId: chainId
    };
    
    console.log('Speed up transaction details:');
    console.log('- Gas Price:', ethers.formatUnits(speedUpTx.gasPrice, 'gwei'), 'gwei');
    console.log('- Nonce:', speedUpTx.nonce);
    
    const signedTx = await wallet.signTransaction(speedUpTx);
    const txResponse = await provider.broadcastTransaction(signedTx);
    
    console.log('\n✅ Speed up transaction sent!');
    console.log('Transaction hash:', txResponse.hash);
    console.log('View on Amoy Explorer: https://amoy.polygonscan.com/tx/' + txResponse.hash);
    
  } catch (error) {
    console.error('❌ Error speeding up transaction:', error);
  }
}

// Main execution
async function main() {
  console.log('🚀 Transaction Cancellation Script for Amoy Network');
  console.log('================================================\n');
  
  // You can choose which method to use
  console.log('1. Cancel transaction (send 0 ETH to self with higher gas price)');
  console.log('2. Speed up transaction (send 0 ETH to self with much higher gas price)');
  
  // For this example, we'll use the cancel method
  await cancelTransaction();
  
  // Uncomment the line below if you want to try the speed up method instead
  // await speedUpTransaction();
}

// Run the script
main()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }); 