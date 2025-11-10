import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import { Hero } from "@/components/Hero";
import { SearchBar } from "@/components/SearchBar";
import { RemedyCard } from "@/components/RemedyCard";
import { AIRemedyCard } from "@/components/AIRemedyCard";
import { ViewToggle } from "@/components/ViewToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AIAssistant } from "@/components/AIAssistant";
import remediesData from "@/assets/remedies.json";
import { Remedy, AIRemedy, isAIRemedy } from "@/types/remedy";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [aiRemedies, setAiRemedies] = useState<AIRemedy[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const { toast } = useToast();

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

  // Get all unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    remediesData.forEach((remedy: Remedy) => {
      if (remedy["Health Issue"]) {
        cats.add(remedy["Health Issue"]);
      }
    });
    return Array.from(cats).sort().slice(0, 8);
  }, []);

  // Filter dataset results based on submitted search query
  const datasetRemedies = useMemo(() => {
    if (!submittedQuery.trim()) {
      return [];
    }

    let results = fuse.search(submittedQuery).map((result) => result.item);
    
    // Apply category filter
    if (selectedCategory) {
      results = results.filter(r => r["Health Issue"] === selectedCategory);
    }

    return results;
  }, [submittedQuery, fuse, selectedCategory]);

  // Combine dataset and AI remedies
  const allRemedies = useMemo(() => {
    return [...datasetRemedies, ...aiRemedies];
  }, [datasetRemedies, aiRemedies]);

  // Generate AI remedies when search is submitted
  const generateAIRemedies = async (query: string, datasetResults: Remedy[]) => {
    setIsLoadingAI(true);
    try {
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
      }

      const hasDatasetResults = datasetResults && datasetResults.length > 0;
      
      const prompt = hasDatasetResults 
        ? `You found ${datasetResults.length} remedies in the database for "${query}". 
           Please provide 3-5 ADDITIONAL complementary home remedies that are NOT in this list: ${JSON.stringify(datasetResults.map((r) => r['Name of Item']))}.
           
           Focus on:
           - Different natural ingredients
           - Alternative approaches
           - Modern scientific remedies
           - Traditional remedies from different cultures`
        : `Generate 5-7 comprehensive home remedies for "${query}".`;

      const fullPrompt = `${prompt}

CRITICAL: You MUST respond with ONLY a valid JSON array. No markdown, no explanations, no code blocks, just pure JSON.

Generate remedies in this EXACT format:
[
  {
    "name": "Ingredient/Remedy Name",
    "healthIssue": "${query}",
    "remedy": "Detailed preparation and usage instructions (at least 2-3 sentences)",
    "yogasan": "Specific yoga pose name with brief instructions",
    "acupressure": "Specific pressure point name and location",
    "benefits": "Key benefits in one sentence",
    "precautions": "Any warnings or who should avoid",
    "duration": "How long to use this remedy",
    "source": "AI-Generated"
  }
]

Requirements:
1. Each remedy must be practical and safe
2. Include detailed preparation steps
3. Specify exact quantities where applicable
4. Mention frequency of use
5. All remedies should be different from each other
6. Focus on natural, accessible ingredients
7. Include scientific rationale where possible

Return ONLY the JSON array, nothing else.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{ text: fullPrompt }]
            }],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      let aiResponse = data.candidates[0]?.content?.parts[0]?.text || '[]';
      
      console.log('Raw AI response:', aiResponse);
      
      // Clean up the response
      aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      let remedies;
      try {
        remedies = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        remedies = [];
      }

      if (!Array.isArray(remedies)) {
        remedies = [];
      }

      console.log('Generated remedies count:', remedies.length);
      
      if (remedies.length > 0) {
        setAiRemedies(remedies);
        toast({
          title: "✨ AI Remedies Generated",
          description: `Found ${remedies.length} additional AI-powered remedies!`,
        });
      }
    } catch (error) {
      console.error('Error generating AI remedies:', error);
      toast({
        title: "AI Generation Error",
        description: error instanceof Error ? error.message : "Could not generate AI remedies.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

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
    setSubmittedQuery("");
    setSuggestions([]);
    setSelectedCategory("");
    setAiRemedies([]);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSubmittedQuery(searchQuery);
      setSuggestions([]);
      setAiRemedies([]); // Clear previous AI results
      
      // First get dataset results
      const datasetResults = fuse.search(searchQuery).map((result) => result.item);
      
      // Then generate AI remedies
      generateAIRemedies(searchQuery, datasetResults);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setSubmittedQuery(suggestion);
    setSuggestions([]);
    setAiRemedies([]); // Clear previous AI results
    
    // Get dataset results
    const datasetResults = fuse.search(suggestion).map((result) => result.item);
    
    // Generate AI remedies
    generateAIRemedies(suggestion, datasetResults);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 font-inter">
      <ThemeToggle />
      <AIAssistant />
      <Hero />

      <div className="relative pb-12">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={handleClearSearch}
          onSearch={handleSearch}
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
        />

        {/* Category Quick Filters */}
        {!submittedQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 max-w-5xl mx-auto px-4"
          >
            <h3 className="text-center text-sm font-semibold text-muted-foreground mb-4 font-poppins">
              Popular Health Issues
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearchQuery(cat);
                    setSubmittedQuery(cat);
                    setAiRemedies([]);
                    const datasetResults = fuse.search(cat).map((result) => result.item);
                    generateAIRemedies(cat, datasetResults);
                  }}
                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-medium transition-colors"
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI Loading Indicator */}
        {isLoadingAI && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 max-w-5xl mx-auto px-4"
          >
            <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm font-medium text-foreground">
                Generating AI-powered remedies...
              </span>
              <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
            </div>
          </motion.div>
        )}

        {/* Results Section */}
        <div className="mt-16 max-w-7xl mx-auto px-4">
          {allRemedies.length > 0 ? (
            <>
              <ViewToggle
                view={view}
                onViewChange={setView}
                resultCount={allRemedies.length}
              />

              {/* Show count breakdown */}
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

        {/* Info Section */}
        {!submittedQuery && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-20 max-w-4xl mx-auto px-4 text-center pb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4 font-poppins">
              🌿 Explore Natural Healing with AI
            </h2>
            <p className="text-muted-foreground font-inter leading-relaxed mb-6">
              Search for any health condition and discover both time-tested remedies from our database 
              and cutting-edge AI-generated solutions. Each search combines traditional wisdom with 
              modern AI to give you comprehensive healing options including home remedies, yoga poses, 
              acupressure points, and dietary recommendations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-primary/5 rounded-lg">
                <div className="text-3xl mb-2">📚</div>
                <h4 className="font-semibold text-foreground mb-1">600+ Database Remedies</h4>
                <p className="text-sm text-muted-foreground">Traditional proven solutions</p>
              </div>
              <div className="p-4 bg-secondary/5 rounded-lg">
                <div className="text-3xl mb-2">✨</div>
                <h4 className="font-semibold text-foreground mb-1">AI-Powered Insights</h4>
                <p className="text-sm text-muted-foreground">Dynamic remedy generation</p>
              </div>
              <div className="p-4 bg-accent/5 rounded-lg">
                <div className="text-3xl mb-2">💬</div>
                <h4 className="font-semibold text-foreground mb-1">AI Assistant</h4>
                <p className="text-sm text-muted-foreground">Ask anything about wellness</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;
