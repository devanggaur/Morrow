import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const goals = [
  { id: "rainy-day", label: "Build a rainy-day fund", icon: "🌧️" },
  { id: "pay-debt", label: "Pay off debt faster", icon: "💳" },
  { id: "fun", label: "Save for something fun", icon: "🎉" },
  { id: "stop-overspending", label: "Stop overspending", icon: "🛑" },
  { id: "coaching", label: "Get smarter money coaching", icon: "🧠" },
];

interface MoneyGoalsScreenProps {
  onNext?: (selectedGoals: string[]) => void;
}

export default function MoneyGoalsScreen({ onNext }: MoneyGoalsScreenProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 p-6">
        <div className="h-1 bg-muted rounded-full mb-8">
          <div className="h-full w-1/6 bg-primary rounded-full transition-all" />
        </div>

        <h1 className="text-3xl font-bold mb-3">What are your money goals right now?</h1>
        <p className="text-muted-foreground mb-8">Pick all that apply</p>

        <div className="space-y-3">
          {goals.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                data-testid={`goal-${goal.id}`}
                className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center gap-4 hover-elevate ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                <span className="text-3xl">{goal.icon}</span>
                <span className="flex-1 text-left font-medium text-lg">
                  {goal.label}
                </span>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          data-testid="link-data-explained"
          className="mt-6 text-sm text-muted-foreground underline"
        >
          Your data explained
        </button>
      </div>

      <div className="p-6 border-t border-border bg-card">
        <Button
          onClick={() => onNext?.(selectedGoals)}
          data-testid="button-next"
          disabled={selectedGoals.length === 0}
          className="w-full rounded-full py-6 text-lg font-semibold"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
