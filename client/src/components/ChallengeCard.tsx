import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ChallengeCardProps {
  emoji: string;
  title: string;
  description: string;
  reward: string;
  progress?: number;
  streak?: number;
  isActive?: boolean;
}

export default function ChallengeCard({
  emoji,
  title,
  description,
  reward,
  progress,
  streak,
  isActive = false,
}: ChallengeCardProps) {
  return (
    <Card className="p-5 hover-elevate cursor-pointer" data-testid={`challenge-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex gap-4">
        <div className="text-5xl flex-shrink-0">{emoji}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-lg">{title}</h3>
            {isActive && (
              <Badge variant="default" className="bg-primary">
                Active
              </Badge>
            )}
            {streak && streak > 0 && (
              <Badge variant="secondary">
                🔥 {streak} day streak
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-3">{description}</p>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-primary">{reward}</span>
          </div>

          {progress !== undefined && (
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Button
            data-testid={`button-${isActive ? "continue" : "start"}-challenge`}
            className="w-full rounded-full"
            variant={isActive ? "default" : "outline"}
          >
            {isActive ? "Continue" : "Start challenge"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
