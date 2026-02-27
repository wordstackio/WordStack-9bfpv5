import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { getCurrentUser, deleteAccount, logout, DEV_MODE } from "@/lib/auth";
import { getPublishedPoems } from "@/lib/storage";
import { mockPoems, mockPoets } from "@/lib/mockData";
import { Poem } from "@/types";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";
import { ArrowLeft, Download, FileText, FileJson, BookOpen, Trash2, AlertTriangle, Moon, Sun } from "lucide-react";

type ExportFormat = "txt" | "json";

export default function Settings() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { theme, toggleTheme } = useTheme();
  const [exportFormat, setExportFormat] = useState<ExportFormat>("txt");
  const [exported, setExported] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  const allPoems = useMemo(() => {
    if (!user) return [];
    // Combine mock poems + localStorage published poems, deduplicate by id
    const storedPoems = getPublishedPoems();
    const combined = [...mockPoems, ...storedPoems];
    const seen = new Set<string>();
    const unique: Poem[] = [];
    for (const poem of combined) {
      if (poem.poetId === user.id && !seen.has(poem.id)) {
        seen.add(poem.id);
        unique.push(poem);
      }
    }
    // Sort by date, newest first
    unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return unique;
  }, [user]);

  if (!user) return null;

  const poet = mockPoets.find((p) => p.id === user.id);
  const poetName = poet?.name ?? user.name;

  const generateTextExport = (): string => {
    const lines: string[] = [];
    lines.push(`=== ${poetName}'s Poems ===`);
    lines.push(`Exported on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`);
    lines.push(`Total poems: ${allPoems.length}`);
    lines.push("");

    for (const poem of allPoems) {
      lines.push("---");
      lines.push(`Title: ${poem.title}`);
      lines.push(`Date: ${new Date(poem.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`);
      lines.push("");
      lines.push(poem.content);
      lines.push("");
    }

    lines.push("---");
    lines.push("Exported from WordStack");
    return lines.join("\n");
  };

  const generateJsonExport = (): string => {
    const data = {
      poet: poetName,
      exportedAt: new Date().toISOString(),
      totalPoems: allPoems.length,
      poems: allPoems.map((poem) => ({
        title: poem.title,
        content: poem.content,
        createdAt: poem.createdAt,
        clapsCount: poem.clapsCount,
        commentsCount: poem.commentsCount,
        isPinned: poem.isPinned ?? false,
      })),
    };
    return JSON.stringify(data, null, 2);
  };

  const handleExport = () => {
    if (allPoems.length === 0) return;

    const content = exportFormat === "txt" ? generateTextExport() : generateJsonExport();
    const mimeType = exportFormat === "txt" ? "text/plain" : "application/json";
    const extension = exportFormat;
    const filename = `${poetName.toLowerCase().replace(/\s+/g, "-")}-poems.${extension}`;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setIsDeleting(true);

    try {
      if (DEV_MODE) {
        // In dev mode just clear local session
        await logout();
      } else {
        const result = await deleteAccount();
        if (!result.success) {
          console.error("Delete account failed:", result.error);
          setIsDeleting(false);
          return;
        }
      }
      // Clear all local storage data for this user
      localStorage.clear();
      navigate("/login");
    } catch (err) {
      console.error("Delete account error:", err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 pb-24">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account and export your work
          </p>
        </div>

        <div className="space-y-6">
          {/* Appearance Section */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              {theme === "dark" ? (
                <Moon className="w-6 h-6 text-primary" />
              ) : (
                <Sun className="w-6 h-6 text-primary" />
              )}
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">Appearance</h2>
                <p className="text-sm text-muted-foreground">
                  Customize how WordStack looks on your device
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-background border border-border">
                  <Moon className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Dark mode</p>
                  <p className="text-xs text-muted-foreground">
                    {theme === "dark" ? "On - easier on the eyes at night" : "Off - using light theme"}
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                aria-label="Toggle dark mode"
              />
            </div>
          </Card>

          {/* Export Data Section */}
          {user.isPoet && (
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Download className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground">Export Data</h2>
                  <p className="text-sm text-muted-foreground">
                    Download all of your poems as a single file
                  </p>
                </div>
              </div>

              {/* Poem count summary */}
              <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-muted/40">
                <BookOpen className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Poems available for export</p>
                  <p className="text-2xl font-bold text-foreground">{allPoems.length}</p>
                </div>
              </div>

              {allPoems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You have no poems to export yet. Start writing to build your collection.
                </p>
              ) : (
                <>
                  {/* Format selection */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-foreground mb-3">Export format</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setExportFormat("txt")}
                        className={`flex items-center gap-3 p-4 rounded-lg border transition-all text-left ${
                          exportFormat === "txt"
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <FileText className={`w-5 h-5 flex-shrink-0 ${exportFormat === "txt" ? "text-primary" : "text-muted-foreground"}`} />
                        <div>
                          <p className={`font-medium text-sm ${exportFormat === "txt" ? "text-primary" : "text-foreground"}`}>
                            Plain Text
                          </p>
                          <p className="text-xs text-muted-foreground">.txt - Human readable</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setExportFormat("json")}
                        className={`flex items-center gap-3 p-4 rounded-lg border transition-all text-left ${
                          exportFormat === "json"
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <FileJson className={`w-5 h-5 flex-shrink-0 ${exportFormat === "json" ? "text-primary" : "text-muted-foreground"}`} />
                        <div>
                          <p className={`font-medium text-sm ${exportFormat === "json" ? "text-primary" : "text-foreground"}`}>
                            JSON
                          </p>
                          <p className="text-xs text-muted-foreground">.json - Structured data</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mb-6 p-4 rounded-lg border border-border bg-muted/20">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Preview</p>
                    {exportFormat === "txt" ? (
                      <pre className="text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap">
{`=== ${poetName}'s Poems ===
Exported on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
Total poems: ${allPoems.length}

---
Title: ${allPoems[0]?.title ?? ""}
Date: ${allPoems[0] ? new Date(allPoems[0].createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}

${allPoems[0]?.content?.split("\n").slice(0, 3).join("\n") ?? ""}
...`}
                      </pre>
                    ) : (
                      <pre className="text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap">
{`{
  "poet": "${poetName}",
  "totalPoems": ${allPoems.length},
  "poems": [
    {
      "title": "${allPoems[0]?.title ?? ""}",
      "content": "...",
      "createdAt": "${allPoems[0]?.createdAt ?? ""}"
    }
    ...
  ]
}`}
                      </pre>
                    )}
                  </div>

                  {/* Export button */}
                  <Button size="lg" onClick={handleExport} className="w-full gap-2">
                    <Download className="w-4 h-4" />
                    {exported ? "Downloaded!" : `Export ${allPoems.length} ${allPoems.length === 1 ? "Poem" : "Poems"} as .${exportFormat}`}
                  </Button>
                </>
              )}
            </Card>
          )}

          {/* Non-poet message */}
          {!user.isPoet && (
            <Card className="p-8 text-center">
              <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-serif text-xl font-bold text-foreground mb-2">No export data available</h2>
              <p className="text-sm text-muted-foreground">
                The export feature is available for poets. Start writing to unlock this feature.
              </p>
            </Card>
          )}

          {/* Delete Account Section */}
          <Card className="p-8 border-destructive/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">Delete Account</h2>
                <p className="text-sm text-muted-foreground">
                  Permanently remove your account and all associated data
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 mb-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="text-sm text-foreground">
                  <p className="font-medium mb-1">This action is irreversible</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>All your poems and drafts will be permanently deleted</li>
                    <li>Your profile, collections, and comments will be removed</li>
                    <li>Any ink balance and transaction history will be lost</li>
                    <li>You will not be able to recover your account</li>
                  </ul>
                </div>
              </div>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
              setDeleteDialogOpen(open);
              if (!open) setDeleteConfirmText("");
            }}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account, all your poems,
                    drafts, collections, and any other data associated with your
                    account. This action cannot be undone.
                  </AlertDialogDescription>
                  <div className="mt-3">
                    <p className="text-sm font-medium text-foreground mb-2">
                      Type <span className="font-mono font-bold text-destructive">DELETE</span> to confirm
                    </p>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type DELETE to confirm"
                      className="font-mono"
                      autoComplete="off"
                    />
                  </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteAccount();
                    }}
                    disabled={deleteConfirmText !== "DELETE" || isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete Account Permanently"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Card>
        </div>
      </div>
    </div>
  );
}
