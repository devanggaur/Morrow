import { db } from './db';
import { eq, and, desc } from 'drizzle-orm';
import * as schema from '../shared/schema';

// ============ User Operations ============

export async function createUser(data: {
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}) {
  const [user] = await db.insert(schema.users).values(data).returning();
  return user;
}

export async function getUserByUsername(username: string) {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .limit(1);
  return user;
}

export async function getUserById(id: string) {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return user;
}

export async function updateUser(userId: string, data: Partial<typeof schema.users.$inferInsert>) {
  const [user] = await db
    .update(schema.users)
    .set(data)
    .where(eq(schema.users.id, userId))
    .returning();
  return user;
}

// ============ Plaid Operations ============

export async function savePlaidAccount(userId: string, accountData: any) {
  const [account] = await db
    .insert(schema.plaidAccounts)
    .values({
      userId,
      accountId: accountData.account_id,
      name: accountData.name,
      mask: accountData.mask,
      type: accountData.type,
      subtype: accountData.subtype,
      currentBalance: accountData.balances?.current,
      availableBalance: accountData.balances?.available,
      isoCurrencyCode: accountData.balances?.iso_currency_code,
      rawJson: accountData,
    })
    .onConflictDoUpdate({
      target: schema.plaidAccounts.accountId,
      set: {
        currentBalance: accountData.balances?.current,
        availableBalance: accountData.balances?.available,
        rawJson: accountData,
      },
    })
    .returning();
  return account;
}

export async function saveTransactions(userId: string, transactions: any[]) {
  if (transactions.length === 0) return [];

  const values = transactions.map((t) => ({
    userId,
    transactionId: t.transaction_id,
    accountId: t.account_id,
    date: t.date,
    amount: t.amount,
    merchantName: t.merchant_name,
    merchantCategoryCode: t.merchant_category_code,
    personalFinanceCategory: t.personal_finance_category?.primary,
    personalFinanceSubcategory: t.personal_finance_category?.detailed,
    category: t.category?.[0],
    subcategory: t.category?.[1],
    pending: t.pending,
    paymentMethod: t.payment_meta?.payment_method,
    paymentChannel: t.payment_channel,
    transactionCode: t.transaction_code,
    counterpartiesType: t.counterparties?.[0]?.type,
    counterpartiesName: t.counterparties?.[0]?.name,
    locationAddress: t.location?.address,
    locationCity: t.location?.city,
    locationState: t.location?.region,
    locationZip: t.location?.postal_code,
    locationLat: t.location?.lat,
    locationLon: t.location?.lon,
    rawJson: t,
  }));

  const savedTransactions = await db
    .insert(schema.transactions)
    .values(values)
    .onConflictDoNothing()
    .returning();

  return savedTransactions;
}

export async function getTransactionsByUserId(userId: string, limit: number = 100) {
  const transactions = await db
    .select()
    .from(schema.transactions)
    .where(eq(schema.transactions.userId, userId))
    .orderBy(desc(schema.transactions.date))
    .limit(limit);
  return transactions;
}

export async function saveRecurringStreams(userId: string, streams: any[]) {
  if (streams.length === 0) return [];

  const values = streams.map((s) => ({
    userId,
    streamId: s.stream_id,
    direction: s.direction,
    personalFinanceCategory: s.personal_finance_category,
    merchantName: s.merchant_name,
    averageDaysApart: s.average_days_apart,
    lastAmount: s.last_amount?.amount,
    lastTransactionDate: s.last_date,
    transactionFrequency: s.frequency,
  }));

  const saved = await db
    .insert(schema.recurringStreams)
    .values(values)
    .onConflictDoUpdate({
      target: schema.recurringStreams.streamId,
      set: {
        lastAmount: values[0].lastAmount,
        lastTransactionDate: values[0].lastTransactionDate,
      },
    })
    .returning();

  return saved;
}

// ============ Increase Operations ============

export async function saveIncreaseEntity(userId: string, entityData: any) {
  const [entity] = await db
    .insert(schema.increaseEntities)
    .values({
      userId,
      entityId: entityData.id,
      entityType: entityData.structure,
      firstName: entityData.natural_person?.name?.split(' ')[0],
      lastName: entityData.natural_person?.name?.split(' ').slice(1).join(' '),
      email: entityData.natural_person?.email,
      dateOfBirth: entityData.natural_person?.date_of_birth,
      address: entityData.natural_person?.address?.line1,
      city: entityData.natural_person?.address?.city,
      state: entityData.natural_person?.address?.state,
      zip: entityData.natural_person?.address?.zip,
      phoneNumber: entityData.natural_person?.phone_number,
      rawJson: entityData,
    })
    .onConflictDoNothing()
    .returning();
  return entity;
}

export async function saveIncreaseAccount(
  userId: string,
  accountData: any,
  isMainAccount: boolean = false,
  purpose?: string,
  goalAmount?: number
) {
  const [account] = await db
    .insert(schema.increaseAccounts)
    .values({
      userId,
      accountId: accountData.id,
      entityId: accountData.entity_id,
      accountName: accountData.name,
      purpose,
      goalAmount,
      status: accountData.status,
      currentBalance: accountData.balance ? accountData.balance / 100 : 0,
      isMainAccount,
      rawJson: accountData,
    })
    .onConflictDoUpdate({
      target: schema.increaseAccounts.accountId,
      set: {
        currentBalance: accountData.balance ? accountData.balance / 100 : 0,
        status: accountData.status,
        rawJson: accountData,
      },
    })
    .returning();
  return account;
}

export async function getIncreaseAccountsByUserId(userId: string) {
  const accounts = await db
    .select()
    .from(schema.increaseAccounts)
    .where(eq(schema.increaseAccounts.userId, userId))
    .orderBy(desc(schema.increaseAccounts.isMainAccount));
  return accounts;
}

export async function saveIncreaseTransaction(
  userId: string,
  accountId: string,
  direction: string,
  amount: number,
  description: string
) {
  const [transaction] = await db
    .insert(schema.increaseTransactions)
    .values({
      userId,
      accountId,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      direction,
      amount,
      description,
    })
    .returning();
  return transaction;
}

// ============ Locus Operations ============

export async function saveLocusPayment(userId: string, paymentData: any) {
  const [payment] = await db
    .insert(schema.locusPayments)
    .values({
      userId,
      paymentId: paymentData.payment_id || `payment_${Date.now()}`,
      fromAddress: paymentData.from_address,
      toAddress: paymentData.to_address,
      amount: paymentData.amount,
      currency: paymentData.currency || 'USDC',
      status: paymentData.status || 'completed',
      transactionHash: paymentData.transaction_hash,
      description: paymentData.description,
    })
    .returning();
  return payment;
}

export async function saveLocusFunding(
  userId: string,
  fromAccountId: string,
  amount: number
) {
  const [funding] = await db
    .insert(schema.locusFunding)
    .values({
      userId,
      fundingId: `funding_${Date.now()}`,
      fromAccountId,
      toWalletAddress: process.env.LOCUS_WALLET_ADDRESS || '',
      amount,
      status: 'completed',
    })
    .returning();
  return funding;
}

export async function getLocusPaymentsByUserId(userId: string) {
  const payments = await db
    .select()
    .from(schema.locusPayments)
    .where(eq(schema.locusPayments.userId, userId))
    .orderBy(desc(schema.locusPayments.createdAt));
  return payments;
}

// ============ Savings & Rewards Operations ============

export async function saveReward(
  userId: string,
  rewardType: string,
  amount: number,
  description: string
) {
  const [reward] = await db
    .insert(schema.rewardsHistory)
    .values({
      userId,
      rewardId: `reward_${Date.now()}`,
      rewardType,
      amount,
      description,
    })
    .returning();
  return reward;
}

export async function createWithdrawalRequest(
  userId: string,
  vaultId: string,
  amount: number,
  reason: string,
  impactMessage: string
) {
  const [request] = await db
    .insert(schema.withdrawalRequests)
    .values({
      userId,
      requestId: `wd_${Date.now()}`,
      vaultId,
      amount,
      reason,
      impactMessage,
      status: 'pending',
    })
    .returning();
  return request;
}

export async function getWithdrawalRequest(requestId: string) {
  const [request] = await db
    .select()
    .from(schema.withdrawalRequests)
    .where(eq(schema.withdrawalRequests.requestId, requestId))
    .limit(1);
  return request;
}

export async function completeWithdrawalRequest(requestId: string) {
  const [request] = await db
    .update(schema.withdrawalRequests)
    .set({ status: 'completed', completedAt: new Date() })
    .where(eq(schema.withdrawalRequests.requestId, requestId))
    .returning();
  return request;
}

export async function createChallenge(userId: string, weekStartDate: string) {
  const [challenge] = await db
    .insert(schema.challenges)
    .values({
      userId,
      challengeId: `challenge_${Date.now()}`,
      weekStartDate,
      targetAmount: 35,
      currentProgress: 0,
      status: 'active',
      rewardAmount: 10,
      rewardClaimed: false,
    })
    .returning();
  return challenge;
}

export async function getCurrentChallenge(userId: string) {
  const [challenge] = await db
    .select()
    .from(schema.challenges)
    .where(
      and(
        eq(schema.challenges.userId, userId),
        eq(schema.challenges.status, 'active')
      )
    )
    .orderBy(desc(schema.challenges.createdAt))
    .limit(1);
  return challenge;
}

export async function updateChallengeProgress(
  challengeId: string,
  amount: number
) {
  const [challenge] = await db
    .select()
    .from(schema.challenges)
    .where(eq(schema.challenges.challengeId, challengeId))
    .limit(1);

  if (!challenge) return null;

  const newProgress = (challenge.currentProgress || 0) + amount;
  const [updated] = await db
    .update(schema.challenges)
    .set({ currentProgress: newProgress })
    .where(eq(schema.challenges.challengeId, challengeId))
    .returning();

  return updated;
}

export async function recordChallengeSave(
  challengeId: string,
  amount: number,
  saveDate: string
) {
  const [save] = await db
    .insert(schema.challengeSaves)
    .values({
      challengeId,
      amount,
      saveDate,
    })
    .returning();
  return save;
}

// ============ User Settings ============

export async function getUserSettings(userId: string) {
  const [settings] = await db
    .select()
    .from(schema.userSettings)
    .where(eq(schema.userSettings.userId, userId))
    .limit(1);

  if (!settings) {
    // Create default settings
    const [newSettings] = await db
      .insert(schema.userSettings)
      .values({
        userId,
        autoSaveFixed: 0,
        autoSavePercentage: 0,
        notificationsEnabled: true,
      })
      .returning();
    return newSettings;
  }

  return settings;
}

export async function updateUserSettings(
  userId: string,
  data: Partial<typeof schema.userSettings.$inferInsert>
) {
  const [settings] = await db
    .update(schema.userSettings)
    .set(data)
    .where(eq(schema.userSettings.userId, userId))
    .returning();
  return settings;
}
