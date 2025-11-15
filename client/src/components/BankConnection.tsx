import { Button } from "@/components/ui/button";
import { Shield, Building2 } from "lucide-react";

interface BankConnectionProps {
  onConnect?: () => void;
}

export default function BankConnection({ onConnect }: BankConnectionProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 p-6 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-3">Connect your bank</h1>
          <p className="text-muted-foreground mb-12 text-lg">
            Morrow analyzes your spending to personalize savings.
          </p>

          <div className="space-y-4">
            <Button
              onClick={onConnect}
              data-testid="button-connect-plaid"
              className="w-full rounded-full py-6 text-lg font-semibold"
            >
              Connect with Plaid
            </Button>

            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Shield className="w-3 h-3" /> Secure
              </span>
              <span>•</span>
              <span>Read-only</span>
              <span>•</span>
              <span>Bank-level encryption</span>
            </p>

            <button
              data-testid="button-skip"
              className="text-sm text-muted-foreground underline mt-4"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
