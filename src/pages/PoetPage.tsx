import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Filter, ExternalLink, Twitter, Instagram, Globe } from "lucide-react";
import { mockPoets, mockPoems, mockCollections, mockUpdates } from "@/lib/mockData";
import PoemCard from "@/components/features/PoemCard";
import { getCurrentUser } from "@/lib/auth";
import { isFollowing, followPoet, unfollowPoet, getThemePreferences } from "@/lib/storage";
import { shortTimeAgo } from "@/lib/utils";
import { ThemePreferences } from "@/types";
import GiveClapsOverlay from "@/components/features/GiveClapsOverlay";

export default function PoetPage() {
  const { id } = useParams();
  const user = getCurrentUser();
  
  const poet = mockPoets.find(p => p.id === id);
  const [following, setFollowing] = useState(poet ? isFollowing(poet.id) : false);
  const [filterCollection, setFilterCollection] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemePreferences | null>(null);
  const [showGiveClaps, setShowGiveClaps] = useState(false);

  useEffect(() => {
    if (poet) {
      const prefs = getThemePreferences(poet.id);
      setTheme(prefs);
    }
  }, [poet]);
  
  if (!poet || !theme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const poetPoems = mockPoems.filter(p => p.poetId === poet.id);
  const poetCollections = mockCollections.filter(c => c.poetId === poet.id);
  const poetUpdates = mockUpdates.filter(u => u.poetId === poet.id);
  const featuredPoem = poetPoems.find(p => p.isPinned) || poetPoems[0];
  
  const filteredPoems = filterCollection
    ? poetPoems.filter(p => p.collectionIds?.includes(filterCollection))
    : poetPoems;

  const getFontClass = () => {
    switch (theme.typography) {
      case "serif": return "font-serif";
      case "sans": return "font-sans";
      case "typewriter": return "font-mono";
    }
  };

  const getColorClasses = () => {
    switch (theme.colorScheme) {
      case "minimal-white":
        return {
          page: "bg-white",
          text: "text-gray-900",
          textMuted: "text-gray-600",
          card: "bg-white border-gray-200",
          accent: "bg-gray-50",
          primary: "text-gray-900",
          border: "border-gray-200"
        };
      case "dark-literary":
        return {
          page: "bg-gray-900",
          text: "text-gray-100",
          textMuted: "text-gray-400",
          card: "bg-gray-800 border-gray-700",
          accent: "bg-gray-800",
          primary: "text-gray-100",
          border: "border-gray-700"
        };
      case "warm-paper":
        return {
          page: "bg-amber-50",
          text: "text-amber-950",
          textMuted: "text-amber-800",
          card: "bg-white border-amber-200",
          accent: "bg-amber-100",
          primary: "text-amber-900",
          border: "border-amber-200"
        };
      case "modern-clean":
        return {
          page: "bg-slate-50",
          text: "text-slate-900",
          textMuted: "text-slate-600",
          card: "bg-white border-slate-200",
          accent: "bg-slate-100",
          primary: "text-slate-900",
          border: "border-slate-200"
        };
    }
  };

  const colors = getColorClasses();

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
    <div className={`min-h-screen overflow-x-hidden pb-20 ${colors.page} ${colors.text}`}>
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
      
      {/* 1. Hero Section - Personal Website Landing */}
      <section className={`relative ${colors.accent} ${colors.border} border-b ${poet.bannerImage ? 'pt-6 md:pt-8' : ''}`}>
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
          
          <h1 className={`${getFontClass()} text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 px-2 ${colors.primary}`}>
            {poet.name}
          </h1>
          <p className={`text-base sm:text-lg md:text-xl lg:text-2xl ${colors.textMuted} mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed px-4`}>
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
                <span className="mr-2">👏</span>
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

          <div className={`flex flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-8 text-xs sm:text-sm ${colors.textMuted} px-4`}>
            <span><strong className={`text-base sm:text-lg ${colors.text}`}>{poet.followersCount}</strong> followers</span>
            <span className="hidden sm:inline">·</span>
            <span><strong className={`text-base sm:text-lg ${colors.text}`}>{poet.totalPoems}</strong> poems</span>
            <span className="hidden sm:inline">·</span>
            <span><strong className={`text-base sm:text-lg ${colors.text}`}>{poet.totalInk}</strong> Ink</span>
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
        <section className={`py-8 md:py-16 ${colors.accent}`}>
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <div className="w-1 h-6 md:h-8 bg-primary rounded"></div>
              <h2 className={`${getFontClass()} text-xl md:text-2xl font-semibold ${colors.textMuted}`}>
                Featured Work
              </h2>
            </div>
            
            <div>
              <Link to={`/poem/${featuredPoem.id}`}>
                <h3 className={`${getFontClass()} text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 hover:text-primary transition-colors leading-tight`}>
                  {featuredPoem.title}
                </h3>
              </Link>
              <div className="max-w-none">
                <pre className={`${getFontClass()} ${colors.text} text-sm sm:text-base md:text-lg leading-loose whitespace-pre-wrap break-words`}>
                  {featuredPoem.content}
                </pre>
              </div>
              <div className={`flex flex-wrap items-center gap-2 sm:gap-4 mt-6 md:mt-8 pt-4 md:pt-6 border-t ${colors.border} text-xs sm:text-sm ${colors.textMuted}`}>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 md:h-8 bg-primary rounded"></div>
              <h2 className={`${getFontClass()} text-2xl md:text-3xl font-bold`}>
                Poetry Library
              </h2>
            </div>
            
            {poetCollections.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className={`w-4 h-4 ${colors.textMuted} flex-shrink-0`} />
                <select 
                  className={`${colors.card} ${colors.border} ${colors.text} border rounded px-3 py-1.5 text-sm w-full sm:w-auto`}
                  value={filterCollection || ""}
                  onChange={(e) => setFilterCollection(e.target.value || null)}
                >
                  <option value="">All Poems</option>
                  {poetCollections.map(col => (
                    <option key={col.id} value={col.id}>{col.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-4 md:space-y-6">
            {filteredPoems.map(poem => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Collections Section (if any) */}
      {theme.sections.showCollections && poetCollections.length > 0 && (
        <section className={`py-8 md:py-16 ${colors.accent}`}>
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-center gap-2 mb-6 md:mb-8">
              <div className="w-1 h-6 md:h-8 bg-primary rounded"></div>
              <h2 className={`${getFontClass()} text-2xl md:text-3xl font-bold`}>
                Collections
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {poetCollections.map(collection => (
                <Link key={collection.id} to={`/collection/${collection.id}`}>
                  <Card className={`p-6 hover:shadow-md transition-shadow cursor-pointer h-full ${colors.card}`}>
                    {collection.coverImage && (
                      <img 
                        src={collection.coverImage} 
                        alt={collection.name}
                        className="w-full h-32 object-cover rounded mb-4"
                      />
                    )}
                    <h3 className={`${getFontClass()} text-xl font-semibold mb-2 hover:text-primary transition-colors ${colors.text}`}>
                      {collection.name}
                    </h3>
                    {collection.description && (
                      <p className={`text-sm ${colors.textMuted} mb-2 line-clamp-2`}>
                        {collection.description}
                      </p>
                    )}
                    <p className={`${colors.textMuted} text-sm`}>
                      {collection.poemIds.length} {collection.poemIds.length === 1 ? 'poem' : 'poems'}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Support Section */}
      {theme.sections.showSupport && (
        <section className={`py-8 md:py-16 ${colors.accent} border-y ${colors.border}`}>
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <div className="text-5xl mb-4 md:mb-6">👏</div>
            <h2 className={`${getFontClass()} text-2xl md:text-3xl font-bold mb-3 md:mb-4 px-2 ${colors.primary}`}>
              Support {poet.name}'s Work
            </h2>
            <p className={`text-sm sm:text-base md:text-lg ${colors.textMuted} mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed px-4`}>
              If these words moved you, show your appreciation with claps. Your support helps poets continue creating meaningful work.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mb-6 md:mb-8 max-w-md sm:max-w-none mx-auto">
              <Button size="lg" className="w-full sm:w-auto" onClick={() => setShowGiveClaps(true)}>
                <span className="mr-2">👏</span>
                Give Claps
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <ExternalLink className="w-4 h-4 mr-2" />
                Share this page
              </Button>
            </div>

            <div className={`${colors.card} border ${colors.border} rounded-lg p-6 inline-block`}>
              <p className={`text-sm ${colors.textMuted} mb-2`}>Total claps received</p>
              <p className="text-3xl font-bold text-primary">{poet.totalInk.toLocaleString()}</p>
            </div>
          </div>
        </section>
      )}

      {/* 6. Updates / Journal Section (if any) */}
      {theme.sections.showUpdates && poetUpdates.length > 0 && (
        <section className={`py-8 md:py-16`}>
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex items-center gap-2 mb-6 md:mb-8">
              <div className="w-1 h-6 md:h-8 bg-primary rounded"></div>
              <h2 className={`${getFontClass()} text-2xl md:text-3xl font-bold`}>
                Updates
              </h2>
            </div>
            
            <div className="space-y-4">
              {poetUpdates.map(update => (
                <Card key={update.id} className={`p-6 ${colors.card}`}>
                  <p className={`leading-relaxed mb-3 ${colors.text}`}>{update.content}</p>
                  <p className={`text-sm ${colors.textMuted}`}>{update.createdAt}</p>
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
      <section className={`py-8 md:py-16 ${colors.accent}`}>
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-2 mb-6 md:mb-8">
            <div className="w-1 h-6 md:h-8 bg-primary rounded"></div>
            <h2 className={`${getFontClass()} text-2xl md:text-3xl font-bold`}>
              About {poet.name}
            </h2>
          </div>
          
          <Card className={`p-6 md:p-8 ${colors.card}`}>
            <div className="prose prose-sm md:prose-lg max-w-none">
              <p className={`leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line break-words ${colors.text}`}>
                {poet.aboutText || poet.bio}
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
