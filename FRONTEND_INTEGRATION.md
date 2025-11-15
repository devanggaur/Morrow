# Frontend Integration Guide

This guide shows you how to connect your existing Morrow frontend components to the new backend API.

## API Base URL

All API endpoints are prefixed with `/api`. Since the frontend and backend run on the same port in development, you can use relative URLs:

```typescript
const API_BASE = '/api';
```

## Quick Start Examples

### 1. Plaid Bank Connection (Onboarding)

```typescript
// In your BankConnection component (client/src/components/BankConnection.tsx)

import { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';

export function BankConnection() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Step 1: Get Link Token from backend
  useEffect(() => {
    async function createLinkToken() {
      const response = await fetch('/api/plaid/create_link_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user-id' }),
      });
      const data = await response.json();
      setLinkToken(data.link_token);
    }
    createLinkToken();
  }, []);

  // Step 2: Handle successful connection
  const onSuccess = async (publicToken: string) => {
    // Exchange public token for access token
    const response = await fetch('/api/plaid/exchange_public_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_token: publicToken }),
    });
    const data = await response.json();
    setAccessToken(data.access_token);

    // Now fetch accounts and transactions
    await fetchAccounts(data.access_token);
  };

  // Step 3: Initialize Plaid Link
  const config = {
    token: linkToken,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <button onClick={() => open()} disabled={!ready}>
      Connect Bank Account
    </button>
  );
}

async function fetchAccounts(accessToken: string) {
  const response = await fetch('/api/plaid/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: accessToken }),
  });
  const data = await response.json();
  console.log('Accounts:', data.accounts);
}
```

### 2. Fetch Transactions

```typescript
// Fetch last 90 days of transactions
async function fetchTransactions(accessToken: string) {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const response = await fetch('/api/plaid/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      count: 500,
    }),
  });

  const data = await response.json();
  return data.transactions;
}
```

### 3. Create Increase Vault

```typescript
// In your VaultsTab component

async function createVault(entityId: string, vaultName: string, goalAmount: number) {
  const response = await fetch('/api/increase/vault', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entityId: entityId,
      name: vaultName,
      purpose: 'savings',
      goalAmount: goalAmount,
    }),
  });

  const data = await response.json();
  return data;
}

// Transfer to vault
async function transferToVault(fromAccountId: string, toVaultId: string, amount: number) {
  const response = await fetch('/api/increase/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromAccountId,
      toAccountId: toVaultId,
      amount,
      description: 'Savings transfer',
    }),
  });

  const data = await response.json();
  return data;
}

// Get vault balance
async function getVaultBalance(vaultId: string) {
  const response = await fetch(`/api/increase/balance/${vaultId}`);
  const data = await response.json();
  return data.current_balance;
}
```

### 4. AI Coach Chat

```typescript
// In your CoachTab component

async function chatWithCoach(messages: Array<{ role: string; content: string }>) {
  const response = await fetch('/api/coach/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  const data = await response.json();
  return data.message;
}

// Example usage:
const messages = [
  {
    role: 'user',
    content: 'How can I save more money each month?',
  },
];

const aiResponse = await chatWithCoach(messages);
console.log('Coach says:', aiResponse);
```

### 5. Savings Suggestions (Windfall & Sweep)

```typescript
// Run savings analysis on transactions

async function getSavingsSuggestions(transactions: any[]) {
  const response = await fetch('/api/savings/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions }),
  });

  const data = await response.json();
  return data.opportunities;
}

// Example response:
// {
//   windfall: {
//     type: 'windfall',
//     amount: 5000,
//     suggestedSave: 1000,
//     message: 'Great news! We detected a windfall of $5000...'
//   },
//   sweep: {
//     type: 'sweep',
//     unspentBudget: 120.50,
//     suggestedSave: 60.25,
//     message: "You're $120.50 under your weekly average..."
//   },
//   hasOpportunities: true
// }
```

### 6. Fresh Start Detection

```typescript
// Check for temporal landmarks (New Year, Month Start, Monday)

async function checkFreshStart() {
  const response = await fetch('/api/savings/fresh-start/check?userId=current-user');
  const data = await response.json();
  return data.freshStart;
}

// Example response:
// {
//   hasFreshStart: true,
//   landmark: 'Monday',
//   emoji: '💪',
//   message: 'Fresh week ahead! Consider increasing your savings by 5%.',
//   suggestedIncrease: 0.05
// }
```

### 7. Locus Wallet & Donations

```typescript
// Get wallet balance
async function getWalletBalance() {
  const response = await fetch('/api/locus/wallet?userId=current-user');
  const data = await response.json();
  return {
    balance: data.balance,
    currency: data.currency,
  };
}

// Get available charities
async function getCharities() {
  const response = await fetch('/api/locus/charities');
  const data = await response.json();
  return data.charities;
}

// Make a donation
async function makeDonation(charityId: string, amount: number, fromAddress: string) {
  const response = await fetch('/api/locus/donate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      charityId,
      amount,
      fromAddress,
    }),
  });

  const data = await response.json();
  return data;
}
```

### 8. Withdrawal Impact (Soft Lock)

```typescript
// Calculate impact before allowing withdrawal

async function checkWithdrawalImpact(
  vaultGoal: number,
  currentBalance: number,
  withdrawAmount: number
) {
  const response = await fetch('/api/savings/withdrawal/impact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vaultGoal,
      currentBalance,
      withdrawAmount,
    }),
  });

  const data = await response.json();
  return data.impact;
}

// Example response:
// {
//   progressBefore: 50.0,
//   progressAfter: 40.0,
//   progressLost: 10.0,
//   daysDelayed: 100,
//   impactMessage: 'Withdrawing $500.00 will set you back 100 days...'
// }
```

## Error Handling

Always wrap API calls in try-catch blocks:

```typescript
async function safeApiCall() {
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: 'value' }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    // Show error to user
    return null;
  }
}
```

## Using React Query (Already in your project)

You already have TanStack React Query installed. Here's how to use it:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch data with caching
function usePlaidAccounts(accessToken: string) {
  return useQuery({
    queryKey: ['plaid-accounts', accessToken],
    queryFn: async () => {
      const response = await fetch('/api/plaid/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken }),
      });
      return response.json();
    },
    enabled: !!accessToken, // Only run if we have a token
  });
}

// Mutations for creating/updating data
function useCreateVault() {
  return useMutation({
    mutationFn: async (vaultData: { entityId: string; name: string; goalAmount: number }) => {
      const response = await fetch('/api/increase/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vaultData),
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch vault list
      queryClient.invalidateQueries({ queryKey: ['vaults'] });
    },
  });
}
```

## Next Steps

1. **Update your existing components** to use these API calls
2. **Remove any mock/demo data** from your frontend
3. **Test the full user flow** from onboarding through vault creation
4. **Add loading states** using React Query's `isLoading` flags
5. **Add error handling** and user-friendly error messages

## Testing

Run the test script to verify all endpoints:

```bash
npm test:api
```

This will test all 30+ endpoints and show you which ones are working correctly.
