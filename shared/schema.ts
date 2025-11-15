import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============ User Management ============
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  plaidAccessToken: text("plaid_access_token"),
  plaidItemId: text("plaid_item_id"),
  increaseEntityId: text("increase_entity_id"),
  walletBalance: real("wallet_balance").default(0),
  savingsStreak: integer("savings_streak").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  autoSaveFixed: real("auto_save_fixed").default(0),
  autoSavePercentage: real("auto_save_percentage").default(0),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ Plaid Integration ============
export const plaidAccounts = pgTable("plaid_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  accountId: text("account_id").notNull().unique(),
  name: text("name"),
  mask: text("mask"),
  type: text("type"),
  subtype: text("subtype"),
  currentBalance: real("current_balance"),
  availableBalance: real("available_balance"),
  isoCurrencyCode: text("iso_currency_code"),
  rawJson: jsonb("raw_json"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  transactionId: text("transaction_id").notNull().unique(),
  accountId: text("account_id").notNull(),
  date: text("date"),
  amount: real("amount"),
  merchantName: text("merchant_name"),
  merchantCategoryCode: text("merchant_category_code"),
  personalFinanceCategory: text("personal_finance_category"),
  personalFinanceSubcategory: text("personal_finance_subcategory"),
  category: text("category"),
  subcategory: text("subcategory"),
  pending: boolean("pending"),
  paymentMethod: text("payment_method"),
  paymentChannel: text("payment_channel"),
  transactionCode: text("transaction_code"),
  counterpartiesType: text("counterparties_type"),
  counterpartiesName: text("counterparties_name"),
  locationAddress: text("location_address"),
  locationCity: text("location_city"),
  locationState: text("location_state"),
  locationZip: text("location_zip"),
  locationLat: real("location_lat"),
  locationLon: real("location_lon"),
  rawJson: jsonb("raw_json"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recurringStreams = pgTable("recurring_streams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  streamId: text("stream_id").notNull().unique(),
  direction: text("direction"),
  personalFinanceCategory: text("personal_finance_category"),
  merchantName: text("merchant_name"),
  averageDaysApart: integer("average_days_apart"),
  lastAmount: real("last_amount"),
  lastTransactionDate: text("last_transaction_date"),
  transactionFrequency: text("transaction_frequency"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ Increase Banking ============
export const increaseEntities = pgTable("increase_entities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  entityId: text("entity_id").notNull().unique(),
  entityType: text("entity_type"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  dateOfBirth: text("date_of_birth"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  phoneNumber: text("phone_number"),
  ssnLast4: text("ssn_last_4"),
  rawJson: jsonb("raw_json"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const increaseAccounts = pgTable("increase_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  accountId: text("account_id").notNull().unique(),
  entityId: text("entity_id").notNull(),
  accountName: text("account_name"),
  purpose: text("purpose"),
  goalAmount: real("goal_amount"),
  status: text("status"),
  currentBalance: real("current_balance"),
  isMainAccount: boolean("is_main_account").default(false),
  rawJson: jsonb("raw_json"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const increaseTransactions = pgTable("increase_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  transactionId: text("transaction_id").notNull().unique(),
  accountId: text("account_id").notNull(),
  direction: text("direction"),
  amount: real("amount"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ Locus Wallet ============
export const locusPayments = pgTable("locus_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  paymentId: text("payment_id").notNull().unique(),
  fromAddress: text("from_address"),
  toAddress: text("to_address"),
  amount: real("amount"),
  currency: text("currency").default("USDC"),
  status: text("status"),
  transactionHash: text("transaction_hash"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const locusFunding = pgTable("locus_funding", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fundingId: text("funding_id").notNull().unique(),
  fromAccountId: text("from_account_id"),
  toWalletAddress: text("to_wallet_address"),
  amount: real("amount"),
  status: text("status"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const charityRecipients = pgTable("charity_recipients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  charityId: text("charity_id").notNull().unique(),
  charityName: text("charity_name"),
  walletAddress: text("wallet_address"),
  description: text("description"),
  website: text("website"),
  impactDescription: text("impact_description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ Savings & Gamification ============
export const rewardsHistory = pgTable("rewards_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  rewardId: text("reward_id").notNull().unique(),
  rewardType: text("reward_type"),
  amount: real("amount"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  requestId: text("request_id").notNull().unique(),
  vaultId: text("vault_id").notNull(),
  amount: real("amount"),
  reason: text("reason"),
  impactMessage: text("impact_message"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  challengeId: text("challenge_id").notNull().unique(),
  weekStartDate: text("week_start_date"),
  targetAmount: real("target_amount").default(35),
  currentProgress: real("current_progress").default(0),
  status: text("status").default("active"),
  rewardAmount: real("reward_amount").default(10),
  rewardClaimed: boolean("reward_claimed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challengeSaves = pgTable("challenge_saves", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: text("challenge_id").notNull(),
  saveDate: text("save_date"),
  amount: real("amount"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const autonomousActions = pgTable("autonomous_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  actionId: text("action_id").notNull().unique(),
  actionType: text("action_type"),
  amount: real("amount"),
  reasoning: text("reasoning"),
  status: text("status"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ Zod Schemas ============
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type PlaidAccount = typeof plaidAccounts.$inferSelect;
export type IncreaseAccount = typeof increaseAccounts.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
