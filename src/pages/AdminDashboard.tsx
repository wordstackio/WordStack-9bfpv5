import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  UserX
} from "lucide-react";
import { mockPoets, mockPoems } from "@/lib/mockData";
import { getCommunityPosts } from "@/lib/storage";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "content" | "settings">("overview");

  useEffect(() => {
    if (!user) {
      navigate("/wsadmin", { replace: true });
      return;
    }

    if (!user.isAdmin) {
      navigate("/feed", { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  const totalUsers = mockPoets.length + 50; // Mock total users
  const totalPoets = mockPoets.length;
  const totalPoems = mockPoems.length;
  const totalPosts = getCommunityPosts().length;

  const handleLogout = async () => {
    localStorage.removeItem("wordstack_admin_viewing_site");
    await logout();
    navigate("/wsadmin", { replace: true });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
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
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className="flex-shrink-0"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
            className="flex-shrink-0"
          >
            <Users className="w-4 h-4 mr-2" />
            Users & Poets
          </Button>
          <Button
            variant={activeTab === "content" ? "default" : "outline"}
            onClick={() => setActiveTab("content")}
            className="flex-shrink-0"
          >
            <FileText className="w-4 h-4 mr-2" />
            Content
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "outline"}
            onClick={() => setActiveTab("settings")}
            className="flex-shrink-0"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
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
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Feather className="w-5 h-5 text-purple-600" />
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
                  <span className="text-sm font-medium text-gray-600">Community Posts</span>
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{totalPosts}</p>
                <p className="text-xs text-gray-500">Active discussions</p>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
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
                    <p className="text-xs text-gray-500">"Morning Dew on Cedar" by Elena Rivera</p>
                  </div>
                  <span className="text-xs text-gray-400">15m ago</span>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
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
                  <Users className="w-5 h-5 text-purple-600" />
                  All Poets
                </h3>
                <Button size="sm" variant="outline">
                  Export List
                </Button>
              </div>
              <div className="space-y-3">
                {mockPoets.map((poet) => (
                  <div key={poet.id} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <img
                      src={poet.avatar}
                      alt={poet.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
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
                  <FileText className="w-5 h-5 text-purple-600" />
                  All Poems
                </h3>
                <Button size="sm" variant="outline">
                  Moderate Content
                </Button>
              </div>
              <div className="space-y-3">
                {mockPoems.map((poem) => (
                  <div key={poem.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 mb-1">{poem.title}</p>
                      <p className="text-sm text-gray-500">by {poem.poetName}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>👏 {poem.clapsCount} claps</span>
                        <span>💬 {poem.commentsCount} comments</span>
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
                <MessageCircle className="w-5 h-5 text-purple-600" />
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
                          <span>👏 {post.clapsCount}</span>
                          <span>💬 {post.commentsCount}</span>
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

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
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
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Blog Posts</p>
                    <p className="text-sm text-gray-500">Manage admin blog content</p>
                  </div>
                  <Button size="sm">Manage</Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
