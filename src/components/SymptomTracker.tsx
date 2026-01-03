import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { WellnessResponse } from "@/components/WellnessResponse";
import { 
  Plus, Loader2, Activity, Calendar, TrendingUp, 
  Heart, AlertTriangle, Sparkles, ChevronRight
} from "lucide-react";

interface SymptomRecord {
  id: string;
  symptoms: string[];
  severity: string;
  notes: string | null;
  analysis: string | null;
  recommendations: any;
  future_predictions: any;
  created_at: string;
}

export function SymptomTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState([5]);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [symptomHistory, setSymptomHistory] = useState<SymptomRecord[]>([]);
  const [wellnessInsight, setWellnessInsight] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSymptomHistory();
    }
  }, [user]);

  const fetchSymptomHistory = async () => {
    if (!user) return;
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from("user_symptoms")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data && !error) {
      setSymptomHistory(data);
    }
    setIsLoading(false);
  };

  const addSymptom = async () => {
    if (!user || !symptoms.trim()) {
      toast({ title: "Please enter symptoms", variant: "destructive" });
      return;
    }

    const symptomArray = symptoms.split(',').map(s => s.trim()).filter(Boolean);
    const severityLevel = severity[0] <= 3 ? "mild" : severity[0] <= 6 ? "moderate" : "severe";

    const { error } = await supabase.from("user_symptoms").insert({
      user_id: user.id,
      symptoms: symptomArray,
      severity: severityLevel,
      notes: notes || null,
    });

    if (error) {
      toast({ title: "Failed to add symptom", variant: "destructive" });
    } else {
      toast({ title: "Symptom added successfully" });
      setSymptoms("");
      setNotes("");
      setSeverity([5]);
      setShowAddForm(false);
      fetchSymptomHistory();
    }
  };

  const generateWellnessInsight = async () => {
    if (symptomHistory.length < 2) {
      toast({ 
        title: "Need more data", 
        description: "Add at least 2 symptom entries to get insights",
        variant: "destructive" 
      });
      return;
    }

    setIsAnalyzing(true);
    setWellnessInsight("");

    try {
      // Compile symptom patterns
      const allSymptoms = symptomHistory.flatMap(r => r.symptoms);
      const symptomCounts = allSymptoms.reduce((acc: Record<string, number>, s) => {
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {});
      
      const severityCounts = symptomHistory.reduce((acc: Record<string, number>, r) => {
        acc[r.severity] = (acc[r.severity] || 0) + 1;
        return acc;
      }, {});

      const recentSymptoms = symptomHistory.slice(0, 5).flatMap(r => r.symptoms);

      const { data, error } = await supabase.functions.invoke('openrouter-chat', {
        body: {
          messages: [
            { 
              role: "user", 
              content: `Based on the user's symptom tracking history, provide comprehensive wellness insights.

## Symptom History Overview:
- Total entries: ${symptomHistory.length}
- Recent symptoms (last 5 entries): ${recentSymptoms.join(', ')}
- Symptom frequency: ${JSON.stringify(symptomCounts)}
- Severity distribution: ${JSON.stringify(severityCounts)}

Please provide:

## Current Health Assessment
Analyze the overall patterns and current health state based on the symptom history.

## Key Observations
Identify any recurring patterns, concerning trends, or areas that need attention.

## Present Recommendations
What should the user focus on right now based on their symptoms? Include specific home remedies, lifestyle changes, and self-care tips.

## Future Health Outlook
Based on the patterns, what should the user be mindful of in the coming weeks? What preventive measures would help?

## Holistic Wellness Plan
Provide a brief personalized wellness plan covering:
- Diet suggestions
- Exercise recommendations
- Stress management techniques
- Sleep optimization tips

Keep the response helpful, actionable, and encouraging.`
            }
          ],
          context: "Wellness insights based on symptom history"
        }
      });

      if (error) throw error;

      if (data.blocked) {
        setWellnessInsight(data.response);
      } else {
        setWellnessInsight(data.response || "Unable to generate insights at this time.");
      }

    } catch (error) {
      console.error("Error generating insights:", error);
      toast({ 
        title: "Failed to generate insights", 
        description: "Please try again",
        variant: "destructive" 
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "mild": return "bg-green-500/10 text-green-700 border-green-500/30";
      case "moderate": return "bg-yellow-500/10 text-yellow-700 border-yellow-500/30";
      case "severe": return "bg-red-500/10 text-red-700 border-red-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTopSymptoms = () => {
    const allSymptoms = symptomHistory.flatMap(r => r.symptoms);
    const counts = allSymptoms.reduce((acc: Record<string, number>, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{symptomHistory.length}</p>
                <p className="text-xs text-muted-foreground">Total Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Heart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {symptomHistory.filter(r => r.severity === "mild").length}
                </p>
                <p className="text-xs text-muted-foreground">Mild Cases</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {symptomHistory.filter(r => r.severity === "moderate").length}
                </p>
                <p className="text-xs text-muted-foreground">Moderate Cases</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/5 to-red-500/10 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <TrendingUp className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {symptomHistory.filter(r => r.severity === "severe").length}
                </p>
                <p className="text-xs text-muted-foreground">Severe Cases</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Symptoms */}
      {getTopSymptoms().length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Most Reported Symptoms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getTopSymptoms().map(([symptom, count]) => (
                <Badge 
                  key={symptom} 
                  variant="secondary" 
                  className="px-3 py-1 text-sm"
                >
                  {symptom} <span className="ml-1 opacity-60">×{count}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Symptom Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Track Your Symptoms
              </CardTitle>
              <CardDescription>
                Log what you're feeling to get personalized wellness insights
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              variant={showAddForm ? "secondary" : "default"}
            >
              <Plus className="h-4 w-4 mr-2" />
              {showAddForm ? "Cancel" : "Add Symptom"}
            </Button>
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <CardContent className="space-y-4 border-t border-border pt-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    What symptoms are you experiencing?
                  </label>
                  <Input
                    placeholder="e.g., headache, fatigue, sore throat (comma separated)"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Severity: {severity[0]}/10 ({severity[0] <= 3 ? "Mild" : severity[0] <= 6 ? "Moderate" : "Severe"})
                  </label>
                  <Slider
                    value={severity}
                    onValueChange={setSeverity}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Additional Notes (optional)
                  </label>
                  <Textarea
                    placeholder="Any additional context about how you're feeling..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                <Button onClick={addSymptom} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Save Symptom Entry
                </Button>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Generate Wellness Insights */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Get Personalized Wellness Insights
                </h3>
                <p className="text-sm text-muted-foreground">
                  Analyze your symptom patterns for present and future health recommendations
                </p>
              </div>
            </div>
            <Button 
              onClick={generateWellnessInsight} 
              disabled={isAnalyzing || symptomHistory.length < 2}
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wellness Insight Result */}
      {wellnessInsight && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <WellnessResponse content={wellnessInsight} />
        </motion.div>
      )}

      {/* Recent Symptom History */}
      {symptomHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent Symptom History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {symptomHistory.slice(0, 5).map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(record.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <Badge className={getSeverityColor(record.severity)}>
                      {record.severity}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {record.symptoms.map((symptom, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                  {record.notes && (
                    <p className="text-sm text-muted-foreground">
                      {record.notes}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
            
            {symptomHistory.length > 5 && (
              <Button variant="ghost" className="w-full mt-4">
                View All History
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {symptomHistory.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Symptoms Tracked Yet
            </h3>
            <p className="text-muted-foreground max-w-sm">
              Start tracking your symptoms to receive personalized wellness insights and health recommendations.
            </p>
            <Button onClick={() => setShowAddForm(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Symptom
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
