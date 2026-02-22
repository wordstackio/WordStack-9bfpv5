import { Link } from "react-router-dom";
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
    <article className="py-8 border-b border-border/40 last:border-b-0">
      {showSpotlight && (
        <div className="inline-flex items-center gap-1.5 text-xs text-primary mb-4">
          <Sparkles className="w-3 h-3" />
          <span className="font-medium tracking-wide uppercase">Spotlighted</span>
        </div>
      )}
      
      <Link to={`/poet/${poem.poetId}`} className="flex items-center gap-2.5 mb-5">
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
        <span className="text-muted-foreground/40 text-sm">
          {formatDistanceToNow(new Date(poem.createdAt), { addSuffix: true })}
        </span>
      </Link>
      
      <Link to={`/poem/${poem.id}`} className="block group">
        <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors leading-snug">
          {poem.title}
        </h3>
      
        <div className="font-serif text-base md:text-lg leading-loose text-foreground/80 whitespace-pre-line mb-6">
          {previewLines}
          {poem.content.length > previewLines.length && (
            <span className="text-muted-foreground/60 italic ml-1">...</span>
          )}
        </div>
      </Link>
      
      <div className="flex items-center gap-5 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{'👏'}</span>
          <span>{poem.clapsCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageCircle className="w-4 h-4" />
          <span>{poem.commentsCount}</span>
        </div>
      </div>
    </article>
  );
}
