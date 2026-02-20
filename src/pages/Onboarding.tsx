import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { 
  getOnboardingProgress, 
  saveOnboardingProgress,
  completeOnboarding,
  followPoet 
} from "@/lib/storage";
import { mockPoets } from "@/lib/mockData";
import { Sparkles, Check, Feather } from "lucide-react";
import PoetCard from "@/components/features/PoetCard";

type UserType = "writer" | "reader" | "both" | null;
type Theme = "light" | "dark";

export default function Onboarding() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType>(null);
  
  // Poet setup
  const [poetName, setPoetName] = useState(user?.name || "");
  const [poetBio, setPoetBio] = useState("");
  const [theme, setTheme] = useState<Theme>("light");
  const [accentColor, setAccentColor] = useState("#8B7355");
  
  // First poem
  const [poemTitle, setPoemTitle] = useState("");
  const [poemContent, setPoemContent] = useState("");
  const [saveDraft, setSaveDraft] = useState(false);
  
  // Follow poets
  const [followedCount, setFollowedCount] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/signup");
      return;
    }
    
    const progress = getOnboardingProgress();
    if (progress.completed) {
      navigate("/feed");
    }
  }, [user, navigate]);

  const totalSteps = userType === "reader" ? 3 : 6;

  const handleNext = () => {
    saveOnboardingProgress({
      step,
      userType: userType || "writer",
      poetName,
      poetBio,
      theme,
      completed: false
    });
    setStep(step + 1);
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleComplete = () => {
    completeOnboarding();
    if (userType === "writer" || userType === "both") {
      navigate(`/poet/${user?.id}`);
    } else {
      navigate("/feed");
    }
  };

  const handleFollowPoet = (poetId: string) => {
    followPoet(poetId);
    setFollowedCount(prev => prev + 1);
  };

  if (!user) return null;

  // Step 1: Choose user type
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center">
          <Feather className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="font-serif text-5xl font-bold text-foreground mb-4">
            Welcome to WordStack
          </h1>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Are you a poet, a reader, or both?
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card 
              className={`p-8 cursor-pointer transition-all hover:shadow-lg ${
                userType === "writer" ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setUserType("writer")}
            >
              <div className="text-4xl mb-3">✍️</div>
              <h3 className="font-serif text-xl font-semibold mb-2">I write poetry</h3>
              <p className="text-sm text-muted-foreground">
                Create your poet page and share your work
              </p>
            </Card>

            <Card 
              className={`p-8 cursor-pointer transition-all hover:shadow-lg ${
                userType === "reader" ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setUserType("reader")}
            >
              <div className="text-4xl mb-3">📖</div>
              <h3 className="font-serif text-xl font-semibold mb-2">I mostly read</h3>
              <p className="text-sm text-muted-foreground">
                Discover and support talented poets
              </p>
            </Card>

            <Card 
              className={`p-8 cursor-pointer transition-all hover:shadow-lg ${
                userType === "both" ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setUserType("both")}
            >
              <div className="text-4xl mb-3">🌿</div>
              <h3 className="font-serif text-xl font-semibold mb-2">Both</h3>
              <p className="text-sm text-muted-foreground">
                Write poetry and explore the community
              </p>
            </Card>
          </div>

          {userType && (
            <Button size="lg" onClick={handleNext} className="px-12">
              Continue
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Poet Name & URL (Writer/Both only)
  if ((userType === "writer" || userType === "both") && step === 2) {
    const urlSlug = poetName.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>Step {step} of {totalSteps}</span>
            </div>
            <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <Card className="p-8">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
              Choose your poet name
            </h2>
            <p className="text-muted-foreground mb-8">
              This is how readers will know you. You can change it later.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <Input 
                  placeholder="Elena Rivera"
                  value={poetName}
                  onChange={(e) => setPoetName(e.target.value)}
                  className="text-lg"
                />
              </div>

              {poetName && (
                <div className="bg-accent/20 p-4 rounded-lg">
                  <label className="block text-sm font-medium mb-1">Your poet page URL</label>
                  <p className="text-sm text-muted-foreground font-mono">
                    wordstack.com/poet/{urlSlug || "yourname"}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  size="lg" 
                  onClick={handleNext}
                  disabled={!poetName.trim()}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Step 3: Bio (Writer/Both only)
  if ((userType === "writer" || userType === "both") && step === 3) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>Step {step} of {totalSteps}</span>
            </div>
            <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <Card className="p-8">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
              Describe your poetry
            </h2>
            <p className="text-muted-foreground mb-8">
              One sentence that captures your voice.
            </p>

            <div className="space-y-6">
              <div>
                <Textarea 
                  placeholder="Writing about light, loss, and the spaces between words."
                  value={poetBio}
                  onChange={(e) => setPoetBio(e.target.value)}
                  rows={3}
                  className="text-base resize-none"
                  maxLength={150}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {poetBio.length} / 150 characters
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline"
                  onClick={handleSkip}
                >
                  Skip for now
                </Button>
                <Button 
                  size="lg" 
                  onClick={handleNext}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Step 4: Theme (Writer/Both only)
  if ((userType === "writer" || userType === "both") && step === 4) {
    const colors = [
      { name: "Earth", value: "#8B7355" },
      { name: "Ocean", value: "#2C5F7B" },
      { name: "Forest", value: "#3D5A40" },
      { name: "Sunset", value: "#B56576" },
      { name: "Midnight", value: "#2D3047" }
    ];

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>Step {step} of {totalSteps}</span>
            </div>
            <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <Card className="p-8">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
              Pick your aesthetic
            </h2>
            <p className="text-muted-foreground mb-8">
              Small touches that make it yours.
            </p>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium mb-4">Theme Mode</label>
                <div className="grid grid-cols-2 gap-4">
                  <Card 
                    className={`p-6 cursor-pointer transition-all ${
                      theme === "light" ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setTheme("light")}
                  >
                    <div className="w-full h-20 bg-gradient-to-br from-white to-gray-100 rounded mb-3" />
                    <p className="font-medium text-center">Light</p>
                  </Card>
                  <Card 
                    className={`p-6 cursor-pointer transition-all ${
                      theme === "dark" ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setTheme("dark")}
                  >
                    <div className="w-full h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded mb-3" />
                    <p className="font-medium text-center">Dark</p>
                  </Card>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-4">Accent Color</label>
                <div className="flex gap-3">
                  {colors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setAccentColor(color.value)}
                      className={`w-12 h-12 rounded-full transition-all ${
                        accentColor === color.value ? "ring-2 ring-offset-2 ring-primary" : ""
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline"
                  onClick={handleSkip}
                >
                  Skip for now
                </Button>
                <Button 
                  size="lg" 
                  onClick={handleNext}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Ink Explanation (appears for both writers and readers, different step numbers)
  const inkStep = userType === "reader" ? 2 : 5;
  if (step === inkStep) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background flex items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full">
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>Step {step} of {totalSteps}</span>
            </div>
            <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <div className="text-center mb-12">
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              Support poets with Ink
            </h2>
            <p className="text-lg text-muted-foreground">
              Our simple way to show appreciation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center">
              <div className="text-3xl mb-3">💛</div>
              <h3 className="font-serif text-lg font-semibold mb-2">Ink Support</h3>
              <p className="text-sm text-muted-foreground">
                Tip poets directly on poems you love
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="font-serif text-lg font-semibold mb-2">Spotlight</h3>
              <p className="text-sm text-muted-foreground">
                Poets can boost their work for 24 hours
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-serif text-lg font-semibold mb-2">Contests</h3>
              <p className="text-sm text-muted-foreground">
                Run poetry competitions with Ink prizes
              </p>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" onClick={handleNext} className="px-12">
              Got it
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Follow Poets (appears for all user types, different step numbers)
  const followStep = userType === "reader" ? 3 : 6;
  if (step === followStep) {
    const minFollowRequired = 3;
    const canProceed = followedCount >= minFollowRequired;

    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>Step {step} of {totalSteps}</span>
            </div>
            <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-3">
              Follow poets you enjoy
            </h2>
            <p className="text-lg text-muted-foreground mb-2">
              Build your feed by following at least {minFollowRequired} poets
            </p>
            <p className="text-sm text-muted-foreground">
              {followedCount} of {minFollowRequired} poets followed
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {mockPoets.slice(0, 6).map(poet => (
              <div key={poet.id} onClick={() => handleFollowPoet(poet.id)}>
                <PoetCard poet={poet} />
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              onClick={handleComplete}
              disabled={!canProceed}
              className="px-12"
            >
              {canProceed ? "Complete Setup" : `Follow ${minFollowRequired - followedCount} more`}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
