import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentUser } from "@/lib/auth";
import { 
  getCommunityPosts, 
  getFollows,
  togglePostLike,
  getPostLiked,
  canUseInk,
  getFreeInkUsage,
  getComments,
  createComment,
  clapComment,
  getCommentClaps,
  getUnreadNotificationsCount,
  votePoll,
  isFollowing
} from "@/lib/storage";
import { CommunityPost, Comment } from "@/types";
import { Users, MessageCircle, Send, Feather, Clock, Reply, Repeat2, Share, MoreHorizontal, Heart, ExternalLink, BarChart3, Quote, Lock, Globe } from "lucide-react";
import { Fragment } from "react";
import { mockPoets } from "@/lib/mockData";
import OutOfInkModal from "@/components/features/OutOfInkModal";
import MentionRenderer from "@/components/features/MentionRenderer";

// Linkify URLs in text
function linkifyText(text: string) {
  const splitRegex = /(https?:\/\/[^\s<]+)/gi;
  const parts = text.split(splitRegex);
  return parts.map((part, i) => {
    if (/^https?:\/\//i.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

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
  const [filter, setFilter] = useState<"all" | "following">("all");
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

    if (searchParams.get("compose") === "true") {
      setSearchParams({});
      navigate("/community/compose");
      return;
    }

    loadPosts();
    loadNotifications();

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

  const handleVotePoll = (postId: string, optionId: string) => {
    if (!user) return;
    votePoll(postId, user.id, optionId);
    loadPosts();
  };

  const handleLike = (postId: string) => {
    if (!user) return;
    togglePostLike(user.id, postId);
    loadPosts();
  };

  const handleShare = async (post: CommunityPost) => {
    const shareData = {
      title: `${post.poetName} on WordStack`,
      text: post.content.length > 140 ? post.content.slice(0, 137) + "..." : post.content,
      url: `${window.location.origin}/community?post=${post.id}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed silently
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
    }
  };

  const getPoetInfo = (poetId: string) => {
    return mockPoets.find(p => p.id === poetId);
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

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const renderComment = (comment: Comment, postComments: Comment[], depth: number = 0) => {
    const replies = postComments.filter(c => c.parentCommentId === comment.id);
    const userClaps = getCommentClaps(user.id, comment.id);
    const isReplying = replyingTo === comment.id;
    
    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-10 mt-2' : 'mt-3'}`}>
        <div className="flex gap-2.5">
          <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-muted">
            {comment.userAvatar ? (
              <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Feather className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-foreground">{comment.userName}</span>
              <span className="text-xs text-muted-foreground">{getTimeAgo(comment.createdAt)}</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground mt-0.5">
              <MentionRenderer content={comment.content} className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground mt-0" />
            </p>
            
            <div className="flex items-center gap-5 mt-1.5">
              <button
                onClick={() => handleCommentClap(comment.id)}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  userClaps > 0 ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Feather className="w-3 h-3" />
                {comment.clapsCount > 0 && <span>{comment.clapsCount}</span>}
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
                  className="text-sm h-8 border-muted bg-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCommentSubmit(comment.postId, comment.id);
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCommentSubmit(comment.postId, comment.id)}
                  disabled={!commentInputs[comment.id]?.trim()}
                  className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
            
            {replies.length > 0 && (
              <div>
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
      <div className="mx-auto max-w-xl">

        {/* Blog Highlights - Right after header */}
        {adminBlogPosts.length > 0 && (
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-2 mb-2.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">From WordStack</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
              {adminBlogPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="flex-shrink-0 w-56 group"
                >
                  <div className="flex gap-2.5 items-start">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-medium text-primary uppercase tracking-wide">{post.category}</span>
                      <h4 className="text-xs font-semibold text-foreground line-clamp-2 leading-snug mt-0.5 group-hover:text-primary transition-colors">
                        {post.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Contextual sentence - centered */}
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[13px] leading-snug text-muted-foreground text-center">
            {user.isPoet
              ? "Share updates, connect with readers, and see what fellow poets are up to."
              : "See what your favorite poets are sharing, join conversations, and discover new voices."}
          </p>
        </div>

        {/* Sticky Tab Header */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex">
            <button
              onClick={() => setFilter("all")}
              className={`flex-1 py-3 text-sm font-medium text-center relative transition-colors ${
                filter === "all" ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              For you
              {filter === "all" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-0.5 bg-primary rounded-full" />
              )}
            </button>
            <button
              onClick={() => setFilter("following")}
              className={`flex-1 py-3 text-sm font-medium text-center relative transition-colors ${
                filter === "following" ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              Following
              {filter === "following" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        {filteredPosts.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-foreground mb-1">No updates yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              {filter === "following"
                ? "Poets you follow haven't posted any updates yet."
                : "Be the first to share an update with the community."}
            </p>
            {user.isPoet && (
              <Button
                onClick={() => navigate("/community/compose")}
                className="rounded-full px-5 font-semibold"
              >
                Post an update
              </Button>
            )}
          </div>
        ) : (
          <div>
            {filteredPosts.map((post, index) => {
              const poet = getPoetInfo(post.poetId) || {
                id: post.poetId,
                name: post.poetName,
                avatar: post.poetAvatar
              };
              const isLiked = getPostLiked(user.id, post.id);
              
              return (
                <div key={post.id}>
                  {index > 0 && (
                    <div className="h-[1px] bg-border" />
                  )}
                  <article className="px-4 pt-3 pb-2.5 hover:bg-muted/10 transition-colors">
                    <div className="flex gap-3">
                      {/* Avatar */}
                    <button
                      onClick={() => navigate(`/poet/${poet.id}`)}
                      className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity mt-0.5"
                    >
                      {poet.avatar ? (
                        <img
                          src={poet.avatar}
                          alt={poet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Feather className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <button
                            onClick={() => navigate(`/poet/${poet.id}`)}
                            className="font-semibold text-[15px] text-foreground hover:underline truncate"
                          >
                            {poet.name}
                          </button>
                          <span className="text-muted-foreground flex-shrink-0">·</span>
                          <span className="text-sm text-muted-foreground flex-shrink-0">
                            {getTimeAgo(post.createdAt)}
                          </span>
                        </div>
                        <button className="p-1 -mr-1 hover:bg-muted rounded-full transition-colors flex-shrink-0">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                      
                      {/* Post body */}
                      {post.content && (
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words text-foreground mt-0.5">
                          {linkifyText(post.content)}
                        </p>
                      )}

                      {/* Attached Images */}
                      {post.images && post.images.length > 0 && (
                        <div
                          className={`mt-2.5 gap-0.5 rounded-xl overflow-hidden border border-border ${
                            post.images.length === 1
                              ? "grid grid-cols-1"
                              : "grid grid-cols-2"
                          }`}
                        >
                          {post.images.map((img, i) => (
                            <div
                              key={i}
                              className={`bg-muted ${
                                post.images!.length === 1
                                  ? "aspect-video"
                                  : "aspect-square"
                              }`}
                            >
                              <img
                                src={img}
                                alt={`Post image ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Attached Link Card */}
                      {post.link && (
                        <a
                          href={post.link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2.5 block border border-border rounded-2xl overflow-hidden hover:bg-muted/20 transition-colors group/link"
                        >
                          {post.link.image && (
                            <div className="aspect-[1.91/1] bg-muted relative">
                              <img
                                src={post.link.image}
                                alt={post.link.title || "Link preview"}
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous"
                              />
                            </div>
                          )}
                          <div className="px-3.5 py-2.5">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              {post.link.domain || (() => {
                                try { return new URL(post.link!.url).hostname.replace("www.", ""); } catch { return post.link!.url; }
                              })()}
                            </p>
                            {post.link.title && (
                              <p className="text-sm font-semibold text-foreground leading-snug mt-0.5 line-clamp-2 group-hover/link:text-primary transition-colors">
                                {post.link.title}
                              </p>
                            )}
                            {post.link.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                {post.link.description}
                              </p>
                            )}
                          </div>
                        </a>
                      )}

                      {/* Poll */}
                      {post.poll && (() => {
                        const hasVoted = !!post.poll.votedUsers[user.id];
                        const totalVotes = post.poll.options.reduce((sum, o) => sum + o.votes, 0);
                        const isExpired = new Date(post.poll.endsAt) < new Date();
                        const showResults = hasVoted || isExpired;
                        const userVote = post.poll.votedUsers[user.id];

                        return (
                          <div className="mt-2.5 border border-border rounded-xl overflow-hidden">
                            <div className="px-3.5 py-3 space-y-2">
                              {post.poll.options.map((opt) => {
                                const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                                return showResults ? (
                                  <div key={opt.id} className="relative">
                                    <div
                                      className={`absolute inset-0 rounded-lg ${
                                        userVote === opt.id ? "bg-primary/15" : "bg-muted/60"
                                      }`}
                                      style={{ width: `${pct}%` }}
                                    />
                                    <div className="relative flex items-center justify-between px-3 py-2 rounded-lg">
                                      <span className={`text-sm ${userVote === opt.id ? "font-semibold text-foreground" : "text-foreground"}`}>
                                        {opt.text}
                                        {userVote === opt.id && (
                                          <span className="ml-1.5 text-xs text-primary">{"(you)"}</span>
                                        )}
                                      </span>
                                      <span className="text-xs font-medium text-muted-foreground ml-2">{pct}%</span>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    key={opt.id}
                                    onClick={() => handleVotePoll(post.id, opt.id)}
                                    className="w-full text-left px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted/30 hover:border-primary/30 transition-colors"
                                  >
                                    {opt.text}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="px-3.5 py-2 border-t border-border/50 flex items-center gap-2">
                              <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
                                {!isExpired && (
                                  <span> · {(() => {
                                    const hrs = Math.max(0, Math.ceil((new Date(post.poll!.endsAt).getTime() - Date.now()) / 3600000));
                                    return hrs > 24 ? `${Math.ceil(hrs / 24)}d left` : `${hrs}h left`;
                                  })()}</span>
                                )}
                                {isExpired && " · Final results"}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Quoted Poem */}
                      {post.quote && (
                        <Link
                          to={`/poem/${post.quote.poemId}`}
                          className="mt-2.5 block border border-border rounded-xl overflow-hidden hover:bg-muted/20 transition-colors"
                        >
                          <div className="px-3.5 py-3">
                            <div className="flex items-start gap-2">
                              <Quote className="w-4 h-4 text-primary/50 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="font-serif text-sm font-semibold text-foreground leading-snug">
                                  {post.quote.poemTitle}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 italic line-clamp-2">
                                  {`"${post.quote.excerpt}"`}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {"by "}
                                  <span className="font-medium text-foreground/70">
                                    {post.quote.poetName}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )}

                      {/* Action bar */}
                      <div className="flex items-center justify-between mt-1.5 -ml-2 max-w-[300px]">
                        <button 
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center gap-1.5 p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors group"
                        >
                          <MessageCircle className="w-[18px] h-[18px]" />
                          {post.commentsCount > 0 && (
                            <span className="text-xs">{post.commentsCount}</span>
                          )}
                        </button>
                        
                        <button
                          className="flex items-center gap-1.5 p-2 rounded-full text-muted-foreground hover:text-green-600 hover:bg-green-600/10 transition-colors"
                        >
                          <Repeat2 className="w-[18px] h-[18px]" />
                        </button>

                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1.5 p-2 rounded-full transition-colors ${
                            isLiked
                              ? 'text-rose-500'
                              : 'text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10'
                          }`}
                        >
                          <Heart className={`w-[18px] h-[18px] ${isLiked ? 'fill-rose-500' : ''}`} />
                          {(post.likesCount || 0) > 0 && (
                            <span className="text-xs">{post.likesCount}</span>
                          )}
                        </button>

                        <button
                          onClick={() => handleShare(post)}
                          className="flex items-center gap-1.5 p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Share className="w-[18px] h-[18px]" />
                        </button>
                      </div>
                      
                      {/* Comments Section */}
                      {expandedComments.has(post.id) && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          {/* Reply Permission Indicator */}
                          {post.replyPermission === "followers" && (
                            <div className="flex items-center gap-1.5 mb-2 px-1">
                              <Users className="w-3 h-3 text-muted-foreground/60" />
                              <span className="text-[11px] text-muted-foreground/60">
                                Only followers can reply
                              </span>
                            </div>
                          )}

                          {/* Comment Input (permission-gated) */}
                          {(() => {
                            const isOwner = post.poetId === user.id;
                            const followsPoet = isFollowing(post.poetId);
                            const canReply =
                              !post.replyPermission ||
                              post.replyPermission === "everyone" ||
                              isOwner ||
                              followsPoet;

                            return canReply ? (
                              <div className="flex gap-2.5">
                                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                                  {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Feather className="w-3.5 h-3.5 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 flex gap-2">
                                  <Input
                                    value={commentInputs[post.id] || ""}
                                    onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                    placeholder="Post your reply... (use @username to mention)"
                                    className="text-sm h-8 border-muted bg-transparent rounded-full px-3"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleCommentSubmit(post.id);
                                      }
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCommentSubmit(post.id)}
                                    disabled={!commentInputs[post.id]?.trim()}
                                    className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10 rounded-full"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-muted/40 border border-border/50">
                                <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />
                                <span className="text-xs text-muted-foreground">
                                  Follow <span className="font-medium text-foreground/70">{post.poetName}</span> to reply
                                </span>
                              </div>
                            );
                          })()}
                          
                          {/* Comments List */}
                          <div>
                            {getComments(post.id)
                              .filter(c => !c.parentCommentId)
                              .map(comment => renderComment(comment, getComments(post.id)))
                            }
                            {post.commentsCount === 0 && (
                              <p className="text-xs text-muted-foreground text-center py-4">
                                No replies yet. Start the conversation.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  </article>
                </div>
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
