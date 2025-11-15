import OnboardingCarousel from "../OnboardingCarousel";

export default function OnboardingCarouselExample() {
  return (
    <OnboardingCarousel
      onSignUp={() => console.log("Sign up clicked")}
      onLogin={() => console.log("Log in clicked")}
    />
  );
}
