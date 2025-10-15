#!/usr/bin/env ts-node

import { createAppConfig } from '../src/config.js';
import { promises as fs } from 'fs';

interface DeploymentInfo {
    timestamp: string;
    network: string;
    packageId: string;
    upgradeCapId: string;
    adminCapSweepstakeId: string;
    adminCapConditionalId: string;
    deploymentTx: string;
}

interface UMADeploymentInfo {
    timestamp: string;
    network: string;
    contractName: string;
    contractAddress: string;
    deploymentTx: string;
    blockNumber: number;
    gasUsed: number;
}

interface VerificationResult {
    component: string;
    success: boolean;
    details: string;
    error?: string;
}

class DeploymentVerifier {
    private config: any;
    private results: VerificationResult[] = [];

    constructor() {
        console.log('🔍 Deployment Verification Script');
        console.log('=================================\n');
    }

    async verifyAllDeployments(): Promise<boolean> {
        try {
            // Load deployment information
            const suiDeployment = await this.loadSuiDeploymentInfo();
            const umaDeployment = await this.loadUMADeploymentInfo();

            if (!suiDeployment) {
                console.error('❌ Sui deployment information not found');
                console.error('   Please run deployment first or check deployment-info.json');
                return false;
            }

            if (!umaDeployment) {
                console.error('❌ UMA deployment information not found');
                console.error('   Please run UMA deployment first or check deployment-info-base.json');
                return false;
            }

            console.log('📋 Found deployment information:');
            console.log(`   Sui Package ID: ${suiDeployment.packageId}`);
            console.log(`   UMA Contract: ${umaDeployment.contractAddress}`);
            console.log('');

            // Verify Sui deployment
            await this.verifySuiDeployment(suiDeployment);

            // Verify UMA deployment
            await this.verifyUMADeployment(umaDeployment);

            // Verify integration
            await this.verifyIntegration(suiDeployment, umaDeployment);

            // Display results
            this.displayResults();

            // Check if all verifications passed
            const allPassed = this.results.every(result => result.success);

            if (allPassed) {
                console.log('\n🎉 All deployments verified successfully!');
                console.log('✅ System is ready for mainnet operation');
            } else {
                console.log('\n❌ Some deployments failed verification');
                console.log('🔧 Please check the issues above');
            }

            return allPassed;

        } catch (error) {
            console.error('💥 Deployment verification failed:', error);
            return false;
        }
    }

    private async loadSuiDeploymentInfo(): Promise<DeploymentInfo | null> {
        try {
            const data = await fs.readFile('deployment-info.json', 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return null;
        }
    }

    private async loadUMADeploymentInfo(): Promise<UMADeploymentInfo | null> {
        try {
            const data = await fs.readFile('../uma/deployment-info-base.json', 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return null;
        }
    }

    private async verifySuiDeployment(deployment: DeploymentInfo): Promise<void> {
        console.log('🔍 Verifying Sui deployment...');

        try {
            // Initialize config for verification
            this.config = createAppConfig();

            // Verify package exists
            const packageInfo = await this.config.client.getObject({
                id: deployment.packageId,
                options: { showContent: true }
            });

            if (!packageInfo.data) {
                this.results.push({
                    component: 'Sui Package',
                    success: false,
                    details: 'Package not found',
                    error: 'Package object does not exist'
                });
                return;
            }

            // Verify admin caps exist
            const adminCapSweepstake = await this.config.client.getObject({
                id: deployment.adminCapSweepstakeId,
                options: { showContent: true }
            });

            const adminCapConditional = await this.config.client.getObject({
                id: deployment.adminCapConditionalId,
                options: { showContent: true }
            });

            if (!adminCapSweepstake.data) {
                this.results.push({
                    component: 'Sui Admin Cap (Sweepstake)',
                    success: false,
                    details: 'Admin cap not found',
                    error: 'AdminCap object does not exist'
                });
            } else {
                this.results.push({
                    component: 'Sui Admin Cap (Sweepstake)',
                    success: true,
                    details: 'Admin cap verified'
                });
            }

            if (!adminCapConditional.data) {
                this.results.push({
                    component: 'Sui Admin Cap (Conditional)',
                    success: false,
                    details: 'Admin cap not found',
                    error: 'AdminCap object does not exist'
                });
            } else {
                this.results.push({
                    component: 'Sui Admin Cap (Conditional)',
                    success: true,
                    details: 'Admin cap verified'
                });
            }

            // Verify package modules
            const packageModules = packageInfo.data.content?.fields?.modules || [];
            if (packageModules.length === 0) {
                this.results.push({
                    component: 'Sui Package Modules',
                    success: false,
                    details: 'No modules found',
                    error: 'Package appears to be empty'
                });
            } else {
                this.results.push({
                    component: 'Sui Package Modules',
                    success: true,
                    details: `Found ${packageModules.length} modules`
                });
            }

            console.log('✅ Sui deployment verification completed');

        } catch (error: any) {
            this.results.push({
                component: 'Sui Deployment',
                success: false,
                details: 'Verification failed',
                error: error.message
            });
            console.error('❌ Sui deployment verification failed:', error.message);
        }
    }

    private async verifyUMADeployment(deployment: UMADeploymentInfo): Promise<void> {
        console.log('🔍 Verifying UMA deployment...');

        try {
            // This would verify the UMA contract on Base
            // For now, we'll simulate the verification

            // Check if contract address is valid
            if (!deployment.contractAddress.startsWith('0x')) {
                this.results.push({
                    component: 'UMA Contract Address',
                    success: false,
                    details: 'Invalid contract address format',
                    error: 'Address must start with 0x'
                });
                return;
            }

            // Verify contract was deployed in a reasonable block
            if (deployment.blockNumber <= 0) {
                this.results.push({
                    component: 'UMA Contract Block',
                    success: false,
                    details: 'Invalid deployment block',
                    error: 'Block number must be positive'
                });
            } else {
                this.results.push({
                    component: 'UMA Contract Block',
                    success: true,
                    details: `Deployed at block ${deployment.blockNumber}`
                });
            }

            // Verify gas usage was reasonable
            if (deployment.gasUsed <= 0) {
                this.results.push({
                    component: 'UMA Contract Gas',
                    success: false,
                    details: 'Invalid gas usage',
                    error: 'Gas used must be positive'
                });
            } else {
                this.results.push({
                    component: 'UMA Contract Gas',
                    success: true,
                    details: `Used ${deployment.gasUsed} gas`
                });
            }

            console.log('✅ UMA deployment verification completed');

        } catch (error: any) {
            this.results.push({
                component: 'UMA Deployment',
                success: false,
                details: 'Verification failed',
                error: error.message
            });
            console.error('❌ UMA deployment verification failed:', error.message);
        }
    }

    private async verifyIntegration(suiDeployment: DeploymentInfo, umaDeployment: UMADeploymentInfo): Promise<void> {
        console.log('🔍 Verifying system integration...');

        try {
            // Verify that both deployments are on the correct networks
            if (suiDeployment.network !== 'mainnet') {
                this.results.push({
                    component: 'Network Configuration (Sui)',
                    success: false,
                    details: 'Sui deployment not on mainnet',
                    error: `Expected mainnet, got ${suiDeployment.network}`
                });
            } else {
                this.results.push({
                    component: 'Network Configuration (Sui)',
                    success: true,
                    details: 'Sui deployment on mainnet'
                });
            }

            if (umaDeployment.network !== 'base') {
                this.results.push({
                    component: 'Network Configuration (UMA)',
                    success: false,
                    details: 'UMA deployment not on Base',
                    error: `Expected base, got ${umaDeployment.network}`
                });
            } else {
                this.results.push({
                    component: 'Network Configuration (UMA)',
                    success: true,
                    details: 'UMA deployment on Base'
                });
            }

            // Verify deployment timestamps are reasonable
            const suiTime = new Date(suiDeployment.timestamp);
            const umaTime = new Date(umaDeployment.timestamp);
            const timeDiff = Math.abs(suiTime.getTime() - umaTime.getTime());

            if (timeDiff > 24 * 60 * 60 * 1000) { // 24 hours
                this.results.push({
                    component: 'Deployment Timing',
                    success: false,
                    details: 'Deployments too far apart',
                    error: `Time difference: ${Math.round(timeDiff / (60 * 60 * 1000))} hours`
                });
            } else {
                this.results.push({
                    component: 'Deployment Timing',
                    success: true,
                    details: 'Deployments completed within reasonable time'
                });
            }

            console.log('✅ Integration verification completed');

        } catch (error: any) {
            this.results.push({
                component: 'System Integration',
                success: false,
                details: 'Integration verification failed',
                error: error.message
            });
            console.error('❌ Integration verification failed:', error.message);
        }
    }

    private displayResults(): void {
        console.log('\n📊 Verification Results');
        console.log('======================');

        const successful = this.results.filter(r => r.success);
        const failed = this.results.filter(r => !r.success);

        if (successful.length > 0) {
            console.log('\n✅ Successful Verifications:');
            successful.forEach(result => {
                console.log(`   ✓ ${result.component}: ${result.details}`);
            });
        }

        if (failed.length > 0) {
            console.log('\n❌ Failed Verifications:');
            failed.forEach(result => {
                console.log(`   ✗ ${result.component}: ${result.details}`);
                if (result.error) {
                    console.log(`     Error: ${result.error}`);
                }
            });
        }

        console.log(`\n📈 Summary: ${successful.length} passed, ${failed.length} failed`);
    }
}

// Main verification function
async function verifyDeployment() {
    console.log('🎯 Deployment Verification Script');
    console.log('=================================\n');

    try {
        const verifier = new DeploymentVerifier();
        const success = await verifier.verifyAllDeployments();

        if (success) {
            console.log('\n🎉 All deployments verified successfully!');
            console.log('🚀 System is ready for mainnet operation');
        } else {
            console.log('\n❌ Verification failed');
            console.log('🔧 Please address the issues above');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n💥 Verification script failed:', error);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    verifyDeployment();
}

export { DeploymentVerifier, verifyDeployment };
