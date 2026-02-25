import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/lib/auth";
import { mockPoems } from "@/lib/mockData";
import {
  getDrafts,
  deleteDraft,
  getPublishedPoems,
  deletePublishedPoem,
  getUserInkBalance,
  boostPoem,
  isPoemBoosted,
  getBoostCost,
} from "@/lib/storage";
import { Poem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  Users,
  Feather,
  Edit,
  Trash2,
  Zap,
  Sparkles,
  PenLine,
  ArrowLeft,
} from "lucide-react";

export default function PoetDashboard() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "draft" | "published";
    id: string;
    title: string;
  } | null>(null);

  // Boost confirmation state
  const [boostTarget, setBoostTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Toast-like feedback
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showFeedback = useCallback(
    (message: string, type: "success" | "error") => {
      setFeedback({ message, type });
      setTimeout(() => setFeedback(null), 3000);
    },
    []
  );

  if (!user || !user.isPoet) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Feather className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Poets Only</h2>
            <p className="text-muted-foreground mb-6">
              You need a poet account to access the dashboard.
            </p>
            <Button onClick={() => navigate("/become-poet")}>
              Become a Poet
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Gather data
  const drafts = getDrafts(user.id);
  const userPublishedPoems = getPublishedPoems().filter(
    (p) => p.poetId === user.id
  );
  const userMockPoems = mockPoems.filter((p) => p.poetId === user.id);
  // Merge, dedup by id
  const publishedMap = new Map<string, Poem>();
  [...userMockPoems, ...userPublishedPoems].forEach((p) =>
    publishedMap.set(p.id, p)
  );
  const allPublished = Array.from(publishedMap.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalPoems = allPublished.length;
  const totalDrafts = drafts.length;
  const followersCount = user.followersCount ?? 0;
  const inkBalance = getUserInkBalance(user.id);
  const boostCost = getBoostCost();

  // Handlers
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "draft") {
      deleteDraft(user.id, deleteTarget.id);
      showFeedback("Draft deleted.", "success");
    } else {
      const success = deletePublishedPoem(deleteTarget.id);
      showFeedback(
        success ? "Poem deleted." : "Could not delete poem.",
        success ? "success" : "error"
      );
    }
    setDeleteTarget(null);
    setRefreshKey((k) => k + 1);
  };

  const handleBoostConfirm = () => {
    if (!boostTarget) return;
    if (inkBalance < boostCost) {
      showFeedback("Not enough Ink to boost.", "error");
      setBoostTarget(null);
      return;
    }
    const success = boostPoem(user.id, boostTarget.id);
    showFeedback(
      success
        ? "Poem boosted to Spotlight for 24 hours!"
        : "Could not boost poem. Check your Ink balance.",
      success ? "success" : "error"
    );
    setBoostTarget(null);
    setRefreshKey((k) => k + 1);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main
      key={refreshKey}
      className="min-h-screen bg-background pb-24 md:pb-8"
    >
      {/* Feedback toast */}
      {feedback && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            feedback.type === "success"
              ? "bg-primary text-primary-foreground"
              : "bg-destructive text-destructive-foreground"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Welcome Area */}
        <section className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-snug">
            Welcome back, {user.name}.
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Your creative workspace at a glance.
          </p>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-3 gap-3 mb-10">
          <StatCard
            icon={<Feather className="w-5 h-5" />}
            label="Poems"
            value={totalPoems}
          />
          <StatCard
            icon={<FileText className="w-5 h-5" />}
            label="Drafts"
            value={totalDrafts}
          />
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Followers"
            value={followersCount}
          />
        </section>

        {/* Followers section */}
        <Card className="mb-10">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {followersCount}{" "}
                {followersCount === 1 ? "person follows" : "people follow"} your
                work
              </p>
              <p className="text-sm text-muted-foreground">
                Keep writing to grow your audience.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs: Drafts & Published */}
        <Tabs defaultValue="drafts" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="drafts" className="gap-1.5">
              <FileText className="w-4 h-4" />
              Drafts ({totalDrafts})
            </TabsTrigger>
            <TabsTrigger value="published" className="gap-1.5">
              <Feather className="w-4 h-4" />
              Published ({totalPoems})
            </TabsTrigger>
          </TabsList>

          {/* Drafts Tab */}
          <TabsContent value="drafts">
            {drafts.length === 0 ? (
              <EmptyState
                icon={<PenLine className="w-10 h-10" />}
                title="No drafts yet"
                description="Start writing your next poem."
                actionLabel="Write a Poem"
                onAction={() => navigate("/write")}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {drafts.map((draft) => (
                  <Card key={draft.id} className="group">
                    <CardContent className="p-4 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {draft.title || "Untitled Draft"}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Last saved {formatDate(draft.lastSaved)}
                        </p>
                        {draft.content && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 whitespace-pre-line">
                            {draft.content}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            navigate(`/write?draft=${draft.id}`)
                          }
                          title="Edit draft"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() =>
                            setDeleteTarget({
                              type: "draft",
                              id: draft.id,
                              title: draft.title || "Untitled Draft",
                            })
                          }
                          title="Delete draft"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Published Tab */}
          <TabsContent value="published">
            {allPublished.length === 0 ? (
              <EmptyState
                icon={<Feather className="w-10 h-10" />}
                title="No published poems yet"
                description="Publish your first poem to the world."
                actionLabel="Write a Poem"
                onAction={() => navigate("/write")}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {allPublished.map((poem) => {
                  const boosted = isPoemBoosted(poem.id);
                  const isMock = mockPoems.some((m) => m.id === poem.id);

                  return (
                    <Card key={poem.id} className="group">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground truncate">
                                {poem.title}
                              </h3>
                              {boosted && (
                                <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                  <Sparkles className="w-3 h-3" />
                                  Boosted
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {formatDate(poem.createdAt)}
                              {" \u00B7 "}
                              {poem.clapsCount}{" "}
                              {poem.clapsCount === 1 ? "clap" : "claps"}
                              {" \u00B7 "}
                              {poem.commentsCount}{" "}
                              {poem.commentsCount === 1
                                ? "comment"
                                : "comments"}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 whitespace-pre-line">
                              {poem.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {!isMock && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    navigate(`/write?draft=${poem.id}`)
                                  }
                                  title="Edit poem"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: "published",
                                      id: poem.id,
                                      title: poem.title,
                                    })
                                  }
                                  title="Delete poem"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {!boosted && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary hover:text-primary"
                                onClick={() =>
                                  setBoostTarget({
                                    id: poem.id,
                                    title: poem.title,
                                  })
                                }
                                title="Boost with Ink"
                              >
                                <Zap className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteTarget?.type === "draft" ? "Draft" : "Poem"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}
              &rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Boost Confirmation Dialog */}
      <AlertDialog
        open={!!boostTarget}
        onOpenChange={() => setBoostTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Boost to Spotlight?</AlertDialogTitle>
            <AlertDialogDescription>
              Boosting &ldquo;{boostTarget?.title}&rdquo; will cost{" "}
              <span className="font-semibold text-foreground">
                {boostCost} Ink
              </span>{" "}
              and feature it in the Spotlight for 24 hours. You currently have{" "}
              <span className="font-semibold text-foreground">
                {inkBalance} Ink
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBoostConfirm}
              disabled={inkBalance < boostCost}
            >
              <Zap className="w-4 h-4 mr-1.5" />
              Boost for {boostCost} Ink
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

/* --- Sub-components --- */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
        <div className="text-primary">{icon}</div>
        <span className="text-2xl font-bold text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-muted-foreground mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-1 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      <Button onClick={onAction}>{actionLabel}</Button>
    </div>
  );
}
