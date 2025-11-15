import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AppProvider } from "./contexts/AppContext";
import { Toaster } from "./components/ui/toaster";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <App />
      <Toaster />
    </AppProvider>
  </QueryClientProvider>
);
