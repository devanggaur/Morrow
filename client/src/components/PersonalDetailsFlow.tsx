import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";

const sources = [
  "Press",
  "Referral",
  "App Store",
  "Search",
  "Social",
  "Friends",
  "Other",
];

const states = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

interface PersonalDetailsFlowProps {
  onComplete?: (data: any) => void;
}

export default function PersonalDetailsFlow({ onComplete }: PersonalDetailsFlowProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dob: "",
    state: "",
    source: "",
  });

  const progress = (step / 5) * 100;

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      onComplete?.(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.email.includes("@");
      case 3:
        const age = formData.dob ? new Date().getFullYear() - new Date(formData.dob).getFullYear() : 0;
        return age >= 18;
      case 4:
        return formData.state.length > 0;
      case 5:
        return formData.source.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 p-6">
        <div className="h-1 bg-muted rounded-full mb-8">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {step > 1 && (
          <button
            onClick={handleBack}
            data-testid="button-back"
            className="mb-6 flex items-center gap-2 text-muted-foreground hover-elevate px-2 py-1 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        )}

        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold mb-3">What's your name?</h1>
            <p className="text-muted-foreground mb-8">We'll use this to personalize your experience</p>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                data-testid="input-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                className="text-lg py-6 rounded-xl"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-3xl font-bold mb-3">What's your email?</h1>
            <p className="text-muted-foreground mb-8">We'll send updates and security alerts here</p>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                data-testid="input-email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="text-lg py-6 rounded-xl"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-3xl font-bold mb-3">When's your birthday?</h1>
            <p className="text-muted-foreground mb-8">You must be 18+ to use Morrow</p>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                data-testid="input-dob"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="text-lg py-6 rounded-xl"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="text-3xl font-bold mb-3">Where do you live?</h1>
            <p className="text-muted-foreground mb-8">State of residence</p>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <select
                id="state"
                data-testid="select-state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full text-lg py-4 px-4 rounded-xl border border-input bg-background"
              >
                <option value="">Select your state</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h1 className="text-3xl font-bold mb-3">How did you hear about Morrow?</h1>
            <p className="text-muted-foreground mb-8">Help us understand how you found us</p>
            <div className="space-y-3">
              {sources.map((source) => (
                <button
                  key={source}
                  onClick={() => setFormData({ ...formData, source })}
                  data-testid={`source-${source.toLowerCase()}`}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left font-medium hover-elevate ${
                    formData.source === source
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          data-testid="link-data-explained"
          className="mt-6 text-sm text-muted-foreground underline"
        >
          Your data explained
        </button>
      </div>

      <div className="p-6 border-t border-border bg-card">
        <Button
          onClick={handleNext}
          data-testid="button-next"
          disabled={!isStepValid()}
          className="w-full rounded-full py-6 text-lg font-semibold"
        >
          {step === 5 ? "Continue" : "Next"}
        </Button>
      </div>
    </div>
  );
}
