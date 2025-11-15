import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plaidAPI, increaseAPI, locusAPI, savingsAPI, coachAPI } from '@/lib/api';

// ============ Plaid Hooks ============

export function usePlaidLinkToken(userId: string) {
  return useQuery({
    queryKey: ['plaid-link-token', userId],
    queryFn: () => plaidAPI.createLinkToken(userId),
  });
}

export function usePlaidAccounts(accessToken: string | null) {
  return useQuery({
    queryKey: ['plaid-accounts', accessToken],
    queryFn: () => plaidAPI.getAccounts(accessToken!),
    enabled: !!accessToken,
  });
}

export function usePlaidTransactions(
  accessToken: string | null,
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: ['plaid-transactions', accessToken, startDate, endDate],
    queryFn: () => plaidAPI.getTransactions(accessToken!, startDate, endDate, 500),
    enabled: !!accessToken,
  });
}

// ============ Increase Hooks ============

export function useCreateIncreaseEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: increaseAPI.createEntity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['increase-entities'] });
    },
  });
}

export function useCreateIncreaseVault() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entityId,
      name,
      purpose,
      goalAmount,
    }: {
      entityId: string;
      name: string;
      purpose?: string;
      goalAmount?: number;
    }) => increaseAPI.createVault(entityId, name, purpose, goalAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['increase-accounts'] });
    },
  });
}

export function useIncreaseBalance(accountId: string | null) {
  return useQuery({
    queryKey: ['increase-balance', accountId],
    queryFn: () => increaseAPI.getBalance(accountId!),
    enabled: !!accountId,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

export function useIncreaseTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fromAccountId,
      toAccountId,
      amount,
      description,
    }: {
      fromAccountId: string;
      toAccountId: string;
      amount: number;
      description: string;
    }) => increaseAPI.transfer(fromAccountId, toAccountId, amount, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['increase-balance'] });
      queryClient.invalidateQueries({ queryKey: ['increase-transactions'] });
    },
  });
}

// ============ Locus Hooks ============

export function useLocusWallet(userId: string = 'default_user') {
  return useQuery({
    queryKey: ['locus-wallet', userId],
    queryFn: () => locusAPI.getWallet(userId),
    refetchInterval: 15000, // Refetch every 15 seconds
  });
}

export function useLocusCharities() {
  return useQuery({
    queryKey: ['locus-charities'],
    queryFn: () => locusAPI.getCharities(),
    staleTime: Infinity, // Charities don't change often
  });
}

export function useLocusDonate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      charityId,
      amount,
      fromAddress,
    }: {
      charityId: string;
      amount: number;
      fromAddress: string;
    }) => locusAPI.donate(charityId, amount, fromAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locus-wallet'] });
    },
  });
}

// ============ Savings Agent Hooks ============

export function useSavingsAnalysis(transactions: any[] | null) {
  return useQuery({
    queryKey: ['savings-analysis', transactions?.length],
    queryFn: () => savingsAPI.analyzeAll(transactions!),
    enabled: !!transactions && transactions.length > 0,
  });
}

export function useFreshStart(userId: string = 'default_user') {
  return useQuery({
    queryKey: ['fresh-start', userId, new Date().toDateString()],
    queryFn: () => savingsAPI.checkFreshStart(userId),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

// ============ AI Coach Hooks ============

export function useChatWithCoach() {
  return useMutation({
    mutationFn: (messages: Array<{ role: string; content: string }>) =>
      coachAPI.chat(messages),
  });
}
