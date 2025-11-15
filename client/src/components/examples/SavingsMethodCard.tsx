import SavingsMethodCard from "../SavingsMethodCard";
import { TrendingUp, Repeat, Zap } from "lucide-react";

export default function SavingsMethodCardExample() {
  return (
    <div className="p-6 space-y-4 bg-background">
      <SavingsMethodCard
        icon={<TrendingUp className="w-6 h-6 text-primary" />}
        title="Windfall Wallet"
        description="Automatically save a percentage when large deposits hit your account"
        example="Tax refund hit: $1,800 → save $360?"
        hasToggle={true}
        hasSlider={true}
        badge="Popular"
      />
      <SavingsMethodCard
        icon={<Repeat className="w-6 h-6 text-primary" />}
        title="Round-ups"
        description="Round up purchases to the nearest dollar and save the change"
        example="$4.50 coffee → save $0.50"
        hasToggle={true}
        hasButton={true}
        buttonText="Configure"
      />
      <SavingsMethodCard
        icon={<Zap className="w-6 h-6 text-primary" />}
        title="Micro-Savings Challenges"
        description="Fun weekly challenges to boost your savings"
        example="No-Takeout Weekend → save $40"
        hasButton={true}
        buttonText="Browse challenges"
      />
    </div>
  );
}
