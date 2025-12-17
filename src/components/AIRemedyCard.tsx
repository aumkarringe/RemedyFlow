import { motion } from "framer-motion";
import { ChevronDown, Sparkles, Heart, Share2, Printer, Copy, Zap, Bookmark, Loader2 } from "lucide-react";
import { useState, forwardRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { AIRemedy } from "@/types/remedy";
import { useSaveRemedy } from "@/hooks/useSaveRemedy";

interface AIRemedyCardProps {
  remedy: AIRemedy;
  index: number;
}

export const AIRemedyCard = forwardRef<HTMLDivElement, AIRemedyCardProps>(({ 
  remedy, 
  index 
}, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  const { saveRemedy, isSaving, isAuthenticated } = useSaveRemedy();

  const handleCopy = () => {
    const text = `${remedy.name}\nHealth Issue: ${remedy.healthIssue}\nRemedy: ${remedy.remedy}${remedy.yogasan ? `\nYoga: ${remedy.yogasan}` : ''}${remedy.acupressure ? `\nAcupressure: ${remedy.acupressure}` : ''}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: remedy.name,
        text: `${remedy.healthIssue}: ${remedy.remedy}`,
      });
    } else {
      handleCopy();
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html><head><title>${remedy.name}</title></head>
      <body><h1>${remedy.name}</h1><h3>${remedy.healthIssue}</h3><p>${remedy.remedy}</p></body>
      </html>
    `);
    printWindow?.print();
  };

  const handleSaveToProfile = async () => {
    const success = await saveRemedy({
      name: remedy.name,
      healthIssue: remedy.healthIssue,
      remedy: remedy.remedy,
      yogasan: remedy.yogasan,
      acupressure: remedy.acupressure,
      isAI: true,
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
      <Card className="group overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-glow)] transition-all duration-500 bg-gradient-to-br from-primary/10 via-card to-secondary/10 border-2 border-primary/40 hover:border-primary/60 relative">
        {/* AI Badge */}
        <div className="absolute top-3 right-3 z-20">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-primary to-secondary rounded-full text-xs font-semibold text-primary-foreground"
          >
            <Sparkles size={12} />
            <span>AI</span>
          </motion.div>
        </div>

        <div className="p-6 relative z-10">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <motion.div 
              className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg"
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Zap className="text-primary-foreground" size={24} />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold font-poppins text-foreground mb-1">
                {remedy.name}
              </h3>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                {remedy.healthIssue}
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
              {remedy.remedy}
            </p>
          </motion.div>

          {/* Benefits Badge */}
          {remedy.benefits && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full">
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">✨</span>
                <span className="text-xs font-medium text-foreground line-clamp-1">{remedy.benefits}</span>
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
              {isExpanded ? "Show Less" : "View Full Details"}
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
                {remedy.remedy}
              </p>
            </div>

            {remedy.yogasan && (
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🧘‍♀️</span>
                  <h4 className="text-sm font-semibold text-foreground font-poppins">
                    Recommended Yoga Pose
                  </h4>
                </div>
                <p className="text-sm text-foreground/80 font-inter leading-relaxed bg-primary/5 p-3 rounded-lg">
                  {remedy.yogasan}
                </p>
              </div>
            )}

            {remedy.acupressure && (
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">👆</span>
                  <h4 className="text-sm font-semibold text-foreground font-poppins">
                    Acupressure Point
                  </h4>
                </div>
                <p className="text-sm text-foreground/80 font-inter leading-relaxed bg-secondary/5 p-3 rounded-lg">
                  {remedy.acupressure}
                </p>
              </div>
            )}

            {remedy.duration && (
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-semibold text-foreground">⏱️ Duration:</span>
                <span className="text-sm text-muted-foreground">{remedy.duration}</span>
              </div>
            )}

            {remedy.precautions && (
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">⚠️</span>
                  <h4 className="text-sm font-semibold text-foreground font-poppins">
                    Precautions
                  </h4>
                </div>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-inter leading-relaxed bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
                  {remedy.precautions}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
});

AIRemedyCard.displayName = "AIRemedyCard";
