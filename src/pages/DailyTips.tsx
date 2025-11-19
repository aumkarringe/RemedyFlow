import { Navbar } from "@/components/Navbar";
import { DailyWellnessTip } from "@/components/DailyWellnessTip";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const DailyTips = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-secondary animate-pulse" />
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            Daily Wellness Tips
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get personalized daily wellness tips powered by Gemini AI to improve your health naturally
          </p>
        </motion.div>
        <DailyWellnessTip />
      </div>
    </div>
  );
};

export default DailyTips;
