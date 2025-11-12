import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, X, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface RemedyComparatorProps {
  onCompare: (remedies: string[]) => void;
}

export function RemedyComparator({ onCompare }: RemedyComparatorProps) {
  const [selectedRemedies, setSelectedRemedies] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast();

  const addRemedy = () => {
    if (inputValue.trim() && !selectedRemedies.includes(inputValue.trim())) {
      if (selectedRemedies.length >= 4) {
        toast({
          title: "Maximum reached",
          description: "You can compare up to 4 remedies at once",
          variant: "destructive"
        });
        return;
      }
      setSelectedRemedies([...selectedRemedies, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeRemedy = (remedy: string) => {
    setSelectedRemedies(selectedRemedies.filter(r => r !== remedy));
  };

  const handleCompare = () => {
    if (selectedRemedies.length >= 2) {
      onCompare(selectedRemedies);
    } else {
      toast({
        title: "Need more remedies",
        description: "Add at least 2 remedies to compare",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          AI Remedy Comparator
        </CardTitle>
        <CardDescription>
          Compare multiple remedies and get AI-powered recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addRemedy()}
            placeholder="Enter remedy name..."
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button onClick={addRemedy} size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <AnimatePresence>
          {selectedRemedies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="flex flex-wrap gap-2">
                {selectedRemedies.map((remedy, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => removeRemedy(remedy)}
                  >
                    {remedy}
                    <X className="w-3 h-3 ml-2" />
                  </Badge>
                ))}
              </div>

              <Button 
                onClick={handleCompare} 
                className="w-full"
                disabled={selectedRemedies.length < 2}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Compare with AI ({selectedRemedies.length}/4)
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
