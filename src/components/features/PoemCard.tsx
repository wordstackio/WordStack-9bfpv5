import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { MessageCircle, Sparkles } from "lucide-react";
import { Poem } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface PoemCardProps {
  poem: Poem;
  showSpotlight?: boolean;
}

export default function PoemCard({ poem, showSpotlight }: PoemCardProps) {
  const previewLines = poem.content.split('\n').slice(0, 4).join('\n');
  
  return (
    <Card className="p-6 hover:shadow-md transition-shadow relative">
      {showSpotlight && (
        <div className="absolute top-4 right-4 flex items-center gap-1 text-xs text-primary bg-accent px-2 py-1 rounded-full">
          <Sparkles className="w-3 h-3" />
          <span className="font-medium">Spotlighted</span>
        </div>
      )}
      
      <Link to={`/poem/${poem.id}`}>
        <h3 className="font-serif text-2xl font-semibold text-foreground mb-3 hover:text-primary transition-colors">
          {poem.title}
        </h3>
      </Link>
      
      <Link to={`/poet/${poem.poetId}`} className="flex items-center gap-2 mb-4">
        {poem.poetAvatar && (
          <img 
            src={poem.poetAvatar} 
            alt={poem.poetName}
            className="w-8 h-8 rounded-full object-cover"
          />
        )}
        <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          {poem.poetName}
        </span>
      </Link>
      
      <div className="font-serif text-base leading-relaxed text-foreground/90 mb-4 whitespace-pre-line">
        {previewLines}
        {poem.content.length > previewLines.length && (
          <span className="text-muted-foreground">...</span>
        )}
      </div>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="text-base">👏</span>
          <span className="font-medium">{poem.clapsCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          <span>{poem.commentsCount}</span>
        </div>
        <span className="ml-auto">
          {formatDistanceToNow(new Date(poem.createdAt), { addSuffix: true })}
        </span>
      </div>
    </Card>
  );
}
