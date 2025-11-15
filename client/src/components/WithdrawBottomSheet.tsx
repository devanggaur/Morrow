import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertCircle } from "lucide-react";

interface WithdrawBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultName: string;
  currentBalance: number;
  weeksDelay: number;
}

export default function WithdrawBottomSheet({
  open,
  onOpenChange,
  vaultName,
  currentBalance,
  weeksDelay,
}: WithdrawBottomSheetProps) {
  const [amount, setAmount] = useState("250");
  const [reason, setReason] = useState("");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="text-2xl">Wait… this slows your goal</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Impact on {vaultName}</p>
              <p className="text-sm text-muted-foreground">
                Withdrawing ${amount} adds <span className="font-semibold text-foreground">{weeksDelay} weeks</span> to your finish date.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Amount to withdraw</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold">
                $
              </span>
              <Input
                id="withdraw-amount"
                data-testid="input-withdraw-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-lg py-6 rounded-xl"
                max={currentBalance}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Max: ${currentBalance.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              data-testid="input-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you need this?"
              className="py-6 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              data-testid="button-keep-saving"
              variant="outline"
              className="rounded-full py-6"
              onClick={() => onOpenChange(false)}
            >
              Keep saving
            </Button>
            <Button
              data-testid="button-still-withdraw"
              className="rounded-full py-6"
              onClick={() => {
                console.log("Withdrawing", amount, "Reason:", reason);
                onOpenChange(false);
              }}
            >
              Still withdraw
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
