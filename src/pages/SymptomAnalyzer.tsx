import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { SymptomChecker } from "@/components/SymptomChecker";
import { AIRemedyCard } from "@/components/AIRemedyCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Stethoscope } from "lucide-react";
import { AIRemedy } from "@/types/remedy";

export default function SymptomAnalyzer() {
  const [aiRemedies, setAiRemedies] = useState<AIRemedy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSymptomAnalysis = async (symptoms: string[]) => {
    setIsLoading(true);
    setAiRemedies([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [
            { role: "user", content: `Analyze these symptoms: ${symptoms.join(', ')}. Provide potential causes, recommend appropriate home remedies, suggest lifestyle changes, and advise when to seek medical attention. Format as JSON array with 3-5 remedy entries, each containing: name (remedy name), healthIssue (the symptom addressed), remedy (detailed instructions), benefits, precautions, duration.` }
          ],
          systemPrompt: "You are a medical AI assistant. Provide symptom analysis and safe home remedy recommendations. Always respond with valid JSON array."
        }
      });

      if (error) throw error;

      const text = data.choices?.[0]?.message?.content || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        setAiRemedies(analysis.map((item: any) => ({ ...item, source: "AI-Generated" })));
      }
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Analysis failed", description: "Please try again", variant: "destructive" });
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
              <Stethoscope className="w-16 h-16 text-primary" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                AI Symptom Analyzer
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get AI-powered symptom analysis and personalized remedy recommendations
            </p>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <SymptomChecker onSearch={handleSymptomAnalysis} />
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
                  Analyzing symptoms with Gemini AI...
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
                Recommended Remedies
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
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
