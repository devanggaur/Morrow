import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Ticket, PartyPopper, TrendingUp, Trophy, Repeat, Zap, Heart, Loader2 } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { useLocusWallet, useLocusCharities, useLocusDonate } from "@/hooks/useAPI";
import { useToast } from "@/hooks/use-toast";

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
  const [showDonateDialog, setShowDonateDialog] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState<any>(null);
  const [donateAmount, setDonateAmount] = useState("");

  const { toast } = useToast();
  const { userId } = useAppContext();

  const { data: walletData, isLoading: isLoadingWallet } = useLocusWallet(userId);
  const { data: charitiesData, isLoading: isLoadingCharities } = useLocusCharities();
  const donateMutation = useLocusDonate();

  const walletBalance = walletData?.balance ?? 0;
  const totalRewards = walletData?.totalRewards ?? 0;
  const charities = charitiesData?.charities ?? [];

  const handleDonate = async () => {
    if (!donateAmount || !selectedCharity) return;

    try {
      await donateMutation.mutateAsync({
        charityId: selectedCharity.charity_id,
        amount: parseFloat(donateAmount),
        fromAddress: process.env.LOCUS_WALLET_ADDRESS || "",
      });

      toast({
        title: "Donation sent!",
        description: `Successfully donated $${donateAmount} to ${selectedCharity.charity_name}.`,
      });

      setShowDonateDialog(false);
      setDonateAmount("");
      setSelectedCharity(null);
    } catch (error) {
      toast({
        title: "Donation failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };
  return (
    <>
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
              {isLoadingWallet ? (
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              ) : (
                <>
                  <p className="text-4xl font-bold text-primary mb-1">
                    ${walletBalance.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Available to spend • ${totalRewards.toFixed(2)} total rewards
                  </p>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button
                data-testid="button-spend-fun-money"
                className="rounded-full"
              >
                Unlock to checking
              </Button>
              <Button
                variant="outline"
                className="rounded-full gap-2"
                onClick={() => {
                  if (charities.length > 0) {
                    setSelectedCharity(charities[0]);
                    setShowDonateDialog(true);
                  }
                }}
              >
                <Heart className="w-4 h-4" />
                Donate
              </Button>
            </div>
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

      <Dialog open={showDonateDialog} onOpenChange={setShowDonateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Donate to charity</DialogTitle>
            <DialogDescription>
              Use your fun money wallet to support causes you care about.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="charity">Select charity</Label>
              {isLoadingCharities ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <select
                  id="charity"
                  className="w-full p-2 border rounded-md"
                  value={selectedCharity?.charity_id || ""}
                  onChange={(e) => {
                    const charity = charities.find(
                      (c: any) => c.charity_id === e.target.value
                    );
                    setSelectedCharity(charity);
                  }}
                >
                  {charities.map((charity: any) => (
                    <option key={charity.charity_id} value={charity.charity_id}>
                      {charity.charity_name}
                    </option>
                  ))}
                </select>
              )}
              {selectedCharity && (
                <p className="text-xs text-muted-foreground">
                  {selectedCharity.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="donate-amount">Amount (USDC)</Label>
              <Input
                id="donate-amount"
                type="number"
                placeholder="0.00"
                value={donateAmount}
                onChange={(e) => setDonateAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Available: ${walletBalance.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDonateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleDonate}
              disabled={
                !donateAmount ||
                !selectedCharity ||
                donateMutation.isPending ||
                parseFloat(donateAmount) > walletBalance
              }
            >
              {donateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Donating...
                </>
              ) : (
                "Donate"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
