import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock } from "lucide-react";

interface VaultCardProps {
  name: string;
  balance: number;
  target: number;
  locked: boolean;
  onClick?: () => void;
}

export default function VaultCard({ name, balance, target, locked, onClick }: VaultCardProps) {
  const progress = (balance / target) * 100;

  return (
    <Card
      onClick={onClick}
      data-testid={`vault-${name.toLowerCase().replace(/\s+/g, "-")}`}
      className="p-5 hover-elevate cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-lg">{name}</h3>
        {locked && (
          <Badge variant="secondary" className="gap-1">
            <Lock className="w-3 h-3" />
            Soft-lock
          </Badge>
        )}
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex justify-between items-end">
        <div>
          <p className="text-2xl font-bold text-primary">${balance.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">of ${target.toLocaleString()}</p>
        </div>
      </div>
    </Card>
  );
}
