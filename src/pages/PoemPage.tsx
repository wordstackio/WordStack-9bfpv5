import { useParams, Link } from "react-router-dom";
import { useState, useCallback } from "react";
import { MessageCircle, User, Share2, Bookmark } from "lucide-react";
import { mockPoems, mockPoets, mockPoemComments } from "@/lib/mockData";
import { getCurrentUser } from "@/lib/auth";
import { clapPoem, getPoemClaps, getUserPoemClaps, getPoemComments, canUseInk, getFreeInkUsage } from "@/lib/storage";
import { shortTimeAgo } from "@/lib/utils";
import OutOfInkModal from "@/components/features/OutOfInkModal";
import ClappersModal from "@/components/features/ClappersModal";
import CommentsOverlay from "@/components/features/CommentsOverlay";

// Mock clapper profiles
const mockClappers = [
  { id: "user-1", name: "Sarah Mitchell", avatar: "/images/avatars/avatar-woman-dark.jpg" },
  { id: "user-2", name: "James Thornton", avatar: "/images/avatars/avatar-man-headshot.jpg" },
  { id: "user-3", name: "Priya Kapoor", avatar: "/images/avatars/avatar-woman-blonde.jpg" },
  { id: "user-4", name: "Leo Nguyen", avatar: "/images/avatars/avatar-man-older.jpg" },
  { id: "user-5", name: "Amara Obi", avatar: "/images/avatars/avatar-woman-closeup.jpg" },
];

export default function PoemPage() {
  const { id } = useParams();
  const user = getCurrentUser();
  const poem = mockPoems.find(p => p.id === id);
  
  const [localClaps, setLocalClaps] = useState(poem ? getPoemClaps(poem.id) : 0);
  const [userClaps, setUserClaps] = useState(user && poem ? getUserPoemClaps(user.id, poem.id) : 0);
  const [showOutOfInkModal, setShowOutOfInkModal] = useState(false);
  const [showClappersModal, setShowClappersModal] = useState(false);
  const [showCommentsOverlay, setShowCommentsOverlay] = useState(false);
  const [outOfInkInfo, setOutOfInkInfo] = useState<{ dailyUsed: number; monthlyUsed: number; timeUntilReset: string }>({
    dailyUsed: 0,
    monthlyUsed: 0,
    timeUntilReset: ""
  });

  // Merge mock + user-created comments for this poem
  const loadComments = useCallback(() => {
    if (!poem) return [];
    const storedComments = getPoemComments(poem.id);
    const mockForPoem = mockPoemComments.filter((c) => c.postId === poem.id);
    // Deduplicate: stored comments take priority by id
    const storedIds = new Set(storedComments.map((c) => c.id));
    return [...mockForPoem.filter((c) => !storedIds.has(c.id)), ...storedComments];
  }, [poem]);

  const [comments, setComments] = useState(loadComments);

  const handleCommentAdded = () => {
    setComments(loadComments());
  };

  if (!poem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Poem not found</p>
      </div>
    );
  }

  // Get other poems from the same poet (excluding current poem)
  const poet = mockPoets.find(p => p.id === poem.poetId);
  const moreFromPoet = mockPoems.filter(p => p.poetId === poem.poetId && p.id !== poem.id);

  const handleClap = () => {
    if (!user) {
      alert("Please log in to clap");
      return;
    }
    
    const check = canUseInk(user.id);
    if (!check.canUse) {
      const usage = getFreeInkUsage(user.id);
      setOutOfInkInfo({
        dailyUsed: usage.dailyUsed,
        monthlyUsed: usage.monthlyUsed,
        timeUntilReset: check.timeUntilReset || "tomorrow"
      });
      setShowOutOfInkModal(true);
      return;
    }
    
    if (clapPoem(user.id, poem.id)) {
      setLocalClaps(getPoemClaps(poem.id));
      setUserClaps(getUserPoemClaps(user.id, poem.id));
    }
  };

  const totalClaps = poem.clapsCount + localClaps;
  const [saved, setSaved] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: poem.title, text: `"${poem.title}" by ${poem.poetName}`, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 md:py-16">
      <article className="container mx-auto px-5 max-w-2xl">
        {/* Poem Title */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-8 leading-tight text-balance">
          {poem.title}
        </h1>

        {/* Poem Content -- large serif, generous spacing */}
        <div className="font-serif text-xl sm:text-2xl md:text-[1.7rem] leading-relaxed md:leading-[2.2] text-foreground whitespace-pre-line mb-10">
          {poem.content}
        </div>

        {/* Action Bar: claps + comments left, share + save right */}
        <div className="flex items-center justify-between py-5 border-t border-border/30">
          {/* Left: claps & comments */}
          <div className="flex items-center gap-5">
            <button
              onClick={handleClap}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group"
              aria-label={`Clap for this poem. ${totalClaps} claps`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform inline-block leading-none">
                {'👏'}
              </span>
              {totalClaps > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowClappersModal(true); }}
                  className="text-sm font-medium hover:underline"
                >
                  {totalClaps}
                </button>
              )}
            </button>

            <button
              onClick={() => setShowCommentsOverlay(true)}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`View comments. ${comments.length} comments`}
            >
              <MessageCircle className="w-[22px] h-[22px]" />
              {comments.length > 0 && (
                <span className="text-sm font-medium">{comments.length}</span>
              )}
            </button>
          </div>

          {/* Right: share & save */}
          <div className="flex items-center gap-5">
            <button
              onClick={handleShare}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Share this poem"
            >
              <Share2 className="w-[22px] h-[22px]" />
            </button>

            <button
              onClick={() => setSaved(!saved)}
              className={`transition-colors ${saved ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              aria-label={saved ? "Unsave this poem" : "Save this poem"}
            >
              <Bookmark className="w-[22px] h-[22px]" fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Written by -- avatar + name */}
        <div className="py-5 border-t border-border/30">
          <Link
            to={`/poet/${poem.poetId}`}
            className="flex items-center gap-3 group"
          >
            {poem.poetAvatar ? (
              <img
                src={poem.poetAvatar}
                alt={poem.poetName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Written by{" "}
              <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {poem.poetName}
              </span>
            </p>
          </Link>
        </div>
      </article>

      {/* More from this Poet */}
      {moreFromPoet.length > 0 && (
        <section className="container mx-auto px-4 max-w-2xl mt-16 pt-12 border-t border-border/40">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              {poet?.avatar ? (
                <img 
                  src={poet.avatar} 
                  alt={poet.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <h2 className="font-serif text-xl font-semibold text-foreground">
                More from {poem.poetName}
              </h2>
            </div>
            <Link 
              to={`/poet/${poem.poetId}`} 
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="space-y-0">
            {moreFromPoet.slice(0, 3).map((otherPoem) => {
              const previewLines = otherPoem.content.split('\n').filter(l => l.trim()).slice(0, 2).join(' ');
              return (
                <Link key={otherPoem.id} to={`/poem/${otherPoem.id}`} className="block py-6 border-b border-border/40 last:border-b-0 group">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {otherPoem.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                    {previewLines}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {'👏'} {otherPoem.clapsCount} {otherPoem.clapsCount === 1 ? 'clap' : 'claps'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {otherPoem.commentsCount}
                    </span>
                    <span className="ml-auto">
                      {shortTimeAgo(otherPoem.createdAt)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Out of Ink Modal */}
      {showOutOfInkModal && (
        <OutOfInkModal
          onClose={() => setShowOutOfInkModal(false)}
          dailyUsed={outOfInkInfo.dailyUsed}
          monthlyUsed={outOfInkInfo.monthlyUsed}
          timeUntilReset={outOfInkInfo.timeUntilReset}
        />
      )}

      {/* Clappers Modal */}
      {showClappersModal && (
        <ClappersModal
          onClose={() => setShowClappersModal(false)}
          clappers={mockClappers.slice(0, Math.min(mockClappers.length, totalClaps))}
          totalClaps={totalClaps}
        />
      )}

      {/* Comments Overlay */}
      {showCommentsOverlay && (
        <CommentsOverlay
          poemId={poem.id}
          comments={comments}
          onClose={() => setShowCommentsOverlay(false)}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
}
