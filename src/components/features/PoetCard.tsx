import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { Poet } from "@/types";
import { isFollowing, followPoet, unfollowPoet } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { useState } from "react";

interface PoetCardProps {
  poet: Poet;
}

export default function PoetCard({ poet }: PoetCardProps) {
  const user = getCurrentUser();
  const [following, setFollowing] = useState(isFollowing(poet.id));

  const handleFollow = () => {
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
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {poet.avatar ? (
          <img 
            src={poet.avatar} 
            alt={poet.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-xl font-semibold text-foreground mb-1">
            {poet.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {poet.bio}
          </p>
          <div className="text-xs text-muted-foreground mb-3">
            {poet.followersCount} followers · {poet.totalPoems} poems
          </div>
          <div className="flex gap-2">
            <Link to={`/poet/${poet.id}`}>
              <Button variant="outline" size="sm">View Page</Button>
            </Link>
            {user && user.id !== poet.id && (
              <Button 
                variant={following ? "secondary" : "default"} 
                size="sm"
                onClick={handleFollow}
              >
                {following ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
