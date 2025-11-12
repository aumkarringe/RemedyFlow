import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, TrendingUp, Calendar, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface JournalEntry {
  id: string;
  date: string;
  symptoms: string;
  severity: number;
  notes: string;
}

interface HealthJournalProps {
  onAnalyze: (entries: JournalEntry[]) => void;
}

export function HealthJournal({ onAnalyze }: HealthJournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentSymptoms, setCurrentSymptoms] = useState("");
  const [currentNotes, setCurrentNotes] = useState("");
  const [severity, setSeverity] = useState(5);
  const { toast } = useToast();

  const addEntry = () => {
    if (!currentSymptoms.trim()) {
      toast({
        title: "Missing symptoms",
        description: "Please describe your symptoms",
        variant: "destructive"
      });
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      symptoms: currentSymptoms,
      severity,
      notes: currentNotes
    };

    setEntries([newEntry, ...entries]);
    setCurrentSymptoms("");
    setCurrentNotes("");
    setSeverity(5);
    
    toast({
      title: "Entry added",
      description: "Your health journal has been updated"
    });
  };

  const getAIInsights = () => {
    if (entries.length < 2) {
      toast({
        title: "Need more entries",
        description: "Add at least 2 entries to get AI insights",
        variant: "destructive"
      });
      return;
    }
    onAnalyze(entries);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Smart Health Journal
        </CardTitle>
        <CardDescription>
          Track your symptoms and get AI-powered health insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Textarea
            placeholder="Describe your symptoms..."
            value={currentSymptoms}
            onChange={(e) => setCurrentSymptoms(e.target.value)}
            rows={3}
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              Severity: {severity}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <Textarea
            placeholder="Additional notes (optional)..."
            value={currentNotes}
            onChange={(e) => setCurrentNotes(e.target.value)}
            rows={2}
          />

          <Button onClick={addEntry} className="w-full">
            <Calendar className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>

        <AnimatePresence>
          {entries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Recent Entries ({entries.length})</h4>
                <Button onClick={getAIInsights} variant="outline" size="sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Get AI Insights
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {entries.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{entry.date}</span>
                      <span className="text-xs font-medium text-foreground">
                        Severity: {entry.severity}/10
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{entry.symptoms}</p>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
