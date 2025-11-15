import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, Lock, Plus, ArrowDownToLine, Loader2 } from "lucide-react";
import WithdrawBottomSheet from "./WithdrawBottomSheet";
import { useAppContext } from "@/contexts/AppContext";
import { useIncreaseTransfer, useIncreaseBalance } from "@/hooks/useAPI";
import { useToast } from "@/hooks/use-toast";

interface VaultDetailProps {
  accountId: string;
  name: string;
  balance: number;
  target: number;
  locked: boolean;
  onBack?: () => void;
}

export default function VaultDetail({ accountId, name, balance, target, locked, onBack }: VaultDetailProps) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState("");

  const { toast } = useToast();
  const { increaseMainAccountId } = useAppContext();
  const transferMutation = useIncreaseTransfer();
  const { data: balanceData } = useIncreaseBalance(accountId);

  const currentBalance = balanceData?.current_balance ?? balance;
  const progress = (currentBalance / target) * 100;
  const weeksRemaining = Math.ceil((target - currentBalance) / 50);

  const handleAddMoney = async () => {
    if (!amount || !increaseMainAccountId) return;

    try {
      await transferMutation.mutateAsync({
        fromAccountId: increaseMainAccountId,
        toAccountId: accountId,
        amount: parseFloat(amount),
        description: `Transfer to ${name}`,
      });

      toast({
        title: "Money added!",
        description: `Successfully transferred $${amount} to ${name}.`,
      });

      setShowAddMoney(false);
      setAmount("");
    } catch (error) {
      toast({
        title: "Transfer failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

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
                ${currentBalance.toLocaleString()}
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
              onClick={() => setShowAddMoney(true)}
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

      <Dialog open={showAddMoney} onOpenChange={setShowAddMoney}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add money to {name}</DialogTitle>
            <DialogDescription>
              Transfer money from your main account to this vault.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddMoney(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleAddMoney}
              disabled={!amount || transferMutation.isPending || !increaseMainAccountId}
            >
              {transferMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transferring...
                </>
              ) : (
                "Transfer"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <WithdrawBottomSheet
        open={showWithdraw}
        onOpenChange={setShowWithdraw}
        vaultName={name}
        currentBalance={currentBalance}
        weeksDelay={3}
      />
    </>
  );
}
