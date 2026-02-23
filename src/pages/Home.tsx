import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import PoetCard from "@/components/features/PoetCard";
import { mockPoets } from "@/lib/mockData";
import { getCurrentUser } from "@/lib/auth";
import { Feather, BookOpen, Users, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-poetry.jpg";

export default function Home() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const featuredPoets = mockPoets.slice(0, 6);

  useEffect(() => {
    if (user) {
      navigate(user.isAdmin ? "/admin/dashboard" : "/feed", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="overflow-x-hidden pb-20">
      {/* Minimal Hero - Gateway Style */}
      <section 
        className="relative h-[500px] md:h-[600px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50" />
        <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto">
          <Feather className="w-16 h-16 md:w-20 md:h-20 text-white/90 mx-auto mb-4 md:mb-6" />
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6">
            WordStack
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-3 md:mb-4 font-serif italic">
            A home for poets.
          </p>
          <p className="text-base md:text-lg text-white/80 mb-6 md:mb-10 max-w-2xl mx-auto leading-relaxed">
            Create your own poetry website. Share your work. Build your audience.
            No noise. No algorithms. Just your words, your way.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-sm sm:max-w-none mx-auto">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="text-sm md:text-base px-6 md:px-10 py-4 md:py-6 w-full sm:w-auto">
                Claim Your Poet Page
              </Button>
            </Link>
            <Link to="/explore" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="text-sm md:text-base px-6 md:px-10 py-4 md:py-6 bg-white/10 border-white/30 text-white hover:bg-white/20 w-full sm:w-auto">
                Explore Poets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* What Makes It Different */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
              Your poetry deserves its own space
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Not a profile. A personal poetry website that feels like yours.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-lg md:text-xl font-semibold mb-2 md:mb-3">Your Own Site</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Curate featured work, organize collections, and control your presentation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-lg md:text-xl font-semibold mb-2 md:mb-3">Direct Support</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Readers can support your work directly with Ink. No middlemen.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-lg md:text-xl font-semibold mb-2 md:mb-3">Calm Discovery</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                No algorithms. Readers discover you through genuine interest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Discover Poets - Main Gateway Function */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
              Discover Poets
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Each poet has their own curated space. Explore and find voices that resonate.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
            {featuredPoets.map(poet => (
              <PoetCard key={poet.id} poet={poet} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/explore">
              <Button size="lg" variant="outline">
                View All Poets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-accent/20 to-background">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 md:mb-6">
            Ready to share your poetry?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-10 leading-relaxed">
            Create your poet page in minutes. No design skills needed.
          </p>
          <Link to="/signup">
            <Button size="lg" className="px-8 md:px-12 py-4 md:py-6 text-base md:text-lg">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
