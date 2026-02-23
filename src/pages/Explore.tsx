import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PoetCard from "@/components/features/PoetCard";
import { mockPoets, mockPoems } from "@/lib/mockData";
import { getCurrentUser } from "@/lib/auth";
import { getFollows } from "@/lib/storage";
import { Poet } from "@/types";
import {
  Flame,
  Sparkles,
  TrendingUp,
  Shuffle,
  Search,
  User,
  BookOpen,
  SlidersHorizontal,
} from "lucide-react";

// Get first line of a poet's latest poem
function getLatestPoemPreview(poetId: string): string | undefined {
  const poem = mockPoems.find((p) => p.poetId === poetId);
  if (!poem) return undefined;
  const firstLine = poem.content.split("\n").find((l) => l.trim().length > 0);
  return firstLine?.trim();
}

// Sort helpers
function byFollowers(a: Poet, b: Poet) {
  return b.followersCount - a.followersCount;
}
function byNewest(a: Poet, b: Poet) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}
function byInk(a: Poet, b: Poet) {
  return b.totalInk - a.totalInk;
}

export default function Explore() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [sortBy, setSortBy] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const followedIds = getFollows();

  // Simulate more poets for demo richness by creating expanded copies
  const allPoets: Poet[] = useMemo(() => {
    const extra: Poet[] = [
      {
        id: "poet-4",
        name: "Jordan Ellis",
        bio: "Quiet storms in small lines. Writing from the midwest.",
        isPoet: true,
        avatar: "/images/avatars/avatar-man-headshot.jpg",
        followersCount: 47,
        totalPoems: 6,
        totalInk: 120,
        createdAt: "2025-01-20",
      },
      {
        id: "poet-5",
        name: "Suki Tanaka",
        bio: "Haiku and free verse. Finding meaning in the brief.",
        isPoet: true,
        avatar: "/images/avatars/avatar-woman-blonde.jpg",
        followersCount: 98,
        totalPoems: 31,
        totalInk: 870,
        createdAt: "2024-12-05",
      },
      {
        id: "poet-6",
        name: "David Osei",
        bio: "Spoken word on paper. The rhythm never stops.",
        isPoet: true,
        avatar: "/images/avatars/avatar-man-older.jpg",
        followersCount: 214,
        totalPoems: 19,
        totalInk: 1600,
        createdAt: "2024-06-15",
      },
      {
        id: "poet-7",
        name: "Clara Moon",
        bio: "Love poems for nobody in particular.",
        isPoet: true,
        avatar: "/images/avatars/avatar-woman-closeup.jpg",
        followersCount: 63,
        totalPoems: 9,
        totalInk: 280,
        createdAt: "2025-02-01",
      },
      {
        id: "poet-8",
        name: "Amira Hadid",
        bio: "Diaspora dreams and inherited silences.",
        isPoet: true,
        avatar: "/images/avatars/avatar-woman-dark.jpg",
        followersCount: 155,
        totalPoems: 22,
        totalInk: 990,
        createdAt: "2024-09-12",
      },
    ];
    return [...mockPoets, ...extra];
  }, []);

  // Filtered by search
  const filteredPoets = useMemo(() => {
    if (!searchQuery.trim()) return allPoets;
    const q = searchQuery.toLowerCase();
    return allPoets.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.bio.toLowerCase().includes(q)
    );
  }, [allPoets, searchQuery]);

  // Sorted list for "all" view
  const sortedPoets = useMemo(() => {
    const list = [...filteredPoets];
    if (sortBy === "trending") return list.sort(byInk);
    if (sortBy === "newest") return list.sort(byNewest);
    if (sortBy === "followers") return list.sort(byFollowers);
    return list;
  }, [filteredPoets, sortBy]);

  // Section-specific lists (only when not searching)
  const isSearching = searchQuery.trim().length > 0;

  const trendingPoets = useMemo(
    () => [...allPoets].sort(byInk).slice(0, 4),
    [allPoets]
  );

  const newVoices = useMemo(
    () => [...allPoets].sort(byNewest).slice(0, 4),
    [allPoets]
  );

  // "Hidden gems": lower followers but higher ink ratio
  const hiddenGems = useMemo(() => {
    return [...allPoets]
      .filter((p) => p.followersCount < 150)
      .sort((a, b) => b.totalInk / (b.followersCount || 1) - a.totalInk / (a.followersCount || 1))
      .slice(0, 4);
  }, [allPoets]);

  // "Fastest growing": simulate by high ink + newer accounts
  const fastestGrowing = useMemo(() => {
    return [...allPoets]
      .sort((a, b) => {
        const aDays = Math.max(1, (Date.now() - new Date(a.createdAt).getTime()) / 86400000);
        const bDays = Math.max(1, (Date.now() - new Date(b.createdAt).getTime()) / 86400000);
        return b.followersCount / bDays - a.followersCount / aDays;
      })
      .slice(0, 4);
  }, [allPoets]);

  // Random poet
  const handleSurpriseMe = () => {
    const randomPoet = allPoets[Math.floor(Math.random() * allPoets.length)];
    navigate(`/poet/${randomPoet.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 max-w-5xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-1">
            Discover Poets
          </h1>
          <p className="text-muted-foreground">
            Find voices that resonate with you
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or bio..."
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-44 h-9">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="followers">Most Followed</SelectItem>
            </SelectContent>
          </Select>

          {/* Surprise Me */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 flex-shrink-0"
            onClick={handleSurpriseMe}
          >
            <Shuffle className="w-3.5 h-3.5" />
            Surprise Me
          </Button>
        </div>

        {/* Search results mode */}
        {isSearching ? (
          <section>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredPoets.length} result{filteredPoets.length !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {sortedPoets.map((poet) => (
                <PoetCard
                  key={poet.id}
                  poet={poet}
                  previewLine={getLatestPoemPreview(poet.id)}
                />
              ))}
            </div>
            {filteredPoets.length === 0 && (
              <Card className="p-12 text-center">
                <User className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No poets found</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Try a different search term
                </p>
              </Card>
            )}
          </section>
        ) : (
          <div className="space-y-10">
            {/* Trending This Week */}
            <Section
              icon={<Flame className="w-5 h-5 text-primary" />}
              title="Trending This Week"
              subtitle="Poets making waves right now"
            >
              <div className="grid sm:grid-cols-2 gap-3">
                {trendingPoets.map((poet) => (
                  <PoetCard
                    key={poet.id}
                    poet={poet}
                    previewLine={getLatestPoemPreview(poet.id)}
                    badge="Trending"
                  />
                ))}
              </div>
            </Section>

            {/* New Voices */}
            <Section
              icon={<Sparkles className="w-5 h-5 text-primary" />}
              title="New Voices"
              subtitle="Fresh talent that just joined"
            >
              <div className="grid sm:grid-cols-2 gap-3">
                {newVoices.map((poet) => (
                  <PoetCard
                    key={poet.id}
                    poet={poet}
                    previewLine={getLatestPoemPreview(poet.id)}
                    badge="New"
                  />
                ))}
              </div>
            </Section>

            {/* Fastest Growing */}
            <Section
              icon={<TrendingUp className="w-5 h-5 text-primary" />}
              title="Fastest Growing"
              subtitle="Rising stars gaining momentum"
            >
              <div className="grid sm:grid-cols-2 gap-3">
                {fastestGrowing.map((poet) => (
                  <PoetCard
                    key={poet.id}
                    poet={poet}
                    previewLine={getLatestPoemPreview(poet.id)}
                    badge="Rising"
                  />
                ))}
              </div>
            </Section>

            {/* Hidden Gems */}
            <Section
              icon={<BookOpen className="w-5 h-5 text-primary" />}
              title="Hidden Gems"
              subtitle="Low followers, strong engagement"
            >
              <div className="grid sm:grid-cols-2 gap-3">
                {hiddenGems.map((poet) => (
                  <PoetCard
                    key={poet.id}
                    poet={poet}
                    previewLine={getLatestPoemPreview(poet.id)}
                    badge="Gem"
                  />
                ))}
              </div>
            </Section>

            {/* All Poets */}
            <Section
              icon={<User className="w-5 h-5 text-primary" />}
              title="All Poets"
              subtitle={`${allPoets.length} poets on WordStack`}
            >
              <div className="grid sm:grid-cols-2 gap-3">
                {sortedPoets.map((poet) => (
                  <PoetCard
                    key={poet.id}
                    poet={poet}
                    previewLine={getLatestPoemPreview(poet.id)}
                  />
                ))}
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

/* Reusable section wrapper */
function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2.5 mb-1">
        {icon}
        <h2 className="font-serif text-xl font-bold text-foreground">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4 ml-[30px]">{subtitle}</p>
      {children}
    </section>
  );
}
