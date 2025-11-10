import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Stethoscope, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const commonSymptoms = [
  "Headache", "Fever", "Cough", "Sore throat", "Runny nose",
  "Fatigue", "Nausea", "Diarrhea", "Muscle pain", "Joint pain",
  "Skin rash", "Dizziness", "Insomnia", "Anxiety", "Indigestion"
];

interface SymptomCheckerProps {
  onSearch: (symptoms: string[]) => void;
}

export function SymptomChecker({ onSearch }: SymptomCheckerProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSearch = () => {
    if (selectedSymptoms.length > 0) {
      onSearch(selectedSymptoms);
    }
  };

  const clearAll = () => {
    setSelectedSymptoms([]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary" />
          Multi-Symptom Checker
        </CardTitle>
        <CardDescription>
          Select multiple symptoms to find comprehensive remedies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {commonSymptoms.map((symptom) => (
            <label
              key={symptom}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <Checkbox
                checked={selectedSymptoms.includes(symptom)}
                onCheckedChange={() => toggleSymptom(symptom)}
                className="data-[state=checked]:bg-primary"
              />
              <span className="text-sm group-hover:text-primary transition-colors">
                {symptom}
              </span>
            </label>
          ))}
        </div>

        <AnimatePresence>
          {selectedSymptoms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map((symptom) => (
                  <Badge
                    key={symptom}
                    variant="secondary"
                    className="px-3 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => toggleSymptom(symptom)}
                  >
                    {symptom}
                    <X className="w-3 h-3 ml-2" />
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSearch} className="flex-1">
                  Find Remedies ({selectedSymptoms.length})
                </Button>
                <Button onClick={clearAll} variant="outline">
                  Clear All
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
