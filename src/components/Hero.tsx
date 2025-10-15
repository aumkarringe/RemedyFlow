import { motion } from "framer-motion";
import { Leaf, Sparkles } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-secondary to-primary">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 text-primary-foreground/10"
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Leaf size={120} />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-20 text-primary-foreground/10"
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles size={100} />
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-1/3 text-primary-foreground/5"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <Leaf size={80} />
        </motion.div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="inline-block mb-6"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Leaf className="text-primary-foreground w-16 h-16 mx-auto mb-4" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold font-poppins text-primary-foreground mb-6 drop-shadow-lg">
            RemedyFlow
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 font-inter max-w-2xl mx-auto mb-8 drop-shadow">
            Discover Natural Home Remedies & Yoga Poses for Your Wellness Journey
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center gap-2 text-primary-foreground/80 text-sm font-inter"
          >
            <Sparkles size={16} />
            <span>Explore 600+ Natural Remedies</span>
            <Sparkles size={16} />
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
