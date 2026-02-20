import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCollection, getPublishedPoems } from "@/lib/storage";
import { mockPoems } from "@/lib/mockData";
import { Collection, Poem } from "@/types";
import PoemCard from "@/components/features/PoemCard";
import { ArrowLeft, BookOpen, Edit } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export default function CollectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [poems, setPoems] = useState<Poem[]>([]);

  useEffect(() => {
    if (!id) return;

    const col = getCollection(id);
    if (!col) {
      navigate("/");
      return;
    }

    setCollection(col);

    // Get all poems and filter by this collection
    const allPoems = [...mockPoems, ...getPublishedPoems()];
    const collectionPoems = allPoems.filter(p => col.poemIds.includes(p.id));
    setPoems(collectionPoems);
  }, [id, navigate]);

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const isOwner = user && user.id === collection.poetId;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Cover Image */}
      <section className="relative bg-gradient-to-br from-accent/30 via-background to-secondary/20 border-b border-border">
        {collection.coverImage && (
          <div className="absolute inset-0 opacity-20">
            <img 
              src={collection.coverImage} 
              alt={collection.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="relative container mx-auto px-4 max-w-4xl py-20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/poet/${collection.poetId}`)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Poet Page
          </Button>

          <div className="flex items-start gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-primary mt-2" />
            <div className="flex-1">
              <h1 className="font-serif text-5xl font-bold mb-4">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                  {collection.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 mt-8">
            <p className="text-muted-foreground">
              <strong className="text-lg text-foreground">{poems.length}</strong> {poems.length === 1 ? 'poem' : 'poems'} in this collection
            </p>
            
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/collections")}
              >
                <Edit className="w-4 h-4 mr-2" />
                Manage Collection
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Poems List */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {poems.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-bold mb-2">No Poems Yet</h3>
              <p className="text-muted-foreground mb-6">
                This collection is waiting for its first poem.
              </p>
              {isOwner && (
                <Button onClick={() => navigate("/collections")}>
                  Add Poems to Collection
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-6">
              {poems.map(poem => (
                <PoemCard key={poem.id} poem={poem} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Collection Info Footer */}
      <section className="py-12 bg-muted/20 border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm text-muted-foreground">
            Part of{" "}
            <Link 
              to={`/poet/${collection.poetId}`}
              className="text-primary hover:underline font-medium"
            >
              poet's collection
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
