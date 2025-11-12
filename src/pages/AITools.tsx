import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { AIAssistant } from "@/components/AIAssistant";
import { RemedyComparator } from "@/components/RemedyComparator";
import { HealthJournal } from "@/components/HealthJournal";
import { ContraindicationChecker } from "@/components/ContraindicationChecker";
import { WellnessPlanGenerator } from "@/components/WellnessPlanGenerator";
import { DailyWellnessTip } from "@/components/DailyWellnessTip";
import { AIRemedyCard } from "@/components/AIRemedyCard";
import { useToast } from "@/hooks/use-toast";
import { AIRemedy } from "@/types/remedy";
import { Loader2, Sparkles, Brain } from "lucide-react";

export default function AITools() {
  const [aiRemedies, setAiRemedies] = useState<AIRemedy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string>("");
  const { toast } = useToast();

  const handleRemedyCompare = async (remedies: string[]) => {
    setIsLoading(true);
    setActiveFeature("Remedy Comparison");
    setAiRemedies([]);
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Compare these home remedies: ${remedies.join(', ')}. Analyze their effectiveness, benefits, drawbacks, potential side effects, and provide a clear recommendation. Format as JSON with: name (as "Remedy Comparison"), healthIssue (as "Comparison Analysis"), remedy (detailed comparison), benefits, precautions.`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const comparison = JSON.parse(jsonMatch[0]);
        setAiRemedies([comparison]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Comparison failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHealthJournalAnalysis = async (entries: any[]) => {
    setIsLoading(true);
    setActiveFeature("Health Journal Analysis");
    setAiRemedies([]);
    
    try {
      const entriesText = entries.map(e => 
        `Date: ${e.date}, Symptoms: ${e.symptoms}, Severity: ${e.severity}/10`
      ).join('\n');

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Analyze these health journal entries and provide insights:\n${entriesText}\n\nIdentify patterns, trends in severity, suggest possible remedies, and provide health recommendations. Format as JSON with: name (as "Health Pattern Analysis"), healthIssue (as "Insights from Journal"), remedy (your detailed analysis and recommendations), benefits (as "Positive Patterns"), precautions (as "Areas of Concern").`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        setAiRemedies([analysis]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Analysis failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContraindicationCheck = async (items: { remedies: string[], medications: string[], conditions: string[] }) => {
    setIsLoading(true);
    setActiveFeature("Safety Check");
    setAiRemedies([]);
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Check for potential contraindications and dangerous interactions between:\nRemedies: ${items.remedies.join(', ') || 'None'}\nMedications: ${items.medications.join(', ') || 'None'}\nMedical Conditions: ${items.conditions.join(', ') || 'None'}\n\nProvide a detailed safety analysis with warnings about potential interactions. Format as JSON with: name (as "Safety Analysis"), healthIssue (as "Contraindication Check"), remedy (detailed analysis of interactions), benefits (as "Safe Combinations"), precautions (critical warnings).`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        setAiRemedies([analysis]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Check failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWellnessPlanGeneration = async (goals: string[], duration: string) => {
    setIsLoading(true);
    setActiveFeature(`${duration}-Day Wellness Plan`);
    setAiRemedies([]);
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Create a personalized ${duration}-day wellness plan for these health goals: ${goals.join(', ')}. Include daily remedies, practices, yoga poses, dietary tips, and lifestyle recommendations. Format as JSON array with 5-7 entries, each containing: name (descriptive title), healthIssue (the goal addressed), remedy (detailed daily practice), benefits, duration (time needed), precautions.`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const plan = JSON.parse(jsonMatch[0]);
        setAiRemedies(plan);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Generation failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Navbar />
      <AIAssistant />
      
      <div className="pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <Brain className="w-16 h-16 text-primary" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                AI-Powered Tools
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced AI features to analyze, compare, and optimize your natural healing journey
            </p>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <DailyWellnessTip />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <RemedyComparator onCompare={handleRemedyCompare} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ContraindicationChecker onCheck={handleContraindicationCheck} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <HealthJournal onAnalyze={handleHealthJournalAnalysis} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <WellnessPlanGenerator onGenerate={handleWellnessPlanGeneration} />
            </motion.div>
          </div>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-lg font-medium text-foreground">
                  Analyzing with AI...
                </span>
                <Sparkles className="w-6 h-6 text-secondary animate-pulse" />
              </div>
            </motion.div>
          )}

          {aiRemedies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold mb-6 text-center font-poppins">
                {activeFeature} Results
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiRemedies.map((remedy, index) => (
                  <AIRemedyCard key={index} remedy={remedy} index={index} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
