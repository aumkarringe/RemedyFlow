import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { Calculator, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DosageCalculator = () => {
  const [remedy, setRemedy] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [condition, setCondition] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const { toast } = useToast();

  const handleCalculate = async () => {
    if (!remedy || !age || !weight) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
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
            content: `Calculate safe dosage for ${remedy} remedy for a person aged ${age} years, weighing ${weight} kg${condition ? ` with ${condition}` : ''}. Provide specific measurements and frequency. Include safety warnings.`
          }]
        }
      });

      if (error) throw error;
      setResult(data.choices[0].message.content);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to calculate dosage. Please try again.",
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
          <Calculator className="w-16 h-16 mx-auto mb-4 text-accent animate-pulse" />
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Dosage Calculator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Calculate safe dosages for home remedies based on age, weight, and health conditions
          </p>
        </motion.div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Calculate Remedy Dosage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="remedy">Remedy Name *</Label>
              <Input
                id="remedy"
                placeholder="e.g., Ginger tea, Turmeric milk"
                value={remedy}
                onChange={(e) => setRemedy(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age (years) *</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="condition">Health Condition (optional)</Label>
              <Input
                id="condition"
                placeholder="e.g., Diabetes, Hypertension"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              />
            </div>
            <Button onClick={handleCalculate} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Calculate Dosage
                </>
              )}
            </Button>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-muted rounded-lg"
              >
                <h3 className="font-semibold mb-2">Dosage Recommendation:</h3>
                <p className="whitespace-pre-wrap">{result}</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DosageCalculator;
