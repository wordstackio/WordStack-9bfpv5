import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser, logout } from "@/lib/auth";
import { 
  Users, 
  Feather, 
  MessageCircle, 
  TrendingUp,
  Settings,
  FileText,
  Shield,
  LogOut,
  Eye,
  Trash2,
  UserX,
  BookOpen,
  Plus,
  ArrowLeft,
  Save,
  Send,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Search as SearchIcon,
  DoorOpen,
  X,
  Trophy
} from "lucide-react";
import { mockPoets, mockPoems, mockChallenges } from "@/lib/mockData";
import { getCommunityPosts, getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, getAccountDeletionRequests, dismissDeletionRequest } from "@/lib/storage";
import { BlogPost, AccountDeletionRequest } from "@/types";

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const EMPTY_FORM: Omit<BlogPost, "id" | "createdAt" | "updatedAt"> = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  coverImage: "",
  author: "WordStack Team",
  authorAvatar: undefined,
  publishedAt: new Date().toISOString(),
  status: "draft",
  showInCarousel: false,
  readTime: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  ogImage: "",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "content" | "blog" | "challenges" | "leaving" | "settings">("overview");

  // Blog management state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showSeo, setShowSeo] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletionRequests, setDeletionRequests] = useState<AccountDeletionRequest[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/wsadmin", { replace: true });
      return;
    }
    if (!user.isAdmin) {
      navigate("/feed", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    loadBlogPosts();
    setDeletionRequests(getAccountDeletionRequests());
  }, []);

  const loadBlogPosts = () => {
    setBlogPosts(getBlogPosts());
  };

  if (!user) return null;

  const totalUsers = mockPoets.length + 50;
  const totalPoets = mockPoets.length;
  const totalPoems = mockPoems.length;
  const totalPosts = getCommunityPosts().length;

  const handleLogout = async () => {
    localStorage.removeItem("wordstack_admin_viewing_site");
    await logout();
    navigate("/wsadmin", { replace: true });
    window.location.reload();
  };

  // Blog form helpers
  const handleFormChange = (field: string, value: string | boolean) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug from title if slug hasn't been manually edited
      if (field === "title" && !editingPost) {
        updated.slug = generateSlug(value as string);
      }
      // Auto-fill meta title from title if empty
      if (field === "title" && !updated.metaTitle) {
        updated.metaTitle = `${value} | WordStack Blog`;
      }
      return updated;
    });
  };

  const handleEstimateReadTime = () => {
    const words = form.content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    setForm(prev => ({ ...prev, readTime: `${minutes}m read` }));
  };

  const openCreateForm = () => {
    setEditingPost(null);
    setForm({ ...EMPTY_FORM });
    setIsCreating(true);
    setShowSeo(false);
  };

  const openEditForm = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      coverImage: post.coverImage,
      author: post.author,
      authorAvatar: post.authorAvatar,
      publishedAt: post.publishedAt,
      status: post.status,
      showInCarousel: post.showInCarousel,
      readTime: post.readTime,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      metaKeywords: post.metaKeywords,
      ogImage: post.ogImage,
    });
    setIsCreating(true);
    setShowSeo(false);
  };

  const handleSave = (publish?: boolean) => {
    if (!form.title.trim()) return alert("Title is required");
    if (!form.content.trim()) return alert("Content is required");

    const status = publish ? "published" : form.status;
    const publishedAt = publish && form.status !== "published" ? new Date().toISOString() : form.publishedAt;

    if (editingPost) {
      updateBlogPost(editingPost.id, { ...form, status, publishedAt });
    } else {
      createBlogPost({ ...form, status, publishedAt });
    }

    setIsCreating(false);
    setEditingPost(null);
    loadBlogPosts();
  };

  const handleDelete = (id: string) => {
    deleteBlogPost(id);
    setDeleteConfirm(null);
    loadBlogPosts();
  };

  const handleToggleCarousel = (post: BlogPost) => {
    updateBlogPost(post.id, { showInCarousel: !post.showInCarousel });
    loadBlogPosts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">WordStack Platform Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => {
                localStorage.setItem("wordstack_admin_viewing_site", "true");
                navigate("/");
              }}>
                <Eye className="w-4 h-4 mr-2" />
                View Site
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {([
            { key: "overview", label: "Overview", icon: TrendingUp },
            { key: "users", label: "Users & Poets", icon: Users },
            { key: "content", label: "Content", icon: FileText },
            { key: "challenges", label: "Challenges", icon: Trophy },
            { key: "blog", label: "Blog", icon: BookOpen },
            { key: "leaving", label: "Leaving WordStack", icon: DoorOpen },
            { key: "settings", label: "Settings", icon: Settings },
          ] as const).map(tab => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              onClick={() => { setActiveTab(tab.key); setIsCreating(false); }}
              className="flex-shrink-0"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">Total Users</span>
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{totalUsers}</p>
                <p className="text-xs text-green-600 font-medium">+12% this month</p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">Active Poets</span>
                  <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Feather className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{totalPoets}</p>
                <p className="text-xs text-green-600 font-medium">+5 new poets</p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">Published Poems</span>
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{totalPoems}</p>
                <p className="text-xs text-gray-500">Across all poets</p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">Blog Posts</span>
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{blogPosts.filter(p => p.status === "published").length}</p>
                <p className="text-xs text-gray-500">{blogPosts.filter(p => p.status === "draft").length} drafts</p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-700" />
                Recent Platform Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New poet joined</p>
                    <p className="text-xs text-gray-500">Elena Rivera created an account</p>
                  </div>
                  <span className="text-xs text-gray-400">2m ago</span>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Poem published</p>
                    <p className="text-xs text-gray-500">{"\"Morning Dew on Cedar\" by Elena Rivera"}</p>
                  </div>
                  <span className="text-xs text-gray-400">15m ago</span>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Community post</p>
                    <p className="text-xs text-gray-500">Marcus Chen shared an update</p>
                  </div>
                  <span className="text-xs text-gray-400">1h ago</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-700" />
                  All Poets
                </h3>
                <Button size="sm" variant="outline">Export List</Button>
              </div>
              <div className="space-y-3">
                {mockPoets.map((poet) => (
                  <div key={poet.id} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <img src={poet.avatar} alt={poet.name} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{poet.name}</p>
                      <p className="text-sm text-gray-500 truncate">{poet.bio}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span>{poet.followersCount} followers</span>
                        <span>{poet.totalPoems} poems</span>
                        <span>{poet.totalInk} ink earned</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/poet/${poet.id}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <UserX className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-700" />
                  All Poems
                </h3>
                <Button size="sm" variant="outline">Moderate Content</Button>
              </div>
              <div className="space-y-3">
                {mockPoems.map((poem) => (
                  <div key={poem.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 mb-1">{poem.title}</p>
                      <p className="text-sm text-gray-500">by {poem.poetName}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{poem.clapsCount} claps</span>
                        <span>{poem.commentsCount} comments</span>
                        <span>{new Date(poem.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/poem/${poem.id}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-gray-700" />
                Community Posts
              </h3>
              <div className="space-y-3">
                {getCommunityPosts().slice(0, 5).map((post) => (
                  <div key={post.id} className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">{post.poetName}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>{post.clapsCount} claps</span>
                          <span>{post.commentsCount} comments</span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Blog Tab */}
        {activeTab === "blog" && (
          <div className="space-y-6">
            {!isCreating ? (
              <>
                {/* Blog list view */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-gray-700" />
                      Blog Posts
                      <span className="text-sm font-normal text-gray-500">({blogPosts.length})</span>
                    </h3>
                    <Button size="sm" onClick={openCreateForm}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Post
                    </Button>
                  </div>

                  {blogPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No blog posts yet.</p>
                      <Button onClick={openCreateForm}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Post
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {blogPosts.map(post => (
                        <div key={post.id} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          {/* Thumbnail */}
                          {post.coverImage && (
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          {!post.coverImage && (
                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-6 h-6 text-gray-400" />
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900 truncate">{post.title}</p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                                post.status === "published"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}>
                                {post.status}
                              </span>
                              {post.showInCarousel && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 flex-shrink-0">
                                  Carousel
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">{post.excerpt || "No excerpt"}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                              <span>{post.category || "Uncategorized"}</span>
                              <span>{post.readTime || "---"}</span>
                              <span>{post.author}</span>
                              <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant={post.showInCarousel ? "default" : "outline"}
                              className="text-xs"
                              onClick={() => handleToggleCarousel(post)}
                              title={post.showInCarousel ? "Remove from carousel" : "Add to carousel"}
                            >
                              {post.showInCarousel ? "In Carousel" : "Add to Carousel"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => openEditForm(post)}>
                              Edit
                            </Button>
                            {post.status === "published" && (
                              <Button size="sm" variant="outline" onClick={() => window.open(`/blog/${post.slug}`, "_blank")}>
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                            {deleteConfirm === post.id ? (
                              <div className="flex gap-1">
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(post.id)}>
                                  Confirm
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)}>
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => setDeleteConfirm(post.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </>
            ) : (
              /* Blog create / edit form */
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => { setIsCreating(false); setEditingPost(null); }}>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="font-semibold text-lg">
                      {editingPost ? "Edit Blog Post" : "New Blog Post"}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    {editingPost?.status === "published" && (
                      <Button size="sm" variant="outline" onClick={() => window.open(`/blog/${form.slug || editingPost.slug}`, "_blank")}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleSave()}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button size="sm" onClick={() => handleSave(true)}>
                      <Send className="w-4 h-4 mr-2" />
                      Publish
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <Input
                      value={form.title}
                      onChange={e => handleFormChange("title", e.target.value)}
                      placeholder="Enter blog post title..."
                      className="text-lg font-serif"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">/blog/</span>
                      <Input
                        value={form.slug}
                        onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="auto-generated-slug"
                      />
                    </div>
                  </div>

                  {/* Category & Author */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <Input
                        value={form.category}
                        onChange={e => handleFormChange("category", e.target.value)}
                        placeholder="e.g. Platform Updates"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                      <Input
                        value={form.author}
                        onChange={e => handleFormChange("author", e.target.value)}
                        placeholder="Author name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Read Time</label>
                      <div className="flex gap-2">
                        <Input
                          value={form.readTime}
                          onChange={e => handleFormChange("readTime", e.target.value)}
                          placeholder="e.g. 4m read"
                        />
                        <Button variant="outline" size="sm" onClick={handleEstimateReadTime} title="Auto-estimate">
                          Auto
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                    <Input
                      value={form.coverImage}
                      onChange={e => handleFormChange("coverImage", e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                    />
                    {form.coverImage && (
                      <img src={form.coverImage} alt="Cover preview" className="mt-2 rounded-lg w-full max-h-48 object-cover" />
                    )}
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                    <Textarea
                      value={form.excerpt}
                      onChange={e => handleFormChange("excerpt", e.target.value)}
                      placeholder="A short summary shown on cards and previews..."
                      rows={2}
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content <span className="text-gray-400 font-normal">(Markdown supported: ## headings, **bold**, *italic*, - lists)</span>
                    </label>
                    <Textarea
                      value={form.content}
                      onChange={e => handleFormChange("content", e.target.value)}
                      placeholder="Write your blog post content here..."
                      rows={16}
                      className="font-mono text-sm"
                    />
                  </div>

                  {/* Options */}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.showInCarousel}
                        onChange={e => handleFormChange("showInCarousel", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">Show in Community Carousel</span>
                    </label>
                  </div>

                  {/* SEO Section */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setShowSeo(!showSeo)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <SearchIcon className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-sm text-gray-700">SEO Settings</span>
                      </div>
                      {showSeo ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </button>

                    {showSeo && (
                      <div className="p-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                          <Input
                            value={form.metaTitle}
                            onChange={e => handleFormChange("metaTitle", e.target.value)}
                            placeholder="Custom page title for search engines"
                          />
                          <p className="text-xs text-gray-400 mt-1">{form.metaTitle.length}/60 characters</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                          <Textarea
                            value={form.metaDescription}
                            onChange={e => handleFormChange("metaDescription", e.target.value)}
                            placeholder="Short description for search engine results..."
                            rows={2}
                          />
                          <p className="text-xs text-gray-400 mt-1">{form.metaDescription.length}/160 characters</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                          <Input
                            value={form.metaKeywords}
                            onChange={e => handleFormChange("metaKeywords", e.target.value)}
                            placeholder="poetry, writing, wordstack (comma separated)"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                          <Input
                            value={form.ogImage}
                            onChange={e => handleFormChange("ogImage", e.target.value)}
                            placeholder="Image shown when shared on social media (defaults to cover image)"
                          />
                        </div>

                        {/* SEO Preview */}
                        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">Search Preview</p>
                          <p className="text-blue-700 text-base font-medium truncate">
                            {form.metaTitle || form.title || "Blog Post Title"}
                          </p>
                          <p className="text-green-700 text-xs truncate">
                            wordstack.com/blog/{form.slug || "post-slug"}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {form.metaDescription || form.excerpt || "Blog post description will appear here..."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === "challenges" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gray-700" />
                  Manage Challenges
                </h3>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Challenge
                </Button>
              </div>
              
              <div className="space-y-4">
                {mockChallenges.map((challenge) => (
                  <div key={challenge.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    {/* Featured Image Thumbnail */}
                    {challenge.themeImage && (
                      <img
                        src={challenge.themeImage}
                        alt={challenge.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{challenge.title}</p>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            challenge.status === "active"
                              ? "bg-green-100 text-green-700"
                              : challenge.status === "closed"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {challenge.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1 mb-2">{challenge.theme}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{challenge.entries.length} entries</span>
                        <span>Ink Cost: {challenge.inkCost}</span>
                        <span>Prize Pool: {challenge.prizePool} Ink</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/challenge/${challenge.id}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Leaving WordStack Tab */}
        {activeTab === "leaving" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <DoorOpen className="w-5 h-5 text-gray-700" />
                  Account Deletion Requests
                  {deletionRequests.length > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {deletionRequests.length}
                    </span>
                  )}
                </h3>
              </div>

              {deletionRequests.length === 0 ? (
                <div className="text-center py-12">
                  <DoorOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-1">No deletion requests</p>
                  <p className="text-sm text-gray-400">
                    When poets delete their accounts, their feedback will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deletionRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-gray-900">
                              {req.userName}
                            </p>
                            <span className="text-xs text-gray-400">
                              {new Date(req.createdAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="bg-gray-50 border border-gray-100 rounded p-3 mb-2">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              Reason for leaving
                            </p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {req.reason}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400">
                            User ID: {req.userId}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                          onClick={() => {
                            dismissDeletionRequest(req.id);
                            setDeletionRequests(getAccountDeletionRequests());
                          }}
                          title="Dismiss"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-700" />
                Platform Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">User Registration</p>
                    <p className="text-sm text-gray-500">Allow new users to sign up</p>
                  </div>
                  <Button size="sm" variant="outline">Enabled</Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Content Moderation</p>
                    <p className="text-sm text-gray-500">Require approval for new poems</p>
                  </div>
                  <Button size="sm" variant="outline">Disabled</Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
