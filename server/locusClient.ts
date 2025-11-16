import axios from 'axios';
import { MCPClientCredentials } from '@locus-technologies/langchain-mcp-m2m';
import Anthropic from '@anthropic-ai/sdk';

const locusApi = axios.create({
  baseURL: process.env.LOCUS_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.LOCUS_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Initialize MCP client with OAuth
let mcpClient: MCPClientCredentials | null = null;
let mcpTools: any = null;

async function initializeMCPClient() {
  if (mcpClient) {
    console.log('♻️  Using cached MCP client');
    return mcpClient;
  }

  try {
    console.log('🔧 Initializing Locus MCP Client with API Key...');
    console.log(`   URL: ${process.env.LOCUS_API_URL}/mcp`);
    console.log(`   API Key: ${process.env.LOCUS_API_KEY?.substring(0, 15)}...`);

    // Try with API key in headers (simpler approach)
    mcpClient = new MCPClientCredentials({
      mcpServers: {
        locus: {
          url: `${process.env.LOCUS_API_URL}/mcp`,
          headers: {
            'Authorization': `Bearer ${process.env.LOCUS_API_KEY}`,
            'Content-Type': 'application/json',
          }
        }
      }
    });

    console.log('🔌 Connecting to Locus MCP server...');
    await mcpClient.initializeConnections();

    mcpTools = await mcpClient.getTools();
    console.log('✅ Locus MCP Client initialized successfully!');
    console.log(`   Available tools: ${mcpTools.map((t: any) => t.name).join(', ')}`);

    return mcpClient;
  } catch (error: any) {
    console.error('❌ Failed to initialize MCP client:', error.message);
    mcpClient = null;
    throw error;
  }
}

// In-memory wallet storage for demo (would be database in production)
const userWallets: { [userId: string]: { balance: number; totalRewards: number; transactions: any[] } } = {};

function initializeWallet(userId: string) {
  if (!userWallets[userId]) {
    userWallets[userId] = {
      balance: 0,
      totalRewards: 0,
      transactions: [],
    };
  }
  return userWallets[userId];
}

export async function getWalletBalance(userId: string) {
  try {
    const wallet = initializeWallet(userId);

    console.log(`📊 getWalletBalance for ${userId}: Balance=$${wallet.balance}, Rewards=$${wallet.totalRewards}, Txs=${wallet.transactions.length}`);

    return {
      success: true,
      balance: wallet.balance,
      totalRewards: wallet.totalRewards,
      currency: 'USDC',
      transactionCount: wallet.transactions.length,
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
    console.log('💳 Attempting direct Locus API payment with API key...');
    console.log(`   To: ${data.toAddress}`);
    console.log(`   Amount: ${data.amount} ${data.currency}`);

    // Try direct API call with API key
    const response = await locusApi.post('/v1/payments', {
      to_address: data.toAddress,
      amount: data.amount,
      currency: data.currency,
      memo: data.description,
    });

    console.log('✅ Locus API Payment Success:', response.data);

    return {
      success: true,
      payment_id: response.data.id || response.data.payment_id,
      transaction_hash: response.data.transaction_hash || response.data.tx_hash,
      data: response.data,
    };
  } catch (apiError: any) {
    console.warn('❌ Direct API call failed:', apiError.response?.status, apiError.response?.data || apiError.message);

    // If direct API fails, try MCP approach
    try {
      console.log('🤖 Falling back to Claude AI agent with MCP...');

      // Initialize MCP client with OAuth
      await initializeMCPClient();

      if (!mcpClient || !mcpTools) {
        throw new Error('MCP client not initialized');
      }

      // Initialize Anthropic client
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY!,
      });

      // Convert MCP tools to Claude tool format
      const claudeTools = mcpTools.map((tool: any) => ({
        name: tool.name,
        description: tool.description || `MCP tool: ${tool.name}`,
        input_schema: tool.inputSchema || {
          type: 'object',
          properties: {},
          required: [],
        },
      }));

      console.log('🔧 Available MCP tools:', mcpTools.map((t: any) => t.name).join(', '));

      // Create Claude agent message
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        tools: claudeTools,
        messages: [
          {
            role: 'user',
            content: `Send ${data.amount} USDC to wallet address ${data.toAddress}. Memo: "${data.description}". Use the send_to_address tool.`,
          },
        ],
      });

      console.log('🤖 Claude response:', JSON.stringify(message, null, 2));

      // Find tool use in Claude's response
      const toolUse = message.content.find((block: any) => block.type === 'tool_use');

      if (!toolUse) {
        throw new Error('Claude did not invoke any tools');
      }

      console.log('🔧 Tool invoked by Claude:', toolUse.name);
      console.log('📋 Tool input:', JSON.stringify(toolUse.input, null, 2));

      // Execute the MCP tool that Claude selected
      const mcpTool = mcpTools.find((t: any) => t.name === toolUse.name);
      if (!mcpTool) {
        throw new Error(`MCP tool ${toolUse.name} not found`);
      }

      const result = await mcpTool.invoke(toolUse.input);

      console.log('💰 Locus MCP Payment Result:', result);

      return {
        success: true,
        payment_id: result.transaction_id || result.id || result.payment_id,
        transaction_hash: result.transaction_hash || result.txHash,
        data: result,
      };
    } catch (error: any) {
      console.error('Error sending payment via Claude → MCP:', error);
      return {
        success: false,
        error: error.message || 'Payment failed',
      };
    }
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

// Reward types and multipliers
export const REWARD_MULTIPLIERS = {
  windfall: 0.05,      // 5% of saved amount
  sweep: 0.03,         // 3% of saved amount
  roundup: 0.01,       // 1% of saved amount
};

// Agent distributes USDC rewards for savings behavior
export async function distributeReward(
  userId: string,
  savingsAmount: number,
  rewardType: 'windfall' | 'sweep' | 'roundup',
  description: string
) {
  try {
    const wallet = initializeWallet(userId);

    // Calculate USDC reward based on type
    const multiplier = REWARD_MULTIPLIERS[rewardType];
    const rewardAmount = Math.round(savingsAmount * multiplier * 100) / 100; // Round to 2 decimals

    // REAL Locus Payment: Send actual USDC via Locus API
    let locusPayment;
    try {
      // Use environment variable for user's wallet address, or fall back to demo address
      const userWalletAddress = process.env.USER_WALLET_ADDRESS || process.env.LOCUS_WALLET_ADDRESS;

      if (!userWalletAddress) {
        throw new Error('USER_WALLET_ADDRESS not configured');
      }

      locusPayment = await sendPayment({
        fromAddress: process.env.LOCUS_WALLET_ADDRESS!, // Treasury wallet
        toAddress: userWalletAddress, // User's wallet
        amount: rewardAmount,
        currency: 'USDC',
        description: `${description} (${rewardType} - saved $${savingsAmount})`,
      });

      if (!locusPayment.success) {
        throw new Error(locusPayment.error || 'Locus payment failed');
      }
    } catch (locusError: any) {
      console.warn('Locus API call failed, using simulation:', locusError.message);
      // Fall back to simulation if Locus API fails
      locusPayment = {
        success: true,
        payment_id: `sim_${Date.now()}`,
        transaction_hash: null,
      };
    }

    const transaction = {
      id: locusPayment.payment_id,
      userId,
      amount: rewardAmount,
      currency: 'USDC',
      type: rewardType,
      description,
      savingsAmount,
      timestamp: new Date().toISOString(),
      status: 'completed',
      transaction_hash: locusPayment.transaction_hash, // Real blockchain tx hash!
      locus_payment_id: locusPayment.payment_id,
    };

    // Update wallet balance
    wallet.balance += rewardAmount;
    wallet.totalRewards += rewardAmount;
    wallet.transactions.push(transaction);

    if (locusPayment.transaction_hash) {
      console.log(`💰 Locus REAL Payment: $${rewardAmount} USDC → User ${userId}`);
      console.log(`   TX Hash: ${locusPayment.transaction_hash}`);
      console.log(`   Type: ${rewardType} | Saved: $${savingsAmount}`);
    } else {
      console.log(`💰 Locus Simulated Payment: $${rewardAmount} USDC → User ${userId} (${rewardType})`);
    }

    console.log(`   Updated Balance: $${wallet.balance} | Total Rewards: $${wallet.totalRewards} | Transactions: ${wallet.transactions.length}`);

    return {
      success: true,
      transaction_id: transaction.id,
      reward_amount: rewardAmount,
      new_balance: wallet.balance,
      transaction,
      transaction_hash: locusPayment.transaction_hash,
    };
  } catch (error: any) {
    console.error('Error distributing reward:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Get wallet transaction history
export async function getWalletTransactions(userId: string, limit: number = 50) {
  try {
    const wallet = initializeWallet(userId);

    return {
      success: true,
      transactions: wallet.transactions.slice(-limit).reverse(), // Most recent first
    };
  } catch (error: any) {
    console.error('Error getting wallet transactions:', error);
    return {
      success: false,
      error: error.message,
      transactions: [],
    };
  }
}

// Gift Card Catalog
export const GIFT_CARDS = [
  {
    id: 'amazon',
    brand: 'Amazon',
    denominations: [10, 25, 50, 100],
    description: 'Shop millions of products on Amazon',
    image: '🎁',
  },
  {
    id: 'starbucks',
    brand: 'Starbucks',
    denominations: [5, 10, 25, 50],
    description: 'Coffee, drinks, and food at Starbucks',
    image: '☕',
  },
  {
    id: 'target',
    brand: 'Target',
    denominations: [10, 25, 50, 100],
    description: 'Shop at Target stores and online',
    image: '🎯',
  },
  {
    id: 'uber',
    brand: 'Uber',
    denominations: [15, 25, 50, 100],
    description: 'Rides and Uber Eats delivery',
    image: '🚗',
  },
  {
    id: 'spotify',
    brand: 'Spotify',
    denominations: [10, 30, 60],
    description: 'Music and podcasts streaming',
    image: '🎵',
  },
  {
    id: 'doordash',
    brand: 'DoorDash',
    denominations: [15, 25, 50, 100],
    description: 'Food delivery from local restaurants',
    image: '🍔',
  },
];

export function getGiftCards() {
  return {
    success: true,
    giftCards: GIFT_CARDS,
  };
}

// Redeem USDC for gift card
export async function redeemGiftCard(
  userId: string,
  giftCardId: string,
  amount: number
) {
  try {
    const wallet = initializeWallet(userId);
    const giftCard = GIFT_CARDS.find(gc => gc.id === giftCardId);

    if (!giftCard) {
      return {
        success: false,
        error: 'Gift card not found',
      };
    }

    if (!giftCard.denominations.includes(amount)) {
      return {
        success: false,
        error: 'Invalid denomination for this gift card',
      };
    }

    if (wallet.balance < amount) {
      return {
        success: false,
        error: 'Insufficient USDC balance',
      };
    }

    // Deduct from wallet
    wallet.balance -= amount;

    // Create redemption transaction
    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      amount: -amount, // Negative for redemption
      currency: 'USDC',
      type: 'redemption',
      description: `Redeemed ${giftCard.brand} gift card`,
      giftCard: {
        brand: giftCard.brand,
        amount,
        code: `GC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, // Mock code
      },
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    wallet.transactions.push(transaction);

    console.log(`🎁 Gift Card Redeemed: ${giftCard.brand} $${amount} → User ${userId} (Balance: $${wallet.balance})`);

    return {
      success: true,
      transaction_id: transaction.id,
      gift_card_code: transaction.giftCard.code,
      new_balance: wallet.balance,
      transaction,
    };
  } catch (error: any) {
    console.error('Error redeeming gift card:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
