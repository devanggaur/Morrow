import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ticket, PartyPopper, TrendingUp, Trophy, Repeat, Zap } from "lucide-react";

const activityFeed = [
  {
    icon: <TrendingUp className="w-5 h-5 text-primary" />,
    action: "Saved $40 with Smart Sweep",
    reward: "earned 2 entries",
    time: "2 hours ago",
  },
  {
    icon: <Trophy className="w-5 h-5 text-primary" />,
    action: "Completed Coffee Swap challenge",
    reward: "unlocked $5 fun wallet credit",
    time: "Yesterday",
  },
  {
    icon: <Repeat className="w-5 h-5 text-primary" />,
    action: "Round-ups accumulated $12",
    reward: "earned 1 entry",
    time: "2 days ago",
  },
  {
    icon: <Zap className="w-5 h-5 text-primary" />,
    action: "Windfall save: $180",
    reward: "earned 9 entries",
    time: "1 week ago",
  },
];

export default function RewardsTab() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Rewards</h1>

        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
              <PartyPopper className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">Fun Money Wallet</h2>
              <p className="text-sm text-muted-foreground">
                Guilt-free spending from your savings wins
              </p>
            </div>
          </div>
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-primary mb-1">$47.50</p>
            <p className="text-sm text-muted-foreground">Available to spend</p>
          </div>
          <Button
            data-testid="button-spend-fun-money"
            className="w-full rounded-full mt-4"
          >
            Unlock to checking
          </Button>
        </Card>

        <Card className="p-6 mb-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Ticket className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">Fun Money Lottery</h2>
              <Badge variant="secondary" className="text-xs">
                Next draw: Sunday 8pm
              </Badge>
            </div>
          </div>

          <div className="bg-muted/30 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your entries</p>
                <p className="text-3xl font-bold">24</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Prize pool</p>
                <p className="text-2xl font-bold text-primary">$100</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Every $10 you save = 1 entry. More entries = better odds!
          </p>

          <Button
            data-testid="button-how-lottery-works"
            variant="outline"
            className="w-full rounded-full"
          >
            How it works
          </Button>
        </Card>

        <div>
          <h2 className="text-xl font-bold mb-4">Activity</h2>
          <div className="space-y-3">
            {activityFeed.map((item, i) => (
              <Card key={i} className="p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm mb-1">{item.action}</p>
                    <p className="text-xs text-primary font-semibold mb-1">
                      {item.reward}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
