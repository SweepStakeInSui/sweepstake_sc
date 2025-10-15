#!/usr/bin/env ts-node

import { ethers } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

interface UMAParameters {
    liveness: number;
    reward: number;
    bond: number;
    bondCurrency: string;
}

class UMAParameterSetter {
    private provider: ethers.Provider;
    private wallet: ethers.Wallet;
    private contract: ethers.Contract;

    constructor(
        provider: ethers.Provider,
        wallet: ethers.Wallet,
        contractAddress: string,
        abi: any[]
    ) {
        this.provider = provider;
        this.wallet = wallet;
        this.contract = new ethers.Contract(contractAddress, abi, wallet);
    }

    async setParameters(parameters: UMAParameters): Promise<void> {
        console.log('⚙️  Setting UMA contract parameters...');
        console.log('=====================================\n');

        try {
            // Set liveness
            await this.setLiveness(parameters.liveness);

            // Set reward
            await this.setReward(parameters.reward);

            // Set bond currency
            await this.setBondCurrency(parameters.bondCurrency);

            // Set bond
            await this.setBond(parameters.bond);

            console.log('\n✅ All UMA parameters set successfully!');

        } catch (error) {
            console.error('❌ Failed to set UMA parameters:', error);
            throw error;
        }
    }

    private async setLiveness(liveness: number): Promise<void> {
        console.log(`📝 Setting liveness to ${liveness} seconds...`);

        try {
            const tx = await this.contract.setLiveness(liveness);
            console.log(`⏳ Transaction sent: ${tx.hash}`);

            const receipt = await tx.wait();
            console.log(`✅ Liveness set successfully in block ${receipt.blockNumber}`);

        } catch (error) {
            console.error('❌ Failed to set liveness:', error);
            throw error;
        }
    }

    private async setReward(reward: number): Promise<void> {
        console.log(`💰 Setting reward to ${reward}...`);

        try {
            const tx = await this.contract.setReward(reward);
            console.log(`⏳ Transaction sent: ${tx.hash}`);

            const receipt = await tx.wait();
            console.log(`✅ Reward set successfully in block ${receipt.blockNumber}`);

        } catch (error) {
            console.error('❌ Failed to set reward:', error);
            throw error;
        }
    }

    private async setBondCurrency(bondCurrency: string): Promise<void> {
        console.log(`🪙 Setting bond currency to ${bondCurrency}...`);

        try {
            const tx = await this.contract.setBondCurrency(bondCurrency);
            console.log(`⏳ Transaction sent: ${tx.hash}`);

            const receipt = await tx.wait();
            console.log(`✅ Bond currency set successfully in block ${receipt.blockNumber}`);

        } catch (error) {
            console.error('❌ Failed to set bond currency:', error);
            throw error;
        }
    }

    private async setBond(bond: number): Promise<void> {
        console.log(`🔒 Setting bond to ${bond}...`);

        try {
            const tx = await this.contract.setBond(bond);
            console.log(`⏳ Transaction sent: ${tx.hash}`);

            const receipt = await tx.wait();
            console.log(`✅ Bond set successfully in block ${receipt.blockNumber}`);

        } catch (error) {
            console.error('❌ Failed to set bond:', error);
            throw error;
        }
    }

    async verifyParameters(): Promise<void> {
        console.log('\n🔍 Verifying UMA parameters...');
        console.log('==============================');

        try {
            const liveness = await this.contract.liveness();
            const reward = await this.contract.reward();
            const bond = await this.contract.bond();
            const bondCurrency = await this.contract.bondCurrency();

            console.log('📋 Current UMA Parameters:');
            console.log(`Liveness: ${liveness.toString()} seconds`);
            console.log(`Reward: ${reward.toString()}`);
            console.log(`Bond: ${bond.toString()}`);
            console.log(`Bond Currency: ${bondCurrency}`);

            console.log('\n✅ Parameter verification completed');

        } catch (error) {
            console.error('❌ Failed to verify parameters:', error);
            throw error;
        }
    }
}

// Main function to set UMA parameters
async function setUMAParameters() {
    // Load configuration from environment
    const contractAddress = process.env.UMA_CONTRACT_ADDRESS;
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

    const parameters: UMAParameters = {
        liveness: parseInt(process.env.UMA_LIVENESS || '3600'),
        reward: parseInt(process.env.UMA_REWARD || '0'),
        bond: parseInt(process.env.UMA_BOND || '0'),
        bondCurrency: process.env.BOND_CURRENCY || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // USDC on Base
    };

    // Validate configuration
    if (!contractAddress || !privateKey) {
        console.error('❌ Missing required environment variables:');
        console.error('   UMA_CONTRACT_ADDRESS');
        console.error('   PRIVATE_KEY');
        process.exit(1);
    }

    console.log('🎯 UMA Parameter Configuration Script');
    console.log('====================================\n');

    try {
        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);

        console.log(`Network: Base Mainnet`);
        console.log(`RPC URL: ${rpcUrl}`);
        console.log(`Wallet Address: ${wallet.address}`);
        console.log(`Contract Address: ${contractAddress}\n`);

        // Load contract ABI
        const contractAbi = [
            'function setLiveness(uint256 _liveness) external',
            'function setReward(uint256 _reward) external',
            'function setBondCurrency(address erc20Address) external',
            'function setBond(uint256 _bond) external',
            'function liveness() external view returns (uint256)',
            'function reward() external view returns (uint256)',
            'function bond() external view returns (uint256)',
            'function bondCurrency() external view returns (address)',
            'function onlyAdmin() external view returns (bool)'
        ];

        // Create parameter setter
        const parameterSetter = new UMAParameterSetter(provider, wallet, contractAddress, contractAbi);

        // Set parameters
        await parameterSetter.setParameters(parameters);

        // Verify parameters
        await parameterSetter.verifyParameters();

        console.log('\n🎉 UMA parameter configuration completed successfully!');

    } catch (error) {
        console.error('\n💥 UMA parameter configuration failed:', error);
        process.exit(1);
    }
}

// Hardhat task
async function setParametersTask() {
    const hre = require('hardhat');
    const { ethers } = hre;

    const contractAddress = process.env.UMA_CONTRACT_ADDRESS;
    const [deployer] = await ethers.getSigners();

    if (!contractAddress) {
        console.error('❌ Please set UMA_CONTRACT_ADDRESS environment variable');
        return;
    }

    const contract = await ethers.getContractAt('SweepstakeUma', contractAddress);

    console.log('Setting UMA parameters...');

    // Set parameters based on environment variables
    const liveness = parseInt(process.env.UMA_LIVENESS || '3600');
    const reward = parseInt(process.env.UMA_REWARD || '0');
    const bond = parseInt(process.env.UMA_BOND || '0');
    const bondCurrency = process.env.BOND_CURRENCY || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

    try {
        // Set liveness
        console.log(`Setting liveness to ${liveness}...`);
        await contract.setLiveness(liveness);

        // Set reward
        console.log(`Setting reward to ${reward}...`);
        await contract.setReward(reward);

        // Set bond currency
        console.log(`Setting bond currency to ${bondCurrency}...`);
        await contract.setBondCurrency(bondCurrency);

        // Set bond
        console.log(`Setting bond to ${bond}...`);
        await contract.setBond(bond);

        console.log('✅ All parameters set successfully!');

    } catch (error) {
        console.error('❌ Failed to set parameters:', error);
    }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    setUMAParameters();
}

export { UMAParameterSetter, setUMAParameters, setParametersTask };
