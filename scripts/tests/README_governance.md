# Governance Tests

This directory contains comprehensive tests for the governance functionality of the sweepstake smart contract.

## Overview

The governance system allows treasury administrators to:
- Create and vote on change pubkey requests
- Create and vote on withdraw requests
- Execute approved requests based on majority voting

## Test Structure

### 1. Contract Callers (`../src/contractsCaller/governance/`)
- `createChangePubkeyRequest.ts` - Create requests to change treasury pubkey
- `voteChangePubkey.ts` - Vote on change pubkey requests
- `executeChangePubkey.ts` - Execute approved change pubkey requests
- `createWithdrawRequest.ts` - Create requests to withdraw funds
- `voteWithdraw.ts` - Vote on withdraw requests
- `executeWithdraw.ts` - Execute approved withdraw requests
- `getRequestInfo.ts` - Get information about governance requests

### 2. Test Files

#### `test_governance.ts` - Comprehensive Test Suite
- Full workflow testing
- Error case handling
- Performance testing
- Edge case scenarios

#### `test_governance_unit.ts` - Unit Tests
- Individual function testing
- Isolated component testing
- Error condition testing
- Voting mechanics testing

#### `test_governance_integration.ts` - Integration Tests
- End-to-end workflow testing
- Multi-admin scenarios
- State transition testing
- Real-world usage patterns

#### `run_governance_tests.ts` - Test Runner
- Command-line interface for running tests
- Test result summarization
- Configurable test execution

## Running Tests

### Prerequisites
1. Ensure you have a configured test environment
2. Set up test accounts with appropriate permissions
3. Have sufficient test funds for deposit/withdraw operations

### Command Line Usage

```bash
# Run all governance tests
npm run test:governance

# Run unit tests only
npm run test:governance:unit

# Run integration tests only
npm run test:governance:integration

# Run comprehensive test suite
npm run test:governance:comprehensive

# Run with verbose output
npm run test:governance -- --verbose

# Show help
npm run test:governance -- --help
```

### Direct Execution

```bash
# Run individual test files
node --loader ts-node/esm tests/test_governance.ts
node --loader ts-node/esm tests/test_governance_unit.ts
node --loader ts-node/esm tests/test_governance_integration.ts
node --loader ts-node/esm tests/run_governance_tests.ts
```

## Test Scenarios

### 1. Change Pubkey Request Workflow
1. **Create Request**: Admin creates a request to change treasury pubkey
2. **Vote**: Admins vote on the request
3. **Execute**: Request is executed if majority approval is reached
4. **Verify**: Confirm pubkey change was applied

### 2. Withdraw Request Workflow
1. **Deposit**: Ensure treasury has sufficient funds
2. **Create Request**: Admin creates a withdraw request
3. **Vote**: Admins vote on the request
4. **Execute**: Request is executed if majority approval is reached
5. **Verify**: Confirm funds were transferred to recipient

### 3. Error Cases
- **Expired Deadline**: Voting on requests past deadline
- **Double Execution**: Attempting to execute already executed requests
- **Insufficient Votes**: Executing requests without majority approval
- **Invalid Admin**: Non-admin attempting governance actions

### 4. Edge Cases
- **Zero Amount**: Withdraw requests for zero amount
- **Large Amounts**: Withdraw requests for very large amounts
- **Concurrent Requests**: Multiple requests created simultaneously
- **State Transitions**: Various request state changes

## Configuration

### Test Configuration
Update the test configuration in each test file:

```typescript
const testConfig = {
    admin1: '0x...',        // Replace with actual admin address
    admin2: '0x...',        // Replace with actual admin address
    admin3: '0x...',        // Replace with actual admin address
    nonAdmin: '0x...',      // Replace with non-admin address
    recipient: '0x...',     // Replace with recipient address
    newPubkey: '0x...',     // Replace with new pubkey for testing
    testAmount: '1000000'   // Adjust test amount as needed
};
```

### Environment Variables
Ensure these are set in your `.env` file:
- `SUI_NETWORK` - Network to connect to (testnet/mainnet/devnet)
- `SUI_PRIVATE_KEY` - Private key for admin account
- `SUI_ADDRESS` - Address for user account

## Expected Behavior

### Successful Test Run
```
🚀 Starting Governance Test Suite...

📋 Setting up test environment...
✅ Treasury created: 0x...
✅ Clock object found: 0x...

🧪 Test 1: Create Change Pubkey Request
✅ Change pubkey request created: 0x...
✅ Request details verified

🧪 Test 2: Vote on Change Pubkey Request
✅ Vote cast successfully
✅ Vote recorded. Total voters: 1

🎉 Governance Test Suite Completed Successfully!
```

### Test Failure
```
❌ Test failed: Error: Failed to create treasury
💥 Test suite failed: Error: Failed to create treasury
```

## Troubleshooting

### Common Issues

1. **"Clock object not found"**
   - Ensure you're connected to the correct network
   - Check that the system clock object exists

2. **"Failed to create treasury"**
   - Verify admin permissions
   - Check account balance for gas fees
   - Ensure contract is deployed correctly

3. **"Insufficient votes"**
   - This is expected behavior for single admin
   - Set up multiple admin accounts for full testing

4. **"Transaction failed"**
   - Check gas limits
   - Verify account permissions
   - Ensure sufficient balance

### Debug Mode
Run tests with verbose output to see detailed logs:
```bash
npm run test:governance -- --verbose
```

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Add appropriate error handling
3. Include both positive and negative test cases
4. Update this README with new test scenarios
5. Ensure tests are deterministic and repeatable

## Test Coverage

The governance tests cover:
- ✅ Request creation
- ✅ Voting mechanisms
- ✅ Execution logic
- ✅ Error conditions
- ✅ State transitions
- ✅ Edge cases
- ⚠️ Multi-admin scenarios (requires setup)
- ⚠️ Performance under load (requires optimization)

## Security Considerations

These tests are designed for development and testing environments. Do not use test private keys or addresses in production. Always verify contract behavior in a testnet environment before deploying to mainnet.

