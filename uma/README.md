# UMA Integration Project

## Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Usage Guide](#usage-guide)
- [Development Guidelines](#development-guidelines)

## Overview
This project integrates with the UMA (Universal Market Access) protocol for decentralized oracle functionality. It allows for automated request handling and voting mechanisms through the UMA protocol.

## Project Structure
```
├── contracts/       # Smart contract source files
├── scripts/         # Deployment and utility scripts
├── test/           # Test files
├── ignition/       # Ignition deployment modules
├── subgraph/       # The Graph protocol integration
├── resources/      # Images and other static resources
└── artifacts/      # Compiled contract artifacts
```

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- A wallet with testnet tokens
- Access to a blockchain node (e.g., Infura, QuickNode)

## Installation
```bash
# Install dependencies
npm install
# or
yarn install
```

## Configuration
1. Create or modify `hardhat.config.ts`:
```typescript
const config: HardhatUserConfig = {
  solidity: '0.8.15',
  networks: {
    amoy: {
      url: 'YOUR_NODE_URL',
      chainId: 80002,  // Mumbai testnet
      accounts: ['YOUR_PRIVATE_KEY'],  // Array of private keys
    },
  },
}
```

Important configuration notes:
- Replace `YOUR_NODE_URL` with your actual node endpoint
- Add your private key to the `accounts` array (never commit this to version control)
- Adjust `chainId` according to your target network

## Deployment

Two deployment methods are available:

### Using Ignition (Recommended)
```bash
npx hardhat ignition deploy ignition/modules/SweepStakeUma.ts --network <network-name>
```

## Usage Guide

### Interacting with UMA Oracle

1. **View Available Requests**
   - Access the testnet oracle interface at [UMA Testnet Oracle](https://testnet.oracle.umaproject.org/propose)
   - Browse available requests for voting

   ![Request Selection](resources/img.png)

2. **Voting Process**
   - Select your desired request
   - Connect your wallet when prompted
   
   ![Wallet Connection](resources/img_1.png)

3. **Submit Vote and View Results**
   - Cast your vote on the selected request
   - Monitor the voting results
   
   ![Voting Interface](resources/img_2.png)

### Important Notes
- Requests have a 30-second dispute window (Note: dispute functionality is disabled in testnet)
- Automated backend systems handle request submission to UMA
- Ensure sufficient gas for transaction execution

## Development Guidelines

### Code Style
- Follow Solidity style guide
- Use meaningful variable and function names
- Comment complex logic

### Testing
```bash
npx hardhat test
```

### Security Considerations
- Never commit private keys or sensitive data
- Use environment variables for configuration
- Follow security best practices when handling user funds

