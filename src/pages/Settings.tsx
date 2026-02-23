import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getCurrentUser } from "@/lib/auth";
import { deleteAccount } from "@/lib/auth";
import {
  getThemePreferences,
  saveThemePreferences,
  isProfileHidden,
  setProfileHidden,
  exportPoetData,
  createAccountDeletionRequest,
} from "@/lib/storage";
import { ThemePreferences, Typography, ColorScheme } from "@/types";
import {
  Palette,
  Type,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
  Download,
  Trash2,
  AlertTriangle,
  FileDown,
  Check,
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [preferences, setPreferences] = useState<ThemePreferences | null>(null);
  const [saved, setSaved] = useState(false);
  const [profileHiddenState, setProfileHiddenState] = useState(false);
  const [hiddenSaved, setHiddenSaved] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  // Delete account state
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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
    setProfileHiddenState(isProfileHidden(user.id));
  }, [user, navigate]);

  if (!preferences || !user) return null;

  const handleSave = () => {
    saveThemePreferences(user.id, preferences);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 1500);
  };

  const handleToggleHidden = (checked: boolean) => {
    setProfileHiddenState(checked);
    setProfileHidden(user.id, checked);
    setHiddenSaved(true);
    setTimeout(() => setHiddenSaved(false), 1500);
  };

  const handleExport = () => {
    const data = exportPoetData(user.id, user.name);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wordstack-${user.name.toLowerCase().replace(/\s+/g, "-")}-export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 3000);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setIsDeleting(true);

    // Save reason to admin
    if (deleteReason.trim()) {
      createAccountDeletionRequest(user.id, user.name, deleteReason.trim());
    } else {
      createAccountDeletionRequest(user.id, user.name, "No reason provided");
    }

    const result = await deleteAccount();
    if (result.success) {
      setShowDeleteSheet(false);
      navigate("/", { replace: true });
      window.location.reload();
    } else {
      setIsDeleting(false);
      alert(result.error || "Failed to delete account. Please try again.");
    }
  };

  const typographyOptions: {
    value: Typography;
    label: string;
    description: string;
    preview: string;
  }[] = [
    {
      value: "serif",
      label: "Serif",
      description: "Classic, timeless poetry feel",
      preview: "The woods are lovely, dark and deep",
    },
    {
      value: "sans",
      label: "Sans-Serif",
      description: "Modern, clean, contemporary",
      preview: "The woods are lovely, dark and deep",
    },
    {
      value: "typewriter",
      label: "Typewriter",
      description: "Vintage, raw, authentic",
      preview: "The woods are lovely, dark and deep",
    },
  ];

  const colorSchemeOptions: {
    value: ColorScheme;
    label: string;
    description: string;
    gradient: string;
  }[] = [
    {
      value: "minimal-white",
      label: "Minimal White",
      description: "Clean, spacious, professional",
      gradient: "from-white via-gray-50 to-gray-100",
    },
    {
      value: "dark-literary",
      label: "Dark Literary",
      description: "Moody, elegant, dramatic",
      gradient: "from-gray-900 via-gray-800 to-gray-700",
    },
    {
      value: "warm-paper",
      label: "Warm Paper",
      description: "Vintage, cozy, inviting",
      gradient: "from-amber-50 via-orange-50 to-yellow-50",
    },
    {
      value: "modern-clean",
      label: "Modern Clean",
      description: "Crisp, balanced, sophisticated",
      gradient: "from-blue-50 via-slate-50 to-gray-50",
    },
  ];

  const getFontClass = (typo: Typography): string => {
    switch (typo) {
      case "serif":
        return "font-serif";
      case "sans":
        return "font-sans";
      case "typewriter":
        return "font-mono";
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
              {typographyOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                    preferences.typography === option.value
                      ? "ring-2 ring-primary bg-accent/30"
                      : ""
                  }`}
                  onClick={() =>
                    setPreferences({
                      ...preferences,
                      typography: option.value,
                    })
                  }
                >
                  <div className="flex items-start gap-4">
                    <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center mt-1">
                      {preferences.typography === option.value && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {option.label}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {option.description}
                      </p>
                      <p
                        className={`text-xl ${getFontClass(option.value)} italic`}
                      >
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
              {colorSchemeOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                    preferences.colorScheme === option.value
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() =>
                    setPreferences({
                      ...preferences,
                      colorScheme: option.value,
                    })
                  }
                >
                  <div
                    className={`w-full h-24 rounded-lg mb-4 bg-gradient-to-br ${option.gradient}`}
                  />
                  <h3 className="font-semibold text-lg mb-1">
                    {option.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                  {preferences.colorScheme === option.value && (
                    <p className="text-xs text-primary font-medium mt-2">
                      Active
                    </p>
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
                <h2 className="font-serif text-2xl font-bold">
                  Section Visibility
                </h2>
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
                      sections: {
                        ...preferences.sections,
                        showUpdates: !!checked,
                      },
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
                      sections: {
                        ...preferences.sections,
                        showCollections: !!checked,
                      },
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
                      sections: {
                        ...preferences.sections,
                        showSupport: !!checked,
                      },
                    })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Hide Profile */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <EyeOff className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-serif text-2xl font-bold">
                  Profile Visibility
                </h2>
                <p className="text-sm text-muted-foreground">
                  Control whether you appear in Discover Poets
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/20 transition-colors">
              <div className="flex-1 mr-4">
                <h3 className="font-semibold mb-1">Hide my profile</h3>
                <p className="text-sm text-muted-foreground">
                  When enabled, your profile will not appear in Discover Poets,
                  search results, curated sections, or trending lists. People
                  with a direct link to your page can still visit it.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {hiddenSaved && (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Saved
                  </span>
                )}
                <Checkbox
                  checked={profileHiddenState}
                  onCheckedChange={(checked) =>
                    handleToggleHidden(!!checked)
                  }
                />
              </div>
            </div>
          </Card>

          {/* Export Data */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Download className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-serif text-2xl font-bold">Export Data</h2>
                <p className="text-sm text-muted-foreground">
                  Download all your poems, drafts, and collections
                </p>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                Export a JSON file containing all your published poems, drafts,
                and collection metadata. This includes titles, full content,
                dates, and engagement counts.
              </p>
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <FileDown className="w-4 h-4" />
                {exportDone ? "Downloaded!" : "Export All Data"}
              </Button>
            </div>
          </Card>

          {/* Preview & Action Buttons */}
          <Card className="p-6 bg-accent/10 border-primary/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                <strong>Tip:</strong> Save your changes, then visit your poet
                page to see the new design.
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
                  <strong className="text-foreground">Typography:</strong>{" "}
                  Affects all headings, poem titles, and your name display with{" "}
                  <span
                    className={`font-bold ${getFontClass(preferences.typography)}`}
                  >
                    {preferences.typography}
                  </span>{" "}
                  style
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                <p>
                  <strong className="text-foreground">Color Scheme:</strong>{" "}
                  Changes background colors, text colors, and overall page mood
                  to match{" "}
                  <strong>
                    {preferences.colorScheme.replace("-", " ")}
                  </strong>{" "}
                  theme
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                <p>
                  <strong className="text-foreground">
                    Section Visibility:
                  </strong>{" "}
                  Controls which content sections appear on your page -- perfect
                  for minimalist poets or those building gradually
                </p>
              </div>
            </div>
          </Card>

          {/* Delete Account - Danger Zone */}
          <Card className="p-8 border-red-200">
            <div className="flex items-center gap-3 mb-6">
              <Trash2 className="w-6 h-6 text-red-500" />
              <div>
                <h2 className="font-serif text-2xl font-bold text-red-600">
                  Danger Zone
                </h2>
                <p className="text-sm text-muted-foreground">
                  Irreversible actions that affect your account
                </p>
              </div>
            </div>

            <div className="p-4 border border-red-200 rounded-lg bg-red-50/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold mb-1 text-red-700">
                    Delete Account
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data.
                    This action cannot be undone. We recommend exporting your
                    data first.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 flex-shrink-0"
                  onClick={() => setShowDeleteSheet(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Account Sheet */}
      <Sheet open={showDeleteSheet} onOpenChange={setShowDeleteSheet}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader className="text-left mb-6">
            <SheetTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Your Account
            </SheetTitle>
            <SheetDescription>
              Please read carefully before proceeding.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 max-w-lg">
            {/* What deletion means */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-700 mb-2">
                What happens when you delete your account:
              </h4>
              <ul className="space-y-2 text-sm text-red-600">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 block w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  Your profile, poems, drafts, and collections will be
                  permanently removed
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 block w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  Your followers and engagement history will be lost
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 block w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  Any remaining Ink balance will be forfeited
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 block w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  This action is <strong>irreversible</strong>
                </li>
              </ul>
            </div>

            {/* Reminder to export */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-700 mb-1">
                    Export your data first
                  </h4>
                  <p className="text-sm text-amber-600 mb-3">
                    Once deleted, your poems cannot be recovered. We strongly
                    recommend downloading a copy of all your work before
                    proceeding.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    onClick={handleExport}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    {exportDone ? "Downloaded!" : "Export My Data"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Optional reason */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Why are you leaving WordStack?{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <Textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Your feedback helps us improve the platform for other poets..."
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This message will be sent to the WordStack team.
              </p>
            </div>

            {/* Confirmation */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Type <strong>DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="destructive"
                disabled={deleteConfirmText !== "DELETE" || isDeleting}
                onClick={handleDeleteAccount}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting
                  ? "Deleting..."
                  : "Permanently Delete My Account"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteSheet(false);
                  setDeleteConfirmText("");
                  setDeleteReason("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
