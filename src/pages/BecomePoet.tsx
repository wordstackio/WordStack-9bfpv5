import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser, upgradeToPoet } from "@/lib/auth";
import { Feather, PenLine, BookOpen, Users, Heart, Sparkles } from "lucide-react";
import { useEffect } from "react";

export default function BecomePoet() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // If already a poet, redirect to their page
    if (user.isPoet) {
      navigate(`/poet/${user.id}`);
    }
  }, [user, navigate]);

  const handleActivate = () => {
    if (!user) return;
    
    upgradeToPoet(user.id);
    // Reload to update user context
    window.location.href = `/poet/${user.id}`;
  };

  if (!user || user.isPoet) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Feather className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Become a WordStack Poet
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your account into a poet's creative home. Share your work, build your audience, and get supported for your craft.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <PenLine className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">Your Poetry Website</h3>
            <p className="text-muted-foreground leading-relaxed">
              Get a beautiful, customizable poet page that feels like your own website. Control your theme, layout, and how your work is presented.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">Organize with Collections</h3>
            <p className="text-muted-foreground leading-relaxed">
              Create themed collections to showcase your work. Group poems by project, theme, or chronology. Tell stories through curated sets.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">Build Your Audience</h3>
            <p className="text-muted-foreground leading-relaxed">
              Readers can follow you to see your latest work. Share updates and behind-the-scenes insights through community posts.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">Get Supported with Ink</h3>
            <p className="text-muted-foreground leading-relaxed">
              Readers can support your work directly through Ink — our way of helping poets earn from their craft without ads or algorithms.
            </p>
          </Card>
        </div>

        {/* What You Get Section */}
        <Card className="p-8 mb-12 bg-gradient-to-b from-accent/20 to-background">
          <div className="flex items-start gap-4 mb-6">
            <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-serif text-2xl font-bold mb-4">What You Get as a Poet</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Your own customizable poet page with bio, banner, and social links</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Unlimited poem publishing with drafts and autosave</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Collection creation and management tools</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Community updates to share thoughts and work-in-progress</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Direct support from readers through Ink</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Follower dashboard and engagement metrics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Featured spotlight opportunities for top poems</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="p-8 bg-primary/5 border-primary/20">
            <h2 className="font-serif text-2xl font-bold mb-3">
              Ready to Share Your Voice?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Activating your poet account is instant and free. You'll keep your current username and settings — we'll just unlock all the creator features.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8"
              onClick={handleActivate}
            >
              <Feather className="w-5 h-5 mr-2" />
              Activate Poet Account
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              You can always switch back to reader mode in your settings
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
