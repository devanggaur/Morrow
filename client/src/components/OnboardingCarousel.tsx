import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import slide1 from "@assets/generated_images/Upward_view_hill_sunrise_reach_4366792c.png";
import slide2 from "@assets/generated_images/Ascending_stairs_growing_coins_e44668e7.png";
import slide3 from "@assets/generated_images/Glowing_vault_protective_shields_11c3126c.png";

const slides = [
  {
    image: slide1,
    title: "Build the future you want.",
    subtitle: "Meet Morrow — your AI money coach that helps you save without thinking.",
  },
  {
    image: slide2,
    title: "Little steps. Big results.",
    subtitle: "Smart sweeps, round-ups, challenges, and more — all tailored to your habits.",
  },
  {
    image: slide3,
    title: "Powered by real accounts.",
    subtitle: "FDIC-insured vaults for every goal. Real savings, real progress.",
  },
];

interface OnboardingCarouselProps {
  onSignUp?: () => void;
  onLogin?: () => void;
}

export default function OnboardingCarousel({ onSignUp, onLogin }: OnboardingCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="relative flex-1">
        <img
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {currentSlide > 0 && (
          <button
            onClick={handlePrev}
            data-testid="button-prev-slide"
            className="absolute top-6 left-4 text-white hover-elevate p-2 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl font-bold mb-3">{slide.title}</h1>
          <p className="text-lg mb-6 text-white/90">{slide.subtitle}</p>

          <div className="flex gap-2 mb-4">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full flex-1 transition-all ${
                  i === currentSlide ? "bg-primary" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 bg-background">
        <div className="flex gap-3">
          <Button
            onClick={onSignUp}
            data-testid="button-sign-up"
            className="flex-1 rounded-full py-6 text-lg font-semibold"
          >
            Sign Up
          </Button>
          <Button
            onClick={onLogin}
            data-testid="button-log-in"
            variant="outline"
            className="flex-1 rounded-full py-6 text-lg font-semibold"
          >
            Log In
          </Button>
        </div>
      </div>
    </div>
  );
}
