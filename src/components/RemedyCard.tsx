import { motion } from "framer-motion";
import { ChevronDown, Leaf, ExternalLink, Heart, Share2, Printer, Copy, Bookmark, Loader2 } from "lucide-react";
import { useState, forwardRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSaveRemedy } from "@/hooks/useSaveRemedy";

interface RemedyCardProps {
  name: string;
  healthIssue: string;
  remedy: string;
  yogasan?: string;
  index: number;
}

export const RemedyCard = forwardRef<HTMLDivElement, RemedyCardProps>(({ 
  name, 
  healthIssue, 
  remedy, 
  yogasan, 
  index 
}, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  const { saveRemedy, isSaving, isAuthenticated } = useSaveRemedy();

  const handleCopy = () => {
    const text = `${name}\nHealth Issue: ${healthIssue}\nRemedy: ${remedy}${yogasan ? `\nYoga: ${yogasan}` : ''}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: name,
        text: `${healthIssue}: ${remedy}`,
      });
    } else {
      handleCopy();
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html><head><title>${name}</title></head>
      <body><h1>${name}</h1><h3>${healthIssue}</h3><p>${remedy}</p></body>
      </html>
    `);
    printWindow?.print();
  };

  const handleSaveToProfile = async () => {
    const success = await saveRemedy({
      name,
      healthIssue,
      remedy,
      yogasan,
      isAI: false,
    });
    if (success) setIsSaved(true);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card className="group overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-glow)] transition-all duration-500 bg-gradient-to-br from-card via-card to-muted/20 border-border/50 hover:border-primary/30 relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
        <div className="p-6 relative z-10">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <motion.div 
              className="p-2 bg-primary/10 rounded-lg"
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Leaf className="text-primary" size={24} />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold font-poppins text-foreground mb-1">
                {name}
              </h3>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                {healthIssue}
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFavorite(!isFavorite)}
                className="hover:bg-primary/10"
              >
                <Heart
                  size={20}
                  className={`${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'} transition-colors`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSaveToProfile}
                disabled={isSaving || isSaved}
                className="hover:bg-primary/10"
                title={isAuthenticated ? "Save to profile" : "Sign in to save"}
              >
                {isSaving ? (
                  <Loader2 size={20} className="animate-spin text-primary" />
                ) : (
                  <Bookmark
                    size={20}
                    className={`${isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'} transition-colors`}
                  />
                )}
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={handleShare} className="flex-1">
              <Share2 size={14} className="mr-1" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1">
              <Copy size={14} className="mr-1" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="flex-1">
              <Printer size={14} className="mr-1" />
              Print
            </Button>
          </div>

          {/* Remedy Preview */}
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm text-muted-foreground font-inter line-clamp-2">
              {remedy}
            </p>
          </motion.div>

          {/* Yogasan Badge */}
          {yogasan && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full">
                <span className="text-xs font-semibold text-primary">🧘</span>
                <span className="text-xs font-medium text-foreground">Yoga Pose Available</span>
              </div>
            </motion.div>
          )}

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
              <motion.div 
                className="pt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="text-2xl"
                  >
                    🧘‍♀️
                  </motion.span>
                  <h4 className="text-sm font-semibold text-foreground font-poppins">
                    Recommended Yoga Pose
                  </h4>
                </div>
                <motion.div 
                  className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative group/img">
                    <img 
                      src={yogasan} 
                      alt="Yoga pose" 
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover/img:scale-110"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<div class="flex flex-col items-center justify-center h-56 text-muted-foreground"><span class="text-4xl mb-2">🧘</span><span class="text-sm">Yoga pose reference</span></div>';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300" />
                    <motion.a
                      href={yogasan}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-3 right-3 p-2.5 bg-card/95 hover:bg-card rounded-lg shadow-lg transition-all backdrop-blur-sm"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ExternalLink size={16} className="text-primary" />
                    </motion.a>
                  </div>
                  <div className="p-3 bg-card/50 backdrop-blur-sm">
                    <p className="text-xs text-muted-foreground font-inter text-center">
                      Practice this yoga pose for enhanced healing benefits
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
});

RemedyCard.displayName = "RemedyCard";
