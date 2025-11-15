import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface EmailVerificationProps {
  email?: string;
  onVerify?: (code: string) => void;
}

export default function EmailVerification({ email = "user@example.com", onVerify }: EmailVerificationProps) {
  const [code, setCode] = useState("");

  const handleVerify = () => {
    if (code.length === 6) {
      onVerify?.(code);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 p-6 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-3xl font-bold mb-3 text-center">Enter your code</h1>
          <p className="text-muted-foreground mb-8 text-center">
            We just emailed a 6-digit code to <span className="font-medium text-foreground">{email}</span>
          </p>

          <div className="flex justify-center mb-6">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              data-testid="input-code"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="text-center space-y-3">
            <button
              data-testid="link-different-email"
              className="text-primary underline text-sm font-medium"
            >
              Send to a different email
            </button>
            <p className="text-sm text-muted-foreground">
              Didn't get it?{" "}
              <button
                data-testid="button-resend"
                className="text-foreground underline font-medium"
              >
                Tap to resend
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-border bg-card">
        <Button
          onClick={handleVerify}
          data-testid="button-verify"
          disabled={code.length !== 6}
          className="w-full rounded-full py-6 text-lg font-semibold"
        >
          Verify and continue
        </Button>
      </div>
    </div>
  );
}
