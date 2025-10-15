#!/usr/bin/env ts-node

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

interface DeploymentStep {
    name: string;
    description: string;
    command: string;
    cwd: string;
    env?: Record<string, string>;
    critical: boolean;
}

interface DeploymentResult {
    step: string;
    success: boolean;
    output?: string;
    error?: string;
    duration: number;
}

class FullMainnetDeployer {
    private results: DeploymentResult[] = [];
    private startTime: Date = new Date();

    constructor() {
        console.log('🚀 Full Mainnet Deployment Orchestrator');
        console.log('=======================================\n');
    }

    async deployAll(): Promise<void> {
        const steps: DeploymentStep[] = [
            {
                name: 'pre-deployment-checks',
                description: 'Running pre-deployment checks',
                command: 'npm run check:env',
                cwd: './scripts',
                critical: true
            },
            {
                name: 'sui-contract-deployment',
                description: 'Deploying Sui smart contracts',
                command: 'npm run deploy:sui',
                cwd: './scripts',
                critical: true
            },
            {
                name: 'uma-contract-deployment',
                description: 'Deploying UMA contracts to Base',
                command: 'npm run deploy:uma',
                cwd: './uma',
                critical: true
            },
            {
                name: 'uma-parameter-configuration',
                description: 'Configuring UMA parameters',
                command: 'npm run configure:uma',
                cwd: './uma',
                critical: true
            },
            {
                name: 'subgraph-deployment',
                description: 'Deploying subgraph to The Graph Studio',
                command: 'npm run deploy:subgraph',
                cwd: './uma/subgraph',
                critical: false
            },
            {
                name: 'post-deployment-tests',
                description: 'Running post-deployment tests',
                command: 'npm run test:mainnet',
                cwd: './scripts',
                critical: false
            },
            {
                name: 'deployment-verification',
                description: 'Verifying all deployments',
                command: 'npm run verify:all',
                cwd: './scripts',
                critical: true
            }
        ];

        console.log('📋 Deployment Steps:');
        steps.forEach((step, index) => {
            const critical = step.critical ? '🔴' : '🟡';
            console.log(`${index + 1}. ${critical} ${step.description}`);
        });
        console.log('');

        for (const step of steps) {
            const result = await this.executeStep(step);
            this.results.push(result);

            if (!result.success && step.critical) {
                console.error(`\n💥 Critical step failed: ${step.description}`);
                console.error('❌ Deployment aborted due to critical failure');
                await this.generateFailureReport();
                process.exit(1);
            } else if (!result.success) {
                console.warn(`\n⚠️  Non-critical step failed: ${step.description}`);
                console.warn('🔄 Continuing with deployment...');
            }
        }

        await this.generateSuccessReport();
    }

    private async executeStep(step: DeploymentStep): Promise<DeploymentResult> {
        const stepStartTime = Date.now();
        console.log(`\n🔄 Executing: ${step.description}`);
        console.log(`Command: ${step.command}`);
        console.log(`Directory: ${step.cwd}`);

        try {
            const output = await this.runCommand(step);
            const duration = Date.now() - stepStartTime;

            console.log(`✅ Step completed successfully in ${duration}ms`);
            return {
                step: step.name,
                success: true,
                output,
                duration
            };

        } catch (error: any) {
            const duration = Date.now() - stepStartTime;
            console.error(`❌ Step failed after ${duration}ms: ${error.message}`);

            return {
                step: step.name,
                success: false,
                error: error.message,
                duration
            };
        }
    }

    private async runCommand(step: DeploymentStep): Promise<string> {
        return new Promise((resolve, reject) => {
            const [command, ...args] = step.command.split(' ');
            const child = spawn(command, args, {
                cwd: step.cwd,
                env: { ...process.env, ...step.env },
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let output = '';
            let error = '';

            child.stdout?.on('data', (data) => {
                const text = data.toString();
                output += text;
                process.stdout.write(text);
            });

            child.stderr?.on('data', (data) => {
                const text = data.toString();
                error += text;
                process.stderr.write(text);
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(`Command failed with exit code ${code}: ${error}`));
                }
            });

            child.on('error', (err) => {
                reject(new Error(`Failed to start command: ${err.message}`));
            });
        });
    }

    private async generateSuccessReport(): Promise<void> {
        const endTime = new Date();
        const totalDuration = endTime.getTime() - this.startTime.getTime();

        console.log('\n🎉 MAINNET DEPLOYMENT COMPLETED SUCCESSFULLY!');
        console.log('=============================================');

        console.log(`\n📊 Deployment Summary:`);
        console.log(`Total Duration: ${this.formatDuration(totalDuration)}`);
        console.log(`Steps Executed: ${this.results.length}`);
        console.log(`Successful: ${this.results.filter(r => r.success).length}`);
        console.log(`Failed: ${this.results.filter(r => !r.success).length}`);

        console.log('\n📋 Step Results:');
        this.results.forEach((result, index) => {
            const status = result.success ? '✅' : '❌';
            const duration = this.formatDuration(result.duration);
            console.log(`${index + 1}. ${status} ${result.step} (${duration})`);
        });

        // Generate deployment report
        const report = {
            timestamp: endTime.toISOString(),
            duration: totalDuration,
            success: true,
            steps: this.results,
            summary: {
                total: this.results.length,
                successful: this.results.filter(r => r.success).length,
                failed: this.results.filter(r => !r.success).length
            }
        };

        await fs.writeFile(
            'deployment-report.json',
            JSON.stringify(report, null, 2)
        );

        console.log('\n💾 Deployment report saved to deployment-report.json');

        console.log('\n📋 Next Steps:');
        console.log('1. Update frontend configuration with deployed addresses');
        console.log('2. Notify users and stakeholders of mainnet launch');
        console.log('3. Set up monitoring and alerting');
        console.log('4. Conduct final end-to-end testing');
        console.log('5. Document deployment addresses and configuration');
    }

    private async generateFailureReport(): Promise<void> {
        const endTime = new Date();
        const totalDuration = endTime.getTime() - this.startTime.getTime();

        console.log('\n💥 MAINNET DEPLOYMENT FAILED!');
        console.log('=============================');

        console.log(`\n📊 Failure Summary:`);
        console.log(`Total Duration: ${this.formatDuration(totalDuration)}`);
        console.log(`Steps Executed: ${this.results.length}`);
        console.log(`Successful: ${this.results.filter(r => r.success).length}`);
        console.log(`Failed: ${this.results.filter(r => !r.success).length}`);

        console.log('\n📋 Step Results:');
        this.results.forEach((result, index) => {
            const status = result.success ? '✅' : '❌';
            const duration = this.formatDuration(result.duration);
            console.log(`${index + 1}. ${status} ${result.step} (${duration})`);
            if (!result.success && result.error) {
                console.log(`   Error: ${result.error}`);
            }
        });

        // Generate failure report
        const report = {
            timestamp: endTime.toISOString(),
            duration: totalDuration,
            success: false,
            steps: this.results,
            summary: {
                total: this.results.length,
                successful: this.results.filter(r => r.success).length,
                failed: this.results.filter(r => !r.success).length
            }
        };

        await fs.writeFile(
            'deployment-failure-report.json',
            JSON.stringify(report, null, 2)
        );

        console.log('\n💾 Failure report saved to deployment-failure-report.json');

        console.log('\n🔧 Troubleshooting Steps:');
        console.log('1. Check the failure report for detailed error information');
        console.log('2. Verify environment variables and configuration');
        console.log('3. Check network connectivity and RPC endpoints');
        console.log('4. Ensure sufficient gas tokens are available');
        console.log('5. Review deployment logs for specific error details');
    }

    private formatDuration(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
}

// Environment validation
async function validateEnvironment(): Promise<boolean> {
    console.log('🔍 Validating deployment environment...');

    const requiredEnvVars = [
        'PRIVATE_KEY',
        'USER_PRIVATE_KEY',
        'NETWORK',
        'BASE_RPC_URL',
        'GRAPH_STUDIO_API_KEY'
    ];

    const missing = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(varName => console.error(`   - ${varName}`));
        return false;
    }

    console.log('✅ Environment validation passed');
    return true;
}

// Main deployment function
async function deployFullMainnet() {
    console.log('🎯 Full Mainnet Deployment Script');
    console.log('=================================\n');

    // Validate environment
    const envValid = await validateEnvironment();
    if (!envValid) {
        console.error('❌ Environment validation failed');
        process.exit(1);
    }

    try {
        const deployer = new FullMainnetDeployer();
        await deployer.deployAll();

    } catch (error) {
        console.error('\n💥 Full deployment failed:', error);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    deployFullMainnet();
}

export { FullMainnetDeployer, deployFullMainnet };
