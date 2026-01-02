import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { Shield, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AIRemedyCard } from "@/components/AIRemedyCard";

const healthGoals = [
  "Prevent common cold and flu",
  "Boost overall immunity",
  "Recover from illness faster",
  "Increase energy levels",
  "Improve gut health",
  "Strengthen respiratory system"
];

const ImmunityBooster = () => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [remedies, setRemedies] = useState<any[]>([]);
  const { toast } = useToast();

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleGenerate = async () => {
    if (selectedGoals.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one health goal",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('openrouter-chat', {
        body: {
          messages: [{
            role: "user",
            content: `Generate immunity-boosting remedies for: ${selectedGoals.join(', ')}`
          }],
          context: `Generate 6 immunity-boosting home remedies. Include dietary remedies, herbal supplements, lifestyle practices, and preventive measures. For each provide: name, description, ingredients/requirements, preparation/practice method, frequency, and expected benefits. Return as JSON array. Health goals: ${selectedGoals.join(', ')}`
        }
      });

      if (error) throw error;
      
      if (data.blocked) {
        toast({ title: "Safety Notice", description: data.response, variant: "destructive" });
        return;
      }
      
      const jsonMatch = data.response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        setRemedies(JSON.parse(jsonMatch[0]));
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate remedies. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Shield className="w-16 h-16 mx-auto mb-4 text-accent animate-pulse" />
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Immunity Booster
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Strengthen your immune system naturally with proven home remedies
          </p>
        </motion.div>

        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle>Select Your Health Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {healthGoals.map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={selectedGoals.includes(goal)}
                    onCheckedChange={() => toggleGoal(goal)}
                  />
                  <Label htmlFor={goal} className="cursor-pointer">
                    {goal}
                  </Label>
                </div>
              ))}
            </div>
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get Immunity Boosters
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {remedies.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {remedies.map((remedy, index) => (
              <AIRemedyCard key={index} remedy={remedy} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImmunityBooster;
