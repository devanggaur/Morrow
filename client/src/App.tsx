import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Onboarding from "@/pages/Onboarding";
import Home from "@/pages/Home";
import Vaults from "@/pages/Vaults";
import SavingsLab from "@/pages/SavingsLab";
import Challenges from "@/pages/Challenges";
import Rewards from "@/pages/Rewards";
import Coach from "@/pages/Coach";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/onboarding" />} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/home" component={Home} />
      <Route path="/vaults" component={Vaults} />
      <Route path="/savings-lab" component={SavingsLab} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/rewards" component={Rewards} />
      <Route path="/coach" component={Coach} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="w-full max-w-[390px] mx-auto bg-background min-h-screen">
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
