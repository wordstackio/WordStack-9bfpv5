import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Shuffle, TrendingUp, Sparkles, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PoetCard from "@/components/features/PoetCard";
import { mockPoets, mockPoems } from "@/lib/mockData";
import { Poet } from "@/types";

type SortOption = "trending" | "newest" | "most-followed" | "most-poems";

const SORT_LABELS: Record<SortOption, string> = {
  trending: "Trending",
  newest: "Newest",
  "most-followed": "Most Followed",
  "most-poems": "Most Poems",
};

function getLatestPoem(poetId: string) {
  return mockPoems
    .filter((p) => p.poetId === poetId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

function getTrendingPoets(poets: Poet[]) {
  // Trending = highest engagement-to-followers ratio (claps + comments per poem)
  return [...poets]
    .map((poet) => {
      const poems = mockPoems.filter((p) => p.poetId === poet.id);
      const totalEngagement = poems.reduce((sum, p) => sum + p.clapsCount + p.commentsCount, 0);
      return { poet, engagement: poems.length > 0 ? totalEngagement / poems.length : 0 };
    })
    .sort((a, b) => b.engagement - a.engagement)
    .map((item) => item.poet);
}

function getHiddenGems(poets: Poet[]) {
  // Low followers but strong ink/engagement ratio
  return [...poets]
    .filter((p) => p.followersCount < 400)
    .sort((a, b) => (b.totalInk / Math.max(b.followersCount, 1)) - (a.totalInk / Math.max(a.followersCount, 1)));
}

function getFastestGrowing(poets: Poet[]) {
  // Highest ink-to-poem ratio (productivity + quality signal)
  return [...poets]
    .map((poet) => ({
      poet,
      growth: poet.totalPoems > 0 ? poet.totalInk / poet.totalPoems : 0,
    }))
    .sort((a, b) => b.growth - a.growth)
    .map((item) => item.poet);
}

function getNewVoices(poets: Poet[]) {
  return [...poets].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export default function Explore() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Curated sections
  const trending = useMemo(() => getTrendingPoets(mockPoets), []);
  const hiddenGems = useMemo(() => getHiddenGems(mockPoets), []);
  const fastestGrowing = useMemo(() => getFastestGrowing(mockPoets), []);
  const newVoices = useMemo(() => getNewVoices(mockPoets), []);

  // Filtered + sorted "All poets"
  const filteredPoets = useMemo(() => {
    let result = [...mockPoets];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.bio.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "trending":
        return getTrendingPoets(result);
      case "newest":
        return result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "most-followed":
        return result.sort((a, b) => b.followersCount - a.followersCount);
      case "most-poems":
        return result.sort((a, b) => b.totalPoems - a.totalPoems);
      default:
        return result;
    }
  }, [searchQuery, sortBy]);

  const isSearching = searchQuery.trim().length > 0;

  const handleSurpriseMe = useCallback(() => {
    const randomPoet = mockPoets[Math.floor(Math.random() * mockPoets.length)];
    navigate(`/poet/${randomPoet.id}`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-6xl py-8 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2 text-balance">
            Discover Poets
          </h1>
          <p className="text-muted-foreground text-pretty">
            Find voices that resonate with you
          </p>
        </div>

        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setShowSortMenu(!showSortMenu)}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {SORT_LABELS[sortBy]}
                <ChevronDown className="w-3 h-3" />
              </Button>
              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-44 bg-popover border border-border rounded-lg shadow-lg z-50 py-1">
                    {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          sortBy === option
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-foreground hover:bg-accent/50"
                        }`}
                      >
                        {SORT_LABELS[option]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Surprise Me */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleSurpriseMe}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Surprise Me</span>
            </Button>
          </div>
        </div>

        {/* Searching -- show flat results */}
        {isSearching ? (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredPoets.length} result{filteredPoets.length !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredPoets.map((poet) => (
                <PoetCard key={poet.id} poet={poet} latestPoem={getLatestPoem(poet.id)} />
              ))}
            </div>
            {filteredPoets.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No poets match your search. Try a different term.</p>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {/* Section: Trending This Week */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  Trending This Week
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trending.slice(0, 3).map((poet) => (
                  <PoetCard
                    key={poet.id}
                    poet={poet}
                    latestPoem={getLatestPoem(poet.id)}
                    variant="featured"
                  />
                ))}
              </div>
            </section>

            {/* Section: New Voices */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  New Voices
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {newVoices.slice(0, 4).map((poet) => (
                  <PoetCard key={poet.id} poet={poet} latestPoem={getLatestPoem(poet.id)} />
                ))}
              </div>
            </section>

            {/* Section: Fastest Growing */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  Fastest Growing
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fastestGrowing.slice(0, 3).map((poet) => (
                  <PoetCard
                    key={poet.id}
                    poet={poet}
                    latestPoem={getLatestPoem(poet.id)}
                    variant="featured"
                  />
                ))}
              </div>
            </section>

            {/* Section: Hidden Gems */}
            {hiddenGems.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-serif text-xl font-semibold text-foreground">
                    Hidden Gems
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground -mt-3 mb-5">
                  Under the radar but worth your attention
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {hiddenGems.slice(0, 4).map((poet) => (
                    <PoetCard key={poet.id} poet={poet} latestPoem={getLatestPoem(poet.id)} />
                  ))}
                </div>
              </section>
            )}

            {/* Section: All Poets (sorted) */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  All Poets
                </h2>
                <span className="text-sm text-muted-foreground">
                  Sorted by {SORT_LABELS[sortBy].toLowerCase()}
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {filteredPoets.map((poet) => (
                  <PoetCard key={poet.id} poet={poet} latestPoem={getLatestPoem(poet.id)} />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
