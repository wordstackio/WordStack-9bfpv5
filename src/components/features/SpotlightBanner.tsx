import { useMemo } from "react";
import { Link } from "react-router-dom";
import { mockPoems, mockPoets, mockSpotlight } from "@/lib/mockData";
import { getActiveSpotlights } from "@/lib/storage";
import { Sparkles } from "lucide-react";

// Atmospheric gradient backgrounds to rotate through
const SPOTLIGHT_GRADIENTS = [
  "bg-gradient-to-br from-[#2a1b3d] via-[#44318d] to-[#1a1a2e]",
  "bg-gradient-to-br from-[#1a1a2e] via-[#4a2040] to-[#2d1b3d]",
  "bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]",
  "bg-gradient-to-br from-[#2d1b3d] via-[#5c3a29] to-[#1a1a2e]",
];

function formatFollowers(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

function getDaysRemaining(expiresAt: string): number {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export default function SpotlightBanner() {
  const spotlight = useMemo(() => {
    // Merge mock spotlights + user-boosted spotlights
    const userSpotlights = getActiveSpotlights();
    const allSpotlights = [
      ...mockSpotlight.map((s) => ({
        poemId: s.poemId,
        poetId: s.poetId,
        expiresAt: s.expiresAt,
      })),
      ...userSpotlights.map((s) => ({
        poemId: s.poemId,
        poetId: s.userId,
        expiresAt: s.expiresAt,
      })),
    ];

    // Deduplicate by poemId
    const seen = new Set<string>();
    const unique = allSpotlights.filter((s) => {
      if (seen.has(s.poemId)) return false;
      seen.add(s.poemId);
      return true;
    });

    if (unique.length === 0) return null;

    // Pick one at random
    const pick = unique[Math.floor(Math.random() * unique.length)];
    const poem = mockPoems.find((p) => p.id === pick.poemId);
    const poet = mockPoets.find((p) => p.id === pick.poetId);

    if (!poem || !poet) return null;

    const gradientIndex = Math.floor(Math.random() * SPOTLIGHT_GRADIENTS.length);

    return { poem, poet, expiresAt: pick.expiresAt, gradientIndex };
  }, []);

  // No spotlight available
  if (!spotlight) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1a2e] via-[#2a1b3d] to-[#0f2027] px-6 py-10 sm:px-10 sm:py-14 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(120,80,160,0.15),transparent_70%)]" />
        <div className="relative z-10">
          <Sparkles className="w-8 h-8 text-amber-400/60 mx-auto mb-4" />
          <p className="font-serif text-lg sm:text-xl text-white/80 italic max-w-md mx-auto leading-relaxed">
            {"The spotlight's empty... even the muse took the night off."}
          </p>
          <p className="text-sm text-white/40 mt-3">
            Poets, this prime spot could be yours. Boost a poem from your dashboard.
          </p>
        </div>
      </div>
    );
  }

  const { poem, poet, expiresAt, gradientIndex } = spotlight;

  // Get 1-2 line preview
  const previewLines = poem.content
    .split("\n")
    .filter((l) => l.trim())
    .slice(0, 2)
    .join(" ");

  const daysLeft = getDaysRemaining(expiresAt);

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${SPOTLIGHT_GRADIENTS[gradientIndex]} px-6 py-8 sm:px-10 sm:py-12`}
    >
      {/* Atmospheric overlay effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(200,180,140,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(120,80,160,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      <div className="relative z-10">
        {/* Header badge */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px flex-1 max-w-16 bg-white/20" />
          <span className="text-xs uppercase tracking-[0.25em] text-white/50 font-medium">
            Spotlight &middot; Sponsored
          </span>
          <div className="h-px flex-1 max-w-16 bg-white/20" />
        </div>

        {/* Title */}
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white uppercase tracking-wide text-center text-balance leading-tight mb-4">
          {poem.title}
        </h2>

        {/* Preview quote */}
        <p className="text-sm sm:text-base text-white/70 italic text-center max-w-lg mx-auto leading-relaxed mb-5">
          &ldquo;{previewLines}&rdquo;
        </p>

        {/* Poet info */}
        <p className="text-sm text-white/60 text-center mb-6">
          by{" "}
          <span className="text-white/90 font-medium">{poet.name}</span>
          {" "}&middot;{" "}
          {formatFollowers(poet.followersCount)} Followers
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3">
          <Link
            to={`/poem/${poem.id}`}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Read the Poem
          </Link>
          <Link
            to={`/poet/${poet.id}`}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-md border border-white/30 text-white/80 font-semibold text-sm uppercase tracking-wider hover:bg-white/10 transition-colors"
          >
            Visit Profile
          </Link>
        </div>

        {/* Featured duration */}
        <p className="text-xs text-white/40 text-center mt-5 italic">
          Featured for {daysLeft > 0 ? `${daysLeft} more ${daysLeft === 1 ? "day" : "days"}` : "its final hours"}.
        </p>
      </div>
    </div>
  );
}
