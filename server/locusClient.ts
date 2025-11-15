import axios from 'axios';

const locusApi = axios.create({
  baseURL: process.env.LOCUS_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.LOCUS_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function getWalletBalance(userId: string) {
  try {
    // In a real implementation, this would fetch from the Locus API
    // For now, we'll return demo data structure
    return {
      success: true,
      balance: 0,
      totalRewards: 0,
      currency: 'USDC',
    };
  } catch (error: any) {
    console.error('Error getting wallet balance:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getWalletAddress() {
  try {
    return {
      success: true,
      address: process.env.LOCUS_WALLET_ADDRESS,
      network: 'polygon',
    };
  } catch (error: any) {
    console.error('Error getting wallet address:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function sendPayment(data: {
  fromAddress: string;
  toAddress: string;
  amount: number;
  currency: string;
  description: string;
}) {
  try {
    const response = await locusApi.post('/payments', {
      from_address: data.fromAddress,
      to_address: data.toAddress,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
    });

    return {
      success: true,
      payment_id: response.data.id,
      transaction_hash: response.data.transaction_hash,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Error sending payment:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

export async function getPaymentStatus(paymentId: string) {
  try {
    const response = await locusApi.get(`/payments/${paymentId}`);

    return {
      success: true,
      payment: response.data,
    };
  } catch (error: any) {
    console.error('Error getting payment status:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

// Streak-based rewards
const STREAK_BONUSES: { [key: number]: number } = {
  4: 10,   // 4 weeks → $10 USDC
  8: 15,   // 8 weeks → $15 USDC
  12: 25,  // 12 weeks → $25 USDC
};

export function checkStreakBonus(streak: number): { eligible: boolean; amount: number } {
  if (STREAK_BONUSES[streak]) {
    return {
      eligible: true,
      amount: STREAK_BONUSES[streak],
    };
  }
  return {
    eligible: false,
    amount: 0,
  };
}

// Predefined charities
export const CHARITIES = [
  {
    charity_id: 'charity_giveDirectly',
    charity_name: 'GiveDirectly',
    wallet_address: '0x750EF1D7a0b4Ab1c97B7A623D7917CcEb5ea779C',
    description: 'Direct cash transfers to people living in extreme poverty',
    website: 'https://www.givedirectly.org',
    impact_description: 'Your donation provides direct cash to families in need',
  },
  {
    charity_id: 'charity_redCross',
    charity_name: 'American Red Cross',
    wallet_address: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
    description: 'Emergency disaster relief and humanitarian aid',
    website: 'https://www.redcross.org',
    impact_description: 'Helps provide emergency relief during disasters',
  },
  {
    charity_id: 'charity_waterOrg',
    charity_name: 'Water.org',
    wallet_address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    description: 'Bringing safe water and sanitation to the world',
    website: 'https://www.water.org',
    impact_description: 'Provides access to clean water for communities in need',
  },
];

export function getCharities() {
  return {
    success: true,
    charities: CHARITIES,
  };
}

export async function sendDonation(
  charityId: string,
  amount: number,
  fromAddress: string
) {
  try {
    const charity = CHARITIES.find(c => c.charity_id === charityId);
    if (!charity) {
      return {
        success: false,
        error: 'Charity not found',
      };
    }

    const result = await sendPayment({
      fromAddress,
      toAddress: charity.wallet_address,
      amount,
      currency: 'USDC',
      description: `Donation to ${charity.charity_name}`,
    });

    return result;
  } catch (error: any) {
    console.error('Error sending donation:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
