import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCollection, getPublishedPoems } from "@/lib/storage";
import { mockPoems, mockPoets, mockCollections } from "@/lib/mockData";
import { Collection, Poem } from "@/types";
import { ArrowLeft, BookOpen, Heart, MessageCircle, ChevronUp, ChevronDown } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export default function CollectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [selectedPoemId, setSelectedPoemId] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Try to get from storage first, then fall back to mock data
    let col = getCollection(id);
    if (!col) {
      col = mockCollections.find(c => c.id === id) || null;
    }

    if (!col) {
      navigate("/");
      return;
    }

    setCollection(col);

    // Get all poems and filter by this collection
    const allPoems = [...mockPoems, ...getPublishedPoems()];
    const collectionPoems = allPoems.filter(p => col.poemIds.includes(p.id));
    setPoems(collectionPoems);
    
    // Set first poem as selected by default
    if (collectionPoems.length > 0) {
      setSelectedPoemId(collectionPoems[0].id);
    }
  }, [id, navigate]);

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const selectedPoem = poems.find(p => p.id === selectedPoemId);
  const selectedPoemIndex = poems.findIndex(p => p.id === selectedPoemId);
  const poet = mockPoets.find(p => p.id === collection.poetId);
  const isOwner = user && user.id === collection.poetId;

  const handleNextPoem = () => {
    if (selectedPoemIndex < poems.length - 1) {
      setSelectedPoemId(poems[selectedPoemIndex + 1].id);
    }
  };

  const handlePreviousPoem = () => {
    if (selectedPoemIndex > 0) {
      setSelectedPoemId(poems[selectedPoemIndex - 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/poet/${collection.poetId}`)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Poet
        </Button>

        {/* Main Layout Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* LEFT PANEL - Collection Info (Sticky) */}
          <div className="md:sticky md:top-8 md:h-fit">
            <Card className="p-6 space-y-6">
              {/* Cover Image */}
              {collection.coverImage && (
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={collection.coverImage}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Collection Title & Description */}
              <div>
                <h1 className="font-serif text-2xl font-bold mb-3 text-balance">
                  {collection.name}
                </h1>
                {collection.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {collection.description}
                  </p>
                )}
              </div>

              {/* Poet Info */}
              {poet && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <img
                    src={poet.avatar}
                    alt={poet.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">By</p>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-sm font-medium"
                      onClick={() => navigate(`/poet/${poet.id}`)}
                    >
                      {poet.name}
                    </Button>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Poems</p>
                  <p className="text-lg font-bold">{poems.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Likes</p>
                  <p className="text-lg font-bold">
                    {poems.reduce((sum, p) => sum + (p.likesCount || 0), 0)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-3 border-t border-border">
                <Button variant="default" className="w-full">
                  <Heart className="w-4 h-4 mr-2" />
                  Tip Poet
                </Button>
                <Button variant="outline" className="w-full">
                  Follow Collection
                </Button>
              </div>

              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate("/collections")}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Manage Collection
                </Button>
              )}
            </Card>
          </div>

          {/* RIGHT PANEL - Reading Area */}
          <div className="md:col-span-2">
            {poems.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-2xl font-bold mb-2">No Poems Yet</h3>
                <p className="text-muted-foreground mb-6">
                  This collection is waiting for its first poem.
                </p>
              </Card>
            ) : (
              <>
                {/* Poem List */}
                <div className="space-y-2 mb-12">
                  {poems.map((poem, index) => (
                    <button
                      key={poem.id}
                      onClick={() => setSelectedPoemId(poem.id)}
                      className={`w-full text-left p-4 rounded-lg border-l-4 transition-all ${
                        selectedPoemId === poem.id
                          ? "border-l-primary bg-muted/50 border border-primary/20"
                          : "border-l-transparent border border-border hover:bg-muted/30"
                      }`}
                    >
                      <p className="text-xs text-muted-foreground font-medium">
                        #{index + 1}
                      </p>
                      <p className="font-serif text-sm font-semibold text-foreground">
                        {poem.title}
                      </p>
                      {poem.preview && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                          {poem.preview}
                        </p>
                      )}
                    </button>
                  ))}
                </div>

                {/* Reading Panel */}
                {selectedPoem && (
                  <Card className="p-8 space-y-8">
                    {/* Progress */}
                    <div className="text-sm text-muted-foreground">
                      Poem {selectedPoemIndex + 1} of {poems.length}
                    </div>

                    {/* Poem Title */}
                    <div>
                      <h2 className="font-serif text-4xl font-bold text-foreground mb-2">
                        {selectedPoem.title}
                      </h2>
                      {selectedPoem.poetName && (
                        <p className="text-muted-foreground">
                          by{" "}
                          <Button
                            variant="link"
                            className="h-auto p-0"
                            onClick={() => navigate(`/poem/${selectedPoem.id}`)}
                          >
                            {selectedPoem.poetName}
                          </Button>
                        </p>
                      )}
                    </div>

                    {/* Poem Content */}
                    <div className="prose prose-invert max-w-none">
                      <div
                        className="whitespace-pre-wrap font-serif text-base leading-relaxed text-foreground"
                        onClick={() => navigate(`/poem/${selectedPoem.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        {selectedPoem.content}
                      </div>
                    </div>

                    {/* Engagement Buttons */}
                    <div className="flex items-center gap-4 pt-6 border-t border-border">
                      <button
                        onClick={() => setIsLiked(!isLiked)}
                        className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isLiked ? "fill-current text-primary" : ""
                          }`}
                        />
                        <span>{(selectedPoem.likesCount || 0) + (isLiked ? 1 : 0)}</span>
                      </button>
                      <button
                        onClick={() => navigate(`/poem/${selectedPoem.id}`)}
                        className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Comments</span>
                      </button>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center justify-between pt-6 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPoem}
                        disabled={selectedPoemIndex === 0}
                      >
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPoem}
                        disabled={selectedPoemIndex === poems.length - 1}
                      >
                        Next
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
