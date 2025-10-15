# Transaction Cancellation Script

This script allows you to cancel pending transactions on the Amoy network using a private key.

## How it works

The script works by sending a new transaction with the same nonce as the pending transaction but with a higher gas price. This causes the new transaction to replace the pending one.

## Usage

### Method 1: Using npm script
```bash
npm run cancel-tx
```

### Method 2: Direct execution
```bash
npx ts-node scripts/cancelTransaction.ts
```

## What the script does

1. **Connects to Amoy network** using the RPC URL from your hardhat config
2. **Gets current nonce** for the wallet address
3. **Creates a cancellation transaction**:
   - Sends 0 ETH to the same wallet address
   - Uses the same nonce as the pending transaction
   - Uses double the current gas price to ensure it gets processed first
4. **Signs and broadcasts** the transaction
5. **Waits for confirmation** and shows the transaction details

## Important Notes

⚠️ **Security Warning**: The private key is hardcoded in the script for demonstration purposes. In production, you should:
- Use environment variables
- Never commit private keys to version control
- Use a dedicated wallet for testing

## Alternative Methods

The script also includes a `speedUpTransaction()` function that can be used to speed up a pending transaction instead of canceling it. To use this method:

1. Uncomment the line `// await speedUpTransaction();` in the main function
2. Comment out the line `await cancelTransaction();`

## Troubleshooting

- **Nonce errors**: If you get a nonce error, the original transaction might have already been processed
- **Insufficient funds**: Make sure your wallet has enough ETH for gas fees
- **Network issues**: Check your internet connection and RPC endpoint

## Network Information

- **Network**: Amoy (Polygon testnet)
- **Chain ID**: 80002
- **RPC URL**: From your hardhat config
- **Explorer**: https://amoy.polygonscan.com

## Example Output

```
🚀 Transaction Cancellation Script for Amoy Network
================================================

Wallet address: 0x...
Current nonce: 5
Current gas price: 25.5 gwei
Cancellation transaction details:
- To: 0x...
- Value: 0.0 ETH
- Gas Limit: 21000
- Gas Price: 51.0 gwei
- Nonce: 5

✅ Cancellation transaction sent!
Transaction hash: 0x...
View on Amoy Explorer: https://amoy.polygonscan.com/tx/0x...

⏳ Waiting for transaction to be mined...
✅ Transaction mined!
Block number: 12345
Gas used: 21000

✅ Script completed successfully!
``` 