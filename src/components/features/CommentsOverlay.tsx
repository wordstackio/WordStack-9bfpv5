import { useState, useRef, useEffect, useMemo } from "react";
import { X, User, ArrowLeft, Send, ChevronDown } from "lucide-react";
import { Comment } from "@/types";
import { shortTimeAgo } from "@/lib/utils";
import {
  createPoemComment,
  clapPoemComment,
  getPoemCommentClaps,
  canUseInk,
  getFreeInkUsage,
} from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import OutOfInkModal from "./OutOfInkModal";
import MentionRenderer from "./MentionRenderer";
import { mockPoets } from "@/lib/mockData";

type SortMode = "relevant" | "recent";

interface CommentsOverlayProps {
  poemId: string;
  comments: Comment[];
  onClose: () => void;
  onCommentAdded: () => void;
}

function CommentBubble({
  comment,
  replies,
  onReply,
  depth = 0,
}: {
  comment: Comment;
  replies: Comment[];
  onReply: (commentId: string, userName: string) => void;
  depth?: number;
}) {
  const user = getCurrentUser();
  const [localClaps, setLocalClaps] = useState(comment.clapsCount);
  const [showOutOfInk, setShowOutOfInk] = useState(false);
  const [outOfInkInfo, setOutOfInkInfo] = useState({
    dailyUsed: 0,
    monthlyUsed: 0,
    timeUntilReset: "",
  });

  const handleClap = () => {
    if (!user) return;
    const check = canUseInk(user.id);
    if (!check.canUse) {
      const usage = getFreeInkUsage(user.id);
      setOutOfInkInfo({
        dailyUsed: usage.dailyUsed,
        monthlyUsed: usage.monthlyUsed,
        timeUntilReset: check.timeUntilReset || "tomorrow",
      });
      setShowOutOfInk(true);
      return;
    }
    if (clapPoemComment(user.id, comment.id)) {
      setLocalClaps((prev) => prev + 1);
    }
  };

  return (
    <>
      <div
        className={`${depth > 0 ? "ml-10 border-l-2 border-border/40 pl-4" : ""}`}
      >
        <div className="py-3">
          <div className="flex items-start gap-3">
            {comment.userAvatar ? (
              <img
                src={comment.userAvatar}
                alt={comment.userName}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {comment.userName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {shortTimeAgo(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed mt-1 whitespace-pre-wrap">
                <MentionRenderer content={comment.content} asFragment={true} />
              </p>
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={handleClap}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Clap for this comment. ${localClaps} claps`}
                >
                  <span className="text-sm">{"👏"}</span>
                  {localClaps > 0 && <span>{localClaps}</span>}
                </button>
                {depth === 0 && (
                  <button
                    onClick={() => onReply(comment.id, comment.userName)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    Reply
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nested replies */}
        {replies.length > 0 && (
          <div>
            {replies.map((reply) => (
              <CommentBubble
                key={reply.id}
                comment={reply}
                replies={[]}
                onReply={onReply}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>

      {showOutOfInk && (
        <OutOfInkModal
          onClose={() => setShowOutOfInk(false)}
          dailyUsed={outOfInkInfo.dailyUsed}
          monthlyUsed={outOfInkInfo.monthlyUsed}
          timeUntilReset={outOfInkInfo.timeUntilReset}
        />
      )}
    </>
  );
}

export default function CommentsOverlay({
  poemId,
  comments,
  onClose,
  onCommentAdded,
}: CommentsOverlayProps) {
  const user = getCurrentUser();
  const [sortMode, setSortMode] = useState<SortMode>("relevant");
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{
    commentId: string;
    userName: string;
  } | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<Array<{ id: string; name: string; avatar: string }>>([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(-1);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowSortDropdown(false);
      }
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowMentionSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Detect @mentions for autocomplete
  useEffect(() => {
    const lastAtIndex = newComment.lastIndexOf("@");
    if (lastAtIndex === -1 || (lastAtIndex > 0 && newComment[lastAtIndex - 1] !== " " && newComment[lastAtIndex - 1] !== "\n")) {
      setShowMentionSuggestions(false);
      return;
    }

    const textAfterAt = newComment.substring(lastAtIndex + 1);
    const mentionRegex = /^\w*$/;
    
    if (!mentionRegex.test(textAfterAt)) {
      setShowMentionSuggestions(false);
      return;
    }

    // Filter poets based on text after @
    const filtered = mockPoets.filter(poet =>
      poet.name.toLowerCase().includes(textAfterAt.toLowerCase()) &&
      poet.id !== user?.id // Don't suggest mentioning yourself
    );

    setMentionSuggestions(filtered);
    setShowMentionSuggestions(filtered.length > 0 && textAfterAt.length > 0);
    setMentionIndex(-1);
  }, [newComment, user?.id]);

  const handleSelectMention = (poetName: string) => {
    const lastAtIndex = newComment.lastIndexOf("@");
    const textAfterAt = newComment.substring(lastAtIndex + 1);
    const beforeMention = newComment.substring(0, lastAtIndex);
    
    const updatedComment = beforeMention + "@" + poetName + " ";
    setNewComment(updatedComment);
    setShowMentionSuggestions(false);
    inputRef.current?.focus();
  };

  const repliesByParent = useMemo(() => {
    const map: Record<string, Comment[]> = {};
    comments
      .filter((c) => c.parentCommentId)
      .forEach((c) => {
        if (!map[c.parentCommentId!]) map[c.parentCommentId!] = [];
        map[c.parentCommentId!].push(c);
      });
    // Sort replies chronologically
    Object.values(map).forEach((arr) =>
      arr.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    );
    return map;
  }, [comments]);

  // Sort top-level comments
  const sortedComments = useMemo(() => {
    const sorted = [...topLevelComments];
    if (sortMode === "relevant") {
      // Most relevant = highest claps + most replies
      sorted.sort((a, b) => {
        const aScore = a.clapsCount + (repliesByParent[a.id]?.length || 0) * 2;
        const bScore = b.clapsCount + (repliesByParent[b.id]?.length || 0) * 2;
        return bScore - aScore;
      });
    } else {
      // Most recent first
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return sorted;
  }, [topLevelComments, repliesByParent, sortMode]);

  const handleReply = (commentId: string, userName: string) => {
    setReplyTo({ commentId, userName });
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    if (!user || !newComment.trim()) return;

    createPoemComment(
      poemId,
      user.id,
      user.name,
      user.avatar,
      replyTo
        ? `@${replyTo.userName} ${newComment.trim()}`
        : newComment.trim(),
      replyTo?.commentId
    );

    setNewComment("");
    setReplyTo(null);
    onCommentAdded();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-background sm:rounded-xl sm:border sm:border-border sm:shadow-lg h-full sm:h-[85vh] sm:max-h-[700px] flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/60 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1.5 hover:bg-accent rounded-lg transition-colors sm:hidden"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="font-serif text-lg font-semibold text-foreground flex-1">
            Comments{" "}
            <span className="font-sans text-sm font-normal text-muted-foreground">
              ({comments.length})
            </span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors hidden sm:block"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Sort Filter */}
        <div className="px-4 py-2.5 border-b border-border/30 flex-shrink-0">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {sortMode === "relevant" ? "Most Relevant" : "Most Recent"}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showSortDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-md z-10 py-1 min-w-[150px] animate-in fade-in-0 zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setSortMode("relevant");
                    setShowSortDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    sortMode === "relevant"
                      ? "text-foreground bg-accent/50 font-medium"
                      : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                  }`}
                >
                  Most Relevant
                </button>
                <button
                  onClick={() => {
                    setSortMode("recent");
                    setShowSortDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    sortMode === "recent"
                      ? "text-foreground bg-accent/50 font-medium"
                      : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                  }`}
                >
                  Most Recent
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4">
          {sortedComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground text-sm">
                No comments yet. Share your thoughts.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {sortedComments.map((comment) => (
                <CommentBubble
                  key={comment.id}
                  comment={comment}
                  replies={repliesByParent[comment.id] || []}
                  onReply={handleReply}
                />
              ))}
            </div>
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border/60 px-4 py-3 flex-shrink-0 bg-background">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-xs text-muted-foreground">
                Replying to{" "}
                <span className="font-medium text-foreground">
                  {replyTo.userName}
                </span>
              </span>
              <button
                onClick={() => setReplyTo(null)}
                className="p-0.5 hover:bg-accent rounded transition-colors"
                aria-label="Cancel reply"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 mb-0.5"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mb-0.5">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  user
                    ? "What are your thoughts? (Use @username to mention)"
                    : "Log in to comment"
                }
                disabled={!user}
                rows={1}
                className="w-full resize-none rounded-xl border border-border bg-muted/30 px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  minHeight: "40px",
                  maxHeight: "120px",
                  height: "auto",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
              
              {/* Mention suggestions dropdown */}
              {showMentionSuggestions && mentionSuggestions.length > 0 && (
                <div 
                  ref={suggestionsRef}
                  className="absolute bottom-full left-0 mb-1 w-full bg-popover border border-border rounded-lg shadow-md z-10 py-1 max-h-[200px] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-150"
                >
                  {mentionSuggestions.map((poet, index) => (
                    <button
                      key={poet.id}
                      onClick={() => handleSelectMention(poet.name)}
                      onMouseEnter={() => setMentionIndex(index)}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                        index === mentionIndex
                          ? "text-foreground bg-accent/50"
                          : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                      }`}
                    >
                      <img 
                        src={poet.avatar} 
                        alt={poet.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-medium">{poet.name}</span>
                    </button>
                  ))}
                </div>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={!user || !newComment.trim()}
                className="absolute right-2.5 bottom-2 p-1 text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:opacity-40 transition-colors"
                aria-label="Send comment"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
