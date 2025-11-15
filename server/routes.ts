import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as plaidClient from "./plaidClient";
import * as increaseClient from "./increaseClient";
import * as locusClient from "./locusClient";
import * as savingsAgent from "./savingsAgent";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
      const { messages } = req.body;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are Morrow, an AI financial coach. You're warm, friendly, and non-judgmental.
Your goal is to help users build better money habits through behavioral insights and gentle nudges.
Keep responses conversational, concise, and encouraging. Use emojis sparingly but appropriately.
Focus on:
- Behavioral economics principles (temporal landmarks, mental accounting, loss aversion)
- Positive reinforcement and encouragement
- Practical, actionable advice
- Understanding emotional relationships with money
Never be preachy or condescending. Always be supportive.`,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      res.json({
        success: true,
        message: completion.choices[0].message.content,
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
