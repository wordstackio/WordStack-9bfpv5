import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ChallengeEntryCard from "@/components/features/ChallengeEntryCard";
import SubmitChallengeModal from "@/components/features/SubmitChallengeModal";
import { mockChallenges } from "@/lib/mockData";
import { getCurrentUser } from "@/lib/auth";
import {
  Trophy,
  Clock,
  Flame,
  Sparkles,
  Zap,
  ArrowLeft,
} from "lucide-react";

export default function ChallengeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const challenge = useMemo(() => mockChallenges.find((c) => c.id === id), [id]);

  const daysRemaining = challenge
    ? Math.ceil(
        (new Date(challenge.deadlineDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  if (!user || !challenge) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Challenge not found</p>
      </div>
    );
  }

  const isPast = challenge.status === "past";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 max-w-5xl py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/challenges")}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Challenges</span>
        </button>

        {/* Challenge Hero with Featured Image */}
        <section className="mb-16">
          <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-lg">
            {/* Featured Image Background */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: `url(${challenge.themeImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

            {/* Content */}
            <div className="relative p-8 md:p-12 min-h-96 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-4">
                {isPast ? (
                  <>
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-semibold text-yellow-300 uppercase tracking-wide">
                      Challenge Closed
                    </span>
                  </>
                ) : (
                  <>
                    <Flame className="w-5 h-5 text-primary" />
                    <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                      Active Challenge
                    </span>
                  </>
                )}
              </div>

              <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
                {challenge.theme}
              </h2>

              <p className="text-white/90 max-w-2xl mb-8 text-lg leading-relaxed">
                {challenge.description}
              </p>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div>
                  <p className="text-xs text-white/70 mb-2 uppercase tracking-wide">
                    {isPast ? "Ended" : "Days Left"}
                  </p>
                  <p className="text-3xl font-bold text-white">{daysRemaining}</p>
                </div>
                <div>
                  <p className="text-xs text-white/70 mb-2 uppercase tracking-wide">Submissions</p>
                  <p className="text-3xl font-bold text-white">
                    {challenge.entries.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/70 mb-2 uppercase tracking-wide">Prize</p>
                  <p className="text-3xl font-bold text-white flex items-center gap-1">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    {challenge.prizePool}
                  </p>
                </div>
              </div>

              {!isPast && (
                <Button
                  size="lg"
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Submit Your Poem
                </Button>
              )}

              {isPast && challenge.winners && challenge.winners.length > 0 && (
                <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg px-4 py-3">
                  <p className="text-sm text-yellow-100 font-medium">
                    🏆 Challenge completed with {challenge.winners.length} winner{challenge.winners.length === 1 ? "" : "s"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Sort & Filter */}
        <div className="mb-8">
          <h3 className="font-serif text-2xl font-bold text-foreground">
            {isPast ? "Winning Entries" : "Current Entries"}
          </h3>
        </div>

        {/* Entries Feed */}
        {challenge.entries.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No entries yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {isPast
                ? "This challenge had no submissions."
                : "Be the first to submit your poem to this challenge"}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {challenge.entries.map((entry) => (
              <ChallengeEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {/* Submit Modal */}
      <SubmitChallengeModal
        challenge={challenge}
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </div>
  );
}
