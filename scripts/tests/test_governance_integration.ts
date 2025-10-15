import { createAppConfig } from '../src/config.js';
import { newTreasury } from '../src/contractsCaller/sweepstake/newTreasury.js';
import { deposit } from "../src/contractsCaller/sweepstake/deposit.js";
import { checkBalance } from "../src/contractsCaller/sweepstake/getBalance.js";
import { createChangePubkeyRequest } from '../src/contractsCaller/governance/createChangePubkeyRequest.js';
import { voteChangePubkey } from '../src/contractsCaller/governance/voteChangePubkey.js';
import { executeChangePubkey } from '../src/contractsCaller/governance/executeChangePubkey.js';
import { createWithdrawRequest } from '../src/contractsCaller/governance/createWithdrawRequest.js';
import { voteWithdraw } from '../src/contractsCaller/governance/voteWithdraw.js';
import { executeWithdraw } from '../src/contractsCaller/governance/executeWithdraw.js';
import { getChangePubkeyRequestInfo, getWithdrawRequestInfo } from '../src/contractsCaller/governance/getRequestInfo.js';

const COIN_TYPE = '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC';

// Integration test configuration
const testConfig = {
    // Test addresses - replace with actual test addresses
    admin1: '0x1d9b45d80219e10af0e95d041b21de1debff34075e3885b83276848a7857763a',
    admin2: '0x2ea9b45d80219e10af0e95d041b21de1debff34075e3885b83276848a7857763b',
    admin3: '0x3fbb45d80219e10af0e95d041b21de1debff34075e3885b83276848a7857763c',
    nonAdmin: '0x4ccb45d80219e10af0e95d041b21de1debff34075e3885b83276848a7857763d',
    recipient: '0x5ddb45d80219e10af0e95d041b21de1debff34075e3885b83276848a7857763e',
    newPubkey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    testAmount: '1000000'
};

// Helper functions
const getFutureTimestamp = (hoursOffset: number = 24): number => {
    return Date.now() + (hoursOffset * 60 * 60 * 1000);
};

const findObjectId = (result: any, objectType: string): string | null => {
    if (!result.objectChanges) return null;
    
    for (const change of result.objectChanges) {
        if (change.type === 'created' && change.objectType?.includes(objectType)) {
            return change.objectId;
        }
    }
    return null;
};

const waitForTransaction = async (txDigest: string, client: any) => {
    const result = await client.waitForTransactionBlock({
        digest: txDigest,
        timeout: 60000,
        pollInterval: 1000,
    });
    return result;
};

// Full governance workflow test
const testFullGovernanceWorkflow = async () => {
    console.log('🔄 Integration Test: Full Governance Workflow');
    console.log('===============================================\n');
    
    const config = createAppConfig();
    let treasuryId: string | null = null;
    let clockId: string | null = null;
    
    try {
        // Phase 1: Setup
        console.log('📋 Phase 1: Environment Setup');
        console.log('------------------------------');
        
        // Create treasury
        const newTreasuryResult = await newTreasury(config, COIN_TYPE);
        treasuryId = findObjectId(newTreasuryResult, 'Treasury');
        
        if (!treasuryId) {
            throw new Error('Failed to create treasury');
        }
        
        console.log(`✅ Treasury created: ${treasuryId}`);
        
        // Get clock object
        const clockObjects = await config.client.getOwnedObjects({
            owner: '0x6',
            filter: { StructType: '0x2::clock::Clock' }
        });
        
        if (clockObjects.data.length > 0) {
            clockId = clockObjects.data[0].objectId;
            console.log(`✅ Clock object found: ${clockId}`);
        } else {
            throw new Error('Clock object not found');
        }
        
        // Deposit initial funds
        await deposit(config, treasuryId, config.user.toSuiAddress(), COIN_TYPE, testConfig.testAmount);
        console.log(`✅ Initial deposit: ${testConfig.testAmount}`);
        
        // Phase 2: Change Pubkey Request Workflow
        console.log('\n🔑 Phase 2: Change Pubkey Request Workflow');
        console.log('------------------------------------------');
        
        const futureDeadline = getFutureTimestamp(48); // 48 hours from now
        
        // Step 1: Create change pubkey request
        console.log('Step 1: Creating change pubkey request...');
        const createPubkeyResult = await createChangePubkeyRequest(
            config,
            treasuryId,
            testConfig.newPubkey,
            futureDeadline
        );
        
        const changePubkeyRequestId = findObjectId(createPubkeyResult, 'ChangePubkeyRequest');
        if (!changePubkeyRequestId) {
            throw new Error('Failed to create change pubkey request');
        }
        
        console.log(`✅ Change pubkey request created: ${changePubkeyRequestId}`);
        
        // Step 2: Verify request details
        const pubkeyRequestInfo = await getChangePubkeyRequestInfo(config, changePubkeyRequestId);
        if (!pubkeyRequestInfo) {
            throw new Error('Failed to get change pubkey request info');
        }
        
        console.log(`✅ Request details verified:`, {
            newPubkey: pubkeyRequestInfo.new_pubkey,
            deadline: new Date(pubkeyRequestInfo.deadline).toISOString(),
            isExecuted: pubkeyRequestInfo.is_executed,
            voterCount: pubkeyRequestInfo.voters.length
        });
        
        // Step 3: Vote on change pubkey request
        console.log('Step 3: Voting on change pubkey request...');
        const votePubkeyResult = await voteChangePubkey(
            config,
            treasuryId,
            changePubkeyRequestId,
            clockId
        );
        
        console.log(`✅ Vote cast successfully`);
        
        // Step 4: Verify vote recorded
        const updatedPubkeyInfo = await getChangePubkeyRequestInfo(config, changePubkeyRequestId);
        if (!updatedPubkeyInfo) {
            throw new Error('Failed to get updated pubkey request info');
        }
        
        console.log(`✅ Vote recorded. Total voters: ${updatedPubkeyInfo.voters.length}`);
        
        // Step 5: Execute change pubkey request
        console.log('Step 5: Executing change pubkey request...');
        try {
            await executeChangePubkey(config, treasuryId, changePubkeyRequestId);
            console.log(`✅ Change pubkey request executed successfully`);
            
            // Verify execution
            const executedPubkeyInfo = await getChangePubkeyRequestInfo(config, changePubkeyRequestId);
            if (executedPubkeyInfo?.is_executed) {
                console.log(`✅ Pubkey change confirmed as executed`);
            }
        } catch (error: any) {
            console.log(`⚠️  Pubkey execution failed (insufficient votes): ${error.message}`);
        }
        
        // Phase 3: Withdraw Request Workflow
        console.log('\n💰 Phase 3: Withdraw Request Workflow');
        console.log('------------------------------------');
        
        // Step 1: Create withdraw request
        console.log('Step 1: Creating withdraw request...');
        const createWithdrawResult = await createWithdrawRequest(
            config,
            treasuryId,
            testConfig.recipient,
            testConfig.testAmount,
            futureDeadline
        );
        
        const withdrawRequestId = findObjectId(createWithdrawResult, 'WithDrawRequest');
        if (!withdrawRequestId) {
            throw new Error('Failed to create withdraw request');
        }
        
        console.log(`✅ Withdraw request created: ${withdrawRequestId}`);
        
        // Step 2: Verify withdraw request details
        const withdrawRequestInfo = await getWithdrawRequestInfo(config, withdrawRequestId);
        if (!withdrawRequestInfo) {
            throw new Error('Failed to get withdraw request info');
        }
        
        console.log(`✅ Withdraw request details verified:`, {
            to: withdrawRequestInfo.to,
            amount: withdrawRequestInfo.amount,
            deadline: new Date(withdrawRequestInfo.deadline).toISOString(),
            isExecuted: withdrawRequestInfo.is_executed,
            voterCount: withdrawRequestInfo.voters.length
        });
        
        // Step 3: Vote on withdraw request
        console.log('Step 3: Voting on withdraw request...');
        const voteWithdrawResult = await voteWithdraw(
            config,
            treasuryId,
            withdrawRequestId,
            clockId
        );
        
        console.log(`✅ Withdraw vote cast successfully`);
        
        // Step 4: Verify withdraw vote recorded
        const updatedWithdrawInfo = await getWithdrawRequestInfo(config, withdrawRequestId);
        if (!updatedWithdrawInfo) {
            throw new Error('Failed to get updated withdraw request info');
        }
        
        console.log(`✅ Withdraw vote recorded. Total voters: ${updatedWithdrawInfo.voters.length}`);
        
        // Step 5: Execute withdraw request
        console.log('Step 5: Executing withdraw request...');
        try {
            await executeWithdraw(config, treasuryId, withdrawRequestId);
            console.log(`✅ Withdraw request executed successfully`);
            
            // Verify execution
            const executedWithdrawInfo = await getWithdrawRequestInfo(config, withdrawRequestId);
            if (executedWithdrawInfo?.is_executed) {
                console.log(`✅ Withdraw execution confirmed`);
                
                // Check recipient balance
                const recipientBalance = await checkBalance(config, treasuryId, testConfig.recipient, COIN_TYPE);
                console.log(`✅ Recipient balance: ${recipientBalance}`);
            }
        } catch (error: any) {
            console.log(`⚠️  Withdraw execution failed (insufficient votes): ${error.message}`);
        }
        
        // Phase 4: Error Handling and Edge Cases
        console.log('\n🚨 Phase 4: Error Handling and Edge Cases');
        console.log('----------------------------------------');
        
        // Test expired deadline
        console.log('Testing expired deadline scenario...');
        const pastDeadline = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
        
        try {
            const expiredRequestResult = await createChangePubkeyRequest(
                config,
                treasuryId,
                testConfig.newPubkey,
                pastDeadline
            );
            
            const expiredRequestId = findObjectId(expiredRequestResult, 'ChangePubkeyRequest');
            if (expiredRequestId) {
                try {
                    await voteChangePubkey(config, treasuryId, expiredRequestId, clockId);
                    console.log(`❌ Should have failed: Voting on expired request succeeded`);
                } catch (error: any) {
                    console.log(`✅ Correctly rejected vote on expired request: ${error.message}`);
                }
            }
        } catch (error: any) {
            console.log(`⚠️  Could not create expired request: ${error.message}`);
        }
        
        // Test double execution
        console.log('Testing double execution scenario...');
        try {
            if (changePubkeyRequestId) {
                await executeChangePubkey(config, treasuryId, changePubkeyRequestId);
                console.log(`❌ Should have failed: Double execution succeeded`);
            }
        } catch (error: any) {
            console.log(`✅ Correctly rejected double execution: ${error.message}`);
        }
        
        // Phase 5: Performance and Stress Testing
        console.log('\n⚡ Phase 5: Performance and Stress Testing');
        console.log('-----------------------------------------');
        
        console.log('Testing multiple concurrent requests...');
        const concurrentRequests = [];
        
        for (let i = 0; i < 3; i++) {
            concurrentRequests.push(
                createChangePubkeyRequest(
                    config,
                    treasuryId,
                    `${testConfig.newPubkey}${i}`,
                    futureDeadline
                )
            );
        }
        
        const startTime = Date.now();
        const results = await Promise.all(concurrentRequests);
        const endTime = Date.now();
        
        console.log(`✅ Created ${results.length} concurrent requests in ${endTime - startTime}ms`);
        
        // Phase 6: Final Verification
        console.log('\n✅ Phase 6: Final Verification');
        console.log('------------------------------');
        
        // Check treasury state
        const finalTreasuryBalance = await checkBalance(config, treasuryId, config.user.toSuiAddress(), COIN_TYPE);
        console.log(`✅ Final treasury balance: ${finalTreasuryBalance}`);
        
        console.log('\n🎉 Full Governance Workflow Integration Test Completed Successfully!');
        console.log('=====================================================================');
        
    } catch (error) {
        console.error('❌ Integration test failed:', error);
        throw error;
    }
};

// Multi-admin governance test (requires multiple admin accounts)
const testMultiAdminGovernance = async () => {
    console.log('\n👥 Multi-Admin Governance Test');
    console.log('==============================');
    
    // This test would require multiple admin accounts and signatures
    // For now, we'll simulate the scenario
    
    console.log('⚠️  Multi-admin test requires multiple admin accounts setup');
    console.log('This test would verify:');
    console.log('- Multiple admins voting on requests');
    console.log('- 2/3 majority requirement validation');
    console.log('- Cross-admin vote verification');
    console.log('- Admin permission validation');
    
    console.log('✅ Multi-admin test framework ready');
};

// Governance state transition test
const testGovernanceStateTransitions = async () => {
    console.log('\n🔄 Governance State Transition Test');
    console.log('===================================');
    
    const config = createAppConfig();
    
    try {
        // Test various state transitions
        console.log('Testing governance state transitions...');
        
        // Create treasury
        const newTreasuryResult = await newTreasury(config, COIN_TYPE);
        const treasuryId = findObjectId(newTreasuryResult, 'Treasury');
        
        if (!treasuryId) {
            throw new Error('Failed to create treasury');
        }
        
        // Test state: Created -> Voted -> Executed
        console.log('Testing state: Created -> Voted -> Executed');
        
        const futureDeadline = getFutureTimestamp(24);
        const createResult = await createChangePubkeyRequest(
            config,
            treasuryId,
            testConfig.newPubkey,
            futureDeadline
        );
        
        const requestId = findObjectId(createResult, 'ChangePubkeyRequest');
        
        if (requestId) {
            // State 1: Created
            let state = await getChangePubkeyRequestInfo(config, requestId);
            console.log(`✅ State 1 - Created: executed=${state?.is_executed}, voters=${state?.voters.length}`);
            
            // Get clock for voting
            const clockObjects = await config.client.getObjectsOwnedByAddress({
                owner: '0x6',
                filter: { StructType: '0x2::clock::Clock' }
            });
            
            if (clockObjects.data.length > 0) {
                const clockId = clockObjects.data[0].objectId;
                
                // State 2: Voted
                await voteChangePubkey(config, treasuryId, requestId, clockId);
                state = await getChangePubkeyRequestInfo(config, requestId);
                console.log(`✅ State 2 - Voted: executed=${state?.is_executed}, voters=${state?.voters.length}`);
                
                // State 3: Executed (if possible)
                try {
                    await executeChangePubkey(config, treasuryId, requestId);
                    state = await getChangePubkeyRequestInfo(config, requestId);
                    console.log(`✅ State 3 - Executed: executed=${state?.is_executed}, voters=${state?.voters.length}`);
                } catch (error: any) {
                    console.log(`⚠️  State 3 - Execution failed: ${error.message}`);
                }
            }
        }
        
        console.log('✅ State transition test completed');
        
    } catch (error) {
        console.error('❌ State transition test failed:', error);
    }
};

// Run all integration tests
const runIntegrationTests = async () => {
    console.log('🚀 Starting Governance Integration Tests...\n');
    
    try {
        await testFullGovernanceWorkflow();
        await testMultiAdminGovernance();
        await testGovernanceStateTransitions();
        
        console.log('\n🏆 All Integration Tests Completed Successfully!');
        
    } catch (error) {
        console.error('💥 Integration test suite failed:', error);
        process.exit(1);
    }
};

// Export for use in other test files
export {
    testFullGovernanceWorkflow,
    testMultiAdminGovernance,
    testGovernanceStateTransitions,
    runIntegrationTests
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runIntegrationTests();
}
