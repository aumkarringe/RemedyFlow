import { motion } from "framer-motion";
import { 
  Leaf, AlertCircle, Sparkles, Heart, Brain, 
  Lightbulb, Target, Apple, Activity, Moon, 
  Droplets, Wind, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface WellnessResponseProps {
  content: string;
  isBlocked?: boolean;
  className?: string;
}

const sectionIcons: Record<string, React.ReactNode> = {
  "current health assessment": <Heart className="w-5 h-5 text-rose-500" />,
  "key observations": <Brain className="w-5 h-5 text-purple-500" />,
  "present recommendations": <Target className="w-5 h-5 text-emerald-500" />,
  "future health outlook": <Lightbulb className="w-5 h-5 text-amber-500" />,
  "holistic wellness plan": <Sparkles className="w-5 h-5 text-primary" />,
  "diet suggestions": <Apple className="w-5 h-5 text-green-500" />,
  "exercise recommendations": <Activity className="w-5 h-5 text-blue-500" />,
  "stress management": <Wind className="w-5 h-5 text-cyan-500" />,
  "sleep optimization": <Moon className="w-5 h-5 text-indigo-500" />,
  "hydration": <Droplets className="w-5 h-5 text-sky-500" />,
};

const getSectionIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  for (const [key, icon] of Object.entries(sectionIcons)) {
    if (lowerTitle.includes(key)) return icon;
  }
  return <Leaf className="w-5 h-5 text-primary" />;
};

const sectionGradients: Record<string, string> = {
  "current health": "from-rose-500/10 to-rose-500/5 border-rose-500/20",
  "key observations": "from-purple-500/10 to-purple-500/5 border-purple-500/20",
  "present": "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
  "future": "from-amber-500/10 to-amber-500/5 border-amber-500/20",
  "holistic": "from-primary/10 to-primary/5 border-primary/20",
  "diet": "from-green-500/10 to-green-500/5 border-green-500/20",
  "exercise": "from-blue-500/10 to-blue-500/5 border-blue-500/20",
  "stress": "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20",
  "sleep": "from-indigo-500/10 to-indigo-500/5 border-indigo-500/20",
};

const getSectionGradient = (title: string) => {
  const lowerTitle = title.toLowerCase();
  for (const [key, gradient] of Object.entries(sectionGradients)) {
    if (lowerTitle.includes(key)) return gradient;
  }
  return "from-muted/50 to-muted/30 border-border/50";
};

export function WellnessResponse({ content, isBlocked, className }: WellnessResponseProps) {
  const formatContent = (text: string) => {
    const lines = text.split('\n');
    const sections: { title: string; content: JSX.Element[] }[] = [];
    let currentSection: { title: string; content: JSX.Element[] } | null = null;
    let listItems: string[] = [];
    let listIndex = 0;

    const flushList = () => {
      if (listItems.length > 0 && currentSection) {
        currentSection.content.push(
          <div key={`list-${listIndex++}`} className="space-y-3 my-4">
            {listItems.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30 hover:border-primary/30 transition-all duration-200"
              >
                <div className="mt-0.5 flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground/90 leading-relaxed text-sm">{item}</span>
              </motion.div>
            ))}
          </div>
        );
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        flushList();
        return;
      }

      // Main section headers (##)
      if (trimmedLine.startsWith('##') && !trimmedLine.startsWith('###')) {
        flushList();
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmedLine.replace(/^##\s*/, ''),
          content: []
        };
        return;
      }

      // Sub-headers (###)
      if (trimmedLine.startsWith('###')) {
        flushList();
        if (currentSection) {
          currentSection.content.push(
            <h4 key={index} className="text-sm font-semibold text-foreground mt-4 mb-2 flex items-center gap-2 uppercase tracking-wide">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              {trimmedLine.replace(/^###\s*/, '')}
            </h4>
          );
        }
        return;
      }

      // Bullet points
      if (trimmedLine.match(/^[-*•]\s/) || trimmedLine.match(/^\d+\.\s/)) {
        const cleanItem = trimmedLine.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '');
        // Handle bold text within list items
        const formattedItem = cleanItem.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        listItems.push(formattedItem.replace(/<\/?strong>/g, ''));
        return;
      }

      // Bold text paragraphs
      if (trimmedLine.includes('**')) {
        flushList();
        const parts = trimmedLine.split(/\*\*(.*?)\*\*/);
        if (currentSection) {
          currentSection.content.push(
            <p key={index} className="text-foreground/90 leading-relaxed my-3 text-sm">
              {parts.map((part, i) => 
                i % 2 === 1 ? (
                  <strong key={i} className="font-semibold text-foreground bg-primary/10 px-1 rounded">
                    {part}
                  </strong>
                ) : part
              )}
            </p>
          );
        }
        return;
      }

      // Regular paragraph
      flushList();
      if (currentSection) {
        currentSection.content.push(
          <p key={index} className="text-foreground/80 leading-relaxed my-2 text-sm">
            {trimmedLine}
          </p>
        );
      } else {
        // Create intro section for content before first header
        if (!currentSection) {
          currentSection = { title: "Overview", content: [] };
        }
        currentSection.content.push(
          <p key={index} className="text-foreground/80 leading-relaxed my-2 text-sm">
            {trimmedLine}
          </p>
        );
      }
    });

    flushList();
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  };

  if (isBlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "rounded-2xl p-5 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-amber-500/20 flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-foreground/90 leading-relaxed">{content}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const sections = formatContent(content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-4", className)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg shadow-primary/20">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Your Wellness Insights</h3>
          <p className="text-sm text-muted-foreground">Personalized recommendations based on your symptoms</p>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              idx === sections.length - 1 && sections.length % 2 !== 0 ? "md:col-span-2" : ""
            )}
          >
            <Card className={cn(
              "h-full overflow-hidden border bg-gradient-to-br transition-all duration-300 hover:shadow-lg",
              getSectionGradient(section.title)
            )}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-background/80 shadow-sm">
                    {getSectionIcon(section.title)}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {section.title}
                  </h3>
                </div>
                <div className="space-y-1">
                  {section.content}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-2 mt-6 py-4 px-6 rounded-xl bg-gradient-to-r from-primary/5 via-muted/50 to-primary/5 border border-border/30"
      >
        <Leaf className="w-4 h-4 text-primary" />
        <span className="text-sm text-muted-foreground">
          Wellness guidance for informational purposes • Always consult healthcare professionals for medical advice
        </span>
      </motion.div>
    </motion.div>
  );
}
