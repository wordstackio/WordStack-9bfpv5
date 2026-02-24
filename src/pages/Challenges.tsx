import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockChallenges } from "@/lib/mockData";
import { getCurrentUser } from "@/lib/auth";
import {
  Trophy,
  Clock,
  Flame,
  ChevronRight,
  Droplets,
  Lock,
  Star,
} from "lucide-react";

export default function Challenges() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const openChallenges = useMemo(
    () => mockChallenges.filter((c) => c.status === "active"),
    []
  );

  const closedChallenges = useMemo(
    () => mockChallenges.filter((c) => c.status === "closed"),
    []
  );

  const pastChallenges = useMemo(
    () => mockChallenges.filter((c) => c.status === "past"),
    []
  );

  // Get all winners across challenges
  const allWinners = useMemo(() => {
    const winners = [];
    pastChallenges.forEach((challenge) => {
      challenge.entries.forEach((entry) => {
        if (entry.isWinner) {
          winners.push({
            ...entry,
            challengeId: challenge.id,
            challengeTitle: challenge.title,
          });
        }
      });
    });
    return winners.slice(0, 6); // Show last 6 winners
  }, [pastChallenges]);

  const daysRemaining = (challenge: typeof mockChallenges[0]) => {
    return Math.ceil(
      (new Date(challenge.deadlineDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    );
  };

  const ChallengeCard = ({ challenge }: { challenge: typeof mockChallenges[0] }) => {
    const days = daysRemaining(challenge);
    const isPast = challenge.status === "past";

    return (
      <div
        className="group relative rounded-xl overflow-hidden cursor-pointer border border-border hover:border-primary/50 transition-all"
        onClick={() => navigate(`/challenge/${challenge.id}`)}
      >
        {/* Featured Image Background */}
        <div
          className="absolute inset-0 w-full h-full group-hover:scale-110 transition-transform duration-300"
          style={{
            backgroundImage: `url(${challenge.themeImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />

        {/* Content */}
        <div className="relative p-6 h-64 flex flex-col justify-between">
          {/* Top Badge */}
          <div className="flex items-center justify-between">
            {isPast && challenge.winners && challenge.winners.length > 0 ? (
              <Trophy className="w-5 h-5 text-yellow-400" />
            ) : (
              <Flame className="w-5 h-5 text-primary" />
            )}
          </div>

          {/* Bottom Content */}
          <div>
            {/* Title */}
            <h4 className="font-serif text-2xl font-bold text-white mb-3 text-balance line-clamp-2">
              {challenge.title}
            </h4>

            {/* Status & Stats Row */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex flex-col">
                {isPast ? (
                  <Badge variant="secondary" className="w-fit bg-gray-600/80 text-white">
                    Closed
                  </Badge>
                ) : (
                  <span className="text-sm text-white/90 font-medium">
                    Ends in {days} {days === 1 ? "day" : "days"}
                  </span>
                )}
              </div>
              <div className="text-right flex items-center gap-1">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold text-white">
                  {challenge.prizePool}
                </span>
              </div>
            </div>

            {/* Submission Count */}
            <p className="text-xs text-white/70">
              {challenge.entries.length} {challenge.entries.length === 1 ? "submission" : "submissions"}
            </p>
          </div>
        </div>
      </div>
    );
  };

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
            Compete with poets worldwide and showcase your work
          </p>
        </div>

        {/* Open Challenges Section */}
        {openChallenges.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
                <Flame className="w-6 h-6 text-primary" />
                Open Challenges
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {openChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Winners Section */}
        {allWinners.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                Recent Winners
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allWinners.map((winner) => (
                <Card key={winner.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                  {/* Winner Header with Trophy Badge */}
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Poet Avatar */}
                      <img
                        src={winner.poetAvatar}
                        alt={winner.poetName}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        {/* Poet Name - Link to Profile */}
                        <button
                          onClick={() => navigate(`/poet/${winner.poetId}`)}
                          className="text-sm font-semibold text-foreground hover:text-primary transition-colors text-left"
                        >
                          {winner.poetName}
                        </button>
                        {/* Challenge Name - Link to Challenge */}
                        <button
                          onClick={() => navigate(`/challenge/${winner.challengeId}`)}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors text-left line-clamp-1"
                        >
                          {winner.challengeTitle}
                        </button>
                      </div>
                    </div>
                    <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0 ml-2" />
                  </div>

                  {/* Winning Poem */}
                  <div className="p-4 flex-1 flex flex-col">
                    {/* Poem Title - Link to Poem Page */}
                    <button
                      onClick={() => navigate(`/poem/${winner.poemId}`)}
                      className="font-serif font-bold text-foreground hover:text-primary transition-colors text-left mb-2 line-clamp-2"
                    >
                      {winner.poemTitle}
                    </button>
                    {/* Poem Preview */}
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3 flex-1">
                      {winner.poemPreview}
                    </p>
                    {/* Winner Badge */}
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
                        <Star className="w-3 h-3 mr-1" />
                        Winner
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {winner.inkReceived} Ink
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Closed Challenges Section */}
        {closedChallenges.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
                <Lock className="w-6 h-6 text-muted-foreground" />
                Closed Challenges
              </h2>
              {closedChallenges.length > 3 && (
                <Button variant="ghost" className="gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {closedChallenges.slice(0, 3).map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {openChallenges.length === 0 && pastChallenges.length === 0 && closedChallenges.length === 0 && (
          <Card className="p-12 text-center">
            <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No challenges available</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Check back soon for new challenges
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
