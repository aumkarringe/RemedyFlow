import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, Sparkles, Heart, Brain, Moon, Zap, Shield, 
  Salad, Dumbbell, Wind, Calendar, Star, BookOpen,
  TrendingUp, RefreshCw
} from "lucide-react";

interface WellnessInsights {
  healthStats: {
    stress: string;
    sleepImbalance: string;
    fatigue: string;
    digestion: string;
    immunity: string;
  };
  analysis: string;
  recommendations: {
    homeRemedies: Array<{ name: string; description: string; benefit: string }>;
    yogaPoses: Array<{ name: string; duration: string; benefit: string }>;
    acupressure: Array<{ name: string; location: string; technique: string }>;
    diet: { eat: string[]; avoid: string[] };
    lifestyle: Array<{ tip: string; reason: string }>;
    meditation: Array<{ name: string; duration: string; instructions: string }>;
  };
  weeklyPlan: Array<{ day: string; morning: string; evening: string; focus: string }>;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [insights, setInsights] = useState<WellnessInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedRemedies, setSavedRemedies] = useState<any[]>([]);
  const [healthSearches, setHealthSearches] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    const [remediesRes, searchesRes] = await Promise.all([
      supabase.from("saved_remedies").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("health_searches").select("*").eq("user_id", user.id).order("searched_at", { ascending: false }).limit(20),
    ]);

    if (remediesRes.data) setSavedRemedies(remediesRes.data);
    if (searchesRes.data) setHealthSearches(searchesRes.data);
  };

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const userData = {
        savedRemedies: savedRemedies.map(r => ({ name: r.remedy_name, healthIssue: r.health_issue, isFavorite: r.is_favorite, tried: r.tried })),
        healthSearches: healthSearches.map(s => ({ issue: s.health_issue, category: s.category })),
        searchPatterns: healthSearches.reduce((acc: Record<string, number>, s) => {
          acc[s.health_issue] = (acc[s.health_issue] || 0) + 1;
          return acc;
        }, {}),
      };

      const { data, error } = await supabase.functions.invoke("wellness-insights", {
        body: { userData },
      });

      if (error) throw error;
      setInsights(data.insights);

      toast({
        title: "Insights Generated",
        description: "Your personalized wellness insights are ready!",
      });
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Error",
        description: "Failed to generate insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const parsePercentage = (str: string) => parseInt(str.replace("%", "")) || 50;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, {user?.user_metadata?.display_name || "Wellness Seeker"} 🌿
          </h1>
          <p className="text-muted-foreground text-lg">
            Your personalized wellness dashboard
          </p>
        </motion.div>

        {/* Generate Insights Button */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Smart Wellness Insights</h3>
                <p className="text-muted-foreground">
                  Get personalized recommendations based on your health data
                </p>
              </div>
            </div>
            <Button onClick={generateInsights} disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {insights && (
          <Tabs defaultValue="stats" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="stats">Health Stats</TabsTrigger>
              <TabsTrigger value="remedies">Remedies</TabsTrigger>
              <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
              <TabsTrigger value="diet">Diet</TabsTrigger>
              <TabsTrigger value="plan">Weekly Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="stats">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Health Stats Cards */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="h-5 w-5 text-orange-500" />
                      Stress Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{insights.healthStats.stress}</div>
                    <Progress value={parsePercentage(insights.healthStats.stress)} className="h-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Moon className="h-5 w-5 text-indigo-500" />
                      Sleep Quality
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{insights.healthStats.sleepImbalance}</div>
                    <Progress value={100 - parsePercentage(insights.healthStats.sleepImbalance)} className="h-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Energy Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{insights.healthStats.fatigue}</div>
                    <Progress value={100 - parsePercentage(insights.healthStats.fatigue)} className="h-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Heart className="h-5 w-5 text-red-500" />
                      Digestion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{insights.healthStats.digestion}</div>
                    <Progress value={parsePercentage(insights.healthStats.digestion)} className="h-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield className="h-5 w-5 text-green-500" />
                      Immunity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{insights.healthStats.immunity}</div>
                    <Progress value={parsePercentage(insights.healthStats.immunity)} className="h-2" />
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 lg:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{insights.analysis}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="remedies">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Home Remedies */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Salad className="h-5 w-5 text-green-600" />
                      Home Remedies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {insights.recommendations.homeRemedies.map((remedy, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50">
                        <h4 className="font-semibold">{remedy.name}</h4>
                        <p className="text-sm text-muted-foreground">{remedy.description}</p>
                        <Badge variant="secondary" className="mt-2">{remedy.benefit}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Yoga Poses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Dumbbell className="h-5 w-5 text-purple-600" />
                      Yoga Poses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {insights.recommendations.yogaPoses.map((pose, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50">
                        <h4 className="font-semibold">{pose.name}</h4>
                        <p className="text-sm text-muted-foreground">Duration: {pose.duration}</p>
                        <Badge variant="secondary" className="mt-2">{pose.benefit}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Acupressure */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-600" />
                      Acupressure Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {insights.recommendations.acupressure.map((point, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50">
                        <h4 className="font-semibold">{point.name}</h4>
                        <p className="text-sm text-muted-foreground">Location: {point.location}</p>
                        <p className="text-sm mt-1">{point.technique}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Meditation */}
                <Card className="md:col-span-2 lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wind className="h-5 w-5 text-cyan-600" />
                      Meditation & Breathing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {insights.recommendations.meditation.map((med, i) => (
                        <div key={i} className="p-4 rounded-lg bg-muted/50">
                          <h4 className="font-semibold">{med.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">Duration: {med.duration}</p>
                          <p className="text-sm">{med.instructions}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="lifestyle">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Lifestyle Recommendations
                  </CardTitle>
                  <CardDescription>
                    Personalized tips based on your wellness patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {insights.recommendations.lifestyle.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-lg border bg-card"
                      >
                        <h4 className="font-semibold mb-2">{item.tip}</h4>
                        <p className="text-sm text-muted-foreground">{item.reason}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="diet">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-green-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <Salad className="h-5 w-5" />
                      Foods to Eat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {insights.recommendations.diet.eat.map((food, i) => (
                        <Badge key={i} variant="secondary" className="bg-green-500/10 text-green-700">
                          {food}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <Heart className="h-5 w-5" />
                      Foods to Avoid
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {insights.recommendations.diet.avoid.map((food, i) => (
                        <Badge key={i} variant="secondary" className="bg-red-500/10 text-red-700">
                          {food}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="plan">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Your Weekly Wellness Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.weeklyPlan.map((day, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-lg">{day.day}</h4>
                          <Badge>{day.focus}</Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Morning</span>
                            <p>{day.morning}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Evening</span>
                            <p>{day.evening}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Saved Remedies Section */}
        {savedRemedies.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Your Saved Remedies</CardTitle>
              <CardDescription>Remedies you've saved from your searches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedRemedies.slice(0, 6).map((remedy) => (
                  <div key={remedy.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{remedy.remedy_name}</h4>
                      {remedy.is_favorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                    </div>
                    <Badge variant="outline">{remedy.health_issue}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
