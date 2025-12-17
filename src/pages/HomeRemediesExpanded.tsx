import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Search, Loader2, Sparkles, Apple, FlaskConical, Sun, Droplets } from "lucide-react";

type RemedyCategory = "herbal" | "dietary" | "lifestyle" | "topical";

interface GeneratedRemedy {
  name: string;
  ingredients: string[];
  preparation: string;
  usage: string;
  benefits: string[];
  precautions: string;
  category: RemedyCategory;
}

const categoryIcons = {
  herbal: <Leaf className="w-5 h-5" />,
  dietary: <Apple className="w-5 h-5" />,
  lifestyle: <Sun className="w-5 h-5" />,
  topical: <Droplets className="w-5 h-5" />,
};

const categoryColors = {
  herbal: "from-green-500 to-emerald-500",
  dietary: "from-orange-500 to-amber-500",
  lifestyle: "from-blue-500 to-cyan-500",
  topical: "from-purple-500 to-pink-500",
};

export default function HomeRemediesExpanded() {
  const [healthIssue, setHealthIssue] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<RemedyCategory | "all">("all");
  const [remedies, setRemedies] = useState<GeneratedRemedy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateRemedies = async () => {
    if (!healthIssue.trim()) {
      toast({
        title: "Enter a health issue",
        description: "Please describe your health concern",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-remedies', {
        body: {
          healthIssue,
          additionalInfo,
          expanded: true,
          categories: selectedCategory === "all" ? ["herbal", "dietary", "lifestyle", "topical"] : [selectedCategory],
        }
      });

      if (error) throw error;

      if (data.remedies) {
        setRemedies(data.remedies);
        toast({
          title: "✨ Remedies Generated",
          description: `Found ${data.remedies.length} personalized remedies`,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate remedies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRemedies = selectedCategory === "all" 
    ? remedies 
    : remedies.filter(r => r.category === selectedCategory);

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
            <FlaskConical className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">AI Home Remedies</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Expanded Home Remedies
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get detailed, personalized home remedies across multiple categories
          </p>
        </motion.div>

        {/* Search Form */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Health Issue</label>
              <Input
                placeholder="e.g., headache, cold, digestive issues..."
                value={healthIssue}
                onChange={(e) => setHealthIssue(e.target.value)}
                className="text-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Additional Information (optional)</label>
              <Textarea
                placeholder="Any allergies, preferences, or specific symptoms..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Remedy Category</label>
              <div className="flex flex-wrap gap-2">
                {(["all", "herbal", "dietary", "lifestyle", "topical"] as const).map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="capitalize"
                  >
                    {cat !== "all" && categoryIcons[cat]}
                    <span className="ml-1">{cat}</span>
                  </Button>
                ))}
              </div>
            </div>
            <Button 
              onClick={generateRemedies} 
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Remedies...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Personalized Remedies
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results */}
        {filteredRemedies.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Generated Remedies ({filteredRemedies.length})
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {filteredRemedies.map((remedy, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${categoryColors[remedy.category]} text-white`}>
                        {categoryIcons[remedy.category]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{remedy.name}</h3>
                        <span className="text-xs px-2 py-1 bg-muted rounded-full capitalize">
                          {remedy.category}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Ingredients</h4>
                        <div className="flex flex-wrap gap-1">
                          {remedy.ingredients.map((ing, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-primary/10 rounded-full">
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Preparation</h4>
                        <p className="text-sm">{remedy.preparation}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">How to Use</h4>
                        <p className="text-sm">{remedy.usage}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Benefits</h4>
                        <ul className="text-sm list-disc list-inside">
                          {remedy.benefits.map((benefit, i) => (
                            <li key={i}>{benefit}</li>
                          ))}
                        </ul>
                      </div>

                      {remedy.precautions && (
                        <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                          <h4 className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">⚠️ Precautions</h4>
                          <p className="text-sm text-orange-700 dark:text-orange-300">{remedy.precautions}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
