import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { TrendingUp, Vault, FlaskConical, Gift, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useAppContext } from "@/contexts/AppContext";
import {
  usePlaidAccounts,
  usePlaidTransactions,
  useIncreaseAccounts,
  useIncreaseBalance,
  useIncreaseTransfer,
} from "@/hooks/useAPI";
import { savingsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function HomeTab() {
  const [windfallAmount, setWindfallAmount] = useState([180]);
  const [sweepAmount, setSweepAmount] = useState([50]);
  const [roundupAmount, setRoundupAmount] = useState([25]);

  const [windfallData, setWindfallData] = useState<any>(null);
  const [sweepData, setSweepData] = useState<any>(null);
  const [roundupData, setRoundupData] = useState<any>(null);

  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(false);
  const [windfallClaimed, setWindfallClaimed] = useState(false);
  const [sweepClaimed, setSweepClaimed] = useState(false);
  const [roundupClaimed, setRoundupClaimed] = useState(false);

  const { toast } = useToast();
  const { plaidAccessToken, increaseEntityId, increaseMainAccountId } =
    useAppContext();
  const transferMutation = useIncreaseTransfer();

  // Fetch Plaid accounts
  const { data: plaidAccountsData } = usePlaidAccounts(plaidAccessToken);

  // Fetch Plaid transactions for windfall detection
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const { data: transactionsData } = usePlaidTransactions(
    plaidAccessToken,
    startDate,
    endDate
  );

  // Fetch Increase accounts for vault balances
  const { data: increaseAccountsData } = useIncreaseAccounts(increaseEntityId);

  // Fetch main account balance
  const { data: mainBalanceData } = useIncreaseBalance(increaseMainAccountId);

  // Calculate total checking balance from Plaid
  const checkingBalance =
    plaidAccountsData?.accounts
      ?.filter((acc: any) => acc.type === "depository")
      .reduce((sum: number, acc: any) => sum + (acc.balances?.current || 0), 0) || 0;

  // Calculate total vault balance
  const vaultBalance =
    increaseAccountsData?.accounts?.reduce(
      (sum: number, acc: any) => sum + (acc.current_balance || 0),
      0
    ) || 0;

  const vaultCount = increaseAccountsData?.accounts?.length || 0;

  // Handler for "Do it" button - transfer savings to first vault
  const handleClaimSavings = async (type: 'windfall' | 'sweep' | 'roundup', amount: number, description: string) => {
    const firstVault = increaseAccountsData?.accounts?.[0];

    if (!firstVault || !increaseMainAccountId || amount <= 0) {
      toast({
        title: "Cannot transfer",
        description: "Please create a vault first or adjust the amount.",
        variant: "destructive",
      });
      return;
    }

    try {
      await transferMutation.mutateAsync({
        fromAccountId: increaseMainAccountId,
        toAccountId: firstVault.account_id,
        amount,
        description,
      });

      if (type === 'windfall') setWindfallClaimed(true);
      if (type === 'sweep') setSweepClaimed(true);
      if (type === 'roundup') setRoundupClaimed(true);

      toast({
        title: "Savings transferred!",
        description: `$${amount} moved to ${firstVault.name}. Great job!`,
      });
    } catch (error) {
      toast({
        title: "Transfer failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Detect all savings opportunities when transactions are loaded
  useEffect(() => {
    if (transactionsData?.transactions) {
      setIsLoadingOpportunities(true);

      Promise.all([
        savingsAPI.detectWindfall(transactionsData.transactions),
        savingsAPI.analyzeSweep(transactionsData.transactions),
        savingsAPI.analyzeRoundups(transactionsData.transactions),
      ])
        .then(([windfallResult, sweepResult, roundupResult]) => {
          // Windfall
          if (windfallResult.hasWindfall && windfallResult.suggestion) {
            setWindfallData(windfallResult);
            setWindfallAmount([windfallResult.suggestion.amount]);
          } else if (import.meta.env.DEV) {
            // Demo windfall
            setWindfallData({
              hasWindfall: true,
              suggestion: {
                type: 'windfall',
                title: 'Tax refund hit',
                amount: 180,
                transaction: {
                  amount: 1800,
                  merchantName: 'US Treasury',
                  date: new Date().toISOString().split('T')[0],
                },
                message: 'Great news! We detected a windfall.',
              },
            });
            setWindfallAmount([180]);
          }

          // Smart Sweep
          if (sweepResult.hasSweep && sweepResult.suggestion) {
            setSweepData(sweepResult);
            setSweepAmount([sweepResult.suggestion.amount]);
          } else if (import.meta.env.DEV) {
            // Demo sweep
            setSweepData({
              hasSweep: true,
              suggestion: {
                type: 'sweep',
                title: 'Under budget this week',
                amount: 45,
                transaction: {
                  amount: 90,
                  weeklyAverage: 250,
                  thisWeekSpending: 160,
                },
                message: "You're under your weekly budget. Save half of it?",
              },
            });
            setSweepAmount([45]);
          }

          // Round-ups
          if (roundupResult.hasRoundups && roundupResult.suggestion) {
            setRoundupData(roundupResult);
            setRoundupAmount([roundupResult.suggestion.amount]);
          } else if (import.meta.env.DEV) {
            // Demo roundups
            setRoundupData({
              hasRoundups: true,
              suggestion: {
                type: 'roundup',
                title: 'Spare change savings',
                amount: 23,
                transaction: {
                  amount: 23,
                  transactionCount: 47,
                  averageRoundup: 0.49,
                },
                message: 'Round up 47 purchases to save $23',
              },
            });
            setRoundupAmount([23]);
          }
        })
        .catch((error) => {
          console.error("Error detecting savings opportunities:", error);
        })
        .finally(() => {
          setIsLoadingOpportunities(false);
        });
    }
  }, [transactionsData]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Hi Devang,</h1>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-5">
            <p className="text-sm text-muted-foreground mb-1">Cash in checking</p>
            <p className="text-2xl font-bold">
              ${checkingBalance.toLocaleString()}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground mb-1">Saved in vaults</p>
            <p className="text-2xl font-bold text-primary">
              ${vaultBalance.toLocaleString()}
            </p>
          </Card>
        </div>

        <div className="flex gap-2 mb-6">
          <Link href="/savings-lab">
            <Badge
              data-testid="pill-savings-lab"
              className="px-4 py-2 text-sm rounded-full cursor-pointer hover-elevate"
              variant="secondary"
            >
              <FlaskConical className="w-4 h-4 mr-2" />
              Savings Lab
            </Badge>
          </Link>
          <Link href="/rewards">
            <Badge
              data-testid="pill-rewards"
              className="px-4 py-2 text-sm rounded-full cursor-pointer hover-elevate"
              variant="secondary"
            >
              <Gift className="w-4 h-4 mr-2" />
              Rewards
            </Badge>
          </Link>
        </div>

        {windfallData?.hasWindfall && !windfallClaimed && (
          <Card className="p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">Your best move today</h2>
                <Badge variant="outline" className="text-xs">
                  Windfall Detected
                </Badge>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-muted-foreground mb-4">
                {windfallData.suggestion.title}:{" "}
                <span className="font-semibold text-foreground">
                  ${windfallData.suggestion.transaction.amount.toLocaleString()}
                </span>
              </p>
              <div className="bg-muted/50 rounded-xl p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Save</span>
                  <span className="text-lg font-bold text-primary">
                    ${windfallAmount[0]}
                  </span>
                </div>
                <Slider
                  value={windfallAmount}
                  onValueChange={setWindfallAmount}
                  max={
                    Math.floor(
                      windfallData.suggestion.transaction.amount * 0.5
                    )
                  }
                  min={0}
                  step={10}
                  className="mb-2"
                  data-testid="slider-windfall-amount"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {Math.round(
                    (windfallAmount[0] /
                      windfallData.suggestion.transaction.amount) *
                      100
                  )}
                  % of your windfall
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                data-testid="button-windfall-do-it"
                className="flex-1 rounded-full font-semibold"
                onClick={() => handleClaimSavings('windfall', windfallAmount[0], `Windfall savings - ${windfallData?.suggestion?.title}`)}
                disabled={transferMutation.isPending || windfallAmount[0] <= 0}
              >
                {transferMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  "Do it"
                )}
              </Button>
              <Button
                data-testid="button-adjust"
                variant="outline"
                className="rounded-full font-semibold px-6"
              >
                Adjust
              </Button>
              <Button
                data-testid="button-skip"
                variant="ghost"
                className="rounded-full font-semibold px-6"
                onClick={() => setWindfallData(null)}
              >
                Skip
              </Button>
            </div>
          </Card>
        )}

        {windfallClaimed && (
          <Card className="p-6 mb-6 bg-primary/5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">Move claimed!</h2>
                <Badge variant="default" className="text-xs mb-3">
                  Windfall saved
                </Badge>
                <p className="text-sm text-muted-foreground">
                  You saved ${windfallAmount[0]} from your windfall. Keep up the great work!
                </p>
              </div>
            </div>
          </Card>
        )}

        {sweepData?.hasSweep && !sweepClaimed && (
          <Card className="p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">Smart Sweep</h2>
                <Badge variant="outline" className="text-xs">
                  Under Budget
                </Badge>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-muted-foreground mb-4">{sweepData.suggestion.message}</p>
              <div className="bg-muted/50 rounded-xl p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Save</span>
                  <span className="text-lg font-bold text-primary">${sweepAmount[0]}</span>
                </div>
                <Slider
                  value={sweepAmount}
                  onValueChange={setSweepAmount}
                  max={sweepData.suggestion.transaction.amount}
                  min={0}
                  step={5}
                  className="mb-2"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {Math.round((sweepAmount[0] / sweepData.suggestion.transaction.amount) * 100)}% of unspent budget
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 rounded-full font-semibold"
                onClick={() => handleClaimSavings('sweep', sweepAmount[0], 'Smart Sweep - Weekly savings')}
                disabled={transferMutation.isPending || sweepAmount[0] <= 0}
              >
                {transferMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  "Do it"
                )}
              </Button>
              <Button variant="ghost" className="rounded-full font-semibold px-6" onClick={() => setSweepData(null)}>
                Skip
              </Button>
            </div>
          </Card>
        )}

        {sweepClaimed && (
          <Card className="p-6 mb-6 bg-primary/5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">Move claimed!</h2>
                <Badge variant="default" className="text-xs mb-3">
                  Smart Sweep saved
                </Badge>
                <p className="text-sm text-muted-foreground">
                  You saved ${sweepAmount[0]} from your weekly budget. Nice work!
                </p>
              </div>
            </div>
          </Card>
        )}

        {roundupData?.hasRoundups && !roundupClaimed && (
          <Card className="p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">Round-ups</h2>
                <Badge variant="outline" className="text-xs">
                  Spare Change
                </Badge>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-muted-foreground mb-4">{roundupData.suggestion.message}</p>
              <div className="bg-muted/50 rounded-xl p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Save</span>
                  <span className="text-lg font-bold text-primary">${roundupAmount[0]}</span>
                </div>
                <Slider
                  value={roundupAmount}
                  onValueChange={setRoundupAmount}
                  max={roundupData.suggestion.transaction.amount}
                  min={0}
                  step={1}
                  className="mb-2"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {roundupData.suggestion.transaction.transactionCount} transactions
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 rounded-full font-semibold"
                onClick={() => handleClaimSavings('roundup', roundupAmount[0], 'Round-ups - Spare change')}
                disabled={transferMutation.isPending || roundupAmount[0] <= 0}
              >
                {transferMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  "Do it"
                )}
              </Button>
              <Button variant="ghost" className="rounded-full font-semibold px-6" onClick={() => setRoundupData(null)}>
                Skip
              </Button>
            </div>
          </Card>
        )}

        {roundupClaimed && (
          <Card className="p-6 mb-6 bg-primary/5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">Move claimed!</h2>
                <Badge variant="default" className="text-xs mb-3">
                  Round-ups saved
                </Badge>
                <p className="text-sm text-muted-foreground">
                  You saved ${roundupAmount[0]} in spare change. Every penny counts!
                </p>
              </div>
            </div>
          </Card>
        )}

        {isLoadingOpportunities && (
          <Card className="p-6 mb-6 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </Card>
        )}

        <Link href="/vaults">
          <Card className="p-5 hover-elevate cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Vault className="w-5 h-5 text-primary" />
                <span className="font-semibold">View all vaults</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {vaultCount} active
              </span>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
