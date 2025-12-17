import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dumbbell, Loader2, Sparkles, Timer, Target, AlertTriangle, Play, ChevronDown } from "lucide-react";

interface Exercise {
  name: string;
  type: string;
  duration: string;
  targetArea: string;
  instructions: string[];
  benefits: string[];
  precautions: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  videoSearch?: string;
}

interface ExercisePlan {
  symptom: string;
  overview: string;
  exercises: Exercise[];
  weeklyPlan: {
    day: string;
    focus: string;
    exercises: string[];
  }[];
  tips: string[];
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const commonSymptoms = [
  "Back pain",
  "Neck stiffness",
  "Shoulder tension",
  "Knee pain",
  "Headache",
  "Poor posture",
  "Stress & anxiety",
  "Low energy",
  "Insomnia",
  "Digestive issues",
];

export default function ExerciseRecommendations() {
  const [symptoms, setSymptoms] = useState("");
  const [plan, setPlan] = useState<ExercisePlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const { toast } = useToast();

  const generatePlan = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Enter your symptoms",
        description: "Please describe your symptoms or health concerns",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are an expert fitness and physical therapy consultant. Generate personalized exercise recommendations based on symptoms. Return JSON only:
{
  "symptom": "summarized symptom",
  "overview": "brief explanation of how exercise helps",
  "exercises": [
    {
      "name": "exercise name",
      "type": "stretching/strengthening/cardio/yoga/breathing",
      "duration": "e.g., 30 seconds x 3 sets",
      "targetArea": "body part",
      "instructions": ["step 1", "step 2"],
      "benefits": ["benefit 1", "benefit 2"],
      "precautions": "safety note",
      "difficulty": "beginner/intermediate/advanced"
    }
  ],
  "weeklyPlan": [
    {"day": "Monday", "focus": "focus area", "exercises": ["exercise names"]}
  ],
  "tips": ["general tips"]
}
Provide 6-8 exercises covering different types. Be specific with instructions.`
            },
            {
              role: "user",
              content: `Generate exercise recommendations for these symptoms: ${symptoms}`
            }
          ],
        }),
      });

      if (!response.ok) throw new Error("Failed to generate plan");

      const data = await response.json();
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setPlan(JSON.parse(jsonMatch[0]));
        toast({
          title: "✨ Exercise Plan Generated",
          description: "Your personalized exercise plan is ready",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate exercise plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Navbar />
      <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Dumbbell className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">AI Exercise Planner</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Symptom-Based Exercises
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get personalized exercise recommendations based on your symptoms and health concerns
          </p>
        </motion.div>

        {/* Input Section */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Describe Your Symptoms</label>
              <Textarea
                placeholder="e.g., I have lower back pain that gets worse when sitting for long periods..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={4}
                className="text-base"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Common Symptoms</label>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map((symptom) => (
                  <Button
                    key={symptom}
                    variant="outline"
                    size="sm"
                    onClick={() => setSymptoms((prev) => prev ? `${prev}, ${symptom}` : symptom)}
                  >
                    {symptom}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              onClick={generatePlan} 
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Exercise Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Exercise Plan
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results */}
        {plan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Overview */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
              <h2 className="text-xl font-semibold mb-2">Exercise Plan for: {plan.symptom}</h2>
              <p className="text-muted-foreground">{plan.overview}</p>
            </Card>

            {/* Exercises */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Dumbbell className="w-6 h-6 text-primary" />
                Recommended Exercises ({plan.exercises.length})
              </h2>
              
              <div className="grid gap-4">
                {plan.exercises.map((exercise, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden">
                      <div 
                        className="p-4 cursor-pointer"
                        onClick={() => setExpandedExercise(expandedExercise === index ? null : index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Play className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{exercise.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 bg-muted rounded-full">{exercise.type}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[exercise.difficulty]}`}>
                                  {exercise.difficulty}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Timer className="w-4 h-4" />
                                {exercise.duration}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Target className="w-4 h-4" />
                                {exercise.targetArea}
                              </div>
                            </div>
                            <motion.div
                              animate={{ rotate: expandedExercise === index ? 180 : 0 }}
                            >
                              <ChevronDown className="w-5 h-5" />
                            </motion.div>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedExercise === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0 border-t border-border space-y-4">
                              <div>
                                <h4 className="text-sm font-medium mb-2">Instructions</h4>
                                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                                  {exercise.instructions.map((step, i) => (
                                    <li key={i}>{step}</li>
                                  ))}
                                </ol>
                              </div>

                              <div>
                                <h4 className="text-sm font-medium mb-2">Benefits</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                  {exercise.benefits.map((benefit, i) => (
                                    <li key={i}>{benefit}</li>
                                  ))}
                                </ul>
                              </div>

                              {exercise.precautions && (
                                <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                  <p className="text-sm text-orange-700 dark:text-orange-300">{exercise.precautions}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Weekly Plan */}
            {plan.weeklyPlan && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Weekly Schedule</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {plan.weeklyPlan.map((day, index) => (
                    <Card key={index} className="p-4">
                      <h3 className="font-semibold text-primary">{day.day}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{day.focus}</p>
                      <ul className="text-sm space-y-1">
                        {day.exercises.map((ex, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {ex}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {plan.tips && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">💡 General Tips</h2>
                <ul className="space-y-2">
                  {plan.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
