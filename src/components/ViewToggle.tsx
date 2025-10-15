import { motion } from "framer-motion";
import { Grid3x3, List } from "lucide-react";
import { Button } from "./ui/button";

interface ViewToggleProps {
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
  resultCount: number;
}

export const ViewToggle = ({ view, onViewChange, resultCount }: ViewToggleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-4 max-w-7xl mx-auto mb-6"
    >
      <div>
        <p className="text-sm text-muted-foreground font-inter">
          Found <span className="font-semibold text-foreground">{resultCount}</span> remedies
        </p>
      </div>

      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <Button
          variant={view === "grid" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange("grid")}
          className="gap-2"
        >
          <Grid3x3 size={16} />
          <span className="hidden sm:inline">Grid</span>
        </Button>
        <Button
          variant={view === "list" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange("list")}
          className="gap-2"
        >
          <List size={16} />
          <span className="hidden sm:inline">List</span>
        </Button>
      </div>
    </motion.div>
  );
};
