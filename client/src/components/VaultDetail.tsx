import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Lock, Plus, ArrowDownToLine } from "lucide-react";
import WithdrawBottomSheet from "./WithdrawBottomSheet";

interface VaultDetailProps {
  name: string;
  balance: number;
  target: number;
  locked: boolean;
  onBack?: () => void;
}

export default function VaultDetail({ name, balance, target, locked, onBack }: VaultDetailProps) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const progress = (balance / target) * 100;
  const weeksRemaining = Math.ceil((target - balance) / 50);

  return (
    <>
      <div className="min-h-screen bg-background pb-20">
        <div className="p-6">
          <button
            onClick={onBack}
            data-testid="button-back"
            className="flex items-center gap-2 mb-6 text-muted-foreground hover-elevate px-2 py-1 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold">{name}</h1>
              {locked && (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="w-3 h-3" />
                  Soft-lock
                </Badge>
              )}
            </div>

            <div className="text-center py-8">
              <p className="text-5xl font-bold text-primary mb-2">
                ${balance.toLocaleString()}
              </p>
              <p className="text-muted-foreground">
                of ${target.toLocaleString()} goal
              </p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                About {weeksRemaining} weeks to go at current pace
              </p>
            </div>
          </div>

          {locked && (
            <Card className="p-5 mb-6 bg-muted/30">
              <div className="flex gap-3">
                <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Soft-lock active</h3>
                  <p className="text-sm text-muted-foreground">
                    Withdrawing slows your goal progress. We'll show you the impact before you confirm.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button
              data-testid="button-add-money"
              className="rounded-full py-6 gap-2"
            >
              <Plus className="w-5 h-5" />
              Add money
            </Button>
            <Button
              data-testid="button-withdraw"
              variant="outline"
              className="rounded-full py-6 gap-2"
              onClick={() => setShowWithdraw(true)}
            >
              <ArrowDownToLine className="w-5 h-5" />
              Withdraw
            </Button>
          </div>
        </div>
      </div>

      <WithdrawBottomSheet
        open={showWithdraw}
        onOpenChange={setShowWithdraw}
        vaultName={name}
        currentBalance={balance}
        weeksDelay={3}
      />
    </>
  );
}
