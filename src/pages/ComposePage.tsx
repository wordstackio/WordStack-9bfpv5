import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { createCommunityPost, getPublishedPoems } from "@/lib/storage";
import { mockPoems } from "@/lib/mockData";
import { PostPoll, QuoteRef, Poem } from "@/types";
import {
  ArrowLeft,
  Image as ImageIcon,
  Link2,
  BarChart3,
  Quote,
  X,
  Plus,
  Feather,
  Globe,
  ChevronDown,
  ExternalLink,
  Loader2,
} from "lucide-react";

type AttachmentMode = null | "image" | "link" | "poll" | "quote";

// Extract domain from URL
function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

// Extract first URL from text
function extractUrl(text: string): string | null {
  const urlRegex = /(https?:\/\/[^\s<]+)/gi;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
}

// Known site metadata for realistic previews (simulates OG fetch)
const KNOWN_SITES: Record<string, { title: string; description: string; image: string }> = {
  "youtube.com": {
    title: "YouTube",
    description: "Enjoy the videos and music you love, upload original content, and share it all with the world.",
    image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&h=314&fit=crop",
  },
  "twitter.com": {
    title: "X (formerly Twitter)",
    description: "The platform for public conversation.",
    image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&h=314&fit=crop",
  },
  "x.com": {
    title: "X (formerly Twitter)",
    description: "The platform for public conversation.",
    image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&h=314&fit=crop",
  },
  "github.com": {
    title: "GitHub",
    description: "Where the world builds software. Millions of developers use GitHub to build and ship software.",
    image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&h=314&fit=crop",
  },
  "medium.com": {
    title: "Medium",
    description: "Where good ideas find you. Read and share new perspectives on just about any topic.",
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&h=314&fit=crop",
  },
  "spotify.com": {
    title: "Spotify",
    description: "Listen to music and podcasts for free.",
    image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=600&h=314&fit=crop",
  },
  "instagram.com": {
    title: "Instagram",
    description: "Create and share photos and videos with the people who matter most.",
    image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=600&h=314&fit=crop",
  },
};

// Simulate OG data fetch (in production, this would be a server endpoint)
async function fetchLinkPreview(url: string): Promise<{
  url: string;
  title: string;
  description: string;
  image?: string;
  domain: string;
}> {
  const domain = extractDomain(url);

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

  // Check known sites
  const known = Object.entries(KNOWN_SITES).find(([key]) => domain.includes(key));
  if (known) {
    return {
      url,
      title: known[1].title,
      description: known[1].description,
      image: known[1].image,
      domain,
    };
  }

  // Generate realistic-looking fallback from URL/domain
  const pathParts = new URL(url).pathname.split("/").filter(Boolean);
  const titleFromPath = pathParts.length > 0
    ? pathParts[pathParts.length - 1]
        .replace(/[-_]/g, " ")
        .replace(/\.\w+$/, "")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : domain;

  return {
    url,
    title: titleFromPath || domain,
    description: `Content from ${domain}`,
    domain,
  };
}

export default function ComposePage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [content, setContent] = useState("");
  const [activeMode, setActiveMode] = useState<AttachmentMode>(null);

  // Image state
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Link state (auto-detected)
  const [detectedLink, setDetectedLink] = useState<{
    url: string;
    title: string;
    description: string;
    image?: string;
    domain: string;
  } | null>(null);
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [dismissedUrls, setDismissedUrls] = useState<Set<string>>(new Set());
  const lastDetectedUrl = useRef<string | null>(null);

  // Manual link state (fallback)
  const [manualLinkUrl, setManualLinkUrl] = useState("");
  const [manualLinkTitle, setManualLinkTitle] = useState("");

  // Poll state
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollDuration, setPollDuration] = useState<"1d" | "3d" | "7d">("1d");

  // Quote state
  const [selectedQuote, setSelectedQuote] = useState<QuoteRef | null>(null);
  const [quoteSearch, setQuoteSearch] = useState("");

  const didFocusRef = useRef(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!user.isPoet) {
      navigate("/community");
      return;
    }
    // Focus textarea once on mount only
    if (!didFocusRef.current) {
      didFocusRef.current = true;
      textareaRef.current?.focus();
    }
  }, [user, navigate]);

  const handleTextareaResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, []);

  // Track activeMode in a ref so the effect doesn't depend on it
  const activeModeRef = useRef(activeMode);
  activeModeRef.current = activeMode;
  const dismissedUrlsRef = useRef(dismissedUrls);
  dismissedUrlsRef.current = dismissedUrls;

  // Auto-detect URLs in content
  useEffect(() => {
    const url = extractUrl(content);

    if (!url) {
      if (lastDetectedUrl.current) {
        lastDetectedUrl.current = null;
        setDetectedLink(null);
        setIsLoadingLink(false);
      }
      return;
    }

    // Skip if this URL was dismissed or already detected
    if (dismissedUrlsRef.current.has(url) || lastDetectedUrl.current === url) return;

    lastDetectedUrl.current = url;
    setIsLoadingLink(true);

    fetchLinkPreview(url).then((preview) => {
      if (lastDetectedUrl.current === url) {
        setDetectedLink(preview);
        setIsLoadingLink(false);
        if (activeModeRef.current === "link") setActiveMode(null);
      }
    });
  // Only re-run when the content text actually changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (!user) return null;

  const charLimit = 500;
  const remaining = charLimit - content.length;
  const hasLink = !!detectedLink || (activeMode === "link" && manualLinkUrl.trim());
  const canPost =
    content.trim().length > 0 || images.length > 0 || selectedQuote || hasLink;

  // -- Handlers --

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (images.length >= 4) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImages((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (images.length <= 1) setActiveMode(null);
  };

  const dismissLink = () => {
    if (detectedLink) {
      setDismissedUrls((prev) => new Set([...prev, detectedLink.url]));
    }
    setDetectedLink(null);
    lastDetectedUrl.current = null;
    setIsLoadingLink(false);
  };

  const toggleMode = (mode: AttachmentMode) => {
    if (activeMode === mode) {
      setActiveMode(null);
    } else {
      setActiveMode(mode);
    }
  };

  const handlePost = () => {
    if (!canPost) return;

    const extras: Parameters<typeof createCommunityPost>[4] = {};

    if (images.length > 0) {
      extras.images = images;
    }

    // Prefer auto-detected link, fall back to manual
    if (detectedLink) {
      extras.link = {
        url: detectedLink.url,
        title: detectedLink.title,
        description: detectedLink.description,
        image: detectedLink.image,
        domain: detectedLink.domain,
      };
    } else if (activeMode === "link" && manualLinkUrl.trim()) {
      extras.link = {
        url: manualLinkUrl.trim(),
        title: manualLinkTitle.trim() || undefined,
        domain: extractDomain(manualLinkUrl.trim()),
      };
    }

    if (
      activeMode === "poll" &&
      pollOptions.filter((o) => o.trim()).length >= 2
    ) {
      const durationHours =
        pollDuration === "1d" ? 24 : pollDuration === "3d" ? 72 : 168;
      const endsAt = new Date(
        Date.now() + durationHours * 60 * 60 * 1000
      ).toISOString();
      extras.poll = {
        question: content.trim(),
        options: pollOptions
          .filter((o) => o.trim())
          .map((text, i) => ({ id: `opt-${i}`, text: text.trim(), votes: 0 })),
        endsAt,
        votedUsers: {},
      };
    }

    if (selectedQuote) {
      extras.quote = selectedQuote;
    }

    createCommunityPost(user.id, user.name, user.avatar, content, extras);
    navigate("/community");
  };

  // Get poems for quote search (memoized to avoid re-renders stealing focus)
  const uniquePoems = useMemo(() => {
    const allPoems: Poem[] = [...mockPoems, ...getPublishedPoems()];
    return allPoems.filter(
      (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
    );
  }, []);
  
  const filteredPoems = useMemo(() => {
    return quoteSearch.trim()
      ? uniquePoems.filter(
          (p) =>
            p.title.toLowerCase().includes(quoteSearch.toLowerCase()) ||
            p.poetName.toLowerCase().includes(quoteSearch.toLowerCase())
        )
      : uniquePoems.slice(0, 8);
  }, [quoteSearch, uniquePoems]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex items-center gap-3">
          <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            Drafts
          </button>
          <Button
            onClick={handlePost}
            disabled={!canPost}
            size="sm"
            className="rounded-full px-5 h-9 font-semibold"
          >
            Post
          </Button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-32">
          {/* Avatar + Audience + Textarea */}
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-muted mt-0.5">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Feather className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Audience Selector */}
              <button className="flex items-center gap-1 text-sm font-semibold text-primary border border-primary/30 rounded-full px-3 py-0.5 mb-3 hover:bg-primary/5 transition-colors">
                <Globe className="w-3.5 h-3.5" />
                Everyone
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* Main Textarea */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  if (e.target.value.length <= charLimit) {
                    setContent(e.target.value);
                    handleTextareaResize();
                  }
                }}
                placeholder={
                  activeMode === "poll"
                    ? "Ask a question..."
                    : "What's happening?"
                }
                className="w-full bg-transparent text-foreground text-lg leading-relaxed placeholder:text-muted-foreground/60 resize-none outline-none min-h-[120px] font-sans"
                rows={1}
              />

              {/* Attached Images */}
              {images.length > 0 && (
                <div
                  className={`mt-3 gap-1 rounded-2xl overflow-hidden ${
                    images.length === 1
                      ? "grid grid-cols-1"
                      : images.length === 2
                      ? "grid grid-cols-2"
                      : images.length === 3
                      ? "grid grid-cols-2 grid-rows-2"
                      : "grid grid-cols-2 grid-rows-2"
                  }`}
                >
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className={`relative bg-muted ${
                        images.length === 1
                          ? "aspect-video"
                          : images.length === 3 && i === 0
                          ? "row-span-2 aspect-square"
                          : "aspect-square"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Upload ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Auto-detected Link Preview */}
              {isLoadingLink && !detectedLink && (
                <div className="mt-3 border border-border rounded-2xl overflow-hidden">
                  <div className="p-4 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Fetching link preview...
                    </span>
                  </div>
                </div>
              )}

              {detectedLink && (
                <div className="mt-3 border border-border rounded-2xl overflow-hidden relative group">
                  <button
                    onClick={dismissLink}
                    className="absolute top-2 right-2 z-10 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                  {detectedLink.image && (
                    <div className="aspect-[1.91/1] bg-muted">
                      <img
                        src={detectedLink.image}
                        alt={detectedLink.title}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>
                  )}
                  <div className="px-3.5 py-2.5">
                    <p className="text-xs text-muted-foreground">
                      {detectedLink.domain}
                    </p>
                    <p className="text-sm font-semibold text-foreground leading-snug mt-0.5 line-clamp-2">
                      {detectedLink.title}
                    </p>
                    {detectedLink.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {detectedLink.description}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Manual Link Attachment (only if no auto-detected link) */}
              {activeMode === "link" && !detectedLink && !isLoadingLink && (
                <div className="mt-4 p-3 border border-border rounded-2xl bg-muted/30 space-y-2" onMouseDown={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Attach Link
                    </span>
                    <button
                      onClick={() => {
                        setActiveMode(null);
                        setManualLinkUrl("");
                        setManualLinkTitle("");
                      }}
                      className="p-0.5 hover:bg-muted rounded-full"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <input
                    type="url"
                    value={manualLinkUrl}
                    onChange={(e) => setManualLinkUrl(e.target.value)}
                    placeholder="Paste a URL..."
                    className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition-colors"
                  />
                  <input
                    type="text"
                    value={manualLinkTitle}
                    onChange={(e) => setManualLinkTitle(e.target.value)}
                    placeholder="Title (optional)"
                    className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition-colors"
                  />
                </div>
              )}

              {/* Poll Builder */}
              {activeMode === "poll" && (
                <div className="mt-4 p-3 border border-border rounded-2xl bg-muted/30 space-y-3" onMouseDown={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Poll
                    </span>
                    <button
                      onClick={() => {
                        setActiveMode(null);
                        setPollOptions(["", ""]);
                      }}
                      className="p-0.5 hover:bg-muted rounded-full"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {pollOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...pollOptions];
                            newOpts[i] = e.target.value;
                            setPollOptions(newOpts);
                          }}
                          placeholder={`Option ${i + 1}`}
                          className="flex-1 bg-transparent border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition-colors"
                          maxLength={60}
                        />
                        {pollOptions.length > 2 && (
                          <button
                            onClick={() =>
                              setPollOptions(
                                pollOptions.filter((_, j) => j !== i)
                              )
                            }
                            className="p-1 hover:bg-muted rounded-full"
                          >
                            <X className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {pollOptions.length < 4 && (
                    <button
                      onClick={() => setPollOptions([...pollOptions, ""])}
                      className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add option
                    </button>
                  )}

                  <div className="pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground block mb-1.5">
                      Poll duration
                    </span>
                    <div className="flex gap-2">
                      {(["1d", "3d", "7d"] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() => setPollDuration(d)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            pollDuration === d
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {d === "1d"
                            ? "1 Day"
                            : d === "3d"
                            ? "3 Days"
                            : "7 Days"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quote Selector */}
              {activeMode === "quote" && !selectedQuote && (
                <div className="mt-4 p-3 border border-border rounded-2xl bg-muted/30 space-y-3" onMouseDown={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Share a Poem
                    </span>
                    <button
                      onClick={() => {
                        setActiveMode(null);
                        setQuoteSearch("");
                      }}
                      className="p-0.5 hover:bg-muted rounded-full"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={quoteSearch}
                    onChange={(e) => setQuoteSearch(e.target.value)}
                    placeholder="Search poems or poets..."
                    className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition-colors"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredPoems.map((poem) => (
                      <button
                        key={poem.id}
                        onClick={() => {
                          setSelectedQuote({
                            poemId: poem.id,
                            poemTitle: poem.title,
                            poetName: poem.poetName,
                            excerpt: poem.content
                              .split("\n")
                              .filter((l) => l.trim())
                              .slice(0, 2)
                              .join(" ")
                              .slice(0, 120),
                          });
                          setActiveMode(null);
                        }}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-muted/60 transition-colors"
                      >
                        <p className="font-serif text-sm font-semibold text-foreground leading-snug">
                          {poem.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          by {poem.poetName}
                        </p>
                      </button>
                    ))}
                    {filteredPoems.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-3">
                        No poems found.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Quote Preview */}
              {selectedQuote && (
                <div className="mt-3 border border-border rounded-2xl overflow-hidden">
                  <div className="px-3.5 py-3 bg-muted/30">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Quote className="w-3 h-3 text-primary/50" />
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Shared Poem</span>
                        </div>
                        <p className="font-serif text-sm font-semibold text-foreground leading-snug">
                          {selectedQuote.poemTitle}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 italic line-clamp-2">
                          {`"${selectedQuote.excerpt}"`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          by{" "}
                          <span className="font-medium text-foreground/70">
                            {selectedQuote.poetName}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedQuote(null)}
                        className="p-0.5 hover:bg-muted rounded-full flex-shrink-0 mt-0.5"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-background">
        {/* Reply Audience */}
        <div className="px-4 py-2 border-b border-border/50">
          <button className="flex items-center gap-1.5 text-sm text-primary font-semibold">
            <Globe className="w-4 h-4" />
            Everyone can reply
          </button>
        </div>

        {/* Toolbar + Character Count */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-0.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              onClick={() => {
                if (activeMode === "poll") return;
                fileInputRef.current?.click();
              }}
              disabled={activeMode === "poll" || images.length >= 4}
              className={`p-2.5 rounded-full transition-colors ${
                activeMode === "poll" || images.length >= 4
                  ? "text-muted-foreground/30 cursor-not-allowed"
                  : "text-primary hover:bg-primary/10"
              }`}
              aria-label="Add image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <button
              onClick={() => toggleMode("link")}
              disabled={activeMode === "poll" || !!detectedLink}
              className={`p-2.5 rounded-full transition-colors ${
                detectedLink
                  ? "text-primary/50 cursor-default"
                  : activeMode === "link"
                  ? "text-primary bg-primary/10"
                  : activeMode === "poll"
                  ? "text-muted-foreground/30 cursor-not-allowed"
                  : "text-primary hover:bg-primary/10"
              }`}
              aria-label="Add link"
            >
              <Link2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => toggleMode("poll")}
              disabled={images.length > 0}
              className={`p-2.5 rounded-full transition-colors ${
                activeMode === "poll"
                  ? "text-primary bg-primary/10"
                  : images.length > 0
                  ? "text-muted-foreground/30 cursor-not-allowed"
                  : "text-primary hover:bg-primary/10"
              }`}
              aria-label="Create poll"
            >
              <BarChart3 className="w-5 h-5" />
            </button>

            <button
              onClick={() => toggleMode("quote")}
              className={`p-2.5 rounded-full transition-colors ${
                activeMode === "quote" || selectedQuote
                  ? "text-primary bg-primary/10"
                  : "text-primary hover:bg-primary/10"
              }`}
              aria-label="Share poem"
            >
              <Quote className="w-5 h-5" />
            </button>
          </div>

          {/* Character Counter */}
          <div className="flex items-center gap-3">
            {content.length > 0 && (
              <>
                <div className="relative w-6 h-6">
                  <svg
                    className="w-6 h-6 -rotate-90"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-muted/60"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${
                        (content.length / charLimit) * 62.8
                      } 62.8`}
                      className={
                        remaining <= 20
                          ? remaining <= 0
                            ? "text-destructive"
                            : "text-amber-500"
                          : "text-primary"
                      }
                    />
                  </svg>
                </div>
                {remaining <= 20 && (
                  <span
                    className={`text-xs font-medium ${
                      remaining <= 0
                        ? "text-destructive"
                        : "text-amber-500"
                    }`}
                  >
                    {remaining}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
