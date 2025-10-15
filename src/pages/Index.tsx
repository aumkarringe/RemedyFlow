import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import { Hero } from "@/components/Hero";
import { SearchBar } from "@/components/SearchBar";
import { RemedyCard } from "@/components/RemedyCard";
import { ViewToggle } from "@/components/ViewToggle";
import remediesData from "@/assets/remedies.json";
import { Remedy } from "@/types/remedy";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Initialize Fuse.js for fuzzy search
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

  // Get all unique health issues for suggestions
  const healthIssues = useMemo(() => {
    const issues = new Set<string>();
    remediesData.forEach((remedy: Remedy) => {
      if (remedy["Health Issue"]) {
        issues.add(remedy["Health Issue"]);
      }
    });
    return Array.from(issues).sort();
  }, []);

  // Filter results based on search query
  const filteredRemedies = useMemo(() => {
    if (!searchQuery.trim()) {
      // Show a sample of remedies when no search query
      return (remediesData as Remedy[]).slice(0, 12);
    }

    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [searchQuery, fuse]);

  // Update suggestions based on search query
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const matchingSuggestions = healthIssues.filter((issue) =>
        issue.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Also add item names that match
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
    setSuggestions([]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 font-inter">
      <Hero />

      <div className="relative pb-12">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={handleClearSearch}
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
        />

        {/* Results Section */}
        <div className="mt-16 max-w-7xl mx-auto px-4">
          {filteredRemedies.length > 0 ? (
            <>
              <ViewToggle
                view={view}
                onViewChange={setView}
                resultCount={filteredRemedies.length}
              />

              <motion.div
                layout
                className={`grid gap-6 ${
                  view === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 max-w-3xl mx-auto"
                }`}
              >
                <AnimatePresence mode="popLayout">
                  {filteredRemedies.map((remedy, index) => (
                    <RemedyCard
                      key={`${remedy["Name of Item"]}-${index}`}
                      name={remedy["Name of Item"]}
                      healthIssue={remedy["Health Issue"]}
                      remedy={remedy["Home Remedy"]}
                      yogasan={remedy["Yogasan"]}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          ) : (
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
          )}
        </div>

        {/* Info Section */}
        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-20 max-w-4xl mx-auto px-4 text-center pb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4 font-poppins">
              Explore Natural Healing
            </h2>
            <p className="text-muted-foreground font-inter leading-relaxed">
              Browse through our extensive collection of time-tested home remedies and yoga poses.
              Each remedy is carefully documented with detailed instructions and recommended yoga
              practices to complement your healing journey. Start by searching for a specific health
              issue or explore the remedies shown above.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;
