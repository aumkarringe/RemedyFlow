import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { CloudSun, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AIRemedyCard } from "@/components/AIRemedyCard";

const SeasonalRemedies = () => {
  const [season, setSeason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [remedies, setRemedies] = useState<any[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!season) {
      toast({
        title: "Missing Information",
        description: "Please select a season",
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
            content: `Generate 5 home remedies specifically beneficial for ${season} season. For each remedy provide: name, description (2-3 sentences), ingredients list, preparation steps, and why it's good for this season. Format as JSON array.`
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <CloudSun className="w-16 h-16 mx-auto mb-4 text-secondary animate-pulse" />
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
            Seasonal Remedies
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover remedies optimized for different seasons and weather conditions
          </p>
        </motion.div>

        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle>Select Season</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Season</Label>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spring">Spring</SelectItem>
                  <SelectItem value="summer">Summer</SelectItem>
                  <SelectItem value="autumn">Autumn/Fall</SelectItem>
                  <SelectItem value="winter">Winter</SelectItem>
                  <SelectItem value="monsoon">Monsoon</SelectItem>
                </SelectContent>
              </Select>
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
                  Get Seasonal Remedies
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

export default SeasonalRemedies;
