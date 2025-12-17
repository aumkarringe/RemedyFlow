import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Home, Leaf, Brain, Heart, Menu, X, LayoutDashboard, LogIn, LogOut, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/remedies", label: "Remedies", icon: Leaf },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, requiresAuth: true },
  ];

  const aiToolsItems = [
    { path: "/ai/chatbot", label: "AI Chatbot" },
    { path: "/ai/daily-tips", label: "Daily Tips" },
    { path: "/ai/symptoms", label: "Symptom Analyzer" },
    { path: "/ai/journal", label: "Health Journal" },
    { path: "/ai/safety", label: "Safety Check" },
    { path: "/ai/wellness-plan", label: "Wellness Plan" },
    { path: "/ai/dosage", label: "Dosage Calculator" },
    { path: "/ai/preparation", label: "Preparation Guide" },
    { path: "/ai/seasonal", label: "Seasonal Remedies" },
    { path: "/ai/beauty", label: "Natural Beauty" },
    { path: "/ai/sleep", label: "Sleep Optimizer" },
    { path: "/ai/stress", label: "Stress Relief" },
    { path: "/ai/immunity", label: "Immunity Booster" },
    { path: "/ai/breathing", label: "Breathing Test" },
    { path: "/ai/home-remedies", label: "Home Remedies+" },
    { path: "/ai/exercises", label: "Exercise Planner" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-[var(--shadow-glow)]"
            >
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <span className="text-xl font-bold font-poppins bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              RemedyFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              // Skip auth-required items if user is not logged in
              if (item.requiresAuth && !user) return null;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-4 py-2 rounded-lg transition-colors ${
                      active
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {active && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
            
            {/* AI Tools Dropdown */}
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span className="text-sm font-medium">AI Tools</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </motion.div>
              <div className="absolute top-full left-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {aiToolsItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <div className="px-4 py-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors first:rounded-t-lg last:rounded-b-lg">
                      {item.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {/* Auth buttons */}
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="hidden md:flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <Button size="sm" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 space-y-2"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
            
            {/* AI Tools Mobile Section */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground">
                <Brain className="w-4 h-4" />
                <span>AI Tools</span>
              </div>
              {aiToolsItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="pl-10 pr-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
