import { useState } from "react";
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
import VaultCard from "./VaultCard";
import VaultDetail from "./VaultDetail";
import { Plus, Loader2 } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { useIncreaseAccounts, useCreateIncreaseVault } from "@/hooks/useAPI";
import { useToast } from "@/hooks/use-toast";

export default function VaultsTab() {
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [vaultName, setVaultName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");

  const { toast } = useToast();
  const { increaseEntityId } = useAppContext();

  const { data: accountsData, isLoading } = useIncreaseAccounts(increaseEntityId);
  const createVaultMutation = useCreateIncreaseVault();

  const vaults = accountsData?.accounts || [];

  const handleCreateVault = async () => {
    if (!vaultName.trim() || !increaseEntityId) return;

    try {
      await createVaultMutation.mutateAsync({
        entityId: increaseEntityId,
        name: vaultName,
        purpose: "savings",
        goalAmount: goalAmount ? parseFloat(goalAmount) : undefined,
      });

      toast({
        title: "Vault created!",
        description: `Your ${vaultName} vault has been created.`,
      });

      setShowCreateDialog(false);
      setVaultName("");
      setGoalAmount("");
    } catch (error) {
      toast({
        title: "Failed to create vault",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (selectedVaultId !== null) {
    const vault = vaults.find((v: any) => v.account_id === selectedVaultId);
    if (vault) {
      return (
        <VaultDetail
          accountId={vault.account_id}
          name={vault.name}
          balance={vault.current_balance}
          target={5000} // TODO: Get from vault metadata
          locked={true} // TODO: Get from vault metadata
          onBack={() => setSelectedVaultId(null)}
        />
      );
    }
  }

  if (!increaseEntityId) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold mb-2">No Increase Account</h2>
          <p className="text-muted-foreground">
            You need to set up your Increase account first to create vaults.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Your Vaults</h1>
            <Button
              data-testid="button-new-vault"
              size="icon"
              className="rounded-full"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : vaults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You don't have any vaults yet.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Create your first vault
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {vaults.map((vault: any) => (
                <VaultCard
                  key={vault.account_id}
                  name={vault.name}
                  balance={vault.current_balance}
                  target={5000} // TODO: Get from vault metadata
                  locked={true} // TODO: Get from vault metadata
                  onClick={() => setSelectedVaultId(vault.account_id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new vault</DialogTitle>
            <DialogDescription>
              Vaults help you save for specific goals with smart features like soft-locks.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vault-name">Vault name</Label>
              <Input
                id="vault-name"
                placeholder="e.g., Emergency Fund, Vacation"
                value={vaultName}
                onChange={(e) => setVaultName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-amount">Goal amount (optional)</Label>
              <Input
                id="goal-amount"
                type="number"
                placeholder="e.g., 5000"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateVault}
              disabled={!vaultName.trim() || createVaultMutation.isPending}
            >
              {createVaultMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create vault"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
