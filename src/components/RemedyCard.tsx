import { motion } from "framer-motion";
import { ChevronDown, Leaf, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface RemedyCardProps {
  name: string;
  healthIssue: string;
  remedy: string;
  yogasan?: string;
  index: number;
}

export const RemedyCard = ({ 
  name, 
  healthIssue, 
  remedy, 
  yogasan, 
  index 
}: RemedyCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300 bg-gradient-to-br from-card to-card/50 border-border/50">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Leaf className="text-primary" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold font-poppins text-foreground mb-1">
                {name}
              </h3>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                {healthIssue}
              </div>
            </div>
          </div>

          {/* Remedy Preview */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground font-inter line-clamp-2">
              {remedy}
            </p>
          </div>

          {/* Expand Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-between hover:bg-muted/50"
          >
            <span className="text-sm font-medium">
              {isExpanded ? "Show Less" : "View Full Remedy"}
            </span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={18} />
            </motion.div>
          </Button>
        </div>

        {/* Expanded Content */}
        <motion.div
          initial={false}
          animate={{
            height: isExpanded ? "auto" : 0,
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-6 pt-0 space-y-4 border-t border-border/50">
            <div className="pt-4">
              <h4 className="text-sm font-semibold text-foreground mb-2 font-poppins">
                Complete Remedy:
              </h4>
              <p className="text-sm text-foreground/80 font-inter leading-relaxed">
                {remedy}
              </p>
            </div>

            {yogasan && (
              <div className="pt-2">
                <h4 className="text-sm font-semibold text-foreground mb-3 font-poppins">
                  Recommended Yoga Pose:
                </h4>
                <div className="relative rounded-lg overflow-hidden bg-muted/30">
                  <img 
                    src={yogasan} 
                    alt="Yoga pose" 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center h-48 text-muted-foreground text-sm">Yoga pose image not available</div>';
                    }}
                  />
                  <a
                    href={yogasan}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 p-2 bg-card/90 hover:bg-card rounded-lg shadow-md transition-colors"
                  >
                    <ExternalLink size={16} className="text-primary" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
};
