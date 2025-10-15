#!/usr/bin/env ts-node

import { createAppConfig } from '../src/config.js';
import { newTreasury } from '../src/contractsCaller/sweepstake/newTreasury.js';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

interface DeploymentConfig {
    network: 'mainnet' | 'testnet' | 'devnet';
    rpcUrl: string;
    adminPrivateKey: string;
    userPrivateKey: string;
    coinType: string;
}

interface DeploymentResult {
    packageId: string;
    upgradeCapId: string;
    adminCapSweepstakeId: string;
    adminCapConditionalId: string;
    treasuryId?: string;
    deploymentTx: string;
}

class MainnetDeployer {
    private config: AppConfig;
    private deploymentConfig: DeploymentConfig;

    constructor(config: DeploymentConfig) {
        this.deploymentConfig = config;
        this.config = this.createAppConfig(config);
    }

    private createAppConfig(config: DeploymentConfig): AppConfig {
        const client = new SuiClient({ url: config.rpcUrl });
        const admin = Ed25519Keypair.fromSecretKey(
            Buffer.from(config.adminPrivateKey, 'hex')
        );
        const user = Ed25519Keypair.fromSecretKey(
            Buffer.from(config.userPrivateKey, 'hex')
        );

        return {
            client,
            moduleAddress: '', // Will be set after deployment
            admin,
            user,
            adminCapSweepTake: '', // Will be set after deployment
            adminCapConditional: '', // Will be set after deployment
        };
    }

    async deployContracts(): Promise<DeploymentResult> {
        console.log('🚀 Starting mainnet deployment...');
        console.log(`Network: ${this.deploymentConfig.network}`);
        console.log(`RPC URL: ${this.deploymentConfig.rpcUrl}`);

        try {
            // Deploy the package
            const deploymentResult = await this.deployPackage();
            
            // Extract deployment information
            const result = this.extractDeploymentInfo(deploymentResult);
            
            // Update config with deployed addresses
            this.config.moduleAddress = result.packageId;
            this.config.adminCapSweepTake = result.adminCapSweepstakeId;
            this.config.adminCapConditional = result.adminCapConditionalId;

            console.log('✅ Contract deployment completed successfully!');
            console.log('📋 Deployment Information:');
            console.log(`Package ID: ${result.packageId}`);
            console.log(`Upgrade Cap ID: ${result.upgradeCapId}`);
            console.log(`Admin Cap Sweepstake ID: ${result.adminCapSweepstakeId}`);
            console.log(`Admin Cap Conditional ID: ${result.adminCapConditionalId}`);

            // Save deployment info to file
            await this.saveDeploymentInfo(result);

            return result;

        } catch (error) {
            console.error('❌ Deployment failed:', error);
            throw error;
        }
    }

    private async deployPackage(): Promise<any> {
        console.log('📦 Deploying smart contracts...');

        const tx = new Transaction();
        
        // This would be the actual deployment transaction
        // For now, we'll simulate the deployment process
        console.log('⚠️  This is a simulation. In production, use:');
        console.log('sui client publish --skip-dependency-verification --gas-budget 50000000');

        // In a real deployment, this would call the Sui CLI or use the SDK
        // to publish the package and return the deployment result
        
        return {
            packageId: '0xSIMULATED_PACKAGE_ID',
            upgradeCapId: '0xSIMULATED_UPGRADE_CAP_ID',
            adminCapSweepstakeId: '0xSIMULATED_ADMIN_CAP_SWEEPSTAKE_ID',
            adminCapConditionalId: '0xSIMULATED_ADMIN_CAP_CONDITIONAL_ID',
            deploymentTx: '0xSIMULATED_DEPLOYMENT_TX'
        };
    }

    private extractDeploymentInfo(deploymentResult: any): DeploymentResult {
        // Extract the actual IDs from the deployment result
        // This would parse the actual deployment output
        
        return {
            packageId: deploymentResult.packageId,
            upgradeCapId: deploymentResult.upgradeCapId,
            adminCapSweepstakeId: deploymentResult.adminCapSweepstakeId,
            adminCapConditionalId: deploymentResult.adminCapConditionalId,
            deploymentTx: deploymentResult.deploymentTx
        };
    }

    private async saveDeploymentInfo(result: DeploymentResult): Promise<void> {
        const deploymentInfo = {
            timestamp: new Date().toISOString(),
            network: this.deploymentConfig.network,
            ...result
        };

        const fs = await import('fs/promises');
        await fs.writeFile(
            'deployment-info.json',
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log('💾 Deployment information saved to deployment-info.json');
    }

    async createInitialTreasury(coinType: string = '0x2::sui::SUI'): Promise<string> {
        console.log('💰 Creating initial treasury...');

        try {
            const result = await newTreasury(this.config, coinType);
            
            // Extract treasury ID from result
            const treasuryId = this.extractTreasuryId(result);
            
            console.log(`✅ Treasury created: ${treasuryId}`);
            return treasuryId;

        } catch (error) {
            console.error('❌ Treasury creation failed:', error);
            throw error;
        }
    }

    private extractTreasuryId(result: any): string {
        // Extract treasury ID from the newTreasury result
        // This would parse the actual transaction output
        return '0xSIMULATED_TREASURY_ID';
    }

    async verifyDeployment(): Promise<boolean> {
        console.log('🔍 Verifying deployment...');

        try {
            // Verify package exists
            const packageInfo = await this.config.client.getObject({
                id: this.config.moduleAddress,
                options: { showContent: true }
            });

            if (!packageInfo.data) {
                console.error('❌ Package not found');
                return false;
            }

            // Verify admin caps exist
            const adminCapSweepstake = await this.config.client.getObject({
                id: this.config.adminCapSweepTake,
                options: { showContent: true }
            });

            const adminCapConditional = await this.config.client.getObject({
                id: this.config.adminCapConditional,
                options: { showContent: true }
            });

            if (!adminCapSweepstake.data || !adminCapConditional.data) {
                console.error('❌ Admin caps not found');
                return false;
            }

            console.log('✅ Deployment verification successful');
            return true;

        } catch (error) {
            console.error('❌ Deployment verification failed:', error);
            return false;
        }
    }
}

// Main deployment function
async function deployToMainnet() {
    // Load configuration from environment
    const deploymentConfig: DeploymentConfig = {
        network: (process.env.NETWORK as 'mainnet' | 'testnet' | 'devnet') || 'mainnet',
        rpcUrl: process.env.SUI_RPC_URL || 'https://fullnode.mainnet.sui.io:443',
        adminPrivateKey: process.env.PRIVATE_KEY || '',
        userPrivateKey: process.env.USER_PRIVATE_KEY || '',
        coinType: process.env.COIN_TYPE || '0x2::sui::SUI'
    };

    // Validate configuration
    if (!deploymentConfig.adminPrivateKey || !deploymentConfig.userPrivateKey) {
        console.error('❌ Missing required environment variables: PRIVATE_KEY, USER_PRIVATE_KEY');
        process.exit(1);
    }

    console.log('🎯 Mainnet Deployment Script');
    console.log('============================\n');

    try {
        const deployer = new MainnetDeployer(deploymentConfig);

        // Deploy contracts
        const deploymentResult = await deployer.deployContracts();

        // Create initial treasury
        const treasuryId = await deployer.createInitialTreasury(deploymentConfig.coinType);

        // Verify deployment
        const isVerified = await deployer.verifyDeployment();

        if (isVerified) {
            console.log('\n🎉 Mainnet deployment completed successfully!');
            console.log('\n📋 Next Steps:');
            console.log('1. Update your environment variables with the deployed addresses');
            console.log('2. Deploy UMA contracts to Base network');
            console.log('3. Deploy and configure the subgraph');
            console.log('4. Run post-deployment tests');
            console.log('5. Update frontend configuration');
        } else {
            console.log('\n⚠️  Deployment completed but verification failed');
            console.log('Please check the deployment manually');
        }

    } catch (error) {
        console.error('\n💥 Deployment failed:', error);
        process.exit(1);
    }
}

// Run deployment if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    deployToMainnet();
}

export { MainnetDeployer, deployToMainnet };
