import axios from 'axios';

const increaseApi = axios.create({
  baseURL: process.env.INCREASE_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.INCREASE_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function createEntity(data: {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  ssn?: string; // Full SSN for sandbox (e.g., "123456789")
  ssnLast4?: string; // For production
}) {
  try {
    const response = await increaseApi.post('/entities', {
      structure: 'natural_person',
      natural_person: {
        name: `${data.firstName} ${data.lastName}`,
        date_of_birth: data.dateOfBirth,
        address: {
          line1: data.address.street,
          city: data.address.city,
          state: data.address.state,
          zip: data.address.postalCode,
        },
        identification: {
          method: 'social_security_number',
          // For sandbox, use full SSN if provided, otherwise generate a test one
          number: data.ssn || '123456789',
        },
      },
    });

    return {
      success: true,
      entity_id: response.data.id,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Error creating entity:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
}

export async function getEntity(entityId: string) {
  try {
    const response = await increaseApi.get(`/entities/${entityId}`);

    return {
      success: true,
      entity: response.data,
    };
  } catch (error: any) {
    console.error('Error getting entity:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
}

export async function createAccount(entityId: string, name: string) {
  try {
    const response = await increaseApi.post('/accounts', {
      entity_id: entityId,
      name: name,
      program_id: 'sandbox_program_y9gxnikfjgcujxhk1bdk',
    });

    return {
      success: true,
      account_id: response.data.id,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Error creating account:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
}

export async function getAccount(accountId: string) {
  try {
    const response = await increaseApi.get(`/accounts/${accountId}`);

    return {
      success: true,
      account: response.data,
    };
  } catch (error: any) {
    console.error('Error getting account:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
}

export async function getAccountBalance(accountId: string) {
  try {
    const response = await increaseApi.get(`/accounts/${accountId}`);

    let calculatedBalance = 0;

    // If balance is null (common in sandbox), calculate from transactions
    if (response.data.balance === null) {
      try {
        const txResponse = await increaseApi.get('/transactions', {
          params: { account_id: accountId, limit: 100 },
        });

        calculatedBalance = txResponse.data.data.reduce((sum: number, tx: any) => {
          return sum + (tx.amount || 0);
        }, 0);
      } catch (txError) {
        console.warn(`Could not fetch transactions for account ${accountId}:`, txError);
      }
    }

    return {
      success: true,
      account_id: accountId,
      current_balance: response.data.balance !== null ? response.data.balance / 100 : calculatedBalance / 100,
      currency: response.data.currency,
    };
  } catch (error: any) {
    console.error('Error getting account balance:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
}

export async function createTransfer(
  fromAccountId: string,
  toAccountId: string,
  amount: number,
  description: string
) {
  try {
    // Convert dollars to cents
    const amountInCents = Math.round(amount * 100);

    const response = await increaseApi.post('/account_transfers', {
      account_id: fromAccountId,
      destination_account_id: toAccountId,
      amount: amountInCents,
      description: description,
    });

    return {
      success: true,
      transaction_id: response.data.id,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Error creating transfer:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
}

export async function getAccountTransfers(accountId: string, limit: number = 50) {
  try {
    const response = await increaseApi.get('/account_transfers', {
      params: {
        account_id: accountId,
        limit: limit,
      },
    });

    return {
      success: true,
      transactions: response.data.data.map((transfer: any) => ({
        transaction_id: transfer.id,
        amount: transfer.amount / 100, // Convert from cents to dollars
        description: transfer.description,
        status: transfer.status,
        created_at: transfer.created_at,
      })),
    };
  } catch (error: any) {
    console.error('Error getting account transfers:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
}

export async function getAccountsByEntity(entityId: string) {
  try {
    const response = await increaseApi.get('/accounts', {
      params: {
        entity_id: entityId,
        limit: 100,
      },
    });

    // Fetch balances by calculating from transactions for each account
    const accountsWithBalances = await Promise.all(
      response.data.data.map(async (account: any) => {
        let calculatedBalance = 0;

        // If balance is null, calculate from transactions
        if (account.balance === null) {
          try {
            const txResponse = await increaseApi.get('/transactions', {
              params: {
                account_id: account.id,
                limit: 100,
              },
            });

            // Sum up all transaction amounts
            calculatedBalance = txResponse.data.data.reduce((sum: number, tx: any) => {
              return sum + (tx.amount || 0);
            }, 0);
          } catch (txError) {
            console.warn(`Could not fetch transactions for account ${account.id}:`, txError);
          }
        }

        return {
          account_id: account.id,
          entity_id: account.entity_id,
          name: account.name,
          status: account.status,
          current_balance: account.balance !== null ? account.balance / 100 : calculatedBalance / 100,
          currency: account.currency,
          created_at: account.created_at,
        };
      })
    );

    return {
      success: true,
      accounts: accountsWithBalances,
    };
  } catch (error: any) {
    console.error('Error getting accounts by entity:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
      accounts: [],
    };
  }
}

export async function simulateInboundACH(accountId: string, amount: number, description: string) {
  try {
    // This is for sandbox testing only
    const amountInCents = Math.round(amount * 100);

    const response = await increaseApi.post('/simulations/inbound_ach_transfers', {
      account_number_id: accountId,
      amount: amountInCents,
      description: description,
    });

    return {
      success: true,
      transaction_id: response.data.id,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Error simulating ACH:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
}
