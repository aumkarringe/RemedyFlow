import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { AIAssistant } from "@/components/AIAssistant";
import { RemedyTracker } from "@/components/RemedyTracker";
import { Heart, TrendingUp, Sparkles } from "lucide-react";

export default function Tracker() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Navbar />
      <AIAssistant />
      
      <div className="pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12"
        >
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block mb-4"
            >
              <Heart className="w-16 h-16 text-primary" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Remedy Tracker
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Monitor your progress and track the effectiveness of remedies you've tried
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <RemedyTracker />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-card rounded-xl border border-border shadow-[var(--shadow-card)] text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Monitor how each remedy works for you over time
              </p>
            </div>
            <div className="p-6 bg-card rounded-xl border border-border shadow-[var(--shadow-card)] text-center">
              <Heart className="w-8 h-8 text-secondary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Rate Effectiveness</h3>
              <p className="text-sm text-muted-foreground">
                Share your experience to help others find the best remedies
              </p>
            </div>
            <div className="p-6 bg-card rounded-xl border border-border shadow-[var(--shadow-card)] text-center">
              <Sparkles className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Personal History</h3>
              <p className="text-sm text-muted-foreground">
                Build a record of what works best for your health
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
