import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ChallengeEntryCard from "@/components/features/ChallengeEntryCard";
import SubmitChallengeModal from "@/components/features/SubmitChallengeModal";
import { mockChallenges } from "@/lib/mockData";
import { getCurrentUser } from "@/lib/auth";
import { Challenge } from "@/types";
import {
  Trophy,
  Clock,
  TrendingUp,
  Flame,
  ChevronRight,
  Sparkles,
  Zap,
} from "lucide-react";

type SortOption = "newest" | "featured" | "shortlisted";

export default function Challenges() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const activeChallenge = useMemo(
    () => mockChallenges.find((c) => c.status === "active"),
    []
  );

  const pastChallenges = useMemo(
    () => mockChallenges.filter((c) => c.status === "past"),
    []
  );

  const sortedEntries = useMemo(() => {
    if (!activeChallenge) return [];
    const entries = [...activeChallenge.entries];
    
    switch (sortBy) {
      case "featured":
        return entries.sort((a, b) => (b.isShortlisted ? 1 : 0) - (a.isShortlisted ? 1 : 0));
      case "shortlisted":
        return entries.filter((e) => e.isShortlisted).sort((a, b) => b.inkReceived - a.inkReceived);
      case "newest":
        return entries.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      default:
        return entries;
    }
  }, [activeChallenge, sortBy]);

  const daysRemaining = activeChallenge
    ? Math.ceil(
        (new Date(activeChallenge.deadlineDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 max-w-5xl py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
            Challenges
          </h1>
          <p className="text-muted-foreground">
            Compete, create, and connect with the community
          </p>
        </div>

        {/* Active Challenge Hero with Featured Image */}
        {activeChallenge && (
          <section className="mb-16">
            <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-lg">
              {/* Featured Image Background */}
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  backgroundImage: `url(${activeChallenge.themeImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              
              {/* Content */}
              <div className="relative p-8 md:p-12 min-h-96 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                    Active Challenge
                  </span>
                </div>
                
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
                  {activeChallenge.theme}
                </h2>
                
                <p className="text-white/90 max-w-2xl mb-8 text-lg leading-relaxed">
                  {activeChallenge.description}
                </p>

                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div>
                    <p className="text-xs text-white/70 mb-2 uppercase tracking-wide">Days Left</p>
                    <p className="text-3xl font-bold text-white">
                      {daysRemaining}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/70 mb-2 uppercase tracking-wide">Submissions</p>
                    <p className="text-3xl font-bold text-white">
                      {activeChallenge.entries.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/70 mb-2 uppercase tracking-wide">Ink Cost</p>
                    <p className="text-3xl font-bold text-white flex items-center gap-1">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      {activeChallenge.inkCost}
                    </p>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Submit Your Poem
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Sort & Filter */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Current Entries
            </h3>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Entries Feed */}
        {sortedEntries.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No entries yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Be the first to submit your poem to this challenge
            </p>
          </Card>
        ) : (
          <div className="space-y-4 mb-16">
            {sortedEntries.map((entry) => (
              <ChallengeEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}

        {/* Past Challenges Grid */}
        {pastChallenges.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                Past Challenges
              </h3>
              <Button variant="ghost" className="gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {pastChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="group relative rounded-xl overflow-hidden cursor-pointer border border-border hover:border-primary/50 transition-all"
                  onClick={() => navigate(`/challenge/${challenge.id}`)}
                >
                  {/* Featured Image */}
                  <div
                    className="absolute inset-0 w-full h-full group-hover:scale-110 transition-transform duration-300"
                    style={{
                      backgroundImage: `url(${challenge.themeImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  
                  {/* Content */}
                  <div className="relative p-6 h-64 flex flex-col justify-between">
                    <div>
                      {challenge.winners && challenge.winners.length > 0 && (
                        <Trophy className="w-6 h-6 text-yellow-400 mb-3" />
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-serif text-2xl font-bold text-white mb-2 text-balance">
                        {challenge.title}
                      </h4>
                      <p className="text-white/80 text-sm line-clamp-2 mb-4">
                        {challenge.description}
                      </p>
                      
                      {challenge.winners && challenge.winners.length > 0 && (
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-100">
                          {challenge.winners.length} {challenge.winners.length === 1 ? "Winner" : "Winners"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Submit Modal */}
      <SubmitChallengeModal
        challenge={activeChallenge}
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </div>
  );
}
