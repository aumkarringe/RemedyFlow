import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { ContraindicationChecker } from "@/components/ContraindicationChecker";
import { AIRemedyCard } from "@/components/AIRemedyCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { AIRemedy } from "@/types/remedy";

export default function SafetyCheck() {
  const [aiRemedies, setAiRemedies] = useState<AIRemedy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleContraindicationCheck = async (items: { remedies: string[], medications: string[], conditions: string[] }) => {
    setIsLoading(true);
    setAiRemedies([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('openrouter-chat', {
        body: {
          messages: [
            { role: "user", content: `Check safety of combining:\nRemedies: ${items.remedies.join(', ') || 'None'}\nMedications: ${items.medications.join(', ') || 'None'}\nConditions: ${items.conditions.join(', ') || 'None'}` }
          ],
          context: "Provide a detailed safety analysis with warnings about potential interactions. Return as JSON with: name (as 'Safety Analysis'), healthIssue (as 'Contraindication Check'), remedy (detailed analysis), benefits (safe combinations), precautions (critical warnings). Always recommend consulting a healthcare provider."
        }
      });

      if (error) throw error;

      if (data.blocked) {
        toast({ title: "Safety Notice", description: data.response, variant: "destructive" });
        return;
      }

      const jsonMatch = data.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        setAiRemedies([{ ...analysis, source: "AI-Generated" }]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Check failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Navbar />
      
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
              <ShieldCheck className="w-16 h-16 text-primary" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Safety & Contraindication Check
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Verify the safety of combining remedies with medications and medical conditions
            </p>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ContraindicationChecker onCheck={handleContraindicationCheck} />
          </motion.div>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <div className="flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-lg font-medium text-foreground">
                  Analyzing with Gemini AI...
                </span>
                <Sparkles className="w-6 h-6 text-secondary animate-pulse" />
              </div>
            </motion.div>
          )}

          {aiRemedies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <h2 className="text-2xl font-bold mb-6 text-center font-poppins">
                Safety Analysis Results
              </h2>
              <div className="grid gap-6">
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
