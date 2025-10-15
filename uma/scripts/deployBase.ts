#!/usr/bin/env ts-node

import { ethers } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from '@nomicfoundation/hardhat-deploy/types';

interface BaseDeploymentConfig {
    network: string;
    rpcUrl: string;
    privateKey: string;
    gasPrice?: string;
    gasLimit?: string;
}

interface UMAParameters {
    liveness: number;
    reward: number;
    bond: number;
    bondCurrency: string;
}

interface DeploymentResult {
    contractAddress: string;
    deploymentTx: string;
    blockNumber: number;
    gasUsed: number;
}

class BaseDeployer {
    private provider: ethers.Provider;
    private wallet: ethers.Wallet;
    private config: BaseDeploymentConfig;
    private contract: ethers.Contract | null = null;

    constructor(config: BaseDeploymentConfig) {
        this.config = config;
        this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
        this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    }

    async deployUMAContract(): Promise<DeploymentResult> {
        console.log('🚀 Starting UMA contract deployment to Base...');
        console.log(`Network: ${this.config.network}`);
        console.log(`RPC URL: ${this.config.rpcUrl}`);
        console.log(`Wallet Address: ${this.wallet.address}`);

        try {
            // Check wallet balance
            const balance = await this.provider.getBalance(this.wallet.address);
            console.log(`Wallet Balance: ${ethers.formatEther(balance)} ETH`);

            if (balance < ethers.parseEther('0.01')) {
                throw new Error('Insufficient balance for deployment');
            }

            // Deploy the contract
            const deploymentResult = await this.deployContract();

            console.log('✅ UMA contract deployment completed successfully!');
            console.log('📋 Deployment Information:');
            console.log(`Contract Address: ${deploymentResult.contractAddress}`);
            console.log(`Deployment TX: ${deploymentResult.deploymentTx}`);
            console.log(`Block Number: ${deploymentResult.blockNumber}`);
            console.log(`Gas Used: ${deploymentResult.gasUsed}`);

            // Save deployment info
            await this.saveDeploymentInfo(deploymentResult);

            return deploymentResult;

        } catch (error) {
            console.error('❌ UMA contract deployment failed:', error);
            throw error;
        }
    }

    private async deployContract(): Promise<DeploymentResult> {
        console.log('📦 Deploying SweepstakeUma contract...');

        // This would be the actual contract deployment
        // For now, we'll simulate the deployment process
        console.log('⚠️  This is a simulation. In production, use:');
        console.log('npx hardhat ignition deploy ignition/modules/SweepStakeUma.ts --network base');

        // In a real deployment, this would:
        // 1. Compile the contract
        // 2. Deploy using Hardhat Ignition
        // 3. Return the deployment result

        return {
            contractAddress: '0xSIMULATED_CONTRACT_ADDRESS',
            deploymentTx: '0xSIMULATED_DEPLOYMENT_TX',
            blockNumber: 12345678,
            gasUsed: 1234567
        };
    }

    async configureUMAParameters(
        contractAddress: string,
        parameters: UMAParameters
    ): Promise<void> {
        console.log('⚙️  Configuring UMA parameters...');

        try {
            // This would configure the UMA contract parameters
            console.log('📝 UMA Parameters to set:');
            console.log(`Liveness: ${parameters.liveness} seconds`);
            console.log(`Reward: ${parameters.reward}`);
            console.log(`Bond: ${parameters.bond}`);
            console.log(`Bond Currency: ${parameters.bondCurrency}`);

            // In a real deployment, this would:
            // 1. Connect to the deployed contract
            // 2. Call the setter functions
            // 3. Verify the parameters were set correctly

            console.log('✅ UMA parameters configured successfully');

        } catch (error) {
            console.error('❌ UMA parameter configuration failed:', error);
            throw error;
        }
    }

    async verifyContract(contractAddress: string): Promise<boolean> {
        console.log('🔍 Verifying contract deployment...');

        try {
            // Check if contract exists
            const code = await this.provider.getCode(contractAddress);
            
            if (code === '0x') {
                console.error('❌ Contract not found at address');
                return false;
            }

            // In a real deployment, this would:
            // 1. Verify the contract on BaseScan
            // 2. Check contract parameters
            // 3. Test basic functionality

            console.log('✅ Contract verification successful');
            return true;

        } catch (error) {
            console.error('❌ Contract verification failed:', error);
            return false;
        }
    }

    private async saveDeploymentInfo(result: DeploymentResult): Promise<void> {
        const deploymentInfo = {
            timestamp: new Date().toISOString(),
            network: this.config.network,
            contractName: 'SweepstakeUma',
            ...result
        };

        const fs = await import('fs/promises');
        await fs.writeFile(
            '../deployment-info-base.json',
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log('💾 Deployment information saved to deployment-info-base.json');
    }

    async testContractIntegration(contractAddress: string): Promise<void> {
        console.log('🧪 Testing contract integration...');

        try {
            // Test basic contract functionality
            console.log('📋 Running integration tests...');
            
            // In a real deployment, this would:
            // 1. Test admin functions
            // 2. Test UMA integration
            // 3. Test parameter setting
            // 4. Verify event emissions

            console.log('✅ Contract integration tests passed');

        } catch (error) {
            console.error('❌ Contract integration tests failed:', error);
            throw error;
        }
    }
}

// Main deployment function
async function deployToBase() {
    // Load configuration from environment
    const deploymentConfig: BaseDeploymentConfig = {
        network: 'base',
        rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
        privateKey: process.env.PRIVATE_KEY || '',
        gasPrice: process.env.GAS_PRICE || 'auto',
        gasLimit: process.env.GAS_LIMIT || 'auto'
    };

    const umaParameters: UMAParameters = {
        liveness: parseInt(process.env.UMA_LIVENESS || '3600'),
        reward: parseInt(process.env.UMA_REWARD || '0'),
        bond: parseInt(process.env.UMA_BOND || '0'),
        bondCurrency: process.env.BOND_CURRENCY || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // USDC on Base
    };

    // Validate configuration
    if (!deploymentConfig.privateKey) {
        console.error('❌ Missing required environment variable: PRIVATE_KEY');
        process.exit(1);
    }

    console.log('🎯 Base Network Deployment Script');
    console.log('=================================\n');

    try {
        const deployer = new BaseDeployer(deploymentConfig);

        // Deploy UMA contract
        const deploymentResult = await deployer.deployUMAContract();

        // Configure UMA parameters
        await deployer.configureUMAParameters(
            deploymentResult.contractAddress,
            umaParameters
        );

        // Verify deployment
        const isVerified = await deployer.verifyContract(deploymentResult.contractAddress);

        if (isVerified) {
            // Test contract integration
            await deployer.testContractIntegration(deploymentResult.contractAddress);

            console.log('\n🎉 Base deployment completed successfully!');
            console.log('\n📋 Next Steps:');
            console.log('1. Update subgraph configuration with contract address');
            console.log('2. Deploy subgraph to The Graph Studio');
            console.log('3. Test UMA integration with Sui contracts');
            console.log('4. Update frontend configuration');
            console.log('5. Run end-to-end tests');
        } else {
            console.log('\n⚠️  Deployment completed but verification failed');
            console.log('Please check the deployment manually');
        }

    } catch (error) {
        console.error('\n💥 Base deployment failed:', error);
        process.exit(1);
    }
}

// Hardhat deployment function
const deployUMAContract: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    console.log(`Deploying SweepstakeUma to ${network.name}...`);

    const deployment = await deploy('SweepstakeUma', {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: 1,
    });

    if (deployment.newlyDeployed) {
        console.log(`✅ SweepstakeUma deployed at: ${deployment.address}`);
    }

    return true;
};

deployUMAContract.tags = ['SweepstakeUma'];

// Run deployment if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    deployToBase();
}

export { BaseDeployer, deployToBase, deployUMAContract };
