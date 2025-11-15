import { useState } from "react";
import { Button } from "@/components/ui/button";
import WithdrawBottomSheet from "../WithdrawBottomSheet";

export default function WithdrawBottomSheetExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)}>Open Withdraw Sheet</Button>
      <WithdrawBottomSheet
        open={open}
        onOpenChange={setOpen}
        vaultName="Emergency Fund"
        currentBalance={1250}
        weeksDelay={3}
      />
    </div>
  );
}
