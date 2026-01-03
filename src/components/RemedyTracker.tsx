import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Bookmark, Star, Clock, CheckCircle2, Leaf, 
  TrendingUp, Award, Filter, Sparkles, Heart,
  ThumbsUp, ThumbsDown, Loader2
} from "lucide-react";

interface SavedRemedy {
  id: string;
  remedy_name: string;
  health_issue: string;
  remedy_details: any;
  is_favorite: boolean;
  tried: boolean;
  effectiveness_rating: number | null;
  notes: string | null;
  created_at: string;
}

export function RemedyTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [remedies, setRemedies] = useState<SavedRemedy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "favorites" | "tried" | "untried">("all");

  useEffect(() => {
    if (user) {
      fetchRemedies();
    }
  }, [user]);

  const fetchRemedies = async () => {
    if (!user) return;
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from("saved_remedies")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data && !error) {
      setRemedies(data);
    }
    setIsLoading(false);
  };

  const toggleFavorite = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("saved_remedies")
      .update({ is_favorite: !current })
      .eq("id", id);

    if (!error) {
      setRemedies(prev => prev.map(r => r.id === id ? { ...r, is_favorite: !current } : r));
      toast({ title: !current ? "Added to favorites" : "Removed from favorites" });
    }
  };

  const markAsTried = async (id: string, tried: boolean) => {
    const { error } = await supabase
      .from("saved_remedies")
      .update({ tried })
      .eq("id", id);

    if (!error) {
      setRemedies(prev => prev.map(r => r.id === id ? { ...r, tried } : r));
      toast({ title: tried ? "Marked as tried" : "Marked as untried" });
    }
  };

  const rateEffectiveness = async (id: string, rating: number) => {
    const { error } = await supabase
      .from("saved_remedies")
      .update({ effectiveness_rating: rating, tried: true })
      .eq("id", id);

    if (!error) {
      setRemedies(prev => prev.map(r => r.id === id ? { ...r, effectiveness_rating: rating, tried: true } : r));
      toast({ title: "Rating saved" });
    }
  };

  const getFilteredRemedies = () => {
    switch (filter) {
      case "favorites":
        return remedies.filter(r => r.is_favorite);
      case "tried":
        return remedies.filter(r => r.tried);
      case "untried":
        return remedies.filter(r => !r.tried);
      default:
        return remedies;
    }
  };

  const getStats = () => {
    const total = remedies.length;
    const favorites = remedies.filter(r => r.is_favorite).length;
    const tried = remedies.filter(r => r.tried).length;
    const rated = remedies.filter(r => r.effectiveness_rating !== null);
    const avgRating = rated.length > 0 
      ? rated.reduce((sum, r) => sum + (r.effectiveness_rating || 0), 0) / rated.length 
      : 0;
    
    return { total, favorites, tried, avgRating: avgRating.toFixed(1) };
  };

  const stats = getStats();
  const filteredRemedies = getFilteredRemedies();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Bookmark className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Saved Remedies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/5 to-rose-500/10 border-rose-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20">
                <Heart className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.favorites}</p>
                <p className="text-xs text-muted-foreground">Favorites</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.tried}</p>
                <p className="text-xs text-muted-foreground">Tried</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.avgRating}</p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-primary" />
                Your Remedy Collection
              </CardTitle>
              <CardDescription>
                Track and rate remedies you've saved
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all" className="gap-2">
                <Filter className="h-4 w-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-2">
                <Heart className="h-4 w-4" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="tried" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Tried
              </TabsTrigger>
              <TabsTrigger value="untried" className="gap-2">
                <Clock className="h-4 w-4" />
                To Try
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {filteredRemedies.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <Leaf className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No remedies found in this category</p>
                  <p className="text-sm text-muted-foreground/60">Start exploring and save remedies!</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid gap-4 md:grid-cols-2"
                >
                  {filteredRemedies.map((remedy, idx) => (
                    <motion.div
                      key={remedy.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="h-full border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground mb-1">
                                {remedy.remedy_name}
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                {remedy.health_issue}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleFavorite(remedy.id, remedy.is_favorite)}
                            >
                              <Heart className={`h-4 w-4 transition-colors ${
                                remedy.is_favorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
                              }`} />
                            </Button>
                          </div>

                          {/* Status badges */}
                          <div className="flex items-center gap-2 mb-4">
                            {remedy.tried ? (
                              <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Tried
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                Not tried yet
                              </Badge>
                            )}
                            {remedy.effectiveness_rating && (
                              <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/30">
                                <Star className="h-3 w-3 mr-1" />
                                {remedy.effectiveness_rating}/5
                              </Badge>
                            )}
                          </div>

                          {/* Rating Section */}
                          <div className="space-y-3">
                            <p className="text-xs text-muted-foreground font-medium">Rate effectiveness:</p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => rateEffectiveness(remedy.id, star)}
                                  className="p-1 hover:scale-110 transition-transform"
                                >
                                  <Star className={`h-5 w-5 transition-colors ${
                                    remedy.effectiveness_rating && star <= remedy.effectiveness_rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-muted-foreground/30 hover:text-amber-400"
                                  }`} />
                                </button>
                              ))}
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-center gap-2 pt-2">
                              <Button
                                variant={remedy.tried ? "secondary" : "default"}
                                size="sm"
                                className="flex-1"
                                onClick={() => markAsTried(remedy.id, !remedy.tried)}
                              >
                                {remedy.tried ? (
                                  <>
                                    <Clock className="h-3 w-3 mr-1" />
                                    Mark Untried
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Mark as Tried
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Date */}
                          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/30">
                            Saved {new Date(remedy.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </CardContent>
      </Card>

      {/* Achievement Section */}
      {stats.tried > 0 && (
        <Card className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Wellness Explorer
                </h3>
                <p className="text-sm text-muted-foreground">
                  You've tried {stats.tried} remedies! Keep exploring natural wellness.
                </p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress to next level</span>
                    <span>{stats.tried}/10 remedies</span>
                  </div>
                  <Progress value={Math.min((stats.tried / 10) * 100, 100)} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
