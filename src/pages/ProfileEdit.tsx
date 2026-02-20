import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { updateUserProfile } from "@/lib/storage";
import { User } from "@/types";
import { 
  ArrowLeft, 
  Save, 
  User as UserIcon, 
  Image as ImageIcon,
  Link as LinkIcon,
  Twitter,
  Instagram,
  Globe,
  FileText
} from "lucide-react";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    bio: "",
    avatar: "",
    bannerImage: "",
    customUrl: "",
    aboutText: "",
    socialLinks: {
      twitter: "",
      instagram: "",
      website: ""
    }
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (!user.isPoet) {
      navigate("/feed");
      return;
    }

    // Initialize form with existing user data
    setFormData({
      name: user.name || "",
      bio: user.bio || "",
      avatar: user.avatar || "",
      bannerImage: user.bannerImage || "",
      customUrl: user.customUrl || user.id,
      aboutText: (user as any).aboutText || "",
      socialLinks: {
        twitter: user.socialLinks?.twitter || "",
        instagram: user.socialLinks?.instagram || "",
        website: user.socialLinks?.website || ""
      }
    });
  }, [user, navigate]);

  if (!user) return null;

  const handleSave = () => {
    const updated = updateUserProfile(user.id, formData);
    if (updated) {
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        navigate(`/poet/${user.id}`);
      }, 1500);
    }
  };

  const handleChange = (field: keyof User, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
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
              Edit Profile
            </h1>
            <p className="text-muted-foreground">
              Update your public poet profile information
            </p>
          </div>
          
          <Button size="lg" onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <UserIcon className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-serif text-2xl font-bold">Basic Information</h2>
                <p className="text-sm text-muted-foreground">
                  Your name and short bio
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Display Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Your name as it appears on your page"
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This is how readers will see your name
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Short Bio *
                </label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  placeholder="Describe your poetry in one sentence..."
                  rows={2}
                  maxLength={150}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.bio?.length || 0}/150 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Custom URL Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">wordstack.com/poet/</span>
                  <Input
                    value={formData.customUrl}
                    onChange={(e) => handleChange("customUrl", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="your-name"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Lowercase letters, numbers, and hyphens only
                </p>
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <ImageIcon className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-serif text-2xl font-bold">Visual Identity</h2>
                <p className="text-sm text-muted-foreground">
                  Profile photo and banner image
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Profile Photo URL
                </label>
                <Input
                  value={formData.avatar}
                  onChange={(e) => handleChange("avatar", e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  type="url"
                />
                {formData.avatar && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                    <img 
                      src={formData.avatar} 
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "";
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Banner Image URL
                </label>
                <Input
                  value={formData.bannerImage}
                  onChange={(e) => handleChange("bannerImage", e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  type="url"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 1600x400px, landscape orientation
                </p>
                {formData.bannerImage && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                    <img 
                      src={formData.bannerImage} 
                      alt="Banner preview"
                      className="w-full h-32 object-cover rounded-lg border-2 border-border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Social Links */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <LinkIcon className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-serif text-2xl font-bold">Social Links</h2>
                <p className="text-sm text-muted-foreground">
                  Connect your other online presences
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Twitter className="w-4 h-4 text-blue-400" />
                  Twitter / X
                </label>
                <Input
                  value={formData.socialLinks?.twitter}
                  onChange={(e) => handleSocialChange("twitter", e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                  type="url"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Instagram className="w-4 h-4 text-pink-500" />
                  Instagram
                </label>
                <Input
                  value={formData.socialLinks?.instagram}
                  onChange={(e) => handleSocialChange("instagram", e.target.value)}
                  placeholder="https://instagram.com/yourhandle"
                  type="url"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Globe className="w-4 h-4 text-green-500" />
                  Personal Website
                </label>
                <Input
                  value={formData.socialLinks?.website}
                  onChange={(e) => handleSocialChange("website", e.target.value)}
                  placeholder="https://yourwebsite.com"
                  type="url"
                />
              </div>
            </div>
          </Card>

          {/* Extended About */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-serif text-2xl font-bold">Extended About</h2>
                <p className="text-sm text-muted-foreground">
                  Tell your story in more detail
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                About You
              </label>
              <Textarea
                value={formData.aboutText}
                onChange={(e) => handleChange("aboutText" as keyof User, e.target.value)}
                placeholder="Share your writing journey, influences, philosophy, achievements, or anything else you'd like readers to know about you and your work..."
                rows={12}
                className="font-serif leading-relaxed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can write multiple paragraphs. Press Enter twice for paragraph breaks.
              </p>
            </div>
          </Card>

          {/* Save Button (mobile friendly) */}
          <div className="flex justify-end gap-3 sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-border">
            <Button
              variant="outline"
              onClick={() => navigate(`/poet/${user.id}`)}
            >
              Cancel
            </Button>
            <Button size="lg" onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              {saved ? "Saved Successfully!" : "Save All Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
