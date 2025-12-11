import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Remedies from "./pages/Remedies";
import HealthJournalPage from "./pages/HealthJournalPage";
import SafetyCheck from "./pages/SafetyCheck";
import WellnessPlan from "./pages/WellnessPlan";
import SymptomAnalyzer from "./pages/SymptomAnalyzer";
import AIChatbot from "./pages/AIChatbot";
import DailyTips from "./pages/DailyTips";
import DosageCalculator from "./pages/DosageCalculator";
import PreparationGuide from "./pages/PreparationGuide";
import SeasonalRemedies from "./pages/SeasonalRemedies";
import NaturalBeauty from "./pages/NaturalBeauty";
import SleepOptimizer from "./pages/SleepOptimizer";
import StressRelief from "./pages/StressRelief";
import ImmunityBooster from "./pages/ImmunityBooster";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="remedyflow-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/remedies" element={<Remedies />} />
              <Route path="/ai/chatbot" element={<AIChatbot />} />
              <Route path="/ai/daily-tips" element={<DailyTips />} />
              <Route path="/ai/journal" element={<HealthJournalPage />} />
              <Route path="/ai/safety" element={<SafetyCheck />} />
              <Route path="/ai/wellness-plan" element={<WellnessPlan />} />
              <Route path="/ai/symptoms" element={<SymptomAnalyzer />} />
              <Route path="/ai/dosage" element={<DosageCalculator />} />
              <Route path="/ai/preparation" element={<PreparationGuide />} />
              <Route path="/ai/seasonal" element={<SeasonalRemedies />} />
              <Route path="/ai/beauty" element={<NaturalBeauty />} />
              <Route path="/ai/sleep" element={<SleepOptimizer />} />
              <Route path="/ai/stress" element={<StressRelief />} />
              <Route path="/ai/immunity" element={<ImmunityBooster />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
