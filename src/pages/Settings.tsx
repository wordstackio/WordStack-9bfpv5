import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { getCurrentUser } from "@/lib/auth";
import { getThemePreferences, saveThemePreferences } from "@/lib/storage";
import { ThemePreferences, Typography, ColorScheme } from "@/types";
import { Palette, Type, Eye, Save, ArrowLeft } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [preferences, setPreferences] = useState<ThemePreferences | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (!user.isPoet) {
      navigate("/feed");
      return;
    }

    const prefs = getThemePreferences(user.id);
    setPreferences(prefs);
  }, [user, navigate]);

  if (!preferences || !user) return null;

  const handleSave = () => {
    saveThemePreferences(user.id, preferences);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      // Optionally navigate to poet page to see changes
      // navigate(`/poet/${user.id}`);
    }, 1500);
  };

  const typographyOptions: { value: Typography; label: string; description: string; preview: string }[] = [
    {
      value: "serif",
      label: "Serif",
      description: "Classic, timeless poetry feel",
      preview: "The woods are lovely, dark and deep"
    },
    {
      value: "sans",
      label: "Sans-Serif",
      description: "Modern, clean, contemporary",
      preview: "The woods are lovely, dark and deep"
    },
    {
      value: "typewriter",
      label: "Typewriter",
      description: "Vintage, raw, authentic",
      preview: "The woods are lovely, dark and deep"
    }
  ];

  const colorSchemeOptions: { value: ColorScheme; label: string; description: string; gradient: string }[] = [
    {
      value: "minimal-white",
      label: "Minimal White",
      description: "Clean, spacious, professional",
      gradient: "from-white via-gray-50 to-gray-100"
    },
    {
      value: "dark-literary",
      label: "Dark Literary",
      description: "Moody, elegant, dramatic",
      gradient: "from-gray-900 via-gray-800 to-gray-700"
    },
    {
      value: "warm-paper",
      label: "Warm Paper",
      description: "Vintage, cozy, inviting",
      gradient: "from-amber-50 via-orange-50 to-yellow-50"
    },
    {
      value: "modern-clean",
      label: "Modern Clean",
      description: "Crisp, balanced, sophisticated",
      gradient: "from-blue-50 via-slate-50 to-gray-50"
    }
  ];

  const getFontClass = (typo: Typography): string => {
    switch (typo) {
      case "serif": return "font-serif";
      case "sans": return "font-sans";
      case "typewriter": return "font-mono";
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/poet/${user.id}`)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Page
            </Button>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
              Customize Your Page
            </h1>
            <p className="text-muted-foreground">
              Make your poet page uniquely yours
            </p>
          </div>
          
          <Button size="lg" onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>

        <div className="space-y-8">
          {/* Typography Section */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Type className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-serif text-2xl font-bold">Typography</h2>
                <p className="text-sm text-muted-foreground">
                  Choose the font style that matches your voice
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {typographyOptions.map(option => (
                <Card
                  key={option.value}
                  className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                    preferences.typography === option.value
                      ? "ring-2 ring-primary bg-accent/30"
                      : ""
                  }`}
                  onClick={() =>
                    setPreferences({ ...preferences, typography: option.value })
                  }
                >
                  <div className="flex items-start gap-4">
                    <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center mt-1">
                      {preferences.typography === option.value && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{option.label}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {option.description}
                      </p>
                      <p className={`text-xl ${getFontClass(option.value)} italic`}>
                        {option.preview}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Color Scheme Section */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-serif text-2xl font-bold">Color Scheme</h2>
                <p className="text-sm text-muted-foreground">
                  Set the overall mood and atmosphere
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {colorSchemeOptions.map(option => (
                <Card
                  key={option.value}
                  className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                    preferences.colorScheme === option.value
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() =>
                    setPreferences({ ...preferences, colorScheme: option.value })
                  }
                >
                  <div
                    className={`w-full h-24 rounded-lg mb-4 bg-gradient-to-br ${option.gradient}`}
                  />
                  <h3 className="font-semibold text-lg mb-1">{option.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                  {preferences.colorScheme === option.value && (
                    <p className="text-xs text-primary font-medium mt-2">✓ Active</p>
                  )}
                </Card>
              ))}
            </div>
          </Card>

          {/* Section Visibility */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-serif text-2xl font-bold">Section Visibility</h2>
                <p className="text-sm text-muted-foreground">
                  Choose which sections appear on your page
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/20 transition-colors">
                <div>
                  <h3 className="font-semibold mb-1">Updates / Journal</h3>
                  <p className="text-sm text-muted-foreground">
                    Share short updates and thoughts with your readers
                  </p>
                </div>
                <Checkbox
                  checked={preferences.sections.showUpdates}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      sections: { ...preferences.sections, showUpdates: !!checked }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/20 transition-colors">
                <div>
                  <h3 className="font-semibold mb-1">Collections</h3>
                  <p className="text-sm text-muted-foreground">
                    Display organized groups of poems by theme or series
                  </p>
                </div>
                <Checkbox
                  checked={preferences.sections.showCollections}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      sections: { ...preferences.sections, showCollections: !!checked }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/20 transition-colors">
                <div>
                  <h3 className="font-semibold mb-1">Support Section</h3>
                  <p className="text-sm text-muted-foreground">
                    Show Ink support area with call-to-action
                  </p>
                </div>
                <Checkbox
                  checked={preferences.sections.showSupport}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      sections: { ...preferences.sections, showSupport: !!checked }
                    })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Preview & Action Buttons */}
          <Card className="p-6 bg-accent/10 border-primary/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> Save your changes, then visit your poet page to see the new design.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/poet/${user.id}`)}
                className="whitespace-nowrap"
              >
                Preview My Page
              </Button>
            </div>
          </Card>

          {/* Quick Reference */}
          <Card className="p-6 bg-muted/30">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              What Your Readers Will See
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                <p>
                  <strong className="text-foreground">Typography:</strong> Affects all headings, poem titles, and your name display with <span className={`font-bold ${getFontClass(preferences.typography)}`}>{preferences.typography}</span> style
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                <p>
                  <strong className="text-foreground">Color Scheme:</strong> Changes background colors, text colors, and overall page mood to match <strong>{preferences.colorScheme.replace('-', ' ')}</strong> theme
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                <p>
                  <strong className="text-foreground">Section Visibility:</strong> Controls which content sections appear on your page — perfect for minimalist poets or those building gradually
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
