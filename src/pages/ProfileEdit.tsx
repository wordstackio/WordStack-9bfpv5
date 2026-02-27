import { useState, useEffect, useRef } from "react";
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
  Camera,
  X,
  Loader2,
} from "lucide-react";

// ── Blob upload helper ──────────────────────────────────
async function uploadToBlob(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": file.type,
      "x-filename": filename,
    },
    body: file,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Upload failed");
  }

  const data = await res.json();
  return data.url;
}

// ── Reusable image upload component ─────────────────────
interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  variant: "avatar" | "banner";
  label: string;
  hint?: string;
}

function ImageUpload({ value, onChange, variant, label, hint }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const url = await uploadToBlob(file, variant === "avatar" ? "avatars" : "banners");
      onChange(url);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  // ── Avatar variant ───────────────────────────────
  if (variant === "avatar") {
    return (
      <div>
        <label className="block text-sm font-medium mb-2">{label}</label>
        <div className="flex items-center gap-4">
          <div
            className={`relative w-24 h-24 rounded-full border-2 overflow-hidden flex-shrink-0 cursor-pointer transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-border"
            } ${!value && !uploading ? "bg-muted" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            {uploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : value ? (
              <>
                <img src={value} alt="Profile" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
                <Camera className="w-5 h-5" />
                <span className="text-[10px]">Upload</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              {value ? "Change Photo" : "Upload Photo"}
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange("")}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </Button>
            )}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
      </div>
    );
  }

  // ── Banner variant ───────────────────────────────
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div
        className={`relative w-full rounded-lg border-2 border-dashed overflow-hidden cursor-pointer transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border"
        } ${!value && !uploading ? "bg-muted/50" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {uploading ? (
          <div className="flex items-center justify-center h-36 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Uploading...</span>
          </div>
        ) : value ? (
          <div className="relative">
            <img src={value} alt="Banner" className="w-full h-36 object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Camera className="w-5 h-5 text-white" />
              <span className="text-sm text-white font-medium">Change Banner</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-36 gap-2 text-muted-foreground">
            <Upload className="w-6 h-6" />
            <span className="text-sm font-medium">Click or drag to upload banner</span>
            <span className="text-xs">Recommended: 1600 x 400 px</span>
          </div>
        )}
      </div>

      {value && (
        <div className="mt-2 flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            disabled={uploading}
            className="gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            Replace
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <X className="w-3.5 h-3.5" />
            Remove
          </Button>
        </div>
      )}

      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
    </div>
  );
}

// ── Main page ───────────────────────────────────────────
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
    socialLinks: { twitter: "", instagram: "", website: "" },
  });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!user.isPoet) { navigate("/feed"); return; }
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
        website: user.socialLinks?.website || "",
      },
    });
  }, [user, navigate]);

  if (!user) return null;

  const handleSave = () => {
    const updated = updateUserProfile(user.id, formData);
    if (updated) {
      setSaved(true);
      setTimeout(() => { setSaved(false); navigate(`/poet/${user.id}`); }, 1500);
    }
  };

  const handleChange = (field: keyof User, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setFormData((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [platform]: value } }));
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/poet/${user.id}`)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Page
            </Button>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Edit Profile</h1>
            <p className="text-muted-foreground">Update your public poet profile information</p>
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
                <p className="text-sm text-muted-foreground">Your name and short bio</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Display Name *</label>
                <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Your name as it appears on your page" className="text-lg" />
                <p className="text-xs text-muted-foreground mt-1">This is how readers will see your name</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Short Bio *</label>
                <Textarea value={formData.bio} onChange={(e) => handleChange("bio", e.target.value)} placeholder="Describe your poetry in one sentence..." rows={2} maxLength={150} />
                <p className="text-xs text-muted-foreground mt-1">{formData.bio?.length || 0}/150 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Custom URL Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">wordstack.com/poet/</span>
                  <Input value={formData.customUrl} onChange={(e) => handleChange("customUrl", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="your-name" className="flex-1" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Lowercase letters, numbers, and hyphens only</p>
              </div>
            </div>
          </Card>

          {/* Images -- real upload via Vercel Blob */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <ImageIcon className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-serif text-2xl font-bold">Visual Identity</h2>
                <p className="text-sm text-muted-foreground">Profile photo and banner image</p>
              </div>
            </div>
            <div className="space-y-6">
              <ImageUpload
                value={formData.avatar || ""}
                onChange={(url) => handleChange("avatar", url)}
                variant="avatar"
                label="Profile Photo"
                hint="Square image, at least 200x200px. Max 5 MB."
              />
              <ImageUpload
                value={formData.bannerImage || ""}
                onChange={(url) => handleChange("bannerImage", url)}
                variant="banner"
                label="Banner Image"
                hint="Landscape image, recommended 1600x400px. Max 5 MB."
              />
            </div>
          </Card>

          {/* Social Links */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <LinkIcon className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-serif text-2xl font-bold">Social Links</h2>
                <p className="text-sm text-muted-foreground">Connect your other online presences</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Twitter className="w-4 h-4 text-blue-400" /> Twitter / X
                </label>
                <Input value={formData.socialLinks?.twitter} onChange={(e) => handleSocialChange("twitter", e.target.value)} placeholder="https://twitter.com/yourhandle" type="url" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Instagram className="w-4 h-4 text-pink-500" /> Instagram
                </label>
                <Input value={formData.socialLinks?.instagram} onChange={(e) => handleSocialChange("instagram", e.target.value)} placeholder="https://instagram.com/yourhandle" type="url" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Globe className="w-4 h-4 text-green-500" /> Personal Website
                </label>
                <Input value={formData.socialLinks?.website} onChange={(e) => handleSocialChange("website", e.target.value)} placeholder="https://yourwebsite.com" type="url" />
              </div>
            </div>
          </Card>

          {/* Extended About */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-serif text-2xl font-bold">Extended About</h2>
                <p className="text-sm text-muted-foreground">Tell your story in more detail</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">About You</label>
              <Textarea
                value={formData.aboutText}
                onChange={(e) => handleChange("aboutText" as keyof User, e.target.value)}
                placeholder="Share your writing journey, influences, philosophy, achievements, or anything else you'd like readers to know about you and your work..."
                rows={12}
                className="font-serif leading-relaxed"
              />
              <p className="text-xs text-muted-foreground mt-1">You can write multiple paragraphs. Press Enter twice for paragraph breaks.</p>
            </div>
          </Card>

          {/* Save Button (mobile friendly) */}
          <div className="flex justify-end gap-3 sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-border">
            <Button variant="outline" onClick={() => navigate(`/poet/${user.id}`)}>Cancel</Button>
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
