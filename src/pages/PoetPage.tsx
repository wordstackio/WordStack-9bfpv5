import { useParams, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, Twitter, Instagram, Globe } from "lucide-react";
import { mockPoets, mockPoems, mockUpdates } from "@/lib/mockData";
import PoemCard from "@/components/features/PoemCard";
import { getCurrentUser } from "@/lib/auth";
import { isFollowing, followPoet, unfollowPoet } from "@/lib/storage";
import { shortTimeAgo } from "@/lib/utils";
import GiveClapsOverlay from "@/components/features/GiveClapsOverlay";

export default function PoetPage() {
  const { id } = useParams();
  const location = useLocation();
  const user = getCurrentUser();
  
  const poet = mockPoets.find(p => p.id === id);
  const [following, setFollowing] = useState(poet ? isFollowing(poet.id) : false);
  const [showGiveClaps, setShowGiveClaps] = useState(false);

  useEffect(() => {
    // Reset state when navigating between poet pages
    if (poet) {
      setFollowing(isFollowing(poet.id));
    }
  }, [poet, id, location]);
  
  if (!poet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Poet not found.</p>
      </div>
    );
  }

  const poetPoems = mockPoems.filter(p => p.poetId === poet.id);
  const poetUpdates = mockUpdates.filter(u => u.poetId === poet.id);
  const featuredPoem = poetPoems.find(p => p.isPinned) || poetPoems[0];

  const handleFollow = () => {
    if (!user) {
      alert("Please log in to follow");
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
    <div className="min-h-screen overflow-x-hidden pb-20 bg-background text-foreground">
      {/* Banner Image */}
      {poet.bannerImage && (
        <div className="w-full h-48 sm:h-64 md:h-96 overflow-hidden">
          <img 
            src={poet.bannerImage} 
            alt="Banner"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* 1. Hero Section */}
      <section className={`relative bg-muted/30 border-b border-border ${poet.bannerImage ? 'pt-6 md:pt-8' : ''}`}>
        <div className="container mx-auto px-4 max-w-4xl py-10 md:py-20 text-center">
          <div className="mb-4 md:mb-6">
            {poet.avatar && (
              <img 
                src={poet.avatar} 
                alt={poet.name}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full object-cover mx-auto shadow-lg"
              />
            )}
          </div>
          
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 px-2 text-foreground">
            {poet.name}
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
            {poet.bio}
          </p>
          
          {user && user.id !== poet.id && (
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-6 max-w-md sm:max-w-none mx-auto px-4">
              <Button 
                size="lg"
                variant={following ? "secondary" : "default"}
                onClick={handleFollow}
                className="w-full sm:w-auto"
              >
                {following ? "Following" : "Follow"}
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => setShowGiveClaps(true)}>
                <span className="mr-2">{'👏'}</span>
                Give Claps
              </Button>
              <a href="#poems" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Read Poems
                </Button>
              </a>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-8 text-xs sm:text-sm text-muted-foreground px-4">
            <span><strong className="text-base sm:text-lg text-foreground">{poet.followersCount}</strong> followers</span>
            <span className="hidden sm:inline">{'·'}</span>
            <span><strong className="text-base sm:text-lg text-foreground">{poet.totalPoems}</strong> poems</span>
            <span className="hidden sm:inline">{'·'}</span>
            <span><strong className="text-base sm:text-lg text-foreground">{poet.totalInk}</strong> Ink</span>
          </div>
          
          {/* Social Links */}
          {(poet.socialLinks?.twitter || poet.socialLinks?.instagram || poet.socialLinks?.website) && (
            <div className="flex items-center justify-center gap-4 mt-6">
              {poet.socialLinks.twitter && (
                <a 
                  href={poet.socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {poet.socialLinks.instagram && (
                <a 
                  href={poet.socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {poet.socialLinks.website && (
                <a 
                  href={poet.socialLinks.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 2. Featured Work Section */}
      {featuredPoem && (
        <section className="py-8 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <div className="w-1 h-6 md:h-8 bg-primary rounded"></div>
              <h2 className="font-serif text-xl md:text-2xl font-semibold text-muted-foreground">
                Featured Work
              </h2>
            </div>
            
            <div>
              <Link to={`/poem/${featuredPoem.id}`}>
                <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 hover:text-primary transition-colors leading-tight">
                  {featuredPoem.title}
                </h3>
              </Link>
              <div className="max-w-none">
                <pre className="font-serif text-foreground text-sm sm:text-base md:text-lg leading-loose whitespace-pre-wrap break-words">
                  {featuredPoem.content}
                </pre>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-border text-xs sm:text-sm text-muted-foreground">
                <span>{shortTimeAgo(featuredPoem.createdAt)}</span>
                <span className="hidden sm:inline">{'·'}</span>
                <span><span className="mr-1">{'👏'}</span>{featuredPoem.clapsCount} claps</span>
                <span className="hidden sm:inline">{'·'}</span>
                <span>{featuredPoem.commentsCount} comments</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Poetry Library Section */}
      <section id="poems" className="py-8 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-2 mb-6 md:mb-8">
            <div className="w-1 h-6 md:h-8 bg-primary rounded"></div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
              Poetry Library
            </h2>
          </div>

          <div className="space-y-4 md:space-y-6">
            {poetPoems.map(poem => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Support Section */}
      <section className="py-8 md:py-16 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="text-5xl mb-4 md:mb-6">{'👏'}</div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3 md:mb-4 px-2 text-foreground">
            Support {poet.name}'s Work
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
            If these words moved you, show your appreciation with claps. Your support helps poets continue creating meaningful work.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mb-6 md:mb-8 max-w-md sm:max-w-none mx-auto">
            <Button size="lg" className="w-full sm:w-auto" onClick={() => setShowGiveClaps(true)}>
              <span className="mr-2">{'👏'}</span>
              Give Claps
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={async () => {
                const shareData = {
                  title: `${poet.name} on WordStack`,
                  text: `Check out ${poet.name}'s poetry on WordStack`,
                  url: window.location.href,
                };
                if (navigator.share) {
                  try {
                    await navigator.share(shareData);
                  } catch {
                    // user cancelled share sheet
                  }
                } else {
                  await navigator.clipboard.writeText(window.location.href);
                }
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Share this page
            </Button>
          </div>

          <div className="border border-border rounded-lg p-6 inline-block bg-background">
            <p className="text-sm text-muted-foreground mb-2">Total claps received</p>
            <p className="text-3xl font-bold text-primary">{poet.totalInk.toLocaleString()}</p>
          </div>
        </div>
      </section>

      {/* 6. Updates / Journal Section */}
      {poetUpdates.length > 0 && (
        <section className="py-8 md:py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex items-center gap-2 mb-6 md:mb-8">
              <div className="w-1 h-6 md:h-8 bg-primary rounded"></div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                Updates
              </h2>
            </div>
            
            <div className="space-y-4">
              {poetUpdates.map(update => (
                <Card key={update.id} className="p-6">
                  <p className="leading-relaxed mb-3 text-foreground">{update.content}</p>
                  <p className="text-sm text-muted-foreground">{update.createdAt}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Give Claps Overlay */}
      {showGiveClaps && (
        <GiveClapsOverlay
          poetId={poet.id}
          poetName={poet.name}
          poetAvatar={poet.avatar}
          onClose={() => setShowGiveClaps(false)}
        />
      )}

      {/* 7. About Section */}
      <section className="py-8 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-2 mb-6 md:mb-8">
            <div className="w-1 h-6 md:h-8 bg-primary rounded"></div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
              About {poet.name}
            </h2>
          </div>
          
          <Card className="p-6 md:p-8">
            <div className="prose prose-sm md:prose-lg max-w-none">
              <p className="leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line break-words text-foreground">
                {poet.aboutText || poet.bio}
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
