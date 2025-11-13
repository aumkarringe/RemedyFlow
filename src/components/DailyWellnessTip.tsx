import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const DailyWellnessTip = () => {
  const [tip, setTip] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateTip = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            {
              role: "user",
              content:
                "Provide one insightful daily wellness tip related to home remedies, natural health, or holistic living. Keep it concise (2-3 sentences) and actionable. Make it inspiring and practical.",
            },
          ],
          systemPrompt:
            "You are a wellness coach providing daily health tips. Be concise, practical, and inspiring.",
        },
      });

      if (error) throw error;

      const tipText = data.choices?.[0]?.message?.content || '';
      setTip(tipText);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Failed to load tip",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateTip();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-primary/20 shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Daily Wellness Tip</h3>
            </div>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading your daily tip...</span>
              </div>
            ) : (
              <p className="text-sm text-foreground leading-relaxed">{tip}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={generateTip}
            disabled={isLoading}
            className="flex-shrink-0 hover:bg-primary/10"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
