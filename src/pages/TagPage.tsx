import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getTagBySlug, getPublishedPoems, isPoemBoosted } from "@/lib/storage";
import { mockPoems } from "@/lib/mockData";
import { Poem } from "@/types";
import { ArrowLeft, Sparkles, MessageCircle, Zap } from "lucide-react";
import { shortTimeAgo } from "@/lib/utils";

type SortMode = "new" | "popular";

function BoostedPoemCard({ poem }: { poem: Poem }) {
  const previewLines = poem.content.split("\n").slice(0, 3).join("\n");

  return (
    <article className="relative py-6 border-b border-border/40">
      <div className="inline-flex items-center gap-1.5 text-xs text-amber-500 mb-3">
        <Zap className="w-3 h-3 fill-amber-500" />
        <span className="font-semibold tracking-wide uppercase">Boosted</span>
      </div>

      <Link to={`/poem/${poem.id}`} className="block group">
        <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">
          {poem.title}
        </h3>
        <div className="font-serif text-base md:text-lg leading-loose text-foreground/80 whitespace-pre-line mb-4">
          {previewLines}
          {poem.content.length > previewLines.length && (
            <span className="text-muted-foreground/60 italic ml-1">...</span>
          )}
        </div>
      </Link>

      <div className="flex items-center">
        <Link to={`/poet/${poem.poetId}`} className="flex items-center gap-2.5">
          {poem.poetAvatar && (
            <img
              src={poem.poetAvatar}
              alt={poem.poetName}
              className="w-7 h-7 rounded-full object-cover"
            />
          )}
          <div>
            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors block">
              {poem.poetName}
            </span>
            <span className="text-muted-foreground/50 text-xs">
              {shortTimeAgo(poem.createdAt)}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-5 text-sm text-muted-foreground ml-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{"👏"}</span>
            <span>{poem.clapsCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />
            <span>{poem.commentsCount}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function FeedPoemCard({ poem, showSpotlight }: { poem: Poem; showSpotlight?: boolean }) {
  const previewLines = poem.content.split("\n").slice(0, 4).join("\n");

  return (
    <article className="py-8 border-b border-border/40 last:border-b-0">
      {showSpotlight && (
        <div className="inline-flex items-center gap-1.5 text-xs text-primary mb-4">
          <Sparkles className="w-3 h-3" />
          <span className="font-medium tracking-wide uppercase">Spotlighted</span>
        </div>
      )}

      <Link to={`/poem/${poem.id}`} className="block group">
        <h3 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors leading-snug">
          {poem.title}
        </h3>

        <div className="font-serif text-lg md:text-xl leading-loose text-foreground/80 whitespace-pre-line mb-6">
          {previewLines}
          {poem.content.length > previewLines.length && (
            <span className="text-muted-foreground/60 italic ml-1">...</span>
          )}
        </div>
      </Link>

      <div className="flex items-center">
        <Link to={`/poet/${poem.poetId}`} className="flex items-center gap-2.5">
          {poem.poetAvatar && (
            <img
              src={poem.poetAvatar}
              alt={poem.poetName}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <div>
            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors block">
              {poem.poetName}
            </span>
            <span className="text-muted-foreground/50 text-xs">
              {shortTimeAgo(poem.createdAt)}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-5 text-sm text-muted-foreground ml-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{"👏"}</span>
            <span>{poem.clapsCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />
            <span>{poem.commentsCount}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function TagPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [sortMode, setSortMode] = useState<SortMode>("new");

  const tag = slug ? getTagBySlug(slug) : null;

  // Merge published + mock poems, deduplicate, filter by tag
  const allPoems = useMemo(() => {
    const published = getPublishedPoems();
    const mockIds = new Set(published.map((p) => p.id));
    const merged = [...published, ...mockPoems.filter((p) => !mockIds.has(p.id))];
    return merged.filter((p) => p.tag === slug);
  }, [slug]);

  // Separate boosted vs regular
  const boostedPoems = useMemo(() => allPoems.filter((p) => isPoemBoosted(p.id)).slice(0, 2), [allPoems]);
  const regularPoems = useMemo(() => {
    const boostedIds = new Set(boostedPoems.map((p) => p.id));
    const nonBoosted = allPoems.filter((p) => !boostedIds.has(p.id));

    if (sortMode === "popular") {
      return nonBoosted.sort((a, b) => b.clapsCount - a.clapsCount);
    }
    return nonBoosted.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [allPoems, boostedPoems, sortMode]);

  if (!tag) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Tag not found</h1>
          <p className="text-muted-foreground text-sm mb-4">
            {"The tag you're looking for doesn't exist."}
          </p>
          <button onClick={() => navigate("/explore")} className="text-sm text-primary hover:underline">
            Browse Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="border-b border-border/40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-2 text-balance">
            {tag.name}
          </h1>
          {tag.description && (
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-lg">
              {tag.description}
            </p>
          )}
          <p className="text-sm text-muted-foreground/50 mt-3">
            {allPoems.length} {allPoems.length === 1 ? "poem" : "poems"}
          </p>
        </div>
      </div>

      {/* Sort Tabs */}
      <div className="sticky top-[57px] z-20 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 flex gap-0">
          {(["new", "popular"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className={`relative px-5 py-3 text-sm font-medium capitalize transition-colors ${
                sortMode === mode
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              {mode}
              {sortMode === mode && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Boosted poems in Popular tab */}
        {sortMode === "popular" && boostedPoems.length > 0 && (
          <div>
            {boostedPoems.map((poem) => (
              <BoostedPoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        )}

        {/* Regular poems */}
        {regularPoems.length > 0 ? (
          regularPoems.map((poem) => (
            <FeedPoemCard key={poem.id} poem={poem} />
          ))
        ) : allPoems.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-xl text-muted-foreground/60 mb-2">No poems yet</p>
            <p className="text-sm text-muted-foreground/40">
              Be the first to write a poem tagged with {tag.name}.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
