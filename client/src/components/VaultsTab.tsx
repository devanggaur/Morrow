import { useState } from "react";
import { Button } from "@/components/ui/button";
import VaultCard from "./VaultCard";
import VaultDetail from "./VaultDetail";
import { Plus } from "lucide-react";

const mockVaults = [
  { id: 1, name: "Emergency Fund", balance: 1250, target: 5000, locked: true },
  { id: 2, name: "Vacation", balance: 890, target: 3000, locked: false },
  { id: 3, name: "New Laptop", balance: 450, target: 2000, locked: true },
];

export default function VaultsTab() {
  const [selectedVault, setSelectedVault] = useState<number | null>(null);

  if (selectedVault !== null) {
    const vault = mockVaults.find((v) => v.id === selectedVault);
    if (vault) {
      return (
        <VaultDetail
          {...vault}
          onBack={() => setSelectedVault(null)}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Your Vaults</h1>
          <Button
            data-testid="button-new-vault"
            size="icon"
            className="rounded-full"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {mockVaults.map((vault) => (
            <VaultCard
              key={vault.id}
              {...vault}
              onClick={() => setSelectedVault(vault.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
