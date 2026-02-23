import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { getCurrentUser } from "@/lib/auth";
import { 
  getCommunityPosts, 
  createCommunityPost, 
  getFollows,
  clapPost,
  getPostClaps,
  canUseInk,
  getFreeInkUsage,
  getComments,
  createComment,
  clapComment,
  getCommentClaps,
  getUnreadNotificationsCount
} from "@/lib/storage";
import { CommunityPost, Comment } from "@/types";
import { Users, MessageCircle, Send, X, Feather, Clock, ChevronDown, ChevronLeft, ChevronRight, Reply, Bell } from "lucide-react";
import { mockPoets } from "@/lib/mockData";
import OutOfInkModal from "@/components/features/OutOfInkModal";

// Mock admin blog posts
const adminBlogPosts = [
  {
    id: "blog-1",
    category: "Platform Updates",
    title: "Introducing Collections: Organize Your Poetry Journey",
    readTime: "4m read",
    image: "/images/covers/writing-books.jpg",
    publishedAt: "2024-11-20"
  },
  {
    id: "blog-2",
    category: "Writing Tips",
    title: "Finding Your Voice: A Guide for New Poets",
    readTime: "6m read",
    image: "/images/covers/writing-desk.jpg",
    publishedAt: "2024-11-18"
  },
  {
    id: "blog-3",
    category: "Community",
    title: "November's Most Inked Poems: A Celebration",
    readTime: "3m read",
    image: "/images/covers/library-books.jpg",
    publishedAt: "2024-11-15"
  }
];

export default function Community() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = getCurrentUser();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [filter, setFilter] = useState<"all" | "following">("all");
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showOutOfInkModal, setShowOutOfInkModal] = useState(false);
  const [outOfInkInfo, setOutOfInkInfo] = useState<{ dailyUsed: number; monthlyUsed: number; timeUntilReset: string }>(
    { dailyUsed: 0, monthlyUsed: 0, timeUntilReset: "" }
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Check if compose param is set
    if (searchParams.get("compose") === "true") {
      setShowCompose(true);
      setSearchParams({});
    }

    loadPosts();
    loadNotifications();

    // Poll for new notifications every 10 seconds
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [user, navigate, searchParams]);

  const loadNotifications = () => {
    if (user) {
      setUnreadCount(getUnreadNotificationsCount(user.id));
    }
  };

  const loadPosts = () => {
    const allPosts = getCommunityPosts();
    setPosts(allPosts);
  };

  if (!user) return null;

  const followedPoetIds = getFollows();
  
  const filteredPosts = filter === "following"
    ? posts.filter(p => followedPoetIds.includes(p.poetId))
    : posts;

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      alert("Please write something");
      return;
    }

    if (newPostContent.length > 500) {
      alert("Updates must be under 500 characters");
      return;
    }

    createCommunityPost(user.id, user.name, user.avatar, newPostContent);
    setNewPostContent("");
    setShowCompose(false);
    loadPosts();
  };

  const handleClap = (postId: string) => {
    if (!user) return;
    
    const check = canUseInk(user.id);
    if (!check.canUse) {
      const usage = getFreeInkUsage(user.id);
      setOutOfInkInfo({
        dailyUsed: usage.dailyUsed,
        monthlyUsed: usage.monthlyUsed,
        timeUntilReset: check.timeUntilReset || "tomorrow"
      });
      setShowOutOfInkModal(true);
      return;
    }
    
    clapPost(user.id, postId);
    loadPosts();
  };

  const getPoetInfo = (poetId: string) => {
    return mockPoets.find(p => p.id === poetId);
  };

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? adminBlogPosts.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev === adminBlogPosts.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    
    if (diff > threshold) {
      handleNextSlide();
    } else if (diff < -threshold) {
      handlePrevSlide();
    }
  };

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
      setReplyingTo(null);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const handleCommentSubmit = (postId: string, parentCommentId?: string) => {
    const key = parentCommentId || postId;
    const content = commentInputs[key]?.trim();
    
    if (!content) return;

    createComment(postId, user.id, user.name, user.avatar, content, parentCommentId);
    setCommentInputs({ ...commentInputs, [key]: "" });
    setReplyingTo(null);
    loadPosts();
    loadNotifications();
  };

  const handleCommentClap = (commentId: string) => {
    if (!user) return;
    
    const check = canUseInk(user.id);
    if (!check.canUse) {
      const usage = getFreeInkUsage(user.id);
      setOutOfInkInfo({
        dailyUsed: usage.dailyUsed,
        monthlyUsed: usage.monthlyUsed,
        timeUntilReset: check.timeUntilReset || "tomorrow"
      });
      setShowOutOfInkModal(true);
      return;
    }
    
    clapComment(user.id, commentId);
    loadPosts();
  };

  const renderComment = (comment: Comment, postComments: Comment[], depth: number = 0) => {
    const replies = postComments.filter(c => c.parentCommentId === comment.id);
    const userClaps = getCommentClaps(user.id, comment.id);
    const isReplying = replyingTo === comment.id;
    
    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-4'} ${depth > 2 ? 'ml-4' : ''}`}>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-primary/10">
            {comment.userAvatar ? (
              <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Feather className="w-4 h-4 text-primary" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="bg-muted/30 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{comment.userName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-1 ml-1">
              <button
                onClick={() => handleCommentClap(comment.id)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>👏</span>
                {comment.clapsCount > 0 && <span className="font-medium">{comment.clapsCount}</span>}
                {userClaps > 0 && <span className="text-primary">({userClaps})</span>}
              </button>
              
              <button
                onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Reply className="w-3 h-3" />
                <span>Reply</span>
              </button>
            </div>
            
            {isReplying && (
              <div className="mt-2 flex gap-2">
                <Input
                  value={commentInputs[comment.id] || ""}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [comment.id]: e.target.value })}
                  placeholder={`Reply to ${comment.userName}...`}
                  className="text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCommentSubmit(comment.postId, comment.id);
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => handleCommentSubmit(comment.postId, comment.id)}
                  disabled={!commentInputs[comment.id]?.trim()}
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            )}
            
            {replies.length > 0 && (
              <div className="mt-2">
                {replies.map(reply => renderComment(reply, postComments, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Admin Blog Posts Carousel */}
        <div className="mb-8 relative">
          <div 
            ref={carouselRef}
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {adminBlogPosts.map((post) => (
                <div key={post.id} className="w-full flex-shrink-0 px-1">
                  <Link to={`/blog/${post.id}`}>
                    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4 p-3">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-20 h-20 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          {post.category}
                        </div>
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2 leading-snug">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <button className="flex-shrink-0 w-7 h-7 rounded-full hover:bg-accent flex items-center justify-center transition-colors">
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </Card>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-accent transition-colors z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-8 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-accent transition-colors z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {adminBlogPosts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Filter and Notifications */}
        <div className="mb-6 flex items-center justify-between">
          <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <span>{filter === "all" ? "All Updates" : "Following"}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          <button className="relative p-2 hover:bg-accent rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Compose Box */}
        {user.isPoet && (
          <Card className="p-4 mb-6">
            {!showCompose ? (
              <button
                onClick={() => setShowCompose(true)}
                className="w-full text-left px-4 py-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-muted-foreground"
              >
                Share an update with your followers...
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Feather className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Share what you're working on, reading, or thinking about..."
                      rows={4}
                      className="resize-none"
                      maxLength={500}
                      autoFocus
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {newPostContent.length}/500
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowCompose(false);
                            setNewPostContent("");
                          }}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleCreatePost}
                          disabled={!newPostContent.trim()}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Posts Feed */}
        {filteredPosts.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-2xl font-bold mb-2">No Updates Yet</h3>
            <p className="text-muted-foreground mb-6">
              {filter === "following"
                ? "Poets you follow haven't posted any updates yet."
                : "Be the first to share an update with the community."}
            </p>
            {user.isPoet && (
              <Button onClick={() => setShowCompose(true)}>
                <Send className="w-4 h-4 mr-2" />
                Post Your First Update
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map(post => {
              const poet = getPoetInfo(post.poetId) || {
                id: post.poetId,
                name: post.poetName,
                avatar: post.poetAvatar
              };
              const userClaps = getPostClaps(user.id, post.id);
              
              return (
                <Card key={post.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <button
                      onClick={() => navigate(`/poet/${poet.id}`)}
                      className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 hover:ring-2 ring-primary transition-all"
                    >
                      {poet.avatar ? (
                        <img
                          src={poet.avatar}
                          alt={poet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <Feather className="w-5 h-5 text-primary" />
                        </div>
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <button
                          onClick={() => navigate(`/poet/${poet.id}`)}
                          className="font-semibold hover:underline"
                        >
                          {poet.name}
                        </button>
                        <span className="text-sm text-muted-foreground ml-2">
                          {new Date(post.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <p className="leading-relaxed whitespace-pre-wrap mb-4">
                        {post.content}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleClap(post.id)}
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <span className="text-base">👏</span>
                          <span className="font-medium">{post.clapsCount}</span>
                          {userClaps > 0 && <span className="text-primary text-xs">({userClaps})</span>}
                        </button>
                        
                        <button 
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.commentsCount}</span>
                        </button>
                      </div>
                      
                      {/* Comments Section */}
                      {expandedComments.has(post.id) && (
                        <div className="mt-4 pt-4 border-t border-border">
                          {/* Comment Input */}
                          <div className="flex gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-primary/10">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Feather className="w-4 h-4 text-primary" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 flex gap-2">
                              <Input
                                value={commentInputs[post.id] || ""}
                                onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                placeholder="Write a comment... (use @name to mention)"
                                className="text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleCommentSubmit(post.id);
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={() => handleCommentSubmit(post.id)}
                                disabled={!commentInputs[post.id]?.trim()}
                              >
                                <Send className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Comments List */}
                          <div className="space-y-1">
                            {getComments(post.id)
                              .filter(c => !c.parentCommentId)
                              .map(comment => renderComment(comment, getComments(post.id)))
                            }
                            {post.commentsCount === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                No comments yet. Be the first to comment!
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Out of Ink Modal */}
      {showOutOfInkModal && (
        <OutOfInkModal
          onClose={() => setShowOutOfInkModal(false)}
          dailyUsed={outOfInkInfo.dailyUsed}
          monthlyUsed={outOfInkInfo.monthlyUsed}
          timeUntilReset={outOfInkInfo.timeUntilReset}
        />
      )}
    </div>
  );
}
