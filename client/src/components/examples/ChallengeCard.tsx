import ChallengeCard from "../ChallengeCard";

export default function ChallengeCardExample() {
  return (
    <div className="p-6 space-y-4 bg-background">
      <ChallengeCard
        emoji="☕"
        title="Coffee Swap"
        description="Make coffee at home instead of buying out for 5 days"
        reward="Save ~$25"
        progress={60}
        streak={3}
        isActive={true}
      />
      <ChallengeCard
        emoji="🍕"
        title="No-Takeout Weekend"
        description="Cook all meals at home this weekend"
        reward="Save ~$40"
        isActive={false}
      />
      <ChallengeCard
        emoji="💳"
        title="Zero-Spend Day"
        description="Go 24 hours without spending anything"
        reward="Save whatever you would've spent"
        streak={0}
        isActive={false}
      />
    </div>
  );
}
