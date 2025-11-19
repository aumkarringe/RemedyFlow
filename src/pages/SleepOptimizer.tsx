import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { Moon, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AIRemedyCard } from "@/components/AIRemedyCard";

const SleepOptimizer = () => {
  const [sleepIssue, setSleepIssue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [remedies, setRemedies] = useState<any[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!sleepIssue) {
      toast({
        title: "Missing Information",
        description: "Please describe your sleep issue",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [{
            role: "user",
            content: `Generate 5 natural remedies to improve sleep for someone experiencing: ${sleepIssue}. For each remedy provide: name, description, ingredients/requirements, how to use, best time to use, and expected benefits. Format as JSON array.`
          }]
        }
      });

      if (error) throw error;
      
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Moon className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Sleep Optimizer
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get personalized natural solutions for better sleep quality
          </p>
        </motion.div>

        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle>Describe Your Sleep Issue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="issue">Sleep Issue</Label>
              <Textarea
                id="issue"
                placeholder="E.g., I have trouble falling asleep, wake up frequently at night, can't sleep past 4 AM..."
                value={sleepIssue}
                onChange={(e) => setSleepIssue(e.target.value)}
                rows={4}
              />
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
                  Get Sleep Solutions
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

export default SleepOptimizer;
