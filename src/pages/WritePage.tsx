import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getCurrentUser } from "@/lib/auth";
import { saveDraft, getDraft, publishPoem } from "@/lib/storage";
import { mockCollections } from "@/lib/mockData";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Send,
  ChevronRight,
  Pin,
  X,
  Clock,
  Italic,
  AlignCenter,
  AlignLeft,
} from "lucide-react";

// Floating toolbar on text selection
function FloatingToolbar({ textareaRef }: { textareaRef: React.RefObject<HTMLTextAreaElement | null> }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleSelect = () => {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start !== end) {
        const rect = textarea.getBoundingClientRect();
        setPos({
          top: rect.top - 48,
          left: rect.left + rect.width / 2,
        });
        setShow(true);
      } else {
        setShow(false);
      }
    };

    const handleBlur = () => {
      setTimeout(() => setShow(false), 200);
    };

    textarea.addEventListener("select", handleSelect);
    textarea.addEventListener("mouseup", handleSelect);
    textarea.addEventListener("blur", handleBlur);
    return () => {
      textarea.removeEventListener("select", handleSelect);
      textarea.removeEventListener("mouseup", handleSelect);
      textarea.removeEventListener("blur", handleBlur);
    };
  }, [textareaRef]);

  if (!show) return null;

  return (
    <div
      className="fixed z-50 flex items-center gap-1 px-2 py-1.5 rounded-lg bg-foreground text-background shadow-lg animate-in fade-in-0 zoom-in-95 duration-150"
      style={{ top: pos.top, left: pos.left, transform: "translateX(-50%)" }}
    >
      <button className="p-1.5 rounded hover:bg-background/20 transition-colors" title="Italic">
        <Italic className="w-3.5 h-3.5" />
      </button>
      <div className="w-px h-4 bg-background/20" />
      <button className="p-1.5 rounded hover:bg-background/20 transition-colors" title="Align left">
        <AlignLeft className="w-3.5 h-3.5" />
      </button>
      <button className="p-1.5 rounded hover:bg-background/20 transition-colors" title="Center">
        <AlignCenter className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function WritePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get("draft");
  const user = getCurrentUser();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [collectionId, setCollectionId] = useState<string>("");
  const [isPinned, setIsPinned] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // Load draft if editing
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!user.isPoet) {
      navigate("/feed");
      return;
    }
    if (draftId) {
      const draft = getDraft(user.id, draftId);
      if (draft) {
        setTitle(draft.title);
        setContent(draft.content);
        setCollectionId(draft.collectionId || "");
        setIsPinned(draft.isPinned);
        setLastSaved(new Date(draft.lastSaved));
      }
    }
  }, [user, navigate, draftId]);

  // Auto-resize title textarea
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = titleRef.current.scrollHeight + "px";
    }
  }, [title]);

  // Auto-resize content textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  // Autosave
  const autoSave = useCallback(() => {
    if (!user || !title.trim()) return;
    const draft = {
      id: draftId || `draft-${Date.now()}`,
      title,
      content,
      collectionId: collectionId || undefined,
      isPinned,
      lastSaved: new Date().toISOString(),
    };
    saveDraft(user.id, draft);
    setLastSaved(new Date());
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }, [user, title, content, collectionId, isPinned, draftId]);

  // Autosave every 10 seconds (more frequent for poet's peace of mind)
  useEffect(() => {
    if (!title.trim() && !content.trim()) return;
    const interval = setInterval(autoSave, 10000);
    return () => clearInterval(interval);
  }, [autoSave, title, content]);

  if (!user) return null;

  const handlePublish = () => {
    if (!title.trim()) {
      titleRef.current?.focus();
      return;
    }
    if (!content.trim()) {
      textareaRef.current?.focus();
      return;
    }
    setPublishing(true);
    const draft = {
      id: draftId || `poem-${Date.now()}`,
      title,
      content,
      collectionId: collectionId || undefined,
      isPinned,
      lastSaved: new Date().toISOString(),
    };
    const poem = publishPoem(user.id, user.name, user.avatar, draft);
    setTimeout(() => {
      setPublishing(false);
      navigate(`/poem/${poem.id}`);
    }, 600);
  };

  const wordCount = content.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const lineCount = content.split("\n").length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const userCollections = mockCollections.filter((c) => c.poetId === user.id);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ─── Top Bar ─── */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14 max-w-screen-xl mx-auto">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/poet/${user.id}`)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>

            <div className="w-px h-5 bg-border/60 hidden sm:block" />

            <span className="text-sm text-muted-foreground hidden sm:inline font-serif">
              {draftId ? "Editing Draft" : "New Poem"}
            </span>
          </div>

          {/* Center — save status */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {justSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary font-medium">Draft saved</span>
              </>
            ) : lastSaved ? (
              <>
                <Clock className="w-3 h-3" />
                <span className="hidden sm:inline">
                  Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="sm:hidden">Saved</span>
              </>
            ) : title.trim() || content.trim() ? (
              <span className="text-muted-foreground/60">Unsaved</span>
            ) : null}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{showPreview ? "Edit" : "Preview"}</span>
            </Button>

            <Button
              size="sm"
              className="h-8 text-xs gap-1.5 px-4"
              onClick={handlePublish}
              disabled={publishing || (!title.trim() && !content.trim())}
            >
              <Send className="w-3.5 h-3.5" />
              {publishing ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Main Writing Area ─── */}
      <div className="flex-1 flex">
        <main className="flex-1 flex justify-center overflow-y-auto">
          <div className="w-full max-w-2xl px-6 sm:px-8 py-10 sm:py-16">
            {!showPreview ? (
              <>
                {/* Title */}
                <textarea
                  ref={titleRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your poem a title..."
                  rows={1}
                  className="w-full font-serif text-3xl sm:text-4xl font-bold text-foreground bg-transparent border-0 outline-none resize-none placeholder:text-muted-foreground/30 leading-tight"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      textareaRef.current?.focus();
                    }
                  }}
                />

                {/* Thin separator */}
                <div className="w-12 h-px bg-border/60 my-6 sm:my-8" />

                {/* Content */}
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={"Start writing... press Enter for a new line."}
                  rows={12}
                  className="w-full font-serif text-lg sm:text-xl text-foreground/90 bg-transparent border-0 outline-none resize-none leading-relaxed placeholder:text-muted-foreground/25 min-h-[50vh]"
                />

                <FloatingToolbar textareaRef={textareaRef} />

                {/* Bottom stats — subtle, out of the way */}
                <div className="pt-10 mt-8 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground/50">
                  <div className="flex items-center gap-4">
                    <span>{lineCount} {lineCount === 1 ? "line" : "lines"}</span>
                    <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
                  </div>
                  <span>~{readTime} min read</span>
                </div>
              </>
            ) : (
              /* ─── Preview Mode ─── */
              <div className="animate-in fade-in-0 duration-200">
                <div className="mb-4">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground/40 font-medium">
                    Preview
                  </span>
                </div>

                <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground leading-tight text-balance mb-8">
                  {title || "Untitled Poem"}
                </h1>

                {isPinned && (
                  <div className="flex items-center gap-2 text-xs text-primary/70 mb-6">
                    <Pin className="w-3 h-3" />
                    <span>Pinned to your profile</span>
                  </div>
                )}

                <pre className="font-serif text-lg sm:text-xl leading-relaxed whitespace-pre-wrap text-foreground/85">
                  {content || "Your poem will appear here..."}
                </pre>

                <div className="mt-16 pt-8 border-t border-border/40 flex items-center justify-between text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">WordStack</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground/50">
                    <p>{lineCount} lines / {wordCount} words</p>
                    <p>~{readTime} min read</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ─── Sidebar (Collapsible) ─── */}
        {showSidebar && (
          <aside className="w-72 border-l border-border/40 bg-card/50 p-6 hidden lg:block animate-in slide-in-from-right-4 duration-200 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-foreground">Settings</h3>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Collection */}
            <div className="mb-6">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                Collection
              </label>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                <option value="">None</option>
                {userCollections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
              {userCollections.length === 0 && (
                <p className="text-[11px] text-muted-foreground/50 mt-1.5">
                  You can create collections from your profile.
                </p>
              )}
            </div>

            {/* Pin */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={isPinned}
                  onCheckedChange={(checked) => setIsPinned(!!checked)}
                />
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    Pin to profile
                  </p>
                  <p className="text-[11px] text-muted-foreground/50">
                    Shows at the top of your page
                  </p>
                </div>
              </label>
            </div>

            {/* Visibility */}
            <div className="mb-6">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                Visibility
              </label>
              <div className="px-3 py-2.5 rounded-md bg-accent/30 text-sm text-foreground/80">
                Public
              </div>
              <p className="text-[11px] text-muted-foreground/50 mt-1.5">
                Drafts stay private until you publish.
              </p>
            </div>

            {/* Session stats */}
            <div className="pt-5 border-t border-border/30">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Session
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground/70">
                  <span>Lines</span>
                  <span className="font-medium text-foreground/80">{lineCount}</span>
                </div>
                <div className="flex justify-between text-muted-foreground/70">
                  <span>Words</span>
                  <span className="font-medium text-foreground/80">{wordCount}</span>
                </div>
                <div className="flex justify-between text-muted-foreground/70">
                  <span>Read time</span>
                  <span className="font-medium text-foreground/80">~{readTime} min</span>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* ─── Sidebar toggle (desktop) ─── */}
      {!showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-20 hidden lg:flex items-center gap-1 px-2 py-6 bg-card border border-r-0 border-border/40 rounded-l-lg text-muted-foreground/50 hover:text-foreground hover:bg-accent/30 transition-all group"
          title="Open settings"
        >
          <ChevronRight className="w-4 h-4 rotate-180 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* ─── Mobile bottom bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/90 backdrop-blur-sm border-t border-border/40 px-4 py-2.5 flex items-center justify-between sm:hidden">
        <div className="flex items-center gap-3 text-xs text-muted-foreground/50">
          <span>{lineCount}L</span>
          <span>{wordCount}W</span>
          <span>~{readTime}m</span>
        </div>
        <div className="flex items-center gap-2">
          {justSaved && (
            <span className="text-xs text-primary flex items-center gap-1">
              <Check className="w-3 h-3" />
            </span>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-[11px]"
            onClick={autoSave}
          >
            Save
          </Button>
          <Button
            size="sm"
            className="h-7 text-[11px] px-3"
            onClick={handlePublish}
            disabled={publishing || (!title.trim() && !content.trim())}
          >
            <Send className="w-3 h-3 mr-1" />
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
