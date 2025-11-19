import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { Sparkle, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AIRemedyCard } from "@/components/AIRemedyCard";

const NaturalBeauty = () => {
  const [concern, setConcern] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [remedies, setRemedies] = useState<any[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!concern) {
      toast({
        title: "Missing Information",
        description: "Please select a beauty concern",
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
            content: `Generate 5 natural beauty remedies for ${concern}. For each remedy provide: name, description (2-3 sentences), ingredients list with measurements, preparation steps, application method, and expected results. Format as JSON array.`
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Sparkle className="w-16 h-16 mx-auto mb-4 text-accent animate-pulse" />
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
            Natural Beauty Remedies
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover natural, chemical-free beauty solutions for radiant skin and hair
          </p>
        </motion.div>

        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle>Select Beauty Concern</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Beauty Concern</Label>
              <Select value={concern} onValueChange={setConcern}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a concern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acne and pimples">Acne & Pimples</SelectItem>
                  <SelectItem value="dry skin">Dry Skin</SelectItem>
                  <SelectItem value="dark circles">Dark Circles</SelectItem>
                  <SelectItem value="hair fall">Hair Fall</SelectItem>
                  <SelectItem value="dandruff">Dandruff</SelectItem>
                  <SelectItem value="wrinkles and aging">Wrinkles & Aging</SelectItem>
                  <SelectItem value="dark spots">Dark Spots</SelectItem>
                  <SelectItem value="oily skin">Oily Skin</SelectItem>
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
                  Get Beauty Remedies
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

export default NaturalBeauty;
