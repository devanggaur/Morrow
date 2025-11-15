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
} from "lucide-react";

export default function SavingsLabTab() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-3">Savings Lab</h1>
        <p className="text-muted-foreground mb-6">
          Your personalized savings toolkit. Mix and match to fit your style.
        </p>

        <div className="space-y-4">
          <SavingsMethodCard
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
            title="Windfall Wallet"
            description="Save a percentage when large deposits hit"
            example="Tax refund: $1,800 → save $360?"
            hasToggle={true}
            hasSlider={true}
            badge="Popular"
          />

          <SavingsMethodCard
            icon={<TrendingDown className="w-6 h-6 text-primary" />}
            title="Smart Sweep"
            description="Weekly underspend detection with auto-save"
            example="You spent $80 less → save $40?"
            hasToggle={true}
            hasSlider={true}
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
