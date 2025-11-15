import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

export async function createLinkToken(userId: string) {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: 'Morrow',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    });

    return {
      success: true,
      link_token: response.data.link_token,
    };
  } catch (error: any) {
    console.error('Error creating link token:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function exchangePublicToken(publicToken: string) {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    return {
      success: true,
      access_token: response.data.access_token,
      item_id: response.data.item_id,
    };
  } catch (error: any) {
    console.error('Error exchanging public token:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getAccounts(accessToken: string) {
  try {
    const response = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    return {
      success: true,
      accounts: response.data.accounts,
    };
  } catch (error: any) {
    console.error('Error getting accounts:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getTransactions(
  accessToken: string,
  startDate: string,
  endDate: string,
  count: number = 100
) {
  try {
    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: {
        count,
        include_personal_finance_category: true,
      },
    });

    return {
      success: true,
      transactions: response.data.transactions,
      accounts: response.data.accounts,
      total_transactions: response.data.total_transactions,
    };
  } catch (error: any) {
    console.error('Error getting transactions:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getRecurringTransactions(accessToken: string) {
  try {
    const response = await plaidClient.transactionsRecurringGet({
      access_token: accessToken,
    });

    return {
      success: true,
      inflow_streams: response.data.inflow_streams,
      outflow_streams: response.data.outflow_streams,
    };
  } catch (error: any) {
    console.error('Error getting recurring transactions:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getItem(accessToken: string) {
  try {
    const response = await plaidClient.itemGet({
      access_token: accessToken,
    });

    return {
      success: true,
      item: response.data.item,
    };
  } catch (error: any) {
    console.error('Error getting item:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
