import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockPoems, mockPoets } from "@/lib/mockData";
import { Bookmark, X } from "lucide-react";

export default function SavedPoemsPage() {
  const navigate = useNavigate();
  const [savedPoemIds, setSavedPoemIds] = useState<string[]>([
    "poem-1",
    "poem-3",
    "poem-5"
  ]);

  // Get saved poems from mock data
  const savedPoems = savedPoemIds
    .map(id => mockPoems.find(p => p.id === id))
    .filter(Boolean);

  const handleRemove = (poemId: string) => {
    setSavedPoemIds(prev => prev.filter(id => id !== poemId));
  };

  const handlePoemClick = (poemId: string) => {
    navigate(`/poem/${poemId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-16">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-6 h-6 text-primary fill-primary" />
            <h1 className="text-3xl font-bold">Saved Poems</h1>
          </div>
          <p className="text-muted-foreground">
            {savedPoems.length} {savedPoems.length === 1 ? "poem" : "poems"} saved
          </p>
        </div>

        {/* Empty State */}
        {savedPoems.length === 0 ? (
          <Card className="p-12 text-center">
            <Bookmark className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Saved Poems Yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Start bookmarking poems you love to see them here
            </p>
            <Button onClick={() => navigate("/explore")} variant="default">
              Explore Poems
            </Button>
          </Card>
        ) : (
          /* Saved Poems List */
          <div className="space-y-4">
            {savedPoems.map(poem => {
              const poet = mockPoets.find(p => p.id === poem?.poetId);
              return (
                <Card
                  key={poem?.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <div
                    className="p-4 flex gap-4"
                    onClick={() => handlePoemClick(poem?.id!)}
                  >
                    {/* Poet Avatar */}
                    <div className="flex-shrink-0">
                      <img
                        src={poet?.avatar}
                        alt={poet?.name}
                        className="w-12 h-12 rounded-full object-cover border border-border"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground font-medium">
                        {poet?.name}
                      </p>
                      <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {poem?.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{poem?.clapsCount} claps</span>
                        <span>{poem?.commentsCount} comments</span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="flex-shrink-0 flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={e => {
                          e.stopPropagation();
                          handleRemove(poem?.id!);
                        }}
                        aria-label="Remove from saved"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
