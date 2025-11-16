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
import { Ticket, PartyPopper, TrendingUp, Trophy, Repeat, Zap, Heart, Loader2, Coins, Gift, Check } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { useLocusWallet, useLocusCharities, useLocusDonate, useLocusTransactions, useLocusGiftCards, useLocusRedeemGiftCard } from "@/hooks/useAPI";
import { useToast } from "@/hooks/use-toast";

// Helper to format timestamp
function formatTimeAgo(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return `${Math.floor(seconds / 604800)} weeks ago`;
}

// Helper to get icon for reward type
function getRewardIcon(type: string) {
  switch (type) {
    case 'windfall':
      return <Zap className="w-5 h-5 text-primary" />;
    case 'sweep':
      return <TrendingUp className="w-5 h-5 text-primary" />;
    case 'roundup':
      return <Repeat className="w-5 h-5 text-primary" />;
    case 'redemption':
      return <Gift className="w-5 h-5 text-destructive" />;
    default:
      return <Coins className="w-5 h-5 text-primary" />;
  }
}

export default function RewardsTab() {
  const [showDonateDialog, setShowDonateDialog] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState<any>(null);
  const [donateAmount, setDonateAmount] = useState("");

  const [showGiftCardDialog, setShowGiftCardDialog] = useState(false);
  const [selectedGiftCard, setSelectedGiftCard] = useState<any>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const { toast } = useToast();
  const { userId } = useAppContext();

  const { data: walletData, isLoading: isLoadingWallet } = useLocusWallet(userId);
  const { data: charitiesData, isLoading: isLoadingCharities } = useLocusCharities();
  const { data: transactionsData, isLoading: isLoadingTransactions } = useLocusTransactions(userId);
  const { data: giftCardsData, isLoading: isLoadingGiftCards } = useLocusGiftCards();
  const donateMutation = useLocusDonate();
  const redeemGiftCardMutation = useLocusRedeemGiftCard();

  const walletBalance = walletData?.balance ?? 0;
  const totalRewards = walletData?.totalRewards ?? 0;
  const charities = charitiesData?.charities ?? [];
  const transactions = transactionsData?.transactions ?? [];
  const giftCards = giftCardsData?.giftCards ?? [];

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

  const handleRedeemGiftCard = async () => {
    if (!selectedGiftCard || !selectedAmount) return;

    try {
      const result = await redeemGiftCardMutation.mutateAsync({
        userId,
        giftCardId: selectedGiftCard.id,
        amount: selectedAmount,
      });

      toast({
        title: "Gift Card Redeemed!",
        description: `Your ${selectedGiftCard.brand} $${selectedAmount} gift card code: ${result.gift_card_code}`,
        duration: 10000, // Show longer so user can copy code
      });

      setShowGiftCardDialog(false);
      setSelectedGiftCard(null);
      setSelectedAmount(null);
    } catch (error) {
      toast({
        title: "Redemption failed",
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
                <Coins className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">USDC Rewards Wallet</h2>
                <p className="text-sm text-muted-foreground">
                  Crypto rewards powered by Locus
                </p>
              </div>
            </div>
            <div className="text-center py-4">
              {isLoadingWallet ? (
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              ) : (
                <>
                  <p className="text-4xl font-bold text-primary mb-1">
                    ${walletBalance.toFixed(2)} USDC
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Available balance • ${totalRewards.toFixed(2)} earned from savings
                  </p>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button
                data-testid="button-spend-fun-money"
                className="rounded-full gap-2"
                onClick={() => setShowGiftCardDialog(true)}
                disabled={walletBalance === 0}
              >
                <Gift className="w-4 h-4" />
                Redeem
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
            <h2 className="text-xl font-bold mb-4">USDC Reward History</h2>
            {isLoadingTransactions ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : transactions.length === 0 ? (
              <Card className="p-6 text-center">
                <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground mb-1">
                  No rewards yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Start saving to earn USDC rewards!
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx: any) => (
                  <Card key={tx.id} className="p-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {getRewardIcon(tx.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm mb-1">{tx.description}</p>
                        <p className="text-xs text-primary font-semibold mb-1">
                          {tx.amount >= 0 ? '+' : ''}${tx.amount.toFixed(2)} USDC {tx.type === 'redemption' ? 'spent' : 'reward'}
                          {tx.savingsAmount && ` • Saved $${tx.savingsAmount.toFixed(2)}`}
                          {tx.giftCard && ` • ${tx.giftCard.brand} $${tx.giftCard.amount}`}
                        </p>
                        {tx.transaction_hash && (
                          <p className="text-xs text-muted-foreground mb-1 font-mono break-all">
                            ⛓️ TX: {tx.transaction_hash.substring(0, 16)}...
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(tx.timestamp)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
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

      <Dialog open={showGiftCardDialog} onOpenChange={setShowGiftCardDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Redeem Gift Card</DialogTitle>
            <DialogDescription>
              Use your USDC rewards to get gift cards from popular brands
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {isLoadingGiftCards ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {giftCards.map((gc: any) => (
                  <Card
                    key={gc.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedGiftCard?.id === gc.id
                        ? 'border-primary border-2 bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setSelectedGiftCard(gc);
                      setSelectedAmount(null); // Reset amount when changing card
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{gc.image}</div>
                      <div className="flex-1">
                        <p className="font-semibold">{gc.brand}</p>
                        <p className="text-xs text-muted-foreground">{gc.description}</p>
                      </div>
                      {selectedGiftCard?.id === gc.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>

                    {selectedGiftCard?.id === gc.id && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium mb-2">Select amount:</p>
                        <div className="grid grid-cols-4 gap-2">
                          {gc.denominations.map((amount: number) => (
                            <Button
                              key={amount}
                              variant={selectedAmount === amount ? 'default' : 'outline'}
                              size="sm"
                              className="h-auto py-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAmount(amount);
                              }}
                              disabled={amount > walletBalance}
                            >
                              ${amount}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowGiftCardDialog(false);
                setSelectedGiftCard(null);
                setSelectedAmount(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleRedeemGiftCard}
              disabled={
                !selectedGiftCard ||
                !selectedAmount ||
                redeemGiftCardMutation.isPending ||
                selectedAmount > walletBalance
              }
            >
              {redeemGiftCardMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redeeming...
                </>
              ) : (
                "Redeem"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
