import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { getCurrentUser } from "@/lib/auth";
import { saveDraft, getDraft, publishPoem } from "@/lib/storage";
import { mockCollections } from "@/lib/mockData";
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Eye, 
  FileText,
  Pin,
  Clock,
  Type,
  Sparkles
} from "lucide-react";

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
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [publishing, setPublishing] = useState(false);

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

  // Autosave functionality
  const autoSave = useCallback(() => {
    if (!user || !title.trim()) return;

    const draft = {
      id: draftId || `draft-${Date.now()}`,
      title,
      content,
      collectionId: collectionId || undefined,
      isPinned,
      lastSaved: new Date().toISOString()
    };

    saveDraft(user.id, draft);
    setLastSaved(new Date());
    console.log("Draft autosaved:", draft.id);
  }, [user, title, content, collectionId, isPinned, draftId]);

  // Autosave every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      autoSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoSave]);

  if (!user) return null;

  const handleSaveDraft = () => {
    autoSave();
    alert("Draft saved!");
  };

  const handlePublish = () => {
    if (!title.trim()) {
      alert("Please add a title");
      return;
    }
    if (!content.trim()) {
      alert("Please write your poem");
      return;
    }

    setPublishing(true);

    const draft = {
      id: draftId || `poem-${Date.now()}`,
      title,
      content,
      collectionId: collectionId || undefined,
      isPinned,
      lastSaved: new Date().toISOString()
    };

    const poem = publishPoem(user.id, user.name, user.avatar, draft);
    
    setTimeout(() => {
      setPublishing(false);
      navigate(`/poem/${poem.id}`);
    }, 800);
  };

  const userCollections = mockCollections.filter(c => c.poetId === user.id);
  
  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
  const charCount = content.length;
  const lineCount = content.split('\n').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/poet/${user.id}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            
            {lastSaved && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Last saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? "Edit" : "Preview"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={publishing}
            >
              <Send className="w-4 h-4 mr-2" />
              {publishing ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {!showPreview ? (
          /* Edit Mode */
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-8">
                <div className="space-y-6">
                  {/* Title Input */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <FileText className="w-4 h-4" />
                      Poem Title
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Untitled Poem"
                      className="text-2xl font-serif font-bold border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                    />
                  </div>

                  {/* Content Textarea */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <Type className="w-4 h-4" />
                      Your Poem
                    </label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your poem here...

Press Enter for line breaks.
Double Enter for stanzas.

Let your words flow."
                      rows={20}
                      className="font-serif text-lg leading-relaxed resize-none"
                    />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t border-border">
                    <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
                    <span>·</span>
                    <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
                    <span>·</span>
                    <span>{charCount} {charCount === 1 ? 'character' : 'characters'}</span>
                  </div>
                </div>
              </Card>

              {/* Formatting Tips */}
              <Card className="p-4 bg-accent/20 border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <strong>Formatting Tips:</strong> Use line breaks to structure your poem. 
                  Spaces and indentation are preserved. Your poem will appear exactly as you write it.
                </p>
              </Card>
            </div>

            {/* Settings Sidebar */}
            <div className="space-y-6">
              {/* Collection Selector */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Organization
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Collection
                    </label>
                    <select
                      value={collectionId}
                      onChange={(e) => setCollectionId(e.target.value)}
                      className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                    >
                      <option value="">No collection</option>
                      {userCollections.map(col => (
                        <option key={col.id} value={col.id}>
                          {col.name}
                        </option>
                      ))}
                    </select>
                    {userCollections.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Create collections to organize your poems
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 border border-border rounded hover:bg-accent/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <Pin className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Pin to top</p>
                        <p className="text-xs text-muted-foreground">
                          Featured on your page
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      checked={isPinned}
                      onCheckedChange={(checked) => setIsPinned(!!checked)}
                    />
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={handleSaveDraft}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setShowPreview(true)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Poem
                  </Button>
                </div>
              </Card>

              {/* Writing Stats */}
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
                <h3 className="font-semibold mb-3 text-sm">Writing Session</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lines:</span>
                    <span className="font-medium">{lineCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Words:</span>
                    <span className="font-medium">{wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Characters:</span>
                    <span className="font-medium">{charCount}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <div className="max-w-3xl mx-auto">
            <Card className="p-12">
              <h1 className="font-serif text-5xl font-bold mb-8 text-foreground">
                {title || "Untitled Poem"}
              </h1>
              
              {isPinned && (
                <div className="flex items-center gap-2 text-sm text-primary mb-6">
                  <Pin className="w-4 h-4" />
                  <span>Pinned as featured poem</span>
                </div>
              )}

              <div className="prose prose-lg max-w-none">
                <pre className="font-serif text-lg leading-relaxed whitespace-pre-wrap text-foreground/90">
                  {content || "Your poem will appear here..."}
                </pre>
              </div>

              <div className="mt-12 pt-8 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p>WordStack Poet</p>
                </div>
                <div className="text-right">
                  <p>{lineCount} lines · {wordCount} words</p>
                  <p>{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </Card>

            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
              >
                Continue Editing
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
