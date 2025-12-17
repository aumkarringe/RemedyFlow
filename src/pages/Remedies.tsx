import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import { SearchBar } from "@/components/SearchBar";
import { RemedyCard } from "@/components/RemedyCard";
import { AIRemedyCard } from "@/components/AIRemedyCard";
import { ViewToggle } from "@/components/ViewToggle";
import { Navbar } from "@/components/Navbar";
import { AIAssistant } from "@/components/AIAssistant";
import remediesData from "@/assets/remedies.json";
import { Remedy, AIRemedy, isAIRemedy } from "@/types/remedy";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Remedies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [aiRemedies, setAiRemedies] = useState<AIRemedy[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const { toast } = useToast();

  const fuse = useMemo(
    () =>
      new Fuse(remediesData as Remedy[], {
        keys: [
          { name: "Name of Item", weight: 2 },
          { name: "Health Issue", weight: 3 },
          { name: "Home Remedy", weight: 1 },
        ],
        threshold: 0.3,
        includeScore: true,
        minMatchCharLength: 2,
      }),
    []
  );

  const healthIssues = useMemo(() => {
    const issues = new Set<string>();
    remediesData.forEach((remedy: Remedy) => {
      if (remedy["Health Issue"]) {
        issues.add(remedy["Health Issue"]);
      }
    });
    return Array.from(issues).sort();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    remediesData.forEach((remedy: Remedy) => {
      if (remedy["Health Issue"]) {
        cats.add(remedy["Health Issue"]);
      }
    });
    return Array.from(cats).sort().slice(0, 12);
  }, []);

  const datasetRemedies = useMemo(() => {
    if (!submittedQuery.trim()) {
      return [];
    }

    let results = fuse.search(submittedQuery).map((result) => result.item);
    
    if (selectedCategory) {
      results = results.filter(r => r["Health Issue"] === selectedCategory);
    }

    return results;
  }, [submittedQuery, fuse, selectedCategory]);

  const allRemedies = useMemo(() => {
    return [...datasetRemedies, ...aiRemedies];
  }, [datasetRemedies, aiRemedies]);

  const generateAIRemedies = async (query: string, datasetResults: Remedy[]) => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-remedies', {
        body: {
          healthIssue: query,
          datasetResults: datasetResults
        }
      });

      if (error) throw error;

      if (data.remedies && data.remedies.length > 0) {
        setAiRemedies(data.remedies);
        toast({
          title: "✨ AI Remedies Generated",
          description: `Found ${data.remedies.length} additional AI-powered remedies!`,
        });
      }
    } catch (error) {
      console.error('Error generating AI remedies:', error);
      toast({
        title: "Info",
        description: "Showing database results only",
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const matchingSuggestions = healthIssues.filter((issue) =>
        issue.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const itemSuggestions = (remediesData as Remedy[])
        .filter((remedy) =>
          remedy["Name of Item"].toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((remedy) => remedy["Name of Item"])
        .slice(0, 5);

      setSuggestions([...new Set([...matchingSuggestions, ...itemSuggestions])]);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, healthIssues]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setSubmittedQuery("");
    setSuggestions([]);
    setSelectedCategory("");
    setAiRemedies([]);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSubmittedQuery(searchQuery);
      setSuggestions([]);
      setAiRemedies([]);
      
      const datasetResults = fuse.search(searchQuery).map((result) => result.item);
      generateAIRemedies(searchQuery, datasetResults);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setSubmittedQuery(suggestion);
    setSuggestions([]);
    setAiRemedies([]);
    
    const datasetResults = fuse.search(suggestion).map((result) => result.item);
    generateAIRemedies(suggestion, datasetResults);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Navbar />
      <AIAssistant />
      
      <div className="pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 font-poppins">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Discover Natural Remedies
            </span>
          </h1>
          <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto">
            Search our extensive database enhanced with AI-powered recommendations
          </p>
        </motion.div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={handleClearSearch}
          onSearch={handleSearch}
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
        />

        {!submittedQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 max-w-7xl mx-auto px-4"
          >
            <h3 className="text-center text-sm font-semibold text-muted-foreground mb-6 font-poppins">
              Popular Health Conditions
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat, idx) => (
                <motion.button
                  key={cat}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearchQuery(cat);
                    setSubmittedQuery(cat);
                    setAiRemedies([]);
                    const results = fuse.search(cat).map((r) => r.item);
                    generateAIRemedies(cat, results);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 text-primary rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md border border-primary/20"
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {isLoadingAI && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 max-w-5xl mx-auto px-4"
          >
            <div className="flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-base font-medium text-foreground">
                Analyzing and generating personalized remedies with Gemini AI...
              </span>
              <Sparkles className="w-6 h-6 text-secondary animate-pulse" />
            </div>
          </motion.div>
        )}

        <div className="mt-16 max-w-7xl mx-auto px-4">
          {allRemedies.length > 0 ? (
            <>
              <ViewToggle
                view={view}
                onViewChange={setView}
                resultCount={allRemedies.length}
              />

              {submittedQuery && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mb-6"
                >
                  <p className="text-sm text-muted-foreground">
                    {datasetRemedies.length > 0 && (
                      <span className="font-medium text-foreground">{datasetRemedies.length} database remedies</span>
                    )}
                    {datasetRemedies.length > 0 && aiRemedies.length > 0 && <span> • </span>}
                    {aiRemedies.length > 0 && (
                      <span className="font-medium text-primary">{aiRemedies.length} AI-generated remedies</span>
                    )}
                  </p>
                </motion.div>
              )}

              <motion.div
                layout
                className={`grid gap-6 ${
                  view === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 max-w-3xl mx-auto"
                }`}
              >
                <AnimatePresence mode="popLayout">
                  {allRemedies.map((remedy, index) => {
                    if (isAIRemedy(remedy)) {
                      return (
                        <AIRemedyCard
                          key={`ai-${remedy.name}-${index}`}
                          remedy={remedy}
                          index={index}
                        />
                      );
                    } else {
                      return (
                        <RemedyCard
                          key={`dataset-${remedy["Name of Item"]}-${index}`}
                          name={remedy["Name of Item"]}
                          healthIssue={remedy["Health Issue"]}
                          remedy={remedy["Home Remedy"]}
                          yogasan={remedy["Yogasan"]}
                          index={index}
                        />
                      );
                    }
                  })}
                </AnimatePresence>
              </motion.div>
            </>
          ) : submittedQuery && !isLoadingAI ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-foreground mb-2 font-poppins">
                No remedies found
              </h3>
              <p className="text-muted-foreground font-inter">
                Try adjusting your search or browse our suggestions above
              </p>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
