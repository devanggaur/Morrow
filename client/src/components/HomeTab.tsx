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
  const [saveAmount, setSaveAmount] = useState([180]);
  const [windfallData, setWindfallData] = useState<any>(null);
  const [isLoadingWindfall, setIsLoadingWindfall] = useState(false);
  const [windfallClaimed, setWindfallClaimed] = useState(false);

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

  // Handler for "Do it" button - transfer windfall savings to first vault
  const handleClaimWindfall = async () => {
    const firstVault = increaseAccountsData?.accounts?.[0];

    if (!firstVault || !increaseMainAccountId || saveAmount[0] <= 0) {
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
        amount: saveAmount[0],
        description: `Windfall savings - ${windfallData?.suggestion?.title || 'Income'}`,
      });

      setWindfallClaimed(true);

      toast({
        title: "Savings transferred!",
        description: `$${saveAmount[0]} moved to ${firstVault.name}. Great job!`,
      });
    } catch (error) {
      toast({
        title: "Transfer failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Detect windfall when transactions are loaded
  useEffect(() => {
    if (transactionsData?.transactions) {
      setIsLoadingWindfall(true);
      savingsAPI
        .detectWindfall(transactionsData.transactions)
        .then((data) => {
          if (data.hasWindfall && data.suggestion) {
            setWindfallData(data);
            setSaveAmount([data.suggestion.amount]);
          } else {
            // Demo mode: Show sample windfall if none detected in development
            if (import.meta.env.DEV) {
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
                  message: 'Great news! We detected a windfall. Save some before it gets mentally budgeted.',
                },
              });
              setSaveAmount([180]);
            }
          }
        })
        .catch((error) => {
          console.error("Error detecting windfall:", error);
        })
        .finally(() => {
          setIsLoadingWindfall(false);
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
                    ${saveAmount[0]}
                  </span>
                </div>
                <Slider
                  value={saveAmount}
                  onValueChange={setSaveAmount}
                  max={
                    Math.floor(
                      windfallData.suggestion.transaction.amount * 0.5
                    )
                  }
                  min={0}
                  step={10}
                  className="mb-2"
                  data-testid="slider-save-amount"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {Math.round(
                    (saveAmount[0] /
                      windfallData.suggestion.transaction.amount) *
                      100
                  )}
                  % of your windfall
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                data-testid="button-do-it"
                className="flex-1 rounded-full font-semibold"
                onClick={handleClaimWindfall}
                disabled={transferMutation.isPending || saveAmount[0] <= 0}
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
                  Savings transferred
                </Badge>
                <p className="text-sm text-muted-foreground">
                  You saved ${saveAmount[0]} from your windfall. Keep up the great work!
                </p>
              </div>
            </div>
          </Card>
        )}

        {isLoadingWindfall && (
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
