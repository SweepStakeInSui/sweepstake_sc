# Deployment Guide

## Prerequisites

Before deploying the smart contracts, ensure you have the following:

- Sui CLI installed on your system
- Access to a Sui network (testnet or mainnet)

## Setup Instructions

### 1. Configure Sui Profile

First, configure your Sui client profile. For testnet deployment:

```bash
sui client new-env --alias testnet --rpc https://sui-testnet-endpoint.blockvision.org
sui client switch --env testnet
```

### 2. Create Wallet

Generate a new wallet using the following command:

```bash
sui keytool generate ed25519
```

> Important: Save your wallet information securely!

### 3. Get Test Tokens

For testnet deployment, you can get test SUI tokens using the faucet:

```bash
sui client faucet --address <YOUR_WALLET_ADDRESS>
```

Replace `<YOUR_WALLET_ADDRESS>` with your actual wallet address.

## Deployment

To deploy your smart contract:

```bash
sui move build
```

After deployment, make sure to save your contract's information from the deployment logs for future reference.
