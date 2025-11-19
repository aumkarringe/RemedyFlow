import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { BookOpen, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PreparationGuide = () => {
  const [remedy, setRemedy] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [guide, setGuide] = useState("");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!remedy) {
      toast({
        title: "Missing Information",
        description: "Please enter a remedy name",
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
            content: `Provide a detailed step-by-step preparation guide for ${remedy}. Include: ingredients with exact measurements, equipment needed, preparation steps, storage instructions, shelf life, and best practices.`
          }]
        }
      });

      if (error) throw error;
      setGuide(data.choices[0].message.content);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate guide. Please try again.",
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
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Remedy Preparation Guide
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get detailed step-by-step instructions for preparing home remedies correctly
          </p>
        </motion.div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Generate Preparation Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="remedy">Remedy Name</Label>
              <Input
                id="remedy"
                placeholder="e.g., Honey-Lemon Tea, Turmeric Paste"
                value={remedy}
                onChange={(e) => setRemedy(e.target.value)}
              />
            </div>
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Guide...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Guide
                </>
              )}
            </Button>

            {guide && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-muted rounded-lg"
              >
                <h3 className="font-semibold mb-2">Preparation Guide:</h3>
                <p className="whitespace-pre-wrap">{guide}</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreparationGuide;
