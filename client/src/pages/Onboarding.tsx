import { useState } from "react";
import { useLocation } from "wouter";
import OnboardingCarousel from "@/components/OnboardingCarousel";
import MoneyGoalsScreen from "@/components/MoneyGoalsScreen";
import PersonalDetailsFlow from "@/components/PersonalDetailsFlow";
import EmailVerification from "@/components/EmailVerification";
import BankConnection from "@/components/BankConnection";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");

  const handleCarouselComplete = (action: "signup" | "login") => {
    console.log(`${action} clicked`);
    setStep(1);
  };

  const handleGoalsComplete = () => {
    setStep(2);
  };

  const handleDetailsComplete = (data: any) => {
    setEmail(data.email);
    setStep(3);
  };

  const handleVerificationComplete = () => {
    setStep(4);
  };

  const handleBankConnectionComplete = () => {
    setLocation("/home");
  };

  return (
    <>
      {step === 0 && (
        <OnboardingCarousel
          onSignUp={() => handleCarouselComplete("signup")}
          onLogin={() => handleCarouselComplete("login")}
        />
      )}
      {step === 1 && <MoneyGoalsScreen onNext={handleGoalsComplete} />}
      {step === 2 && <PersonalDetailsFlow onComplete={handleDetailsComplete} />}
      {step === 3 && <EmailVerification email={email} onVerify={handleVerificationComplete} />}
      {step === 4 && <BankConnection onConnect={handleBankConnectionComplete} />}
    </>
  );
}
