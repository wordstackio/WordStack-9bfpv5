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
      <div className="container mx-auto px-4 max-w-4xl py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
            Challenges
          </h1>
          <p className="text-muted-foreground">
            Compete, create, and connect with the community
          </p>
        </div>

        {/* Active Challenge Hero */}
        {activeChallenge && (
          <section className="mb-12">
            <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="w-5 h-5 text-primary" />
                      <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                        Active Challenge
                      </span>
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
                      {activeChallenge.theme}
                    </h2>
                    <p className="text-muted-foreground max-w-2xl">
                      {activeChallenge.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-primary mb-1">
                      {daysRemaining}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {daysRemaining === 1 ? "day" : "days"} left
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 pb-8 border-b border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">INK COST</p>
                    <p className="font-semibold text-foreground flex items-center gap-1">
                      <Zap className="w-4 h-4 text-primary" />
                      {activeChallenge.inkCost}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">SUBMISSIONS</p>
                    <p className="font-semibold text-foreground">
                      {activeChallenge.entries.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">PRIZE POOL</p>
                    <p className="font-semibold text-foreground">
                      {activeChallenge.prizePool} Ink
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full sm:w-auto"
                  size="lg"
                  onClick={() => setIsSubmitModalOpen(true)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Submit Your Poem
                </Button>
              </div>
            </Card>
          </section>
        )}

        {/* Sort & Filter */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
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
          <div className="space-y-4 mb-12">
            {sortedEntries.map((entry) => (
              <ChallengeEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}

        {/* Past Challenges Carousel */}
        {pastChallenges.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                Past Challenges
              </h3>
              <Button variant="ghost" className="gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {pastChallenges.map((challenge) => (
                <Card
                  key={challenge.id}
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/challenge/${challenge.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Challenge Completed
                      </p>
                      <h4 className="font-serif text-lg font-bold text-foreground">
                        {challenge.title}
                      </h4>
                    </div>
                    <Trophy className="w-5 h-5 text-primary flex-shrink-0" />
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {challenge.description}
                  </p>

                  {challenge.winners && challenge.winners.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        {challenge.winners.length} winner{challenge.winners.length !== 1 ? "s" : ""}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        Winners Featured
                      </Badge>
                    </div>
                  )}
                </Card>
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
