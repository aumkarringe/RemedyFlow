import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList, Star, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TrackedRemedy {
  id: string;
  name: string;
  healthIssue: string;
  dateAdded: string;
  effectiveness: number;
}

export function RemedyTracker() {
  const [trackedRemedies, setTrackedRemedies] = useState<TrackedRemedy[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("trackedRemedies");
    if (stored) {
      setTrackedRemedies(JSON.parse(stored));
    }
  }, []);

  const removeRemedy = (id: string) => {
    const updated = trackedRemedies.filter(r => r.id !== id);
    setTrackedRemedies(updated);
    localStorage.setItem("trackedRemedies", JSON.stringify(updated));
  };

  const updateEffectiveness = (id: string, rating: number) => {
    const updated = trackedRemedies.map(r =>
      r.id === id ? { ...r, effectiveness: rating } : r
    );
    setTrackedRemedies(updated);
    localStorage.setItem("trackedRemedies", JSON.stringify(updated));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          Remedy Tracker
        </CardTitle>
        <CardDescription>
          Track remedies you've tried and rate their effectiveness
        </CardDescription>
      </CardHeader>
      <CardContent>
        {trackedRemedies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No remedies tracked yet</p>
            <p className="text-sm mt-1">Use the bookmark button on remedy cards to track them</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <AnimatePresence>
              <div className="space-y-3">
                {trackedRemedies.map((remedy) => (
                  <motion.div
                    key={remedy.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-4 bg-muted rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{remedy.name}</h4>
                        <Badge variant="outline" className="mt-1">
                          {remedy.healthIssue}
                        </Badge>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeRemedy(remedy.id)}
                        className="hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Added: {new Date(remedy.dateAdded).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs mr-2">Rate effectiveness:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => updateEffectiveness(remedy.id, star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-4 h-4 transition-colors ${
                                star <= remedy.effectiveness
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export function trackRemedy(name: string, healthIssue: string) {
  const stored = localStorage.getItem("trackedRemedies");
  const remedies: TrackedRemedy[] = stored ? JSON.parse(stored) : [];
  
  const newRemedy: TrackedRemedy = {
    id: `${Date.now()}-${Math.random()}`,
    name,
    healthIssue,
    dateAdded: new Date().toISOString(),
    effectiveness: 0
  };
  
  const updated = [newRemedy, ...remedies].slice(0, 20); // Keep max 20
  localStorage.setItem("trackedRemedies", JSON.stringify(updated));
}
