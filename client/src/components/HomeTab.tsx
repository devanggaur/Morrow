import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { TrendingUp, Vault, FlaskConical, Gift } from "lucide-react";
import { Link } from "wouter";

export default function HomeTab() {
  const [saveAmount, setSaveAmount] = useState([180]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Hi Devang,</h1>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-5">
            <p className="text-sm text-muted-foreground mb-1">Cash in checking</p>
            <p className="text-2xl font-bold">$1,247</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground mb-1">Saved in vaults</p>
            <p className="text-2xl font-bold text-primary">$3,840</p>
          </Card>
        </div>

        <div className="flex gap-2 mb-6">
          <Link href="/savings-lab">
            <Badge
              data-testid="pill-savings-lab"
              className="px-4 py-2 text-sm rounded-full cursor-pointer hover-elevate"
              variant="secondary"
            >
              <FlaskConical className="w-4 h-4 mr-2" />
              Savings Lab
            </Badge>
          </Link>
          <Link href="/rewards">
            <Badge
              data-testid="pill-rewards"
              className="px-4 py-2 text-sm rounded-full cursor-pointer hover-elevate"
              variant="secondary"
            >
              <Gift className="w-4 h-4 mr-2" />
              Rewards
            </Badge>
          </Link>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">Your best move today</h2>
              <Badge variant="outline" className="text-xs">
                Windfall Detected
              </Badge>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-muted-foreground mb-4">
              Tax refund hit: <span className="font-semibold text-foreground">$1,800</span>
            </p>
            <div className="bg-muted/50 rounded-xl p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Save</span>
                <span className="text-lg font-bold text-primary">${saveAmount[0]}</span>
              </div>
              <Slider
                value={saveAmount}
                onValueChange={setSaveAmount}
                max={900}
                min={0}
                step={10}
                className="mb-2"
                data-testid="slider-save-amount"
              />
              <p className="text-xs text-muted-foreground text-center">
                10% of your windfall
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              data-testid="button-do-it"
              className="flex-1 rounded-full font-semibold"
            >
              Do it
            </Button>
            <Button
              data-testid="button-adjust"
              variant="outline"
              className="rounded-full font-semibold px-6"
            >
              Adjust
            </Button>
            <Button
              data-testid="button-skip"
              variant="ghost"
              className="rounded-full font-semibold px-6"
            >
              Skip
            </Button>
          </div>
        </Card>

        <Link href="/vaults">
          <Card className="p-5 hover-elevate cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Vault className="w-5 h-5 text-primary" />
                <span className="font-semibold">View all vaults</span>
              </div>
              <span className="text-sm text-muted-foreground">3 active</span>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
