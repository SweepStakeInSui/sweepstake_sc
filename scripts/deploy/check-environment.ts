#!/usr/bin/env ts-node

import { promises as fs } from 'fs';
import * as dotenv from 'dotenv';

interface EnvironmentCheck {
    variable: string;
    required: boolean;
    present: boolean;
    value?: string;
    secure?: boolean;
}

class EnvironmentChecker {
    private checks: EnvironmentCheck[] = [];

    constructor() {
        // Load environment variables
        dotenv.config();
    }

    async checkEnvironment(): Promise<boolean> {
        console.log('🔍 Environment Configuration Check');
        console.log('==================================\n');

        // Define required environment variables
        const requiredVars = [
            { name: 'NETWORK', secure: false },
            { name: 'PRIVATE_KEY', secure: true },
            { name: 'USER_PRIVATE_KEY', secure: true },
            { name: 'MODULE_ADDRESS', secure: false },
            { name: 'ADMIN_CAP_SWEEPSTAKE', secure: false },
            { name: 'ADMIN_CAP_CONDITIONAL', secure: false },
            { name: 'SUI_RPC_URL', secure: false },
            { name: 'BASE_RPC_URL', secure: false },
            { name: 'GRAPH_STUDIO_API_KEY', secure: true },
            { name: 'UMA_LIVENESS', secure: false },
            { name: 'UMA_REWARD', secure: false },
            { name: 'UMA_BOND', secure: false },
            { name: 'BOND_CURRENCY', secure: false }
        ];

        // Check each variable
        for (const varConfig of requiredVars) {
            const present = !!process.env[varConfig.name];
            const value = process.env[varConfig.name];
            
            this.checks.push({
                variable: varConfig.name,
                required: true,
                present,
                value: present ? (varConfig.secure ? '[HIDDEN]' : value) : undefined,
                secure: varConfig.secure
            });
        }

        // Display results
        this.displayResults();

        // Check for missing critical variables
        const missingCritical = this.checks.filter(check => check.required && !check.present);
        
        if (missingCritical.length > 0) {
            console.log('\n❌ Critical environment variables missing:');
            missingCritical.forEach(check => {
                console.log(`   - ${check.variable}`);
            });
            return false;
        }

        console.log('\n✅ Environment check passed!');
        return true;
    }

    private displayResults(): void {
        console.log('📋 Environment Variables Status:');
        console.log('');

        // Group by status
        const present = this.checks.filter(check => check.present);
        const missing = this.checks.filter(check => !check.present);

        if (present.length > 0) {
            console.log('✅ Present:');
            present.forEach(check => {
                const secure = check.secure ? '🔒' : '📝';
                console.log(`   ${secure} ${check.variable}: ${check.value}`);
            });
            console.log('');
        }

        if (missing.length > 0) {
            console.log('❌ Missing:');
            missing.forEach(check => {
                console.log(`   ⚠️  ${check.variable}`);
            });
            console.log('');
        }
    }

    async validateNetworkConfiguration(): Promise<boolean> {
        console.log('🌐 Network Configuration Validation');
        console.log('===================================\n');

        const network = process.env.NETWORK;
        const suiRpcUrl = process.env.SUI_RPC_URL;
        const baseRpcUrl = process.env.BASE_RPC_URL;

        if (!network) {
            console.error('❌ NETWORK environment variable not set');
            return false;
        }

        console.log(`Network: ${network}`);

        // Validate Sui configuration
        if (!suiRpcUrl) {
            console.error('❌ SUI_RPC_URL environment variable not set');
            return false;
        }

        console.log(`Sui RPC URL: ${suiRpcUrl}`);

        // Validate Base configuration
        if (!baseRpcUrl) {
            console.error('❌ BASE_RPC_URL environment variable not set');
            return false;
        }

        console.log(`Base RPC URL: ${baseRpcUrl}`);

        // Validate network-specific configurations
        if (network === 'mainnet') {
            console.log('\n🔍 Mainnet-specific validations:');
            
            // Check for mainnet RPC URLs
            if (suiRpcUrl.includes('testnet') || suiRpcUrl.includes('devnet')) {
                console.error('❌ SUI_RPC_URL appears to be pointing to testnet/devnet');
                return false;
            }

            if (baseRpcUrl.includes('testnet') || baseRpcUrl.includes('goerli')) {
                console.error('❌ BASE_RPC_URL appears to be pointing to testnet');
                return false;
            }

            console.log('✅ Mainnet RPC URLs validated');
        }

        console.log('\n✅ Network configuration validation passed');
        return true;
    }

    async validateWalletConfiguration(): Promise<boolean> {
        console.log('🔑 Wallet Configuration Validation');
        console.log('==================================\n');

        const privateKey = process.env.PRIVATE_KEY;
        const userPrivateKey = process.env.USER_PRIVATE_KEY;

        if (!privateKey) {
            console.error('❌ PRIVATE_KEY environment variable not set');
            return false;
        }

        if (!userPrivateKey) {
            console.error('❌ USER_PRIVATE_KEY environment variable not set');
            return false;
        }

        // Validate private key format (basic check)
        const isValidPrivateKey = (key: string): boolean => {
            // Remove 0x prefix if present
            const cleanKey = key.startsWith('0x') ? key.slice(2) : key;
            // Check if it's a valid hex string and correct length
            return /^[0-9a-fA-F]+$/.test(cleanKey) && cleanKey.length === 64;
        };

        if (!isValidPrivateKey(privateKey)) {
            console.error('❌ PRIVATE_KEY format is invalid');
            return false;
        }

        if (!isValidPrivateKey(userPrivateKey)) {
            console.error('❌ USER_PRIVATE_KEY format is invalid');
            return false;
        }

        console.log('✅ Private keys format validation passed');
        console.log('🔒 Private keys are present and properly formatted');

        return true;
    }

    async validateUMAConfiguration(): Promise<boolean> {
        console.log('🔗 UMA Configuration Validation');
        console.log('===============================\n');

        const liveness = process.env.UMA_LIVENESS;
        const reward = process.env.UMA_REWARD;
        const bond = process.env.UMA_BOND;
        const bondCurrency = process.env.BOND_CURRENCY;

        // Check numeric values
        if (liveness && isNaN(parseInt(liveness))) {
            console.error('❌ UMA_LIVENESS must be a valid number');
            return false;
        }

        if (reward && isNaN(parseInt(reward))) {
            console.error('❌ UMA_REWARD must be a valid number');
            return false;
        }

        if (bond && isNaN(parseInt(bond))) {
            console.error('❌ UMA_BOND must be a valid number');
            return false;
        }

        // Check bond currency format
        if (bondCurrency && !bondCurrency.startsWith('0x')) {
            console.error('❌ BOND_CURRENCY must be a valid Ethereum address (starting with 0x)');
            return false;
        }

        console.log('📋 UMA Configuration:');
        console.log(`   Liveness: ${liveness || 'default (3600)'} seconds`);
        console.log(`   Reward: ${reward || 'default (0)'}`);
        console.log(`   Bond: ${bond || 'default (0)'}`);
        console.log(`   Bond Currency: ${bondCurrency || 'default (USDC on Base)'}`);

        console.log('\n✅ UMA configuration validation passed');
        return true;
    }

    async generateEnvironmentTemplate(): Promise<void> {
        console.log('📝 Generating environment template...');

        const template = `# Network Configuration
NETWORK=mainnet

# Sui Configuration
PRIVATE_KEY=your_sui_admin_private_key_here
USER_PRIVATE_KEY=your_sui_user_private_key_here
MODULE_ADDRESS=to_be_filled_after_deployment
ADMIN_CAP_SWEEPSTAKE=to_be_filled_after_deployment
ADMIN_CAP_CONDITIONAL=to_be_filled_after_deployment
SUI_RPC_URL=https://fullnode.mainnet.sui.io:443

# Base Configuration
BASE_RPC_URL=https://mainnet.base.org

# UMA Configuration
UMA_LIVENESS=3600
UMA_REWARD=0
UMA_BOND=0
BOND_CURRENCY=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# The Graph Studio
GRAPH_STUDIO_API_KEY=your_graph_studio_api_key_here

# Contract Addresses (filled after deployment)
UMA_CONTRACT_ADDRESS=to_be_filled_after_deployment
`;

        await fs.writeFile('.env.template', template);
        console.log('✅ Environment template saved to .env.template');
    }
}

// Main function
async function checkEnvironment() {
    console.log('🎯 Environment Check Script');
    console.log('===========================\n');

    try {
        const checker = new EnvironmentChecker();

        // Run all checks
        const envCheck = await checker.checkEnvironment();
        const networkCheck = await checker.validateNetworkConfiguration();
        const walletCheck = await checker.validateWalletConfiguration();
        const umaCheck = await checker.validateUMAConfiguration();

        const allPassed = envCheck && networkCheck && walletCheck && umaCheck;

        if (allPassed) {
            console.log('\n🎉 All environment checks passed!');
            console.log('✅ Ready for mainnet deployment');
        } else {
            console.log('\n❌ Environment check failed');
            console.log('🔧 Please fix the issues above before proceeding');
            
            // Generate template if missing variables
            await checker.generateEnvironmentTemplate();
            console.log('\n📝 Use .env.template as a reference for required variables');
            
            process.exit(1);
        }

    } catch (error) {
        console.error('💥 Environment check failed:', error);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    checkEnvironment();
}

export { EnvironmentChecker, checkEnvironment };
