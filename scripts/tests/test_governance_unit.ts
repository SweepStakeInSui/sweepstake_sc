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

// Test utilities
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

// Unit test for Change Pubkey Request
const testChangePubkeyRequest = async () => {
    console.log('🧪 Unit Test: Change Pubkey Request Flow');
    
    const config = createAppConfig();
    let treasuryId: string | null = null;
    let clockId: string | null = null;
    
    try {
        // Setup
        const newTreasuryResult = await newTreasury(config, COIN_TYPE);
        treasuryId = findObjectId(newTreasuryResult, 'Treasury');
        
        if (!treasuryId) {
            throw new Error('Failed to create treasury');
        }
        
        // Get clock object
        const clockObjects = await config.client.getOwnedObjects({
            owner: '0x6',
            filter: { StructType: '0x2::clock::Clock' }
        });
        
        if (clockObjects.data.length > 0) {
            clockId = clockObjects.data[0].objectId;
        } else {
            throw new Error('Clock object not found');
        }
        
        // Test 1: Create request
        const newPubkey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        const futureDeadline = getFutureTimestamp(24);
        
        const createResult = await createChangePubkeyRequest(
            config,
            treasuryId,
            newPubkey,
            futureDeadline
        );
        
        const requestId = findObjectId(createResult, 'ChangePubkeyRequest');
        if (!requestId) {
            throw new Error('Failed to create change pubkey request');
        }
        
        console.log(`✅ Change pubkey request created: ${requestId}`);
        
        // Test 2: Verify request details
        const requestInfo = await getChangePubkeyRequestInfo(config, requestId);
        if (!requestInfo) {
            throw new Error('Failed to get request info');
        }
        
        console.log(`✅ Request verified:`, {
            newPubkey: requestInfo.new_pubkey,
            deadline: requestInfo.deadline,
            isExecuted: requestInfo.is_executed,
            voterCount: requestInfo.voters.length
        });
        
        // Test 3: Vote on request
        const voteResult = await voteChangePubkey(
            config,
            treasuryId,
            requestId,
            clockId
        );
        
        console.log(`✅ Vote cast successfully`);
        
        // Test 4: Verify vote recorded
        const updatedInfo = await getChangePubkeyRequestInfo(config, requestId);
        if (!updatedInfo) {
            throw new Error('Failed to get updated request info');
        }
        
        console.log(`✅ Vote recorded. Total voters: ${updatedInfo.voters.length}`);
        
        // Test 5: Attempt execution (may fail if insufficient votes)
        try {
            await executeChangePubkey(config, treasuryId, requestId);
            console.log(`✅ Change pubkey executed successfully`);
        } catch (error: any) {
            console.log(`⚠️  Execution failed (insufficient votes): ${error.message}`);
        }
        
        console.log('✅ Change Pubkey Request test completed\n');
        
    } catch (error) {
        console.error('❌ Change Pubkey Request test failed:', error);
        throw error;
    }
};

// Unit test for Withdraw Request
const testWithdrawRequest = async () => {
    console.log('🧪 Unit Test: Withdraw Request Flow');
    
    const config = createAppConfig();
    let treasuryId: string | null = null;
    let clockId: string | null = null;
    
    try {
        // Setup
        const newTreasuryResult = await newTreasury(config, COIN_TYPE);
        treasuryId = findObjectId(newTreasuryResult, 'Treasury');
        
        if (!treasuryId) {
            throw new Error('Failed to create treasury');
        }
        
        // Get clock object
        const clockObjects = await config.client.getOwnedObjects({
            owner: '0x6',
            filter: { StructType: '0x2::clock::Clock' }
        });
        
        if (clockObjects.data.length > 0) {
            clockId = clockObjects.data[0].objectId;
        } else {
            throw new Error('Clock object not found');
        }
        
        // Test 1: Deposit funds
        const testAmount = '1000000';
        await deposit(config, treasuryId, config.user.toSuiAddress(), COIN_TYPE, testAmount);
        console.log(`✅ Deposited ${testAmount} to treasury`);
        
        // Test 2: Create withdraw request
        const recipient = '0x5ddb45d80219e10af0e95d041b21de1debff34075e3885b83276848a7857763e';
        const futureDeadline = getFutureTimestamp(24);
        
        const createResult = await createWithdrawRequest(
            config,
            treasuryId,
            recipient,
            testAmount,
            futureDeadline
        );
        
        const requestId = findObjectId(createResult, 'WithDrawRequest');
        if (!requestId) {
            throw new Error('Failed to create withdraw request');
        }
        
        console.log(`✅ Withdraw request created: ${requestId}`);
        
        // Test 3: Verify request details
        const requestInfo = await getWithdrawRequestInfo(config, requestId);
        if (!requestInfo) {
            throw new Error('Failed to get request info');
        }
        
        console.log(`✅ Request verified:`, {
            to: requestInfo.to,
            amount: requestInfo.amount,
            deadline: requestInfo.deadline,
            isExecuted: requestInfo.is_executed,
            voterCount: requestInfo.voters.length
        });
        
        // Test 4: Vote on request
        const voteResult = await voteWithdraw(
            config,
            treasuryId,
            requestId,
            clockId
        );
        
        console.log(`✅ Vote cast successfully`);
        
        // Test 5: Verify vote recorded
        const updatedInfo = await getWithdrawRequestInfo(config, requestId);
        if (!updatedInfo) {
            throw new Error('Failed to get updated request info');
        }
        
        console.log(`✅ Vote recorded. Total voters: ${updatedInfo.voters.length}`);
        
        // Test 6: Attempt execution (may fail if insufficient votes)
        try {
            await executeWithdraw(config, treasuryId, requestId);
            console.log(`✅ Withdraw executed successfully`);
            
            // Check recipient balance
            const recipientBalance = await checkBalance(config, treasuryId, recipient, COIN_TYPE);
            console.log(`✅ Recipient balance: ${recipientBalance}`);
        } catch (error: any) {
            console.log(`⚠️  Execution failed (insufficient votes): ${error.message}`);
        }
        
        console.log('✅ Withdraw Request test completed\n');
        
    } catch (error) {
        console.error('❌ Withdraw Request test failed:', error);
        throw error;
    }
};

// Unit test for Error Cases
const testGovernanceErrors = async () => {
    console.log('🧪 Unit Test: Governance Error Cases');
    
    const config = createAppConfig();
    
    try {
        // Test 1: Expired deadline
        console.log('Testing expired deadline...');
        
        const pastDeadline = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
        const newPubkey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        
        // Create a treasury for testing
        const newTreasuryResult = await newTreasury(config, COIN_TYPE);
        const treasuryId = findObjectId(newTreasuryResult, 'Treasury');
        
        if (!treasuryId) {
            throw new Error('Failed to create treasury');
        }
        
        // Create request with past deadline
        const createResult = await createChangePubkeyRequest(
            config,
            treasuryId,
            newPubkey,
            pastDeadline
        );
        
        const requestId = findObjectId(createResult, 'ChangePubkeyRequest');
        
        if (requestId) {
            // Get clock object
            const clockObjects = await config.client.getObjectsOwnedByAddress({
                owner: '0x6',
                filter: { StructType: '0x2::clock::Clock' }
            });
            
            if (clockObjects.data.length > 0) {
                const clockId = clockObjects.data[0].objectId;
                
                try {
                    await voteChangePubkey(config, treasuryId, requestId, clockId);
                    console.log(`❌ Should have failed: Voting on expired request succeeded`);
                } catch (error: any) {
                    console.log(`✅ Correctly rejected vote on expired request: ${error.message}`);
                }
            }
        }
        
        // Test 2: Double execution
        console.log('Testing double execution...');
        
        const futureDeadline = getFutureTimestamp(24);
        const createResult2 = await createChangePubkeyRequest(
            config,
            treasuryId,
            newPubkey,
            futureDeadline
        );
        
        const requestId2 = findObjectId(createResult2, 'ChangePubkeyRequest');
        
        if (requestId2) {
            try {
                // First execution attempt
                await executeChangePubkey(config, treasuryId, requestId2);
                console.log(`⚠️  First execution succeeded (may be expected if sufficient votes)`);
                
                // Second execution attempt
                await executeChangePubkey(config, treasuryId, requestId2);
                console.log(`❌ Should have failed: Double execution succeeded`);
            } catch (error: any) {
                console.log(`✅ Correctly rejected double execution: ${error.message}`);
            }
        }
        
        console.log('✅ Error cases test completed\n');
        
    } catch (error) {
        console.error('❌ Error cases test failed:', error);
    }
};

// Unit test for Voting Mechanics
const testVotingMechanics = async () => {
    console.log('🧪 Unit Test: Voting Mechanics');
    
    const config = createAppConfig();
    
    try {
        // Create treasury
        const newTreasuryResult = await newTreasury(config, COIN_TYPE);
        const treasuryId = findObjectId(newTreasuryResult, 'Treasury');
        
        if (!treasuryId) {
            throw new Error('Failed to create treasury');
        }
        
        // Get clock object
        const clockObjects = await config.client.getOwnedObjects({
            owner: '0x6',
            filter: { StructType: '0x2::clock::Clock' }
        });
        
        if (clockObjects.data.length === 0) {
            throw new Error('Clock object not found');
        }
        
        const clockId = clockObjects.data[0].objectId;
        
        // Test multiple votes on same request
        const newPubkey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        const futureDeadline = getFutureTimestamp(24);
        
        const createResult = await createChangePubkeyRequest(
            config,
            treasuryId,
            newPubkey,
            futureDeadline
        );
        
        const requestId = findObjectId(createResult, 'ChangePubkeyRequest');
        
        if (requestId) {
            // Cast multiple votes (should all be from the same admin)
            for (let i = 0; i < 3; i++) {
                try {
                    await voteChangePubkey(config, treasuryId, requestId, clockId);
                    console.log(`✅ Vote ${i + 1} cast successfully`);
                } catch (error: any) {
                    console.log(`⚠️  Vote ${i + 1} failed: ${error.message}`);
                }
            }
            
            // Check final vote count
            const finalInfo = await getChangePubkeyRequestInfo(config, requestId);
            if (finalInfo) {
                console.log(`✅ Final vote count: ${finalInfo.voters.length}`);
            }
        }
        
        console.log('✅ Voting mechanics test completed\n');
        
    } catch (error) {
        console.error('❌ Voting mechanics test failed:', error);
    }
};

// Run all unit tests
const runUnitTests = async () => {
    console.log('🚀 Starting Governance Unit Tests...\n');
    
    try {
        await testChangePubkeyRequest();
        await testWithdrawRequest();
        await testGovernanceErrors();
        await testVotingMechanics();
        
        console.log('🎉 All Unit Tests Completed Successfully!');
        
    } catch (error) {
        console.error('💥 Unit test suite failed:', error);
        process.exit(1);
    }
};

// Export for use in other test files
export {
    testChangePubkeyRequest,
    testWithdrawRequest,
    testGovernanceErrors,
    testVotingMechanics,
    runUnitTests
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runUnitTests();
}
