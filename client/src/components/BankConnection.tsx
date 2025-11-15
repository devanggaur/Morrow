import { Button } from "@/components/ui/button";
import { Shield, Building2, Loader2 } from "lucide-react";
import { usePlaidLink } from "react-plaid-link";
import { usePlaidLinkToken } from "@/hooks/useAPI";
import { plaidAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface BankConnectionProps {
  onConnect?: (accessToken: string, itemId: string) => void;
  onSkip?: () => void;
}

export default function BankConnection({ onConnect, onSkip }: BankConnectionProps) {
  const { toast } = useToast();
  const [userId] = useState(() => `user_${Date.now()}`);

  // Get link token from backend
  const { data: linkTokenData, isLoading: isLoadingToken } = usePlaidLinkToken(userId);

  // Handle successful Plaid Link
  const onSuccess = async (publicToken: string) => {
    try {
      // Exchange public token for access token
      const result = await plaidAPI.exchangePublicToken(publicToken, userId);

      toast({
        title: "Bank connected!",
        description: "Successfully connected your bank account.",
      });

      // Call parent callback with access token
      onConnect?.(result.access_token, result.item_id);
    } catch (error) {
      console.error('Error exchanging token:', error);
      toast({
        title: "Connection failed",
        description: "Could not connect your bank. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Initialize Plaid Link
  const { open, ready } = usePlaidLink({
    token: linkTokenData?.link_token || null,
    onSuccess,
  });

  const handleConnect = () => {
    if (ready) {
      open();
    }
  };

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
              onClick={handleConnect}
              disabled={!ready || isLoadingToken}
              data-testid="button-connect-plaid"
              className="w-full rounded-full py-6 text-lg font-semibold"
            >
              {isLoadingToken ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Connect with Plaid'
              )}
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
              onClick={onSkip}
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
