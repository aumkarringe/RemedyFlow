import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, Sparkles, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const healthGoals = [
  "Better sleep",
  "Stress relief",
  "Boost immunity",
  "Improve digestion",
  "Increase energy",
  "Pain management",
  "Weight management",
  "Mental clarity"
];

interface WellnessPlanGeneratorProps {
  onGenerate: (goals: string[], duration: string) => void;
}

export function WellnessPlanGenerator({ onGenerate }: WellnessPlanGeneratorProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>("7");

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleGenerate = () => {
    if (selectedGoals.length > 0) {
      onGenerate(selectedGoals, duration);
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          AI Wellness Plan Generator
        </CardTitle>
        <CardDescription>
          Get a personalized wellness plan based on your health goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Select your health goals:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {healthGoals.map((goal) => (
              <label
                key={goal}
                className="flex items-center space-x-2 cursor-pointer group"
              >
                <Checkbox
                  checked={selectedGoals.includes(goal)}
                  onCheckedChange={() => toggleGoal(goal)}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-sm group-hover:text-primary transition-colors">
                  {goal}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Plan duration:</h4>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="3">3 days</option>
            <option value="7">7 days (1 week)</option>
            <option value="14">14 days (2 weeks)</option>
            <option value="30">30 days (1 month)</option>
          </select>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleGenerate}
            disabled={selectedGoals.length === 0}
            className="w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Personalized Plan
          </Button>
        </motion.div>

        {selectedGoals.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Creating a {duration}-day plan for {selectedGoals.length} goal{selectedGoals.length > 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
