# Mainnet Deployment Guide

This guide provides comprehensive instructions for deploying the Sweepstake project to mainnet, including both Sui smart contracts and UMA contracts on Base network.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Sui Smart Contract Deployment](#sui-smart-contract-deployment)
- [UMA Contract Deployment on Base](#uma-contract-deployment-on-base)
- [Subgraph Deployment](#subgraph-deployment)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Verification and Testing](#verification-and-testing)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Required Software
- Node.js (v18 or higher)
- npm or yarn
- Sui CLI (latest version)
- Git

### Required Accounts & Tokens
- Sui mainnet wallet with sufficient SUI tokens for gas
- Base mainnet wallet with sufficient ETH for gas
- Admin private keys (keep secure!)
- RPC endpoints for both networks

### Required Services
- RPC provider for Sui mainnet (e.g., Shinami, QuickNode)
- RPC provider for Base mainnet (e.g., Alchemy, Infura)
- The Graph Studio account (for subgraph deployment)

## 🌐 Environment Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd sweepstake_sc

# Install Sui dependencies
cd sweepstake
# Dependencies are managed by Sui Move

# Install UMA dependencies
cd ../uma
npm install

# Install scripts dependencies
cd ../scripts
npm install
```

### 2. Create Environment Files

Create `.env` files for each component:

#### For Sui Contracts (`scripts/.env`)
```bash
# Network Configuration
NETWORK=mainnet

# Sui Configuration
PRIVATE_KEY=your_sui_private_key_here
USER_PRIVATE_KEY=your_user_private_key_here

# Contract Addresses (will be filled after deployment)
MODULE_ADDRESS=to_be_filled_after_deployment
ADMIN_CAP_SWEEPSTAKE=to_be_filled_after_deployment
ADMIN_CAP_CONDITIONAL=to_be_filled_after_deployment

# RPC Configuration
SUI_RPC_URL=https://fullnode.mainnet.sui.io:443
```

#### For UMA Contracts (`uma/.env`)
```bash
# Base Mainnet Configuration
PRIVATE_KEY=your_base_private_key_here

# Base RPC Configuration
BASE_RPC_URL=https://mainnet.base.org

# UMA Configuration
UMA_OPTIMISTIC_ORACLE_V2=0x880d041D67aaB3B062995d11d4aD9c1018A3b02f
UMA_IDENTIFIER_REGISTRY=0x3c1574B6c7F4B8E5C5d5E5F5G5H5I5J5K5L5M5N5O5P5Q5R5S5T5U5V5W5X5Y5Z5A5B5C5D5E5F

# Bond Currency (USDC on Base)
BOND_CURRENCY=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# Deployment Parameters
LIVENESS=3600
REWARD=0
BOND=0
```

### 3. Configure Sui CLI for Mainnet

```bash
# Switch to mainnet environment
sui client new-env --alias mainnet --rpc https://fullnode.mainnet.sui.io:443
sui client switch --env mainnet

# Verify configuration
sui client active-env
sui client addresses
```

## 🚀 Sui Smart Contract Deployment

### 1. Prepare for Deployment

```bash
cd sweepstake

# Build the contracts
sui move build

# Verify build success
ls -la build/
```

### 2. Deploy Contracts

```bash
# Deploy to mainnet
sui client publish --skip-dependency-verification --gas-budget 50000000

# Save the deployment output - IMPORTANT!
# Copy the following from the output:
# - Package ID
# - Upgrade Cap ID
# - Admin Cap IDs
```

### 3. Extract Deployment Information

From the deployment output, extract and save:

```bash
# Example output format:
PACKAGE_ID=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
UPGRADE_CAP_ID=0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
ADMIN_CAP_SWEEPSTAKE_ID=0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba
ADMIN_CAP_CONDITIONAL_ID=0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210
```

### 4. Update Environment Configuration

Update your `scripts/.env` file with the deployed addresses:

```bash
MODULE_ADDRESS=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
ADMIN_CAP_SWEEPSTAKE=0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba
ADMIN_CAP_CONDITIONAL=0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210
```

### 5. Verify Sui Deployment

```bash
# Check package information
sui client object <PACKAGE_ID>

# Check admin capabilities
sui client object <ADMIN_CAP_SWEEPSTAKE_ID>
sui client object <ADMIN_CAP_CONDITIONAL_ID>
```

## 🔗 UMA Contract Deployment on Base

### 1. Update Hardhat Configuration

Update `uma/hardhat.config.ts` for Base mainnet:

```typescript
import { HardhatUserConfig, vars } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-ignition-ethers';

const PRIVATE_KEY = vars.get('PRIVATE_KEY');

const config: HardhatUserConfig = {
  solidity: '0.8.15',
  networks: {
    base: {
      url: 'https://mainnet.base.org',
      chainId: 8453,
      accounts: [PRIVATE_KEY],
      gasPrice: "auto",
      gas: "auto",
    }
  },
  sourcify: {
    enabled: true,
  }
};

export default config;
```

### 2. Deploy UMA Contract

```bash
cd uma

# Deploy to Base mainnet
npx hardhat ignition deploy ignition/modules/SweepStakeUma.ts --network base

# Save the deployment output - IMPORTANT!
# Copy the contract address from the output
```

### 3. Update UMA Contract Configuration

After deployment, update the contract parameters:

```bash
# Set deployment parameters (replace with actual contract address)
UMA_CONTRACT_ADDRESS=0xYourDeployedContractAddress

# Set UMA parameters
npx hardhat run scripts/setParameters.ts --network base
```

### 4. Verify UMA Deployment

```bash
# Verify contract deployment on Base explorer
# https://basescan.org/address/<YOUR_CONTRACT_ADDRESS>

# Check contract parameters
npx hardhat run scripts/verifyDeployment.ts --network base
```

## 📊 Subgraph Deployment

### 1. Update Subgraph Configuration

Update `uma/subgraph/subgraph.yaml` for mainnet:

```yaml
specVersion: 1.0.0
indexerHints:
  prune: auto
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: SweepstakeUma
    network: base
    source:
      address: "0xYourDeployedContractAddress"  # Update with actual address
      abi: SweepstakeUma
      startBlock: 12345678  # Update with actual deployment block
    mapping:
      # ... rest of configuration
```

```

## ⚙️ Post-Deployment Configuration

### 1. Initialize Admin Accounts

```bash
cd scripts

# Initialize admin accounts
npm run init:admin -- --network mainnet

# Verify admin initialization
npm run verify:admin -- --network mainnet
```

### 2. Configure Treasury

```bash
# Create initial treasury
npm run create:treasury -- --coin-type 0x2::sui::SUI

# Configure treasury parameters
npm run configure:treasury -- --treasury-id <TREASURY_ID>
```

### 3. Update Frontend Configuration

Update your frontend configuration files with the deployed addresses:

```typescript
// frontend/src/config/mainnet.ts
export const MAINNET_CONFIG = {
  sui: {
    packageId: "0xYourSuiPackageId",
    adminCapSweepstake: "0xYourAdminCapId",
    adminCapConditional: "0xYourConditionalAdminCapId",
  },
  uma: {
    contractAddress: "0xYourUMAContractAddress",
    network: "base",
    optimisticOracleV2: "0x5953f2538F613E05bAED8A5AeFa8e6622467AD3D",
  },
  subgraph: {
    url: "https://api.studio.thegraph.com/query/your-subgraph-url",
  }
};
```

## 🧪 Verification and Testing

### 1. Run Deployment Tests

```bash
cd scripts

# Run governance tests
npm run test:governance:integration

# Run UMA integration tests
npm run test:uma:integration
```

### 2. Manual Verification

#### Sui Contract Verification
```bash
# Verify package deployment
sui client object <PACKAGE_ID> --json

# Verify admin capabilities
sui client object <ADMIN_CAP_ID> --json

# Test basic functionality
npm run test:basic -- --network mainnet
```

#### UMA Contract Verification
```bash
cd uma

# Verify contract deployment
npx hardhat run scripts/verifyContract.ts --network base

# Test UMA integration
npx hardhat run scripts/testUmaIntegration.ts --network base
```

### 3. End-to-End Testing

```bash
# Test complete workflow
npm run test:e2e -- --network mainnet --uma-network base

# Verify subgraph indexing
npm run verify:subgraph
```

## 🔒 Security Considerations

### 1. Private Key Security
- ✅ Never commit private keys to version control
- ✅ Use hardware wallets for production deployments
- ✅ Implement multi-signature for admin operations
- ✅ Rotate keys regularly

### 2. Contract Security
- ✅ Verify all contracts on block explorers
- ✅ Conduct security audits before mainnet deployment
- ✅ Implement proper access controls
- ✅ Set appropriate gas limits

### 3. Operational Security
- ✅ Monitor contract interactions
- ✅ Set up alerts for critical operations
- ✅ Maintain backup admin accounts
- ✅ Document all administrative actions

## 🚨 Troubleshooting

### Common Issues

#### Sui Deployment Issues
```bash
# Issue: Insufficient gas
# Solution: Increase gas budget
sui client publish --gas-budget 100000000

# Issue: Dependency verification failed
# Solution: Use skip flag (only for mainnet)
sui client publish --skip-dependency-verification

# Issue: Network connection error
# Solution: Check RPC endpoint and network configuration
sui client active-env
```

#### UMA Deployment Issues
```bash
# Issue: Contract deployment failed
# Solution: Check gas price and network connectivity
npx hardhat ignition deploy ignition/modules/SweepStakeUma.ts --network base --verbose

# Issue: Parameter setting failed
# Solution: Verify admin permissions and contract address
npx hardhat run scripts/verifyAdmin.ts --network base
```

#### Subgraph Deployment Issues
```bash
# Issue: Subgraph build failed
# Solution: Check schema and mapping files
npm run codegen
npm run build

# Issue: Indexing not starting
# Solution: Verify start block and network configuration
```

### Support Resources

- **Sui Documentation**: https://docs.sui.io/
- **Base Documentation**: https://docs.base.org/
- **UMA Documentation**: https://docs.umaproject.org/
- **The Graph Documentation**: https://thegraph.com/docs/

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Environment variables configured
- [ ] RPC endpoints verified
- [ ] Sufficient gas tokens available

### Sui Deployment
- [ ] Contracts built successfully
- [ ] Deployed to mainnet
- [ ] Package ID saved
- [ ] Admin Cap IDs saved
- [ ] Environment updated

### UMA Deployment
- [ ] Contract deployed to Base
- [ ] Contract address saved
- [ ] Parameters configured
- [ ] Contract verified on explorer

### Subgraph Deployment
- [ ] Configuration updated for mainnet
- [ ] Subgraph built successfully
- [ ] Deployed to The Graph Studio
- [ ] Indexing started

### Post-Deployment
- [ ] Admin accounts initialized
- [ ] Treasury configured
- [ ] Frontend updated
- [ ] End-to-end tests passing
- [ ] Monitoring configured

## 🎯 Next Steps

After successful deployment:

1. **Monitor**: Set up monitoring and alerting
2. **Document**: Update all documentation with mainnet addresses
3. **Notify**: Inform users and stakeholders of mainnet launch
4. **Maintain**: Establish ongoing maintenance procedures
5. **Scale**: Plan for scaling and optimization

---

**⚠️ Important**: This is a mainnet deployment guide. Always test thoroughly on testnets before deploying to mainnet. Ensure you have proper backups and recovery procedures in place.
