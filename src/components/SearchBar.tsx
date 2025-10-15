import { motion } from "framer-motion";
import { Search, X, Sparkles } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSearch: () => void;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export const SearchBar = ({ 
  value, 
  onChange, 
  onClear,
  onSearch,
  suggestions = [],
  onSuggestionClick 
}: SearchBarProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      onSearch();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto px-4 -mt-8 relative z-20"
    >
      <div className="relative">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Search for health issues, remedies, or ingredients..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-12 pr-12 py-6 text-lg font-inter bg-card shadow-[var(--shadow-elegant)] border-border/50 focus:border-primary transition-all rounded-xl"
            />
            {value && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-muted"
              >
                <X size={20} />
              </Button>
            )}
          </div>
          <Button
            onClick={onSearch}
            disabled={!value.trim()}
            className="px-6 py-6 text-base font-semibold shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-all"
          >
            <Sparkles className="mr-2" size={20} />
            Find Solution
          </Button>
        </div>

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && value && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-card rounded-xl shadow-[var(--shadow-card)] border border-border overflow-hidden z-30"
          >
            {suggestions.slice(0, 8).map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors font-inter text-sm border-b border-border last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <Search size={14} className="text-muted-foreground" />
                  <span className="text-foreground">{suggestion}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Search Tips */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-sm text-muted-foreground mt-4 font-inter"
      >
        Try searching: "Indigestion", "Common Cold", "Headache", or any ingredient name
      </motion.p>
    </motion.div>
  );
};
