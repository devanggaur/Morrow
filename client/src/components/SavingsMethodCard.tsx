import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface SavingsMethodCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  example: string;
  hasToggle?: boolean;
  hasSlider?: boolean;
  hasButton?: boolean;
  buttonText?: string;
  badge?: string;
  defaultEnabled?: boolean;
}

export default function SavingsMethodCard({
  icon,
  title,
  description,
  example,
  hasToggle = false,
  hasSlider = false,
  hasButton = false,
  buttonText = "Set up",
  badge,
  defaultEnabled = false,
}: SavingsMethodCardProps) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [sliderValue, setSliderValue] = useState([20]);

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-lg">{title}</h3>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
        </div>
      </div>

      <div className="bg-muted/30 rounded-xl p-4 mb-4">
        <p className="text-sm">
          <span className="text-muted-foreground">Example: </span>
          <span className="font-medium">{example}</span>
        </p>
      </div>

      {hasToggle && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">
            {enabled ? "Enabled" : "Disabled"}
          </span>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            data-testid={`toggle-${title.toLowerCase().replace(/\s+/g, "-")}`}
          />
        </div>
      )}

      {hasSlider && enabled && (
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Percentage</span>
            <span className="text-sm font-semibold">{sliderValue[0]}%</span>
          </div>
          <Slider
            value={sliderValue}
            onValueChange={setSliderValue}
            max={50}
            min={5}
            step={5}
            data-testid={`slider-${title.toLowerCase().replace(/\s+/g, "-")}`}
          />
        </div>
      )}

      {hasButton && (
        <Button
          data-testid={`button-${title.toLowerCase().replace(/\s+/g, "-")}`}
          className="w-full rounded-full"
          variant={enabled ? "default" : "outline"}
        >
          {buttonText}
        </Button>
      )}
    </Card>
  );
}
