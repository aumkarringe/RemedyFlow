import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "./pages/Home";
import Remedies from "./pages/Remedies";
import HealthJournalPage from "./pages/HealthJournalPage";
import SafetyCheck from "./pages/SafetyCheck";
import WellnessPlan from "./pages/WellnessPlan";
import SymptomAnalyzer from "./pages/SymptomAnalyzer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="remedyflow-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/remedies" element={<Remedies />} />
            <Route path="/ai/journal" element={<HealthJournalPage />} />
            <Route path="/ai/safety" element={<SafetyCheck />} />
            <Route path="/ai/wellness-plan" element={<WellnessPlan />} />
            <Route path="/ai/symptoms" element={<SymptomAnalyzer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
