import VaultCard from "../VaultCard";

export default function VaultCardExample() {
  return (
    <div className="p-6 space-y-4 bg-background">
      <VaultCard
        name="Emergency Fund"
        balance={1250}
        target={5000}
        locked={true}
        onClick={() => console.log("Vault clicked")}
      />
      <VaultCard
        name="Vacation"
        balance={890}
        target={3000}
        locked={false}
        onClick={() => console.log("Vault clicked")}
      />
    </div>
  );
}
