// API client for Morrow backend

const API_BASE = '/api';

// Helper function for API calls
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============ Plaid API ============

export const plaidAPI = {
  createLinkToken: async (userId: string) => {
    return fetchAPI<{ link_token: string }>('/plaid/create_link_token', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  exchangePublicToken: async (publicToken: string, userId?: string) => {
    return fetchAPI<{ access_token: string; item_id: string }>('/plaid/exchange_public_token', {
      method: 'POST',
      body: JSON.stringify({ public_token: publicToken, userId }),
    });
  },

  getAccounts: async (accessToken: string) => {
    return fetchAPI<{ accounts: any[] }>('/plaid/accounts', {
      method: 'POST',
      body: JSON.stringify({ access_token: accessToken }),
    });
  },

  getTransactions: async (
    accessToken: string,
    startDate: string,
    endDate: string,
    count: number = 100
  ) => {
    return fetchAPI<{ transactions: any[]; accounts: any[]; total_transactions: number }>(
      '/plaid/transactions',
      {
        method: 'POST',
        body: JSON.stringify({
          access_token: accessToken,
          start_date: startDate,
          end_date: endDate,
          count,
        }),
      }
    );
  },

  getRecurringTransactions: async (accessToken: string) => {
    return fetchAPI<{ inflow_streams: any[]; outflow_streams: any[] }>(
      '/plaid/recurring_transactions',
      {
        method: 'POST',
        body: JSON.stringify({ access_token: accessToken }),
      }
    );
  },
};

// ============ Increase API ============

export const increaseAPI = {
  createEntity: async (data: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
    };
    ssn?: string;
  }) => {
    return fetchAPI<{ success: boolean; entity_id: string; data: any }>('/increase/entity', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getEntity: async (entityId: string) => {
    return fetchAPI<{ success: boolean; entity: any }>(`/increase/entity/${entityId}`);
  },

  getAccounts: async (entityId: string) => {
    return fetchAPI<{ success: boolean; accounts: any[] }>(`/increase/accounts/${entityId}`);
  },

  createAccount: async (entityId: string, name: string) => {
    return fetchAPI<{ success: boolean; account_id: string; data: any }>('/increase/account', {
      method: 'POST',
      body: JSON.stringify({ entityId, name }),
    });
  },

  createVault: async (entityId: string, name: string, purpose?: string, goalAmount?: number) => {
    return fetchAPI<{ success: boolean; account_id: string; data: any }>('/increase/vault', {
      method: 'POST',
      body: JSON.stringify({ entityId, name, purpose, goalAmount }),
    });
  },

  getBalance: async (accountId: string) => {
    return fetchAPI<{ success: boolean; account_id: string; current_balance: number }>(
      `/increase/balance/${accountId}`
    );
  },

  transfer: async (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string
  ) => {
    return fetchAPI<{ success: boolean; transaction_id: string }>('/increase/transfer', {
      method: 'POST',
      body: JSON.stringify({ fromAccountId, toAccountId, amount, description }),
    });
  },

  getTransactions: async (accountId: string, limit: number = 50) => {
    return fetchAPI<{ success: boolean; transactions: any[] }>(
      `/increase/transactions/${accountId}?limit=${limit}`
    );
  },

  simulateDeposit: async (accountId: string, amount: number, description: string) => {
    return fetchAPI<{ success: boolean; transaction_id: string }>(
      '/increase/simulate/inbound_ach',
      {
        method: 'POST',
        body: JSON.stringify({ accountId, amount, description }),
      }
    );
  },
};

// ============ Locus API ============

export const locusAPI = {
  getWallet: async (userId: string = 'default_user') => {
    return fetchAPI<{ success: boolean; balance: number; totalRewards: number; currency: string }>(
      `/locus/wallet?userId=${userId}`
    );
  },

  getWalletAddress: async () => {
    return fetchAPI<{ success: boolean; address: string; network: string }>(
      '/locus/wallet/address'
    );
  },

  getCharities: async () => {
    return fetchAPI<{ success: boolean; charities: any[] }>('/locus/charities');
  },

  donate: async (charityId: string, amount: number, fromAddress: string) => {
    return fetchAPI<{ success: boolean; payment_id: string; transaction_hash?: string }>(
      '/locus/donate',
      {
        method: 'POST',
        body: JSON.stringify({ charityId, amount, fromAddress }),
      }
    );
  },

  checkStreakBonus: async (streak: number) => {
    return fetchAPI<{ success: boolean; eligible: boolean; amount: number }>(
      '/locus/streak/check',
      {
        method: 'POST',
        body: JSON.stringify({ streak }),
      }
    );
  },
};

// ============ Savings Agent API ============

export const savingsAPI = {
  analyzeAll: async (transactions: any[]) => {
    return fetchAPI<{ success: boolean; opportunities: any }>('/savings/analyze', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    });
  },

  detectWindfall: async (transactions: any[]) => {
    return fetchAPI<{ hasWindfall: boolean; suggestion: any }>('/savings/windfall/detect', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    });
  },

  analyzeSweep: async (transactions: any[]) => {
    return fetchAPI<{ hasSweep: boolean; suggestion: any }>('/savings/sweep/analyze', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    });
  },

  checkFreshStart: async (userId: string = 'default_user') => {
    return fetchAPI<{ success: boolean; freshStart: any }>(
      `/savings/fresh-start/check?userId=${userId}`
    );
  },

  calculateWithdrawalImpact: async (
    vaultGoal: number,
    currentBalance: number,
    withdrawAmount: number
  ) => {
    return fetchAPI<{ success: boolean; impact: any }>('/savings/withdrawal/impact', {
      method: 'POST',
      body: JSON.stringify({ vaultGoal, currentBalance, withdrawAmount }),
    });
  },
};

// ============ AI Coach API ============

export const coachAPI = {
  chat: async (messages: Array<{ role: string; content: string }>) => {
    return fetchAPI<{ success: boolean; message: string }>('/coach/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  },
};

// ============ Health Check ============

export const healthAPI = {
  check: async () => {
    return fetchAPI<{ status: string; timestamp: string; env: string }>('/health');
  },
};
