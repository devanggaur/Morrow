import ChallengeCard from "./ChallengeCard";

const activeChallenges = [
  {
    emoji: "☕",
    title: "Coffee Swap",
    description: "Make coffee at home instead of buying out for 5 days",
    reward: "Save ~$25",
    progress: 60,
    streak: 3,
    isActive: true,
  },
];

const availableChallenges = [
  {
    emoji: "🍕",
    title: "No-Takeout Weekend",
    description: "Cook all meals at home this weekend",
    reward: "Save ~$40",
  },
  {
    emoji: "💳",
    title: "Zero-Spend Day",
    description: "Go 24 hours without spending anything",
    reward: "Save whatever you would've spent",
  },
  {
    emoji: "🚶",
    title: "Walk Instead",
    description: "Choose walking over rideshare 3 times this week",
    reward: "Save ~$30",
  },
  {
    emoji: "📱",
    title: "Streaming Pause",
    description: "Skip one streaming service this month",
    reward: "Save $15",
  },
  {
    emoji: "🛒",
    title: "List-Only Shopping",
    description: "Only buy items on your shopping list for a week",
    reward: "Save ~$50",
  },
];

export default function ChallengesScreen() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-3">Challenges</h1>
        <p className="text-muted-foreground mb-6">
          Fun ways to save more and build better habits
        </p>

        {activeChallenges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Active</h2>
            <div className="space-y-4">
              {activeChallenges.map((challenge, i) => (
                <ChallengeCard key={i} {...challenge} />
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold mb-4">Available</h2>
          <div className="space-y-4">
            {availableChallenges.map((challenge, i) => (
              <ChallengeCard key={i} {...challenge} isActive={false} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
