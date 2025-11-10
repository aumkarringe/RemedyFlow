import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const popularIngredients = [
  "Honey", "Ginger", "Turmeric", "Lemon", "Garlic",
  "Cinnamon", "Apple Cider Vinegar", "Aloe Vera", "Peppermint", "Chamomile"
];

interface IngredientFinderProps {
  onSearch: (ingredients: string[]) => void;
}

export function IngredientFinder({ onSearch }: IngredientFinderProps) {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [customIngredient, setCustomIngredient] = useState("");

  const addIngredient = (ingredient: string) => {
    if (!selectedIngredients.includes(ingredient)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const removeIngredient = (ingredient: string) => {
    setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient));
  };

  const addCustomIngredient = () => {
    if (customIngredient.trim() && !selectedIngredients.includes(customIngredient.trim())) {
      setSelectedIngredients([...selectedIngredients, customIngredient.trim()]);
      setCustomIngredient("");
    }
  };

  const handleSearch = () => {
    if (selectedIngredients.length > 0) {
      onSearch(selectedIngredients);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-primary" />
          Ingredient-Based Finder
        </CardTitle>
        <CardDescription>
          Find remedies using ingredients you have at home
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add custom ingredient..."
            value={customIngredient}
            onChange={(e) => setCustomIngredient(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addCustomIngredient()}
          />
          <Button onClick={addCustomIngredient} size="icon" variant="secondary">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {popularIngredients.map((ingredient) => (
            <Badge
              key={ingredient}
              variant={selectedIngredients.includes(ingredient) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() =>
                selectedIngredients.includes(ingredient)
                  ? removeIngredient(ingredient)
                  : addIngredient(ingredient)
              }
            >
              {ingredient}
            </Badge>
          ))}
        </div>

        <AnimatePresence>
          {selectedIngredients.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Your ingredients:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedIngredients.map((ingredient) => (
                    <Badge
                      key={ingredient}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => removeIngredient(ingredient)}
                    >
                      {ingredient}
                      <X className="w-3 h-3 ml-2" />
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={handleSearch} className="w-full">
                Find Remedies with These Ingredients
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
