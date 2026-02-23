import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, BookOpen, Droplets, Users } from "lucide-react";
import { Poet, Poem } from "@/types";
import { isFollowing, followPoet, unfollowPoet } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { useState } from "react";

interface PoetCardProps {
  poet: Poet;
  previewLine?: string;
  badge?: string;
}

export default function PoetCard({ poet, previewLine, badge }: PoetCardProps) {
  const user = getCurrentUser();
  const [following, setFollowing] = useState(isFollowing(poet.id));

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("Please log in to follow poets");
      return;
    }
    if (following) {
      unfollowPoet(poet.id);
      setFollowing(false);
    } else {
      followPoet(poet.id);
      setFollowing(true);
    }
  };

  return (
    <Link to={`/poet/${poet.id}`} className="block group">
      <Card className="p-4 h-full transition-all duration-200 hover:shadow-md hover:border-primary/30 relative overflow-hidden">
        {/* Badge */}
        {badge && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {badge}
            </span>
          </div>
        )}

        <div className="flex items-start gap-3">
          {/* Avatar */}
          {poet.avatar ? (
            <img
              src={poet.avatar}
              alt={poet.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-border group-hover:ring-primary/30 transition-all"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-base font-semibold text-foreground leading-tight truncate group-hover:text-primary transition-colors">
              {poet.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {poet.bio}
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {poet.followersCount}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {poet.totalPoems}
              </span>
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                {poet.totalInk.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Follow button */}
          {user && user.id !== poet.id && (
            <Button
              variant={following ? "secondary" : "default"}
              size="sm"
              className="flex-shrink-0 h-7 text-xs px-3"
              onClick={handleFollow}
            >
              {following ? "Following" : "Follow"}
            </Button>
          )}
        </div>

        {/* Poem preview line */}
        {previewLine && (
          <div className="mt-3 pt-3 border-t border-border/60">
            <p className="text-xs italic text-muted-foreground line-clamp-2 leading-relaxed">
              "{previewLine}"
            </p>
          </div>
        )}
      </Card>
    </Link>
  );
}
