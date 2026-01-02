import { motion } from "framer-motion";
import { Leaf, AlertCircle, CheckCircle2, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface WellnessResponseProps {
  content: string;
  isBlocked?: boolean;
  className?: string;
}

export function WellnessResponse({ content, isBlocked, className }: WellnessResponseProps) {
  // Parse and format the response content
  const formatContent = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let isInList = false;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-2 my-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                <span className="text-foreground/90 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines but flush list
      if (!trimmedLine) {
        if (isInList) {
          flushList();
          isInList = false;
        }
        return;
      }

      // Handle headers (markdown style)
      if (trimmedLine.startsWith('###')) {
        flushList();
        elements.push(
          <h4 key={index} className="text-base font-semibold text-foreground mt-4 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {trimmedLine.replace(/^###\s*/, '')}
          </h4>
        );
        return;
      }

      if (trimmedLine.startsWith('##')) {
        flushList();
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-foreground mt-5 mb-3 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-primary" />
            {trimmedLine.replace(/^##\s*/, '')}
          </h3>
        );
        return;
      }

      // Handle bullet points
      if (trimmedLine.match(/^[-*•]\s/) || trimmedLine.match(/^\d+\.\s/)) {
        isInList = true;
        const cleanItem = trimmedLine.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '');
        listItems.push(cleanItem);
        return;
      }

      // Handle bold text
      if (trimmedLine.includes('**')) {
        flushList();
        const parts = trimmedLine.split(/\*\*(.*?)\*\*/);
        elements.push(
          <p key={index} className="text-foreground/90 leading-relaxed my-2">
            {parts.map((part, i) => 
              i % 2 === 1 ? <strong key={i} className="font-semibold text-foreground">{part}</strong> : part
            )}
          </p>
        );
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={index} className="text-foreground/90 leading-relaxed my-2">
          {trimmedLine}
        </p>
      );
    });

    flushList();
    return elements;
  };

  if (isBlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "rounded-2xl p-5 bg-amber-500/10 border border-amber-500/20",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-amber-500/20 flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-foreground/90 leading-relaxed">{content}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl p-5 bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50",
        className
      )}
    >
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {formatContent(content)}
      </div>
      
      {/* Subtle branding */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/30">
        <Leaf className="w-3.5 h-3.5 text-primary/60" />
        <span className="text-xs text-muted-foreground">
          Wellness guidance • Always consult professionals for medical advice
        </span>
      </div>
    </motion.div>
  );
}