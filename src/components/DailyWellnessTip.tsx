import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const wellnessTips = [
  {
    tip: "Start your day with warm lemon water to boost digestion and hydration.",
    category: "Morning Ritual"
  },
  {
    tip: "Massage your temples with peppermint oil to relieve tension headaches naturally.",
    category: "Pain Relief"
  },
  {
    tip: "Drink ginger tea after meals to improve digestion and reduce bloating.",
    category: "Digestive Health"
  },
  {
    tip: "Apply aloe vera gel to minor burns and skin irritations for quick relief.",
    category: "Skin Care"
  },
  {
    tip: "Gargle with salt water twice daily to soothe sore throats and prevent infections.",
    category: "Immunity"
  },
  {
    tip: "Add turmeric to warm milk before bed for better sleep and reduced inflammation.",
    category: "Sleep & Recovery"
  },
  {
    tip: "Inhale steam with eucalyptus oil to clear nasal congestion naturally.",
    category: "Respiratory Health"
  },
  {
    tip: "Chew fresh mint leaves after meals to freshen breath and aid digestion.",
    category: "Oral Health"
  },
  {
    tip: "Apply cold cucumber slices to reduce puffy eyes and dark circles.",
    category: "Beauty"
  },
  {
    tip: "Drink chamomile tea in the evening to calm anxiety and promote relaxation.",
    category: "Mental Wellness"
  }
];

export function DailyWellnessTip() {
  const [currentTip, setCurrentTip] = useState(wellnessTips[0]);

  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem("dailyTipDate");
    
    if (storedDate !== today) {
      const randomTip = wellnessTips[Math.floor(Math.random() * wellnessTips.length)];
      setCurrentTip(randomTip);
      localStorage.setItem("dailyTipDate", today);
      localStorage.setItem("dailyTip", JSON.stringify(randomTip));
    } else {
      const stored = localStorage.getItem("dailyTip");
      if (stored) {
        setCurrentTip(JSON.parse(stored));
      }
    }
  }, []);

  const refreshTip = () => {
    const randomTip = wellnessTips[Math.floor(Math.random() * wellnessTips.length)];
    setCurrentTip(randomTip);
    localStorage.setItem("dailyTip", JSON.stringify(randomTip));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              Daily Wellness Tip
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={refreshTip}
              className="h-8 w-8"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm font-medium text-primary">{currentTip.category}</p>
          <p className="text-base leading-relaxed">{currentTip.tip}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
