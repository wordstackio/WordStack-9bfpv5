import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChallengeEntry } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Zap, Heart, MessageCircle, Trophy, Star } from "lucide-react";

interface ChallengeEntryCardProps {
  entry: ChallengeEntry;
}

export default function ChallengeEntryCard({ entry }: ChallengeEntryCardProps) {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCardClick = () => {
    navigate(`/poem/${entry.poemId}`);
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all cursor-pointer border-l-2 border-l-primary/20 hover:border-l-primary" onClick={handleCardClick}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar className="w-12 h-12 flex-shrink-0">
          <AvatarImage src={entry.poetAvatar} alt={entry.poetName} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(entry.poetName)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="text-sm text-muted-foreground">
                {entry.poetName}
              </p>
              <h3 className="font-serif text-lg font-bold text-foreground truncate">
                {entry.poemTitle}
              </h3>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {entry.isWinner && (
                <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              )}
              {entry.isShortlisted && !entry.isWinner && (
                <Star className="w-5 h-5 text-primary" />
              )}
            </div>
          </div>

          {/* Poem Preview */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {entry.poemPreview}
          </p>

          {/* Tags & Stats */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Challenge Entry
              </Badge>
              {entry.isWinner && (
                <Badge className="text-xs bg-yellow-500 hover:bg-yellow-600">
                  Winner
                </Badge>
              )}
              {entry.isShortlisted && !entry.isWinner && (
                <Badge className="text-xs bg-primary/20 text-primary hover:bg-primary/30">
                  Shortlisted
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <button className="hover:text-primary transition-colors flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Heart className="w-4 h-4" />
                {entry.inkReceived}
              </button>
              <button className="hover:text-primary transition-colors flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <MessageCircle className="w-4 h-4" />
                Comments
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Zap className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
