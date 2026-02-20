import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, User } from "lucide-react";
import { mockPoems } from "@/lib/mockData";
import { getCurrentUser } from "@/lib/auth";
import { clapPoem, getPoemClaps, getUserPoemClaps, canUseInk, getFreeInkUsage } from "@/lib/storage";
import { formatDistanceToNow } from "date-fns";
import OutOfInkModal from "@/components/features/OutOfInkModal";

export default function PoemPage() {
  const { id } = useParams();
  const user = getCurrentUser();
  const poem = mockPoems.find(p => p.id === id);
  
  const [localClaps, setLocalClaps] = useState(poem ? getPoemClaps(poem.id) : 0);
  const [userClaps, setUserClaps] = useState(user && poem ? getUserPoemClaps(user.id, poem.id) : 0);
  const [showOutOfInkModal, setShowOutOfInkModal] = useState(false);
  const [outOfInkInfo, setOutOfInkInfo] = useState<{ dailyUsed: number; monthlyUsed: number; timeUntilReset: string }>({
    dailyUsed: 0,
    monthlyUsed: 0,
    timeUntilReset: ""
  });

  if (!poem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Poem not found</p>
      </div>
    );
  }

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
          <div className="flex items-center gap-4 pt-8 border-t border-border">
            <Button onClick={handleClap} variant="default" size="lg">
              <span className="text-lg mr-2">👏</span>
              Clap ({totalClaps})
              {userClaps > 0 && <span className="ml-2 text-xs opacity-75">You: {userClaps}</span>}
            </Button>
            <Button variant="outline" size="lg">
              <MessageCircle className="w-5 h-5 mr-2" />
              Comment ({poem.commentsCount})
            </Button>
          </div>
        </Card>
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
