import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, X, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface ContraindicationCheckerProps {
  onCheck: (items: { remedies: string[], medications: string[], conditions: string[] }) => void;
}

export function ContraindicationChecker({ onCheck }: ContraindicationCheckerProps) {
  const [remedies, setRemedies] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState<'remedies' | 'medications' | 'conditions'>('remedies');
  const { toast } = useToast();

  const addItem = () => {
    if (!inputValue.trim()) return;

    const item = inputValue.trim();
    
    if (activeTab === 'remedies' && !remedies.includes(item)) {
      setRemedies([...remedies, item]);
    } else if (activeTab === 'medications' && !medications.includes(item)) {
      setMedications([...medications, item]);
    } else if (activeTab === 'conditions' && !conditions.includes(item)) {
      setConditions([...conditions, item]);
    }
    
    setInputValue("");
  };

  const removeItem = (item: string, type: 'remedies' | 'medications' | 'conditions') => {
    if (type === 'remedies') setRemedies(remedies.filter(r => r !== item));
    if (type === 'medications') setMedications(medications.filter(m => m !== item));
    if (type === 'conditions') setConditions(conditions.filter(c => c !== item));
  };

  const handleCheck = () => {
    if (remedies.length === 0 && medications.length === 0 && conditions.length === 0) {
      toast({
        title: "Nothing to check",
        description: "Add at least one remedy, medication, or condition",
        variant: "destructive"
      });
      return;
    }
    onCheck({ remedies, medications, conditions });
  };

  const totalItems = remedies.length + medications.length + conditions.length;

  return (
    <Card className="w-full border-orange-200 dark:border-orange-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-600" />
          AI Contraindication Checker
        </CardTitle>
        <CardDescription>
          Check for potential conflicts between remedies, medications, and conditions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab('remedies')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'remedies'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Remedies ({remedies.length})
          </button>
          <button
            onClick={() => setActiveTab('medications')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'medications'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Medications ({medications.length})
          </button>
          <button
            onClick={() => setActiveTab('conditions')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'conditions'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Conditions ({conditions.length})
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            placeholder={`Add ${activeTab.slice(0, -1)}...`}
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button onClick={addItem} size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <AnimatePresence>
          {totalItems > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {remedies.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">Remedies</h4>
                  <div className="flex flex-wrap gap-2">
                    {remedies.map((remedy, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => removeItem(remedy, 'remedies')}
                      >
                        {remedy}
                        <X className="w-3 h-3 ml-2" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {medications.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">Medications</h4>
                  <div className="flex flex-wrap gap-2">
                    {medications.map((med, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => removeItem(med, 'medications')}
                      >
                        {med}
                        <X className="w-3 h-3 ml-2" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {conditions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">Conditions</h4>
                  <div className="flex flex-wrap gap-2">
                    {conditions.map((condition, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => removeItem(condition, 'conditions')}
                      >
                        {condition}
                        <X className="w-3 h-3 ml-2" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleCheck} className="w-full" variant="default">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Check for Conflicts
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
