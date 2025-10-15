import { ethers } from 'ethers';

async function cancelSpecificTransaction() {
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
    
    // Check for pending transactions
    console.log('\n🔍 Checking for pending transactions...');
    
    // Get the latest block to check for pending transactions
    const latestBlock = await provider.getBlock('latest');
    if (!latestBlock) {
      throw new Error('Could not get latest block');
    }
    
    // Get pending transactions from the mempool
    console.log('Checking mempool for pending transactions...');
    
    // Method 1: Try to get pending transactions (this might not work on all RPCs)
    try {
      const pendingBlock = await provider.getBlock('pending');
      if (pendingBlock && pendingBlock.transactions.length > 0) {
        console.log(`Found ${pendingBlock.transactions.length} pending transactions`);
      }
    } catch (error) {
      console.log('Could not get pending transactions from RPC');
    }
    
    // Method 2: Check recent transactions for the wallet
    console.log('\n📋 Recent transactions for your wallet:');
    const balance = await wallet.getBalance();
    console.log('Current balance:', ethers.formatEther(balance), 'ETH');
    
    // Get transaction count to see how many transactions have been sent
    const txCount = await provider.getTransactionCount(wallet.address, 'latest');
    console.log('Total transactions sent:', txCount);
    
    // If there are pending transactions, we need to replace them
    if (txCount > nonce) {
      console.log('\n⚠️  Detected pending transactions!');
      console.log(`Transaction count: ${txCount}, Current nonce: ${nonce}`);
      console.log('This means you have pending transactions that need to be replaced.');
      
      // Create a replacement transaction with higher gas price
      const replacementTx = {
        to: wallet.address, // Send to self
        value: ethers.parseEther('0'), // No value
        gasLimit: 21000,
        gasPrice: gasPrice.gasPrice ? gasPrice.gasPrice * 3n : ethers.parseUnits('100', 'gwei'), // Triple the gas price
        nonce: nonce,
        chainId: chainId
      };
      
      console.log('\n🔄 Creating replacement transaction...');
      console.log('Replacement transaction details:');
      console.log('- To:', replacementTx.to);
      console.log('- Value:', ethers.formatEther(replacementTx.value), 'ETH');
      console.log('- Gas Limit:', replacementTx.gasLimit.toString());
      console.log('- Gas Price:', ethers.formatUnits(replacementTx.gasPrice, 'gwei'), 'gwei');
      console.log('- Nonce:', replacementTx.nonce);
      
      // Sign and send the replacement transaction
      const signedTx = await wallet.signTransaction(replacementTx);
      const txResponse = await provider.broadcastTransaction(signedTx);
      
      console.log('\n✅ Replacement transaction sent!');
      console.log('Transaction hash:', txResponse.hash);
      console.log('View on Amoy Explorer: https://amoy.polygonscan.com/tx/' + txResponse.hash);
      
      // Wait for transaction to be mined
      console.log('\n⏳ Waiting for replacement transaction to be mined...');
      const receipt = await txResponse.wait();
      
      console.log('✅ Replacement transaction mined!');
      if (receipt) {
        console.log('Block number:', receipt.blockNumber);
        console.log('Gas used:', receipt.gasUsed.toString());
      }
      
    } else {
      console.log('\n✅ No pending transactions detected!');
      console.log('Your current nonce matches the transaction count.');
      console.log('If you want to cancel a specific transaction, you need to:');
      console.log('1. Find the transaction hash of the pending transaction');
      console.log('2. Use the same nonce with a higher gas price');
      
      // Still offer to send a cancellation transaction
      console.log('\n🔄 Sending a cancellation transaction anyway...');
      
      const cancelTx = {
        to: wallet.address,
        value: ethers.parseEther('0'),
        gasLimit: 21000,
        gasPrice: gasPrice.gasPrice ? gasPrice.gasPrice * 2n : ethers.parseUnits('50', 'gwei'),
        nonce: nonce,
        chainId: chainId
      };
      
      const signedTx = await wallet.signTransaction(cancelTx);
      const txResponse = await provider.broadcastTransaction(signedTx);
      
      console.log('✅ Cancellation transaction sent!');
      console.log('Transaction hash:', txResponse.hash);
      console.log('View on Amoy Explorer: https://amoy.polygonscan.com/tx/' + txResponse.hash);
      
      const receipt = await txResponse.wait();
      console.log('✅ Transaction mined!');
      if (receipt) {
        console.log('Block number:', receipt.blockNumber);
        console.log('Gas used:', receipt.gasUsed.toString());
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('nonce')) {
        console.log('\n💡 Nonce error detected. This usually means:');
        console.log('- The transaction was already processed');
        console.log('- There\'s a pending transaction with the same nonce');
        console.log('- You need to wait for the pending transaction to be mined');
      }
      
      if (error.message.includes('insufficient funds')) {
        console.log('\n💡 Insufficient funds error. Make sure you have enough ETH for gas fees.');
      }
    }
  }
}

// Function to cancel a specific transaction by hash
async function cancelTransactionByHash(txHash: string) {
  const privateKey = '1c57ff2d3bec34595621305745c8c0a810cefbec86c7d935dba858e747484e4e';
  const amoyRpcUrl = 'https://polygon-amoy.g.alchemy.com/v2/t58CEbd5i8VAjEucW24Fr';
  const chainId = 80002;
  
  const provider = new ethers.JsonRpcProvider(amoyRpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log('🔍 Looking up transaction:', txHash);
  
  try {
    // Get the transaction details
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      throw new Error('Transaction not found');
    }
    
    console.log('Transaction details:');
    console.log('- From:', tx.from);
    console.log('- To:', tx.to);
    console.log('- Nonce:', tx.nonce);
    console.log('- Gas Price:', ethers.formatUnits(tx.gasPrice || 0, 'gwei'), 'gwei');
    console.log('- Value:', ethers.formatEther(tx.value), 'ETH');
    
    // Check if this is your transaction
    if (tx.from.toLowerCase() !== wallet.address.toLowerCase()) {
      throw new Error('This transaction does not belong to your wallet');
    }
    
    // Get current gas price
    const gasPrice = await provider.getFeeData();
    
    // Create replacement transaction with higher gas price
    const replacementTx = {
      to: wallet.address,
      value: ethers.parseEther('0'),
      gasLimit: 21000,
      gasPrice: gasPrice.gasPrice ? gasPrice.gasPrice * 3n : ethers.parseUnits('100', 'gwei'),
      nonce: tx.nonce,
      chainId: chainId
    };
    
    console.log('\n🔄 Creating replacement transaction...');
    console.log('New gas price:', ethers.formatUnits(replacementTx.gasPrice, 'gwei'), 'gwei');
    
    const signedTx = await wallet.signTransaction(replacementTx);
    const txResponse = await provider.broadcastTransaction(signedTx);
    
    console.log('\n✅ Replacement transaction sent!');
    console.log('New transaction hash:', txResponse.hash);
    console.log('View on Amoy Explorer: https://amoy.polygonscan.com/tx/' + txResponse.hash);
    
    const receipt = await txResponse.wait();
    console.log('✅ Replacement transaction mined!');
    if (receipt) {
      console.log('Block number:', receipt.blockNumber);
    }
    
  } catch (error) {
    console.error('❌ Error canceling specific transaction:', error);
  }
}

// Main execution
async function main() {
  console.log('🚀 Advanced Transaction Cancellation Script for Amoy Network');
  console.log('==========================================================\n');
  
  // Check if a specific transaction hash was provided
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    const txHash = args[0];
    console.log(`🎯 Canceling specific transaction: ${txHash}`);
    await cancelTransactionByHash(txHash);
  } else {
    console.log('🔍 Checking for pending transactions and attempting to cancel...');
    await cancelSpecificTransaction();
  }
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