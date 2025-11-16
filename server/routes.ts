import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as plaidClient from "./plaidClient";
import * as increaseClient from "./increaseClient";
import * as locusClient from "./locusClient";
import * as savingsAgent from "./savingsAgent";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function registerRoutes(app: Express): Promise<Server> {

  // ============ Plaid Routes ============

  // Create Link Token
  app.post("/api/plaid/create_link_token", async (req, res) => {
    try {
      const { userId } = req.body;
      const result = await plaidClient.createLinkToken(userId || 'user-' + Date.now());

      if (result.success) {
        res.json({ link_token: result.link_token });
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Exchange Public Token
  app.post("/api/plaid/exchange_public_token", async (req, res) => {
    try {
      const { public_token, userId } = req.body;
      const result = await plaidClient.exchangePublicToken(public_token);

      if (result.success) {
        // TODO: Save access_token and item_id to user record in database
        res.json({
          access_token: result.access_token,
          item_id: result.item_id,
        });
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get Accounts
  app.post("/api/plaid/accounts", async (req, res) => {
    try {
      const { access_token } = req.body;
      const result = await plaidClient.getAccounts(access_token);

      if (result.success) {
        res.json({ accounts: result.accounts });
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get Transactions
  app.post("/api/plaid/transactions", async (req, res) => {
    try {
      const { access_token, start_date, end_date, count } = req.body;
      const result = await plaidClient.getTransactions(access_token, start_date, end_date, count);

      if (result.success) {
        res.json({
          transactions: result.transactions,
          accounts: result.accounts,
          total_transactions: result.total_transactions,
        });
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get Recurring Transactions
  app.post("/api/plaid/recurring_transactions", async (req, res) => {
    try {
      const { access_token } = req.body;
      const result = await plaidClient.getRecurringTransactions(access_token);

      if (result.success) {
        res.json({
          inflow_streams: result.inflow_streams,
          outflow_streams: result.outflow_streams,
        });
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get Item
  app.post("/api/plaid/item", async (req, res) => {
    try {
      const { access_token } = req.body;
      const result = await plaidClient.getItem(access_token);

      if (result.success) {
        res.json({ item: result.item });
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Increase Routes ============

  // Create Entity
  app.post("/api/increase/entity", async (req, res) => {
    try {
      const result = await increaseClient.createEntity(req.body);

      if (result.success) {
        res.json({
          success: true,
          entity_id: result.entity_id,
          data: result.data,
        });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get Entity
  app.get("/api/increase/entity/:entityId", async (req, res) => {
    try {
      const { entityId } = req.params;
      const result = await increaseClient.getEntity(entityId);

      if (result.success) {
        res.json({ success: true, entity: result.entity });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get All Accounts for Entity
  app.get("/api/increase/accounts/:entityId", async (req, res) => {
    try {
      const { entityId } = req.params;
      const result = await increaseClient.getAccountsByEntity(entityId);

      if (result.success) {
        res.json({ success: true, accounts: result.accounts });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create Account (Main or Vault)
  app.post("/api/increase/account", async (req, res) => {
    try {
      const { entityId, name } = req.body;
      const result = await increaseClient.createAccount(entityId, name);

      if (result.success) {
        res.json({
          success: true,
          account_id: result.account_id,
          data: result.data,
        });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create Vault
  app.post("/api/increase/vault", async (req, res) => {
    try {
      const { entityId, name } = req.body;
      const result = await increaseClient.createAccount(entityId, name);

      if (result.success) {
        // TODO: Save vault with purpose and goal amount to database
        res.json({
          success: true,
          account_id: result.account_id,
          data: result.data,
        });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get Account
  app.get("/api/increase/account/:accountId", async (req, res) => {
    try {
      const { accountId } = req.params;
      const result = await increaseClient.getAccount(accountId);

      if (result.success) {
        res.json({ success: true, account: result.account });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get Account Balance
  app.get("/api/increase/balance/:accountId", async (req, res) => {
    try {
      const { accountId } = req.params;
      const result = await increaseClient.getAccountBalance(accountId);

      if (result.success) {
        res.json({
          success: true,
          account_id: result.account_id,
          current_balance: result.current_balance,
          currency: result.currency,
        });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Transfer Between Accounts
  app.post("/api/increase/transfer", async (req, res) => {
    try {
      const { fromAccountId, toAccountId, amount, description } = req.body;
      const result = await increaseClient.createTransfer(
        fromAccountId,
        toAccountId,
        amount,
        description
      );

      if (result.success) {
        res.json({
          success: true,
          transaction_id: result.transaction_id,
          data: result.data,
        });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get Account Transactions
  app.get("/api/increase/transactions/:accountId", async (req, res) => {
    try {
      const { accountId } = req.params;
      const { limit } = req.query;
      const result = await increaseClient.getAccountTransfers(
        accountId,
        limit ? parseInt(limit as string) : 50
      );

      if (result.success) {
        res.json({
          success: true,
          transactions: result.transactions,
        });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Simulate Inbound ACH (Sandbox only)
  app.post("/api/increase/simulate/inbound_ach", async (req, res) => {
    try {
      const { accountId, amount, description } = req.body;
      const result = await increaseClient.simulateInboundACH(accountId, amount, description);

      if (result.success) {
        res.json({
          success: true,
          transaction_id: result.transaction_id,
          data: result.data,
        });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============ Locus Routes ============

  // Get Wallet Balance
  app.get("/api/locus/wallet", async (req, res) => {
    try {
      const { userId } = req.query;
      const result = await locusClient.getWalletBalance(userId as string || 'default_user');

      if (result.success) {
        // Disable caching so balance updates are always fetched
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.json({
          success: true,
          balance: result.balance,
          totalRewards: result.totalRewards,
          currency: result.currency,
        });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get Wallet Address
  app.get("/api/locus/wallet/address", async (req, res) => {
    try {
      const result = await locusClient.getWalletAddress();

      if (result.success) {
        res.json({
          success: true,
          address: result.address,
          network: result.network,
        });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get Charities
  app.get("/api/locus/charities", async (req, res) => {
    try {
      const result = locusClient.getCharities();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Send Donation
  app.post("/api/locus/donate", async (req, res) => {
    try {
      const { charityId, amount, fromAddress } = req.body;
      const result = await locusClient.sendDonation(charityId, amount, fromAddress);

      if (result.success) {
        res.json({
          success: true,
          payment_id: result.payment_id,
          transaction_hash: result.transaction_hash,
        });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Check Streak Bonus
  app.post("/api/locus/streak/check", async (req, res) => {
    try {
      const { streak } = req.body;
      const result = locusClient.checkStreakBonus(streak);
      res.json({
        success: true,
        eligible: result.eligible,
        amount: result.amount,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Distribute USDC Reward (Agent Payment)
  app.post("/api/locus/reward/distribute", async (req, res) => {
    try {
      const { userId, savingsAmount, rewardType, description } = req.body;
      const result = await locusClient.distributeReward(
        userId,
        savingsAmount,
        rewardType,
        description
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get Wallet Transactions
  app.get("/api/locus/wallet/transactions", async (req, res) => {
    try {
      const { userId, limit } = req.query;
      const result = await locusClient.getWalletTransactions(
        userId as string || 'default_user',
        limit ? parseInt(limit as string) : 50
      );

      // Disable caching so new transactions are always fetched
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get Gift Cards Catalog
  app.get("/api/locus/gift-cards", async (req, res) => {
    try {
      const result = locusClient.getGiftCards();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Redeem Gift Card
  app.post("/api/locus/gift-cards/redeem", async (req, res) => {
    try {
      const { userId, giftCardId, amount } = req.body;
      const result = await locusClient.redeemGiftCard(
        userId || 'default_user',
        giftCardId,
        amount
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============ Savings Agent Routes ============

  // Detect Windfall
  app.post("/api/savings/windfall/detect", async (req, res) => {
    try {
      const { transactions } = req.body;
      const result = savingsAgent.detectWindfall(transactions);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analyze Smart Sweep
  app.post("/api/savings/sweep/analyze", async (req, res) => {
    try {
      const { transactions } = req.body;
      const result = savingsAgent.analyzeWeeklySweep(transactions);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analyze Round-ups
  app.post("/api/savings/roundups/analyze", async (req, res) => {
    try {
      const { transactions } = req.body;
      const result = savingsAgent.analyzeRoundups(transactions);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Run Triple Play Analysis
  app.post("/api/savings/analyze", async (req, res) => {
    try {
      const { transactions } = req.body;
      const result = savingsAgent.runTriplePlayAnalysis(transactions);
      res.json({
        success: true,
        opportunities: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Check Fresh Start
  app.get("/api/savings/fresh-start/check", async (req, res) => {
    try {
      const { userId } = req.query;
      const result = savingsAgent.detectFreshStart(userId as string || 'default_user');
      res.json({
        success: true,
        freshStart: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Calculate Withdrawal Impact
  app.post("/api/savings/withdrawal/impact", async (req, res) => {
    try {
      const { vaultGoal, currentBalance, withdrawAmount } = req.body;
      const result = savingsAgent.calculateWithdrawalImpact(
        vaultGoal,
        currentBalance,
        withdrawAmount
      );
      res.json({
        success: true,
        impact: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============ AI Coach Routes ============

  // Chat with AI Coach
  app.post("/api/coach/chat", async (req, res) => {
    try {
      const { messages, userId, plaidAccessToken, increaseMainAccountId } = req.body;

      // Fetch user's financial data
      let financialContext = '';

      // Fetch Plaid transactions if available
      if (plaidAccessToken) {
        try {
          const endDate = new Date().toISOString().split('T')[0];
          const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const plaidResult = await plaidClient.getTransactions(plaidAccessToken, startDate, endDate, 100);

          if (plaidResult.success && plaidResult.transactions) {
            const totalSpending = plaidResult.transactions
              .filter((t: any) => t.amount > 0)
              .reduce((sum: number, t: any) => sum + t.amount, 0);

            const categoryBreakdown: Record<string, number> = {};
            plaidResult.transactions.forEach((t: any) => {
              const category = t.category?.[0] || 'Other';
              categoryBreakdown[category] = (categoryBreakdown[category] || 0) + t.amount;
            });

            financialContext += `\n\n**Recent Transactions (Last 30 Days):**
- Total transactions: ${plaidResult.transactions.length}
- Total spending: $${totalSpending.toFixed(2)}
- Top categories: ${Object.entries(categoryBreakdown)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .slice(0, 5)
              .map(([cat, amt]) => `${cat}: $${(amt as number).toFixed(2)}`)
              .join(', ')}
- Recent transactions: ${plaidResult.transactions.slice(0, 5).map((t: any) =>
  `${t.name} ($${t.amount.toFixed(2)} on ${t.date})`).join('; ')}`;
          }
        } catch (error) {
          console.error('Error fetching Plaid data:', error);
        }
      }

      // Fetch Increase account balance if available
      if (increaseMainAccountId) {
        try {
          const balanceResult = await increaseClient.getAccountBalance(increaseMainAccountId);
          if (balanceResult.success) {
            const balanceInDollars = (balanceResult.current_balance || 0) / 100;
            financialContext += `\n\n**Savings Account:**
- Current balance: $${balanceInDollars.toFixed(2)}`;
          }
        } catch (error) {
          console.error('Error fetching Increase balance:', error);
        }
      }

      // Fetch Locus wallet data
      try {
        const walletResult = await locusClient.getWalletBalance(userId || 'default_user');
        if (walletResult.success) {
          financialContext += `\n\n**Crypto Rewards (USDC):**
- Balance: ${walletResult.balance} USDC
- Total rewards earned: ${walletResult.totalRewards} USDC`;
        }
      } catch (error) {
        console.error('Error fetching Locus wallet:', error);
      }

      // Build system prompt with financial context
      const systemPrompt = `You are Morrow, an AI financial coach. You're warm, friendly, and non-judgmental.
Your goal is to help users build better money habits through behavioral insights and gentle nudges.
Keep responses conversational, concise, and encouraging.

Focus on:
- Behavioral economics principles (temporal landmarks, mental accounting, loss aversion)
- Positive reinforcement and encouragement
- Practical, actionable advice
- Understanding emotional relationships with money
Never be preachy or condescending. Always be supportive.

${financialContext ? `**USER'S FINANCIAL DATA:**${financialContext}

Use this data to provide personalized insights and answer their questions about spending, savings, and financial habits.` : 'The user has not connected their financial accounts yet. Encourage them to do so for personalized insights.'}`;

      // Convert messages to Anthropic format
      const anthropicMessages = messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      }));

      // Call Claude API
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: systemPrompt,
        messages: anthropicMessages,
      });

      const messageContent = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      res.json({
        success: true,
        message: messageContent,
      });
    } catch (error: any) {
      console.error('Error in AI chat:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============ Health Check ============

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
