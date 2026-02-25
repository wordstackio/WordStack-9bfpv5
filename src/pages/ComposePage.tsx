import { useState, useRef, useEffect, useCallback } from "react";
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
} from "lucide-react";

type AttachmentMode = null | "image" | "link" | "poll" | "quote";

export default function ComposePage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [content, setContent] = useState("");
  const [activeMode, setActiveMode] = useState<AttachmentMode>(null);

  // Image state
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Link state
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");

  // Poll state
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollDuration, setPollDuration] = useState<"1d" | "3d" | "7d">("1d");

  // Quote state
  const [selectedQuote, setSelectedQuote] = useState<QuoteRef | null>(null);
  const [quoteSearch, setQuoteSearch] = useState("");

  // Audience
  const [audience, setAudience] = useState<"everyone">("everyone");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!user.isPoet) {
      navigate("/community");
      return;
    }
    // Auto-focus textarea
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, [user, navigate]);

  const handleTextareaResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, []);

  useEffect(() => {
    handleTextareaResize();
  }, [content, handleTextareaResize]);

  if (!user) return null;

  const charLimit = 500;
  const remaining = charLimit - content.length;
  const canPost = content.trim().length > 0 || images.length > 0 || selectedQuote;

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

    if (linkUrl.trim()) {
      extras.link = {
        url: linkUrl.trim(),
        title: linkTitle.trim() || undefined,
      };
    }

    if (activeMode === "poll" && pollOptions.filter((o) => o.trim()).length >= 2) {
      const durationHours = pollDuration === "1d" ? 24 : pollDuration === "3d" ? 72 : 168;
      const endsAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();
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

  // Get poems for quote search
  const allPoems: Poem[] = [...mockPoems, ...getPublishedPoems()];
  const uniquePoems = allPoems.filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
  );
  const filteredPoems = quoteSearch.trim()
    ? uniquePoems.filter(
        (p) =>
          p.title.toLowerCase().includes(quoteSearch.toLowerCase()) ||
          p.poetName.toLowerCase().includes(quoteSearch.toLowerCase())
      )
    : uniquePoems.slice(0, 8);

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
                {audience === "everyone" ? "Everyone" : "Followers"}
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* Main Textarea */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  if (e.target.value.length <= charLimit) {
                    setContent(e.target.value);
                  }
                }}
                placeholder={
                  activeMode === "poll"
                    ? "Ask a question..."
                    : "What's on your mind?"
                }
                className="w-full bg-transparent text-foreground text-lg leading-relaxed placeholder:text-muted-foreground/60 resize-none outline-none min-h-[120px] font-sans"
                rows={1}
              />

              {/* Attached Images */}
              {images.length > 0 && (
                <div
                  className={`mt-3 gap-2 rounded-xl overflow-hidden ${
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

              {/* Link Attachment */}
              {activeMode === "link" && (
                <div className="mt-4 p-3 border border-border rounded-xl bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Attach Link
                    </span>
                    <button
                      onClick={() => {
                        setActiveMode(null);
                        setLinkUrl("");
                        setLinkTitle("");
                      }}
                      className="p-0.5 hover:bg-muted rounded-full"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition-colors"
                  />
                  <input
                    type="text"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    placeholder="Title (optional)"
                    className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition-colors"
                  />
                </div>
              )}

              {/* Poll Builder */}
              {activeMode === "poll" && (
                <div className="mt-4 p-3 border border-border rounded-xl bg-muted/30 space-y-3">
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
                              setPollOptions(pollOptions.filter((_, j) => j !== i))
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
                          {d === "1d" ? "1 Day" : d === "3d" ? "3 Days" : "7 Days"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quote Selector */}
              {activeMode === "quote" && !selectedQuote && (
                <div className="mt-4 p-3 border border-border rounded-xl bg-muted/30 space-y-3">
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
                    autoFocus
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
                <div className="mt-3 border border-border rounded-xl overflow-hidden">
                  <div className="px-3.5 py-3 bg-muted/30">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
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
                        onClick={() => {
                          setSelectedQuote(null);
                        }}
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
          <div className="flex items-center gap-1">
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
                if (activeMode === "poll") return; // Can't add images with poll
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
              disabled={activeMode === "poll"}
              className={`p-2.5 rounded-full transition-colors ${
                activeMode === "link"
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
                  <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
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
                      strokeDasharray={`${(content.length / charLimit) * 62.8} 62.8`}
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
                      remaining <= 0 ? "text-destructive" : "text-amber-500"
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
