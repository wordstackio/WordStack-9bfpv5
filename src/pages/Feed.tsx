import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import PoemCard from "@/components/features/PoemCard";
import { getCurrentUser } from "@/lib/auth";
import { mockPoems } from "@/lib/mockData";
import { getFollows, getPublishedPoems } from "@/lib/storage";
import { Poem } from "@/types";
import { Feather, Heart, Users, Clock } from "lucide-react";

type FeedTab = "inked" | "following" | "recent";

export default function Feed() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState<FeedTab>("inked");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  const allPoems = [...mockPoems, ...getPublishedPoems()];
  const followedPoetIds = getFollows();

  // Filter and sort poems based on active tab
  const getFilteredPoems = (): Poem[] => {
    switch (activeTab) {
      case "inked":
        // Top poems by Ink received
        return [...allPoems].sort((a, b) => b.inkReceived - a.inkReceived);
      
      case "following":
        // Poems from followed poets, sorted by date
        return allPoems
          .filter(poem => followedPoetIds.includes(poem.poetId))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      case "recent":
        // All poems sorted by date
        return [...allPoems].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      
      default:
        return allPoems;
    }
  };

  const filteredPoems = getFilteredPoems();

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Feather className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-4xl font-bold mb-2">Your Feed</h1>
          <p className="text-muted-foreground">Discover poetry from across the platform</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 border-b border-border">
            <Button
              variant="ghost"
              className={`rounded-none border-b-2 transition-colors ${
                activeTab === "inked"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("inked")}
            >
              <Heart className="w-4 h-4 mr-2" />
              Inked
            </Button>
            <Button
              variant="ghost"
              className={`rounded-none border-b-2 transition-colors ${
                activeTab === "following"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("following")}
            >
              <Users className="w-4 h-4 mr-2" />
              Following
            </Button>
            <Button
              variant="ghost"
              className={`rounded-none border-b-2 transition-colors ${
                activeTab === "recent"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("recent")}
            >
              <Clock className="w-4 h-4 mr-2" />
              Recent
            </Button>
          </div>
        </div>

        {/* Tab Description */}
        <div className="mb-8 text-center">
          {activeTab === "inked" && (
            <p className="text-sm text-muted-foreground">
              Top poems by Ink support from the entire platform
            </p>
          )}
          {activeTab === "following" && (
            <p className="text-sm text-muted-foreground">
              {followedPoetIds.length > 0 
                ? `Latest poems from the ${followedPoetIds.length} ${followedPoetIds.length === 1 ? 'poet' : 'poets'} you follow`
                : "You're not following any poets yet"}
            </p>
          )}
          {activeTab === "recent" && (
            <p className="text-sm text-muted-foreground">
              Latest poems from all poets on WordStack
            </p>
          )}
        </div>

        {/* Poems Feed */}
        <section className="mb-12 max-w-2xl mx-auto">
          {filteredPoems.length === 0 ? (
            <div className="py-16 text-center">
              {activeTab === "following" ? (
                <>
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-serif text-2xl font-bold mb-2">No poems yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Follow some poets to see their latest work here.
                  </p>
                  <Button onClick={() => navigate("/explore")}>Discover Poets</Button>
                </>
              ) : (
                <>
                  <Feather className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-serif text-2xl font-bold mb-2">No poems yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to publish a poem on WordStack.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div>
              {filteredPoems.slice(0, 10).map(poem => (
                <PoemCard key={poem.id} poem={poem} />
              ))}
            </div>
          )}
        </section>


      </div>
    </div>
  );
}
