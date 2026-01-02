import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Brain, Leaf, Heart, ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { AIAssistant } from "@/components/AIAssistant";

export default function Home() {
  const features = [
    {
      icon: Leaf,
      title: "600+ Natural Remedies",
      description: "Curated database of proven home remedies for various health conditions",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Brain,
      title: "Smart Wellness Tools",
      description: "Intelligent features including remedy comparison, health journal analysis, and personalized wellness plans",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Heart,
      title: "Health Tracking",
      description: "Monitor remedy effectiveness and track your wellness journey over time",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Contraindication checker to ensure your remedies are safe with medications",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  const stats = [
    { number: "600+", label: "Home Remedies" },
    { number: "50+", label: "Health Conditions" },
    { number: "8", label: "Smart Features" },
    { number: "100%", label: "Natural" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Navbar />
      <AIAssistant />

      {/* Hero Section with 3D Effect */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-20 -right-20 w-96 h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              rotate: [360, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* 3D Floating Icon */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotateY: [0, 180, 360],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-block mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-3xl blur-2xl opacity-50" />
                <div className="relative p-6 bg-gradient-to-br from-primary to-secondary rounded-3xl shadow-[var(--shadow-glow)]">
                  <Sparkles className="w-16 h-16 text-primary-foreground" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6 font-poppins"
            >
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Natural Healing
              </span>
              <br />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 font-inter"
            >
              Discover time-tested home remedies enhanced with cutting-edge AI technology.
              Your journey to natural wellness starts here.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/remedies">
                <Button size="lg" className="group text-lg px-8 py-6">
                  Explore Remedies
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/ai/symptoms">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Brain className="mr-2 w-5 h-5" />
                  Try Smart Tools
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">
              Why Choose <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">RemedyFlow</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Combining traditional wisdom with modern AI technology for comprehensive natural healing
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-8 bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-glow)] transition-all duration-500">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`inline-block p-4 bg-gradient-to-br ${feature.color} rounded-xl mb-4 shadow-lg`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-3 font-poppins text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <Zap className="w-16 h-16 mx-auto mb-6 text-primary animate-pulse" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-poppins">
            Ready to Start Your
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Natural Healing Journey?
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands discovering the power of natural remedies enhanced by smart technology
          </p>
          <Link to="/remedies">
            <Button size="lg" className="text-lg px-10 py-6 group shadow-[var(--shadow-glow)]">
              Get Started Now
              <TrendingUp className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p className="text-sm">
            © 2024 RemedyFlow. Empowering natural wellness with intelligent technology.
          </p>
        </div>
      </footer>
    </div>
  );
}
