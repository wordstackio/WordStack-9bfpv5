import { useParams, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, User } from "lucide-react";
import { mockPoems, mockPoets } from "@/lib/mockData";
import { getCurrentUser } from "@/lib/auth";
import { clapPoem, getPoemClaps, getUserPoemClaps, canUseInk, getFreeInkUsage } from "@/lib/storage";
import { formatDistanceToNow } from "date-fns";
import OutOfInkModal from "@/components/features/OutOfInkModal";

// Mock clapper profiles for the hover popover
const mockClappers = [
  { id: "user-1", name: "Sarah Mitchell", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop" },
  { id: "user-2", name: "James Thornton", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop" },
  { id: "user-3", name: "Priya Kapoor", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop" },
  { id: "user-4", name: "Leo Nguyen", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop" },
  { id: "user-5", name: "Amara Obi", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop" },
];

export default function PoemPage() {
  const { id } = useParams();
  const user = getCurrentUser();
  const poem = mockPoems.find(p => p.id === id);
  
  const [localClaps, setLocalClaps] = useState(poem ? getPoemClaps(poem.id) : 0);
  const [userClaps, setUserClaps] = useState(user && poem ? getUserPoemClaps(user.id, poem.id) : 0);
  const [showOutOfInkModal, setShowOutOfInkModal] = useState(false);
  const [showClappers, setShowClappers] = useState(false);
  const clappersRef = useRef<HTMLDivElement>(null);
  const clapButtonRef = useRef<HTMLButtonElement>(null);
  const [outOfInkInfo, setOutOfInkInfo] = useState<{ dailyUsed: number; monthlyUsed: number; timeUntilReset: string }>({
    dailyUsed: 0,
    monthlyUsed: 0,
    timeUntilReset: ""
  });

  // Close clappers popover on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        clappersRef.current && !clappersRef.current.contains(e.target as Node) &&
        clapButtonRef.current && !clapButtonRef.current.contains(e.target as Node)
      ) {
        setShowClappers(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="p-8 md:p-12">
          {/* Poet Info */}
          <Link 
            to={`/poet/${poem.poetId}`}
            className="flex items-center gap-3 mb-8 group"
          >
            {poem.poetAvatar ? (
              <img 
                src={poem.poetAvatar} 
                alt={poem.poetName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                {poem.poetName}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(poem.createdAt), { addSuffix: true })}
              </p>
            </div>
          </Link>

          {/* Poem Title */}
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-8">
            {poem.title}
          </h1>

          {/* Poem Content */}
          <div className="font-serif text-lg leading-relaxed text-foreground/90 whitespace-pre-line mb-12">
            {poem.content}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 pt-8 border-t border-border">
            {/* Clap button - icon only with count + popover */}
            <div className="relative">
              <button
                ref={clapButtonRef}
                onClick={handleClap}
                onMouseEnter={() => setShowClappers(true)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                aria-label={`Clap for this poem. ${totalClaps} claps`}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform inline-block">
                  {'👏'}
                </span>
                <span className="text-sm font-medium">
                  {totalClaps} {totalClaps === 1 ? 'clap' : 'claps'}
                </span>
              </button>

              {/* Clappers popover */}
              {showClappers && totalClaps > 0 && (
                <div
                  ref={clappersRef}
                  onMouseEnter={() => setShowClappers(true)}
                  onMouseLeave={() => setShowClappers(false)}
                  className="absolute bottom-full left-0 mb-2 w-64 bg-popover border border-border rounded-lg shadow-lg z-50 p-3 animate-in fade-in-0 zoom-in-95"
                >
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {totalClaps} {totalClaps === 1 ? 'clap' : 'claps'} from {Math.min(totalClaps, mockClappers.length)} {Math.min(totalClaps, mockClappers.length) === 1 ? 'person' : 'people'}
                  </p>
                  <div className="space-y-2">
                    {mockClappers.slice(0, Math.min(5, totalClaps)).map((clapper) => (
                      <div key={clapper.id} className="flex items-center gap-2">
                        <img
                          src={clapper.avatar}
                          alt={clapper.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-sm text-foreground truncate">{clapper.name}</span>
                      </div>
                    ))}
                  </div>
                  {totalClaps > 5 && (
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                      and {totalClaps - 5} more
                    </p>
                  )}
                </div>
              )}
            </div>

            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{poem.commentsCount}</span>
            </button>
          </div>
        </Card>

        {/* More from this Poet */}
        {moreFromPoet.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
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

            <div className="grid gap-4">
              {moreFromPoet.slice(0, 3).map((otherPoem) => {
                const previewLines = otherPoem.content.split('\n').filter(l => l.trim()).slice(0, 2).join(' ');
                return (
                  <Link key={otherPoem.id} to={`/poem/${otherPoem.id}`}>
                    <Card className="p-5 hover:shadow-md transition-shadow">
                      <h3 className="font-serif text-lg font-semibold text-foreground mb-1 hover:text-primary transition-colors">
                        {otherPoem.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {previewLines}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {'👏'} {otherPoem.clapsCount} {otherPoem.clapsCount === 1 ? 'clap' : 'claps'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {otherPoem.commentsCount}
                        </span>
                        <span className="ml-auto">
                          {formatDistanceToNow(new Date(otherPoem.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
      
      {/* Out of Ink Modal */}
      {showOutOfInkModal && (
        <OutOfInkModal
          onClose={() => setShowOutOfInkModal(false)}
          dailyUsed={outOfInkInfo.dailyUsed}
          monthlyUsed={outOfInkInfo.monthlyUsed}
          timeUntilReset={outOfInkInfo.timeUntilReset}
        />
      )}
    </div>
  );
}
