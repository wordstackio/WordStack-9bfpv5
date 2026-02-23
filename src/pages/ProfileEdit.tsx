import { useState, useEffect, useRef, useCallback } from "react";
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
  FileText,
  Upload,
  Loader2,
  Camera,
  X
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

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const uploadImage = useCallback(async (file: File, type: "avatar" | "banner") => {
    const isAvatar = type === "avatar";
    const setUploading = isAvatar ? setUploadingAvatar : setUploadingBanner;

    // Validate file
    if (!file.type.startsWith("image/")) return;
    const maxSize = isAvatar ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File too large. Max ${isAvatar ? "5MB" : "10MB"}.`);
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `profiles/${user!.id}/${type}-${Date.now()}.${ext}`;

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "content-type": file.type,
          "x-filename": filename,
        },
        body: file,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { url } = await res.json();
      const field = isAvatar ? "avatar" : "bannerImage";
      setFormData((prev) => ({ ...prev, [field]: url }));
    } catch (err) {
      console.error("Upload error:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [user]);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "banner") => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file, type);
    e.target.value = "";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent, type: "avatar" | "banner") => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) uploadImage(file, type);
    },
    [uploadImage]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

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
              {/* Banner Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Banner Image
                </label>
                <div
                  onDrop={(e) => handleDrop(e, "banner")}
                  onDragOver={handleDragOver}
                  onClick={() => !uploadingBanner && bannerInputRef.current?.click()}
                  className={`relative w-full h-44 rounded-xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden group ${
                    uploadingBanner
                      ? "border-primary/40 bg-primary/5 pointer-events-none"
                      : "border-border hover:border-primary/50 hover:bg-accent/30"
                  }`}
                >
                  {formData.bannerImage ? (
                    <>
                      <img
                        src={formData.bannerImage}
                        alt="Banner preview"
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Camera className="w-5 h-5 text-white" />
                        <span className="text-sm font-medium text-white">Change banner</span>
                      </div>
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData((prev) => ({ ...prev, bannerImage: "" }));
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      {uploadingBanner ? (
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-2" />
                          <span className="text-sm font-medium">Click or drag to upload banner</span>
                          <span className="text-xs mt-1">1600x400px recommended. Max 10MB.</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFilePick(e, "banner")}
                />
              </div>

              {/* Profile Photo Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center gap-5">
                  <div
                    onDrop={(e) => handleDrop(e, "avatar")}
                    onDragOver={handleDragOver}
                    onClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
                    className={`relative w-28 h-28 rounded-full border-2 border-dashed transition-colors cursor-pointer overflow-hidden group flex-shrink-0 ${
                      uploadingAvatar
                        ? "border-primary/40 bg-primary/5 pointer-events-none"
                        : "border-border hover:border-primary/50 hover:bg-accent/30"
                    }`}
                  >
                    {formData.avatar ? (
                      <>
                        <img
                          src={formData.avatar}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        {uploadingAvatar ? (
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        ) : (
                          <Camera className="w-6 h-6" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingAvatar}
                      onClick={() => avatarInputRef.current?.click()}
                      className="gap-2"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {uploadingAvatar ? "Uploading..." : "Upload photo"}
                    </Button>
                    {formData.avatar && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData((prev) => ({ ...prev, avatar: "" }))}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Square image recommended. Max 5MB.
                    </p>
                  </div>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFilePick(e, "avatar")}
                />
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
