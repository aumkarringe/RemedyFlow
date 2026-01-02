import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { AIRemedyCard } from "@/components/AIRemedyCard";
import { WellnessResponse } from "@/components/WellnessResponse";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Stethoscope, History, TrendingUp, AlertCircle } from "lucide-react";
import { AIRemedy } from "@/types/remedy";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SymptomHistory {
  id: string;
  symptoms: string[];
  severity: string;
  analysis: string;
  recommendations: any;
  future_predictions: any;
  created_at: string;
}

export default function SymptomAnalyzer() {
  const [aiRemedies, setAiRemedies] = useState<AIRemedy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [symptomInput, setSymptomInput] = useState("");
  const [analysis, setAnalysis] = useState<string>("");
  const [futurePredictions, setFuturePredictions] = useState<string>("");
  const [symptomHistory, setSymptomHistory] = useState<SymptomHistory[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSymptomHistory();
    }
  }, [user]);

  const fetchSymptomHistory = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("user_symptoms")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data && !error) {
      setSymptomHistory(data);
    }
  };

  const saveSymptomAnalysis = async (symptoms: string[], analysisText: string, recommendations: any, predictions: any) => {
    if (!user) return;

    const { error } = await supabase.from("user_symptoms").insert({
      user_id: user.id,
      symptoms,
      severity: "moderate",
      analysis: analysisText,
      recommendations,
      future_predictions: predictions,
    });

    if (!error) {
      fetchSymptomHistory();
    }
  };

  const handleSymptomAnalysis = async () => {
    if (!symptomInput.trim()) return;
    
    setIsLoading(true);
    setAiRemedies([]);
    setAnalysis("");
    setFuturePredictions("");
    
    try {
      const { data, error } = await supabase.functions.invoke('openrouter-chat', {
        body: {
          messages: [
            { 
              role: "user", 
              content: `Analyze these symptoms: ${symptomInput}

Please provide a comprehensive analysis in the following format:

## Current Assessment
Provide a brief assessment of the symptoms and potential causes.

## Recommended Remedies
Suggest 3-5 natural home remedies with detailed instructions.

## Lifestyle Recommendations  
Suggest lifestyle changes that may help.

## Future Health Considerations
Based on these symptoms, what should the person monitor or be aware of for their future health? What preventive measures would you recommend?

## When to Seek Medical Attention
List warning signs that would require professional medical care.

Also provide the remedies as a JSON array at the end with format:
[{"name": "Remedy Name", "healthIssue": "symptom", "remedy": "instructions", "benefits": "benefits", "precautions": "precautions", "duration": "duration"}]` 
            }
          ],
          context: "Symptom analysis and remedy recommendation"
        }
      });

      if (error) throw error;

      if (data.blocked) {
        setAnalysis(data.response);
        toast({ 
          title: "Safety Notice", 
          description: "Some topics require professional medical consultation.",
        });
        return;
      }

      const responseText = data.response || '';
      
      // Extract remedies JSON if present
      const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        try {
          const remedies = JSON.parse(jsonMatch[0]);
          setAiRemedies(remedies.map((item: any) => ({ ...item, source: "Smart Analysis" })));
        } catch (e) {
          console.log("Could not parse remedies JSON");
        }
      }

      // Store the full analysis
      setAnalysis(responseText.replace(/\[[\s\S]*?\]/, '').trim());

      // Extract future predictions section
      const futureMatch = responseText.match(/## Future Health Considerations[\s\S]*?(?=##|$)/);
      if (futureMatch) {
        setFuturePredictions(futureMatch[0]);
      }

      // Save to database if user is logged in
      const symptoms = symptomInput.split(',').map(s => s.trim()).filter(Boolean);
      if (user) {
        await saveSymptomAnalysis(
          symptoms, 
          responseText, 
          aiRemedies,
          { predictions: futurePredictions }
        );
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
                Symptom Analyzer
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get intelligent symptom analysis and personalized remedy recommendations
            </p>
          </div>
        </motion.div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="analyze" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="analyze">Analyze Symptoms</TabsTrigger>
              <TabsTrigger value="history" disabled={!user}>
                <History className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyze">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)] border border-border"
              >
                <h2 className="text-xl font-semibold mb-4 font-poppins text-foreground">
                  Describe Your Symptoms
                </h2>
                <div className="flex gap-3">
                  <Input
                    placeholder="e.g., headache, sore throat, fatigue..."
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSymptomAnalysis()}
                    className="flex-1"
                  />
                  <Button onClick={handleSymptomAnalysis} disabled={isLoading || !symptomInput.trim()}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze
                  </Button>
                </div>
                
                {!user && (
                  <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Sign in to save your symptom history and get personalized insights
                  </p>
                )}
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
                      Analyzing your symptoms...
                    </span>
                    <Sparkles className="w-6 h-6 text-secondary animate-pulse" />
                  </div>
                </motion.div>
              )}

              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <WellnessResponse content={analysis} />
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
            </TabsContent>

            <TabsContent value="history">
              {symptomHistory.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <History className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No History Yet</h3>
                    <p className="text-muted-foreground text-center">
                      Your symptom analyses will appear here after you perform your first analysis.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {symptomHistory.map((record) => (
                    <Card key={record.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Stethoscope className="w-4 h-4 text-primary" />
                              Symptom Analysis
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {new Date(record.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <Badge variant="secondary">{record.severity}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {record.symptoms.map((symptom, idx) => (
                            <Badge key={idx} variant="outline">{symptom}</Badge>
                          ))}
                        </div>
                        {record.analysis && (
                          <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-sm text-foreground/80 line-clamp-3">
                              {record.analysis.substring(0, 300)}...
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}