import { Navbar } from "@/components/Navbar";
import { AIAssistant } from "@/components/AIAssistant";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

const AIChatbot = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Leaf className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Wellness Guide
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Chat with our intelligent wellness guide to get personalized remedy recommendations and health advice
          </p>
        </motion.div>
        <AIAssistant />
      </div>
    </div>
  );
};

export default AIChatbot;