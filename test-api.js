#!/usr/bin/env node

/**
 * Morrow API Test Script
 * Tests all backend endpoints to ensure integrations are working
 */

const API_BASE = 'http://localhost:8080/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.cyan);
}

function logSection(message) {
  log(`\n${'='.repeat(60)}`, colors.blue);
  log(`  ${message}`, colors.bright + colors.blue);
  log(`${'='.repeat(60)}`, colors.blue);
}

async function testEndpoint(name, method, url, body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      logSuccess(`${name}`);
      return { success: true, data };
    } else {
      logError(`${name} - ${response.status}: ${data.error || data.message || 'Unknown error'}`);
      return { success: false, error: data };
    }
  } catch (error) {
    logError(`${name} - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n🚀 Morrow API Test Suite', colors.bright + colors.cyan);
  log('Testing all backend integrations...\n', colors.cyan);

  let passedTests = 0;
  let failedTests = 0;

  // ========== Health Check ==========
  logSection('Health Check');
  const health = await testEndpoint(
    'Health Check',
    'GET',
    `${API_BASE}/health`
  );
  if (health.success) {
    passedTests++;
    logInfo(`Environment: ${health.data.env}`);
    logInfo(`Timestamp: ${health.data.timestamp}`);
  } else {
    failedTests++;
  }

  // ========== Plaid Tests ==========
  logSection('Plaid Integration');

  const linkToken = await testEndpoint(
    'Create Plaid Link Token',
    'POST',
    `${API_BASE}/plaid/create_link_token`,
    { userId: 'test-user-123' }
  );
  if (linkToken.success) {
    passedTests++;
    logInfo(`Link Token: ${linkToken.data.link_token.substring(0, 30)}...`);
  } else {
    failedTests++;
  }

  // Note: Can't test public token exchange without going through Plaid Link UI
  logInfo('Skipping public token exchange (requires Plaid Link UI interaction)');

  // ========== Increase Tests ==========
  logSection('Increase Banking Integration');

  // Test entity creation
  const entityResult = await testEndpoint(
    'Create Increase Entity',
    'POST',
    `${API_BASE}/increase/entity`,
    {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-15',
      address: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94102',
      },
      email: 'john@example.com',
      phoneNumber: '+14155552671',
      ssnLast4: '1234',
    }
  );

  let entityId = null;
  if (entityResult.success) {
    passedTests++;
    entityId = entityResult.data.entity_id;
    logInfo(`Entity ID: ${entityId}`);
  } else {
    failedTests++;
    logInfo('Entity creation may have failed due to duplicate or API limitations');
  }

  // Test account creation (if entity was created)
  if (entityId) {
    const accountResult = await testEndpoint(
      'Create Increase Account',
      'POST',
      `${API_BASE}/increase/account`,
      {
        entityId: entityId,
        name: 'Test Checking Account',
      }
    );

    if (accountResult.success) {
      passedTests++;
      logInfo(`Account ID: ${accountResult.data.account_id}`);
    } else {
      failedTests++;
    }
  } else {
    logInfo('Skipping account creation (no entity ID)');
  }

  // ========== Locus Tests ==========
  logSection('Locus Crypto Payments Integration');

  const wallet = await testEndpoint(
    'Get Locus Wallet Balance',
    'GET',
    `${API_BASE}/locus/wallet?userId=test-user`
  );
  if (wallet.success) {
    passedTests++;
    logInfo(`Wallet Balance: ${wallet.data.balance} ${wallet.data.currency}`);
  } else {
    failedTests++;
  }

  const walletAddress = await testEndpoint(
    'Get Locus Wallet Address',
    'GET',
    `${API_BASE}/locus/wallet/address`
  );
  if (walletAddress.success) {
    passedTests++;
    logInfo(`Wallet Address: ${walletAddress.data.address}`);
    logInfo(`Network: ${walletAddress.data.network}`);
  } else {
    failedTests++;
  }

  const charities = await testEndpoint(
    'Get Charities List',
    'GET',
    `${API_BASE}/locus/charities`
  );
  if (charities.success) {
    passedTests++;
    logInfo(`Found ${charities.data.charities.length} charities`);
  } else {
    failedTests++;
  }

  const streakCheck = await testEndpoint(
    'Check Streak Bonus',
    'POST',
    `${API_BASE}/locus/streak/check`,
    { streak: 4 }
  );
  if (streakCheck.success) {
    passedTests++;
    if (streakCheck.data.eligible) {
      logInfo(`Streak Bonus: $${streakCheck.data.amount} USDC`);
    }
  } else {
    failedTests++;
  }

  // ========== Savings Agent Tests ==========
  logSection('Savings Agent (Behavioral Features)');

  // Sample transaction data for testing
  const sampleTransactions = [
    {
      date: new Date().toISOString().split('T')[0],
      amount: -5000, // Large income (windfall)
      merchantName: 'Bonus Payment',
      personalFinanceCategory: 'INCOME',
    },
    {
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      amount: 45.67,
      merchantName: 'Coffee Shop',
      personalFinanceCategory: 'FOOD_AND_DRINK',
    },
    {
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      amount: 120.50,
      merchantName: 'Grocery Store',
      personalFinanceCategory: 'FOOD_AND_DRINK',
    },
  ];

  const windfallDetect = await testEndpoint(
    'Detect Windfall Opportunity',
    'POST',
    `${API_BASE}/savings/windfall/detect`,
    { transactions: sampleTransactions }
  );
  if (windfallDetect.success) {
    passedTests++;
    if (windfallDetect.data.hasWindfall) {
      logInfo(`Windfall detected: ${windfallDetect.data.suggestion.message}`);
    } else {
      logInfo('No windfall detected (need more transaction history)');
    }
  } else {
    failedTests++;
  }

  const sweepAnalyze = await testEndpoint(
    'Analyze Smart Sweep',
    'POST',
    `${API_BASE}/savings/sweep/analyze`,
    { transactions: sampleTransactions }
  );
  if (sweepAnalyze.success) {
    passedTests++;
    if (sweepAnalyze.data.hasSweep) {
      logInfo(`Sweep opportunity: ${sweepAnalyze.data.suggestion.message}`);
    } else {
      logInfo('No sweep opportunity (need more transaction history)');
    }
  } else {
    failedTests++;
  }

  const triplePlay = await testEndpoint(
    'Run Triple Play Analysis',
    'POST',
    `${API_BASE}/savings/analyze`,
    { transactions: sampleTransactions }
  );
  if (triplePlay.success) {
    passedTests++;
    logInfo(`Has opportunities: ${triplePlay.data.opportunities.hasOpportunities}`);
  } else {
    failedTests++;
  }

  const freshStart = await testEndpoint(
    'Check Fresh Start (Temporal Landmark)',
    'GET',
    `${API_BASE}/savings/fresh-start/check?userId=test-user`
  );
  if (freshStart.success) {
    passedTests++;
    if (freshStart.data.freshStart.hasFreshStart) {
      logInfo(`Fresh Start: ${freshStart.data.freshStart.landmark} - ${freshStart.data.freshStart.message}`);
    } else {
      logInfo('No fresh start detected today');
    }
  } else {
    failedTests++;
  }

  const withdrawalImpact = await testEndpoint(
    'Calculate Withdrawal Impact',
    'POST',
    `${API_BASE}/savings/withdrawal/impact`,
    {
      vaultGoal: 5000,
      currentBalance: 2500,
      withdrawAmount: 500,
    }
  );
  if (withdrawalImpact.success) {
    passedTests++;
    logInfo(`Impact: ${withdrawalImpact.data.impact.impactMessage}`);
  } else {
    failedTests++;
  }

  // ========== AI Coach Tests ==========
  logSection('AI Coach (OpenAI GPT-4)');

  const chat = await testEndpoint(
    'Chat with AI Coach',
    'POST',
    `${API_BASE}/coach/chat`,
    {
      messages: [
        {
          role: 'user',
          content: 'What are some good habits for saving money?',
        },
      ],
    }
  );
  if (chat.success) {
    passedTests++;
    logInfo(`AI Response: ${chat.data.message.substring(0, 100)}...`);
  } else {
    failedTests++;
  }

  // ========== Summary ==========
  logSection('Test Summary');
  const total = passedTests + failedTests;
  const percentage = ((passedTests / total) * 100).toFixed(1);

  log(`\nTotal Tests: ${total}`, colors.bright);
  logSuccess(`Passed: ${passedTests} (${percentage}%)`);

  if (failedTests > 0) {
    logError(`Failed: ${failedTests} (${(100 - percentage).toFixed(1)}%)`);
  }

  log('\n' + '='.repeat(60) + '\n', colors.blue);

  if (failedTests === 0) {
    logSuccess('🎉 All tests passed! Your Morrow backend is fully functional!\n');
  } else {
    log('⚠️  Some tests failed. Check the logs above for details.\n', colors.yellow);
    log('Note: Some failures may be expected due to sandbox API limitations.\n', colors.yellow);
  }
}

// Run the tests
runTests().catch(console.error);
