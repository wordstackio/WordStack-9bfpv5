import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, BookOpen, Users } from "lucide-react";
import { Poet, Poem } from "@/types";
import { isFollowing, followPoet, unfollowPoet } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { useState } from "react";

interface PoetCardProps {
  poet: Poet;
  latestPoem?: Poem;
  variant?: "default" | "featured";
}

export default function PoetCard({ poet, latestPoem, variant = "default" }: PoetCardProps) {
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

  if (variant === "featured") {
    return (
      <Link to={`/poet/${poet.id}`} className="block group">
        <Card className="p-0 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative h-28 bg-gradient-to-br from-primary/10 via-accent/30 to-secondary/20">
            {poet.avatar ? (
              <img
                src={poet.avatar}
                alt={poet.name}
                className="absolute -bottom-8 left-6 w-16 h-16 rounded-full object-cover border-4 border-card shadow-md"
              />
            ) : (
              <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-full bg-secondary flex items-center justify-center border-4 border-card shadow-md">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="pt-12 px-6 pb-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {poet.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                  {poet.bio}
                </p>
              </div>
              {user && user.id !== poet.id && (
                <Button
                  variant={following ? "secondary" : "default"}
                  size="sm"
                  className="shrink-0 ml-3"
                  onClick={handleFollow}
                >
                  {following ? "Following" : "Follow"}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {poet.followersCount}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {poet.totalPoems} poems
              </span>
              <span className="flex items-center gap-1">
                {'👏'} {poet.totalInk}
              </span>
            </div>
            {latestPoem && (
              <div className="mt-4 pt-3 border-t border-border/50">
                <p className="font-serif text-sm text-foreground/70 italic line-clamp-2 leading-relaxed">
                  {`"${latestPoem.content.split('\n').filter(l => l.trim())[0]}"`}
                </p>
                <p className="text-xs text-muted-foreground mt-1.5">
                  from <span className="font-medium text-foreground/60">{latestPoem.title}</span>
                </p>
              </div>
            )}
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/poet/${poet.id}`} className="block group">
      <Card className="p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex items-start gap-4">
          {poet.avatar ? (
            <img
              src={poet.avatar}
              alt={poet.name}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-7 h-7 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {poet.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                  {poet.bio}
                </p>
              </div>
              {user && user.id !== poet.id && (
                <Button
                  variant={following ? "secondary" : "default"}
                  size="sm"
                  className="shrink-0 ml-3"
                  onClick={handleFollow}
                >
                  {following ? "Following" : "Follow"}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2.5">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {poet.followersCount}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {poet.totalPoems}
              </span>
            </div>
            {latestPoem && (
              <p className="font-serif text-sm text-foreground/60 italic line-clamp-1 mt-2.5 leading-relaxed">
                {`"${latestPoem.content.split('\n').filter(l => l.trim())[0]}"`}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
