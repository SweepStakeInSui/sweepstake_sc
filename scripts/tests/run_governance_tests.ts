#!/usr/bin/env ts-node

import { runAllGovernanceTests } from './test_governance.js';
import { runUnitTests } from './test_governance_unit.js';
import { runIntegrationTests } from './test_governance_integration.js';

// Test execution options
interface TestOptions {
    unit?: boolean;
    integration?: boolean;
    comprehensive?: boolean;
    verbose?: boolean;
}

// Parse command line arguments
const parseArgs = (): TestOptions => {
    const args = process.argv.slice(2);
    const options: TestOptions = {
        unit: false,
        integration: false,
        comprehensive: false,
        verbose: false
    };
    
    for (const arg of args) {
        switch (arg) {
            case '--unit':
            case '-u':
                options.unit = true;
                break;
            case '--integration':
            case '-i':
                options.integration = true;
                break;
            case '--comprehensive':
            case '-c':
                options.comprehensive = true;
                break;
            case '--verbose':
            case '-v':
                options.verbose = true;
                break;
            case '--help':
            case '-h':
                printHelp();
                process.exit(0);
                break;
        }
    }
    
    // If no specific tests selected, run all
    if (!options.unit && !options.integration && !options.comprehensive) {
        options.comprehensive = true;
    }
    
    return options;
};

// Print help information
const printHelp = () => {
    console.log(`
Governance Test Runner

Usage: npm run test:governance [options]

Options:
  -u, --unit           Run unit tests only
  -i, --integration    Run integration tests only
  -c, --comprehensive  Run comprehensive test suite (default)
  -v, --verbose        Enable verbose output
  -h, --help           Show this help message

Examples:
  npm run test:governance                    # Run all tests
  npm run test:governance -- --unit          # Run unit tests only
  npm run test:governance -- --integration   # Run integration tests only
  npm run test:governance -- --verbose       # Run with verbose output
`);
};

// Test result summary
interface TestSummary {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    startTime: number;
    endTime: number;
}

// Run tests based on options
const runTests = async (options: TestOptions): Promise<TestSummary> => {
    const summary: TestSummary = {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        startTime: Date.now(),
        endTime: 0
    };
    
    console.log('🧪 Governance Test Runner');
    console.log('========================\n');
    
    if (options.verbose) {
        console.log('Verbose mode enabled\n');
    }
    
    // Run unit tests
    if (options.unit || options.comprehensive) {
        console.log('🔬 Running Unit Tests...\n');
        summary.totalTests++;
        
        try {
            await runUnitTests();
            summary.passedTests++;
            console.log('✅ Unit tests completed successfully\n');
        } catch (error) {
            summary.failedTests++;
            console.error('❌ Unit tests failed:', error);
            if (options.verbose) {
                console.error('Stack trace:', error.stack);
            }
        }
    }
    
    // Run integration tests
    if (options.integration || options.comprehensive) {
        console.log('🔄 Running Integration Tests...\n');
        summary.totalTests++;
        
        try {
            await runIntegrationTests();
            summary.passedTests++;
            console.log('✅ Integration tests completed successfully\n');
        } catch (error) {
            summary.failedTests++;
            console.error('❌ Integration tests failed:', error);
            if (options.verbose) {
                console.error('Stack trace:', error.stack);
            }
        }
    }
    
    // Run comprehensive tests (if not already covered)
    if (options.comprehensive && !options.unit && !options.integration) {
        console.log('🏆 Running Comprehensive Test Suite...\n');
        summary.totalTests++;
        
        try {
            await runAllGovernanceTests();
            summary.passedTests++;
            console.log('✅ Comprehensive tests completed successfully\n');
        } catch (error) {
            summary.failedTests++;
            console.error('❌ Comprehensive tests failed:', error);
            if (options.verbose) {
                console.error('Stack trace:', error.stack);
            }
        }
    }
    
    summary.endTime = Date.now();
    return summary;
};

// Print test summary
const printSummary = (summary: TestSummary) => {
    const duration = summary.endTime - summary.startTime;
    const durationSeconds = (duration / 1000).toFixed(2);
    
    console.log('📊 Test Summary');
    console.log('==============');
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Passed: ${summary.passedTests}`);
    console.log(`Failed: ${summary.failedTests}`);
    console.log(`Duration: ${durationSeconds}s`);
    
    if (summary.failedTests === 0) {
        console.log('\n🎉 All tests passed successfully!');
    } else {
        console.log('\n❌ Some tests failed. Please check the output above.');
        process.exit(1);
    }
};

// Main execution function
const main = async () => {
    try {
        const options = parseArgs();
        const summary = await runTests(options);
        printSummary(summary);
    } catch (error) {
        console.error('💥 Test runner failed:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { main, parseArgs, printHelp, printSummary };

