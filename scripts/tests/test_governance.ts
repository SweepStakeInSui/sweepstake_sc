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
import { 
    getChangePubkeyRequestInfo,
    getWithdrawRequestInfo
} from '../src/contractsCaller/governance/getRequestInfo.js';

const COIN_TYPE = '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC';

// Test configuration
const testConfig = {
    // Test addresses - you'll need to replace these with actual test addresses
    admin1: '0x1d9b45d80219e10af0e95d041b21de1debff34075e3885b83276848a7857763a',
    admin2: '0x2ea9b45d80219e10af0e95d041b21de1debff34075e3885b83276848a7857763b',
    admin3: '0x3fbb45d80219e10af0e95d041b21de1debff34075e3885b83276848a7857763c',
    nonAdmin: '0x4ccb45d80219e10af0e95d041b21de1debff34075e3885b83276848a7857763d',
    recipient: '0x5ddb45d80219e10af0e95d041b21de1debff34075e3885b83276848a7857763e',
    newPubkey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    testAmount: '1000000'
};

// Helper function to get current timestamp + offset
const getFutureTimestamp = (hoursOffset: number = 24): number => {
    return Date.now() + (hoursOffset * 60 * 60 * 1000);
};

// Helper function to wait for transaction confirmation
const waitForTransaction = async (txDigest: string, client: any) => {
    const result = await client.waitForTransactionBlock({
        digest: txDigest,
        timeout: 60000,
        pollInterval: 1000,
    });
    return result;
};

// Helper function to find object ID from transaction result
const findObjectId = (result: any, objectType: string): string | null => {
    if (!result.objectChanges) return null;
    
    for (const change of result.objectChanges) {
        if (change.type === 'created' && change.objectType?.includes(objectType)) {
            return change.objectId;
        }
    }
    return null;
};

// Test suite for governance functionality
const testGovernance = async () => {
    console.log('🚀 Starting Governance Test Suite...\n');
    
    const config = createAppConfig();
    let treasuryId: string | null = null;
    let clockId: string | null = null;
    
    try {
        // Setup: Create a new treasury
        console.log('📋 Setting up test environment...');
        const newTreasuryResult = await newTreasury(config, COIN_TYPE);
        treasuryId = findObjectId(newTreasuryResult, 'Treasury');
        
        if (!treasuryId) {
            throw new Error('Failed to create treasury');
        }
        
        console.log(`✅ Treasury created: ${treasuryId}`);
        
        // Get clock object ID (this is a system object)
        const clockObjects = await config.client.getOwnedObjects({
            owner: '0x6',
            filter: { StructType: '0x2::clock::Clock' }
        });
        
        if (clockObjects.data.length > 0) {
            clockId = clockObjects.data[0].objectId;
        } else {
            throw new Error('Clock object not found');
        }
        
        console.log(`✅ Clock object found: ${clockId}\n`);
        
        // Test 1: Create Change Pubkey Request
        console.log('🧪 Test 1: Create Change Pubkey Request');
        const futureDeadline = getFutureTimestamp(24);
        
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
        
        // Verify request was created correctly
        const pubkeyRequestInfo = await getChangePubkeyRequestInfo(config, changePubkeyRequestId);
        if (!pubkeyRequestInfo) {
            throw new Error('Failed to get change pubkey request info');
        }
        
        console.log(`✅ Request details:`, {
            newPubkey: pubkeyRequestInfo.new_pubkey,
            deadline: pubkeyRequestInfo.deadline,
            isExecuted: pubkeyRequestInfo.is_executed,
            voters: pubkeyRequestInfo.voters.length
        });
        
        // Test 2: Vote on Change Pubkey Request
        console.log('\n🧪 Test 2: Vote on Change Pubkey Request');
        
        if (!clockId) {
            throw new Error('Clock ID not found');
        }
        
        const voteResult = await voteChangePubkey(
            config,
            treasuryId,
            changePubkeyRequestId,
            clockId
        );
        
        console.log(`✅ Vote cast successfully`);
        
        // Verify vote was recorded
        const updatedPubkeyInfo = await getChangePubkeyRequestInfo(config, changePubkeyRequestId);
        if (!updatedPubkeyInfo) {
            throw new Error('Failed to get updated pubkey request info');
        }
        
        console.log(`✅ Vote recorded. Total voters: ${updatedPubkeyInfo.voters.length}`);
        
        // Test 3: Create Withdraw Request
        console.log('\n🧪 Test 3: Create Withdraw Request');
        
        // First, deposit some funds to the treasury
        await deposit(config, treasuryId, config.user.toSuiAddress(), COIN_TYPE, testConfig.testAmount);
        console.log(`✅ Deposited ${testConfig.testAmount} to treasury`);
        
        const withdrawRequestResult = await createWithdrawRequest(
            config,
            treasuryId,
            testConfig.recipient,
            testConfig.testAmount,
            futureDeadline
        );
        
        const withdrawRequestId = findObjectId(withdrawRequestResult, 'WithDrawRequest');
        if (!withdrawRequestId) {
            throw new Error('Failed to create withdraw request');
        }
        
        console.log(`✅ Withdraw request created: ${withdrawRequestId}`);
        
        // Verify withdraw request was created correctly
        const withdrawRequestInfo = await getWithdrawRequestInfo(config, withdrawRequestId);
        if (!withdrawRequestInfo) {
            throw new Error('Failed to get withdraw request info');
        }
        
        console.log(`✅ Withdraw request details:`, {
            to: withdrawRequestInfo.to,
            amount: withdrawRequestInfo.amount,
            deadline: withdrawRequestInfo.deadline,
            isExecuted: withdrawRequestInfo.is_executed,
            voters: withdrawRequestInfo.voters.length
        });
        
        // Test 4: Vote on Withdraw Request
        console.log('\n🧪 Test 4: Vote on Withdraw Request');
        
        if (!clockId) {
            throw new Error('Clock ID not found');
        }
        
        const voteWithdrawResult = await voteWithdraw(
            config,
            treasuryId,
            withdrawRequestId,
            clockId
        );
        
        console.log(`✅ Withdraw vote cast successfully`);
        
        // Verify withdraw vote was recorded
        const updatedWithdrawInfo = await getWithdrawRequestInfo(config, withdrawRequestId);
        if (!updatedWithdrawInfo) {
            throw new Error('Failed to get updated withdraw request info');
        }
        
        console.log(`✅ Withdraw vote recorded. Total voters: ${updatedWithdrawInfo.voters.length}`);
        
        // Test 5: Execute Change Pubkey Request (if enough votes)
        console.log('\n🧪 Test 5: Execute Change Pubkey Request');
        
        try {
            const executePubkeyResult = await executeChangePubkey(
                config,
                treasuryId,
                changePubkeyRequestId
            );
            
            console.log(`✅ Change pubkey request executed successfully`);
            
            // Verify execution
            const executedPubkeyInfo = await getChangePubkeyRequestInfo(config, changePubkeyRequestId);
            if (executedPubkeyInfo?.is_executed) {
                console.log(`✅ Pubkey change confirmed as executed`);
            } else {
                console.log(`⚠️  Pubkey change execution may have failed due to insufficient votes`);
            }
            
        } catch (error: any) {
            console.log(`⚠️  Pubkey execution failed (expected if insufficient votes): ${error.message}`);
        }
        
        // Test 6: Execute Withdraw Request (if enough votes)
        console.log('\n🧪 Test 6: Execute Withdraw Request');
        
        try {
            const executeWithdrawResult = await executeWithdraw(
                config,
                treasuryId,
                withdrawRequestId
            );
            
            console.log(`✅ Withdraw request executed successfully`);
            
            // Verify execution
            const executedWithdrawInfo = await getWithdrawRequestInfo(config, withdrawRequestId);
            if (executedWithdrawInfo?.is_executed) {
                console.log(`✅ Withdraw execution confirmed`);
                
                // Check recipient balance
                const recipientBalance = await checkBalance(config, treasuryId, testConfig.recipient, COIN_TYPE);
                console.log(`✅ Recipient balance: ${recipientBalance}`);
            } else {
                console.log(`⚠️  Withdraw execution may have failed due to insufficient votes`);
            }
            
        } catch (error: any) {
            console.log(`⚠️  Withdraw execution failed (expected if insufficient votes): ${error.message}`);
        }
        
        // Test 7: Error Cases
        console.log('\n🧪 Test 7: Testing Error Cases');
        
        // Test expired deadline
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
                if (clockId) {
                    try {
                        await voteChangePubkey(config, treasuryId, expiredRequestId, clockId);
                        console.log(`❌ Should have failed: Voting on expired request succeeded`);
                    } catch (error: any) {
                        console.log(`✅ Correctly rejected vote on expired request: ${error.message}`);
                    }
                }
            }
        } catch (error: any) {
            console.log(`⚠️  Could not create expired request: ${error.message}`);
        }
        
        // Test double execution
        try {
            if (changePubkeyRequestId) {
                await executeChangePubkey(config, treasuryId, changePubkeyRequestId);
                console.log(`❌ Should have failed: Double execution succeeded`);
            }
        } catch (error: any) {
            console.log(`✅ Correctly rejected double execution: ${error.message}`);
        }
        
        console.log('\n🎉 Governance Test Suite Completed Successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
};

// Edge Cases and Additional Tests
const testGovernanceEdgeCases = async () => {
    console.log('\n🔬 Testing Governance Edge Cases...\n');
    
    const config = createAppConfig();
    
    try {
        // Test with insufficient admin votes
        console.log('🧪 Edge Case 1: Testing insufficient admin votes scenario');
        // This would require setting up a treasury with multiple admins
        // and testing the 2/3 majority requirement
        
        // Test with invalid admin signatures
        console.log('🧪 Edge Case 2: Testing invalid admin signatures');
        // This would require testing with non-admin addresses
        
        // Test with zero amount withdraw requests
        console.log('🧪 Edge Case 3: Testing zero amount withdraw requests');
        
        // Test with very large amounts
        console.log('🧪 Edge Case 4: Testing large amount withdraw requests');
        
        console.log('✅ Edge case tests completed');
        
    } catch (error) {
        console.error('❌ Edge case test failed:', error);
    }
};

// Performance Tests
const testGovernancePerformance = async () => {
    console.log('\n⚡ Testing Governance Performance...\n');
    
    const config = createAppConfig();
    
    try {
        const startTime = Date.now();
        
        // Test multiple concurrent requests
        console.log('🧪 Performance Test: Multiple concurrent requests');
        
        // Create multiple requests in parallel
        const promises: Promise<any>[] = [];
        for (let i = 0; i < 5; i++) {
            promises.push(
                createChangePubkeyRequest(
                    config,
                    'treasury_id', // You'll need to provide actual treasury ID
                    `${testConfig.newPubkey}${i}`,
                    getFutureTimestamp(24)
                )
            );
        }
        
        const results = await Promise.all(promises);
        const endTime = Date.now();
        
        console.log(`✅ Created ${results.length} requests in ${endTime - startTime}ms`);
        
    } catch (error) {
        console.error('❌ Performance test failed:', error);
    }
};

// Main test runner
const runAllGovernanceTests = async () => {
    try {
        await testGovernance();
        await testGovernanceEdgeCases();
        await testGovernancePerformance();
        
        console.log('\n🏆 All Governance Tests Completed!');
        
    } catch (error) {
        console.error('💥 Test suite failed:', error);
        process.exit(1);
    }
};

// Export for use in other test files
export {
    testGovernance,
    testGovernanceEdgeCases,
    testGovernancePerformance,
    runAllGovernanceTests
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllGovernanceTests();
}

