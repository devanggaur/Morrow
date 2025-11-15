import { useEffect, useState } from "react";
import SavingsMethodCard from "./SavingsMethodCard";
import {
  TrendingUp,
  TrendingDown,
  Scissors,
  Repeat,
  Trophy,
  Workflow,
  Heart,
  PartyPopper,
  Ticket,
  Loader2,
} from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { usePlaidTransactions } from "@/hooks/useAPI";
import { savingsAPI } from "@/lib/api";

export default function SavingsLabTab() {
  const [savingsAnalysis, setSavingsAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { plaidAccessToken } = useAppContext();

  // Fetch transactions
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const { data: transactionsData } = usePlaidTransactions(
    plaidAccessToken,
    startDate,
    endDate
  );

  // Analyze savings opportunities
  useEffect(() => {
    if (transactionsData?.transactions) {
      setIsLoading(true);
      savingsAPI
        .analyzeAll(transactionsData.transactions)
        .then((data) => {
          if (data.success) {
            setSavingsAnalysis(data.opportunities);
          }
        })
        .catch((error) => {
          console.error("Error analyzing savings:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [transactionsData]);

  const windfallExample = savingsAnalysis?.windfall?.hasWindfall
    ? `${savingsAnalysis.windfall.suggestion.title}: $${Math.abs(
        savingsAnalysis.windfall.suggestion.transaction.amount
      ).toLocaleString()} → save $${savingsAnalysis.windfall.suggestion.amount}?`
    : "Tax refund: $1,800 → save $360?";

  const sweepExample = savingsAnalysis?.sweep?.hasSweep
    ? `${savingsAnalysis.sweep.suggestion.title} → save $${savingsAnalysis.sweep.suggestion.amount}?`
    : "You spent $80 less → save $40?";

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-3">Savings Lab</h1>
        <p className="text-muted-foreground mb-6">
          Your personalized savings toolkit. Mix and match to fit your style.
        </p>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        <div className="space-y-4">
          <SavingsMethodCard
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
            title="Windfall Wallet"
            description="Save a percentage when large deposits hit"
            example={windfallExample}
            hasToggle={true}
            hasSlider={true}
            badge={
              savingsAnalysis?.windfall?.hasWindfall ? "Opportunity!" : "Popular"
            }
          />

          <SavingsMethodCard
            icon={<TrendingDown className="w-6 h-6 text-primary" />}
            title="Smart Sweep"
            description="Weekly underspend detection with auto-save"
            example={sweepExample}
            hasToggle={true}
            hasSlider={true}
            badge={savingsAnalysis?.sweep?.hasSweep ? "Opportunity!" : undefined}
          />

          <SavingsMethodCard
            icon={<Scissors className="w-6 h-6 text-primary" />}
            title="Subscription Sweep"
            description="Find cancel/downgrade opportunities"
            example="Skip Gym+? Move $18 monthly to goals"
            hasButton={true}
            buttonText="Review subscriptions"
          />

          <SavingsMethodCard
            icon={<Repeat className="w-6 h-6 text-primary" />}
            title="Round-ups"
            description="Round purchases to nearest dollar"
            example="$4.50 coffee → save $0.50"
            hasToggle={true}
            hasButton={true}
            buttonText="Configure"
          />

          <SavingsMethodCard
            icon={<Trophy className="w-6 h-6 text-primary" />}
            title="Micro-Savings Challenges"
            description="Fun weekly challenges to boost savings"
            example="No-Takeout Weekend → save $40"
            hasButton={true}
            buttonText="Browse challenges"
          />

          <SavingsMethodCard
            icon={<Workflow className="w-6 h-6 text-primary" />}
            title="Rules / Automations"
            description="IF [category] THEN save [amount]"
            example="IF dining THEN save 10% to Vacation"
            hasButton={true}
            buttonText="Create rule"
          />

          <SavingsMethodCard
            icon={<Heart className="w-6 h-6 text-primary" />}
            title="Emotion-based Nudges"
            description="Weekly mood check-in for mindful saving"
            example="Feeling stressed? Move $10 to Peace of Mind"
            hasButton={true}
            buttonText="Check in"
          />

          <SavingsMethodCard
            icon={<PartyPopper className="w-6 h-6 text-primary" />}
            title="Save-to-Spend Loop"
            description="Unlock guilt-free fun money from savings"
            example="Save $100 → unlock $20 fun wallet"
            hasToggle={true}
            hasSlider={true}
            badge="New"
          />

          <SavingsMethodCard
            icon={<Ticket className="w-6 h-6 text-primary" />}
            title="Fun Money Lottery"
            description="Prize-linked savings with Sunday draws"
            example="Save $50 → earn 5 entries for $100 prize"
            hasButton={true}
            buttonText="How it works"
          />
        </div>
      </div>
    </div>
  );
}
