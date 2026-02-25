// Mock storage for follows, ink, etc.

const FOLLOWS_KEY = "wordstack_follows";
const POEM_CLAPS_KEY = "ws_poem_claps";

export const getFollows = (): string[] => {
  const stored = localStorage.getItem(FOLLOWS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const followPoet = (poetId: string) => {
  const follows = getFollows();
  if (!follows.includes(poetId)) {
    follows.push(poetId);
    localStorage.setItem(FOLLOWS_KEY, JSON.stringify(follows));
  }
};

export const unfollowPoet = (poetId: string) => {
  const follows = getFollows().filter(id => id !== poetId);
  localStorage.setItem(FOLLOWS_KEY, JSON.stringify(follows));
};

export const isFollowing = (poetId: string): boolean => {
  return getFollows().includes(poetId);
};

export function clapPoem(userId: string, poemId: string): boolean {
  if (!useInk(userId)) return false;
  
  const stored = localStorage.getItem(POEM_CLAPS_KEY);
  const claps = stored ? JSON.parse(stored) : {};
  
  claps[poemId] = (claps[poemId] || 0) + 1;
  localStorage.setItem(POEM_CLAPS_KEY, JSON.stringify(claps));
  
  // Update poem clap count in published poems
  const poems = getPublishedPoems();
  const poem = poems.find(p => p.id === poemId);
  if (poem) {
    poem.clapsCount++;
    localStorage.setItem(POEMS_KEY, JSON.stringify(poems));
  }
  
  return true;
}

export function getPoemClaps(poemId: string): number {
  const stored = localStorage.getItem(POEM_CLAPS_KEY);
  const claps = stored ? JSON.parse(stored) : {};
  return claps[poemId] || 0;
}

// Give Claps (Ink) directly to a poet (Buy Me a Coffee style)
const POET_SUPPORTERS_KEY = "ws_poet_supporters";

export interface PoetSupport {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  toPoetId: string;
  amount: number;
  message?: string;
  createdAt: string;
}

export function getPoetSupporters(poetId: string): PoetSupport[] {
  const stored = localStorage.getItem(POET_SUPPORTERS_KEY);
  const all: PoetSupport[] = stored ? JSON.parse(stored) : [];
  return all
    .filter((s) => s.toPoetId === poetId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function giveClapsToPoet(
  userId: string,
  userName: string,
  userAvatar: string | undefined,
  poetId: string,
  poetName: string,
  amount: number,
  message?: string
): boolean {
  // Deduct Ink from giver
  if (!deductInkFromUser(userId, amount)) {
    return false;
  }

  // Add Ink to poet
  addInkToUser(poetId, amount);

  // Record support
  const support: PoetSupport = {
    id: `support-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    fromUserId: userId,
    fromUserName: userName,
    fromUserAvatar: userAvatar,
    toPoetId: poetId,
    amount,
    message,
    createdAt: new Date().toISOString(),
  };
  const stored = localStorage.getItem(POET_SUPPORTERS_KEY);
  const supporters: PoetSupport[] = stored ? JSON.parse(stored) : [];
  supporters.push(support);
  localStorage.setItem(POET_SUPPORTERS_KEY, JSON.stringify(supporters));

  // Record transaction for giver
  addInkTransaction(
    userId,
    "given",
    -amount,
    `Gave ${amount} clap${amount === 1 ? "" : "s"} to ${poetName}`,
    poetId,
    poetName
  );

  // Record transaction for receiver
  addInkTransaction(
    poetId,
    "earned",
    amount,
    `Received ${amount} clap${amount === 1 ? "" : "s"} from ${userName}`,
    userId
  );

  return true;
}


export function getUserPoemClaps(userId: string, poemId: string): number {
  const clapsKey = `ws_user_poem_claps_${userId}`;
  const stored = localStorage.getItem(clapsKey);
  const claps = stored ? JSON.parse(stored) : {};
  return claps[poemId] || 0;
}

// Onboarding Progress
interface OnboardingProgress {
  step: number;
  userType: "writer" | "reader" | "both";
  poetName?: string;
  poetBio?: string;
  theme?: "light" | "dark";
  completed: boolean;
}

export function getOnboardingProgress(): OnboardingProgress {
  const stored = localStorage.getItem("ws_onboarding");
  if (!stored) {
    return {
      step: 1,
      userType: "writer",
      completed: false
    };
  }
  return JSON.parse(stored);
}

export function saveOnboardingProgress(progress: OnboardingProgress) {
  localStorage.setItem("ws_onboarding", JSON.stringify(progress));
}

export function completeOnboarding() {
  const progress = getOnboardingProgress();
  progress.completed = true;
  localStorage.setItem("ws_onboarding", JSON.stringify(progress));
}

export function resetOnboarding() {
  localStorage.removeItem("ws_onboarding");
}

// Theme Preferences
import { ThemePreferences, DEFAULT_THEME } from "@/types";

const THEME_KEY_PREFIX = "ws_theme_";

export function getThemePreferences(poetId: string): ThemePreferences {
  const stored = localStorage.getItem(THEME_KEY_PREFIX + poetId);
  return stored ? JSON.parse(stored) : DEFAULT_THEME;
}

export function saveThemePreferences(poetId: string, preferences: ThemePreferences) {
  localStorage.setItem(THEME_KEY_PREFIX + poetId, JSON.stringify(preferences));
}

export function resetThemePreferences(poetId: string) {
  localStorage.removeItem(THEME_KEY_PREFIX + poetId);
}

// Profile Data
import { User, Poem } from "@/types";

export function updateUserProfile(userId: string, profileData: Partial<User>) {
  const currentUser = JSON.parse(localStorage.getItem("wordstack_user") || "{}");
  if (currentUser.id === userId) {
    const updatedUser = { ...currentUser, ...profileData };
    localStorage.setItem("wordstack_user", JSON.stringify(updatedUser));
    return updatedUser;
  }
  return null;
}

// Poem Drafts
interface PoemDraft {
  id: string;
  title: string;
  content: string;
  collectionId?: string;
  isPinned: boolean;
  lastSaved: string;
}

const DRAFTS_KEY = "ws_drafts_";
const POEMS_KEY = "ws_poems";

export function saveDraft(poetId: string, draft: PoemDraft) {
  const drafts = getDrafts(poetId);
  const existingIndex = drafts.findIndex(d => d.id === draft.id);
  
  if (existingIndex >= 0) {
    drafts[existingIndex] = draft;
  } else {
    drafts.push(draft);
  }
  
  localStorage.setItem(DRAFTS_KEY + poetId, JSON.stringify(drafts));
}

export function getDrafts(poetId: string): PoemDraft[] {
  const stored = localStorage.getItem(DRAFTS_KEY + poetId);
  return stored ? JSON.parse(stored) : [];
}

export function getDraft(poetId: string, draftId: string): PoemDraft | null {
  const drafts = getDrafts(poetId);
  return drafts.find(d => d.id === draftId) || null;
}

export function deleteDraft(poetId: string, draftId: string) {
  const drafts = getDrafts(poetId).filter(d => d.id !== draftId);
  localStorage.setItem(DRAFTS_KEY + poetId, JSON.stringify(drafts));
}

export function publishPoem(poetId: string, poetName: string, poetAvatar: string | undefined, draft: PoemDraft): Poem {
  const poem: Poem = {
    id: draft.id,
    poetId,
    poetName,
    poetAvatar,
    title: draft.title,
    content: draft.content,
    createdAt: new Date().toISOString(),
    inkReceived: 0,
    commentsCount: 0,
    isPinned: draft.isPinned,
    collectionIds: draft.collectionId ? [draft.collectionId] : []
  };
  
  // Save to published poems
  const poems = getPublishedPoems();
  poems.unshift(poem);
  localStorage.setItem(POEMS_KEY, JSON.stringify(poems));
  
  // Remove from drafts
  deleteDraft(poetId, draft.id);
  
  return poem;
}

export function getPublishedPoems(): Poem[] {
  const stored = localStorage.getItem(POEMS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Collections Management
import { Collection } from "@/types";

const COLLECTIONS_KEY = "ws_collections";

export function getCollections(poetId?: string): Collection[] {
  const stored = localStorage.getItem(COLLECTIONS_KEY);
  const all = stored ? JSON.parse(stored) : [];
  if (poetId) {
    return all.filter((c: Collection) => c.poetId === poetId).sort((a: Collection, b: Collection) => a.order - b.order);
  }
  return all;
}

export function getCollection(collectionId: string): Collection | null {
  const collections = getCollections();
  return collections.find(c => c.id === collectionId) || null;
}

export function createCollection(poetId: string, name: string, description?: string, coverImage?: string): Collection {
  const collections = getCollections(poetId);
  const newCollection: Collection = {
    id: `col-${Date.now()}`,
    poetId,
    name,
    description,
    coverImage,
    poemIds: [],
    createdAt: new Date().toISOString(),
    order: collections.length
  };
  
  const allCollections = getCollections();
  allCollections.push(newCollection);
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(allCollections));
  
  return newCollection;
}

export function updateCollection(collectionId: string, updates: Partial<Collection>): Collection | null {
  const collections = getCollections();
  const index = collections.findIndex(c => c.id === collectionId);
  
  if (index === -1) return null;
  
  collections[index] = { ...collections[index], ...updates };
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  
  return collections[index];
}

export function deleteCollection(collectionId: string): boolean {
  const collections = getCollections();
  const filtered = collections.filter(c => c.id !== collectionId);
  
  if (filtered.length === collections.length) return false;
  
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(filtered));
  return true;
}

export function addPoemToCollection(collectionId: string, poemId: string): boolean {
  const collection = getCollection(collectionId);
  if (!collection) return false;
  
  if (!collection.poemIds.includes(poemId)) {
    collection.poemIds.push(poemId);
    updateCollection(collectionId, { poemIds: collection.poemIds });
    return true;
  }
  
  return false;
}

export function removePoemFromCollection(collectionId: string, poemId: string): boolean {
  const collection = getCollection(collectionId);
  if (!collection) return false;
  
  const filtered = collection.poemIds.filter(id => id !== poemId);
  if (filtered.length !== collection.poemIds.length) {
    updateCollection(collectionId, { poemIds: filtered });
    return true;
  }
  
  return false;
}

export function reorderCollections(poetId: string, collectionIds: string[]): void {
  const collections = getCollections();
  
  collectionIds.forEach((id, index) => {
    const collection = collections.find(c => c.id === id && c.poetId === poetId);
    if (collection) {
      collection.order = index;
    }
  });
  
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}

// Community Posts
import { CommunityPost, PostPoll, QuoteRef } from "@/types";

const COMMUNITY_POSTS_KEY = "ws_community_posts";
const POST_CLAPS_KEY = "ws_post_claps_";
const FREE_INK_KEY = "ws_free_ink_";

export function getCommunityPosts(): CommunityPost[] {
  const stored = localStorage.getItem(COMMUNITY_POSTS_KEY);
  const posts = stored ? JSON.parse(stored) : [];
  return posts.sort((a: CommunityPost, b: CommunityPost) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createCommunityPost(
  poetId: string, 
  poetName: string, 
  poetAvatar: string | undefined, 
  content: string,
  extras?: {
    images?: string[];
    link?: { url: string; title?: string; description?: string };
    poll?: PostPoll;
    quote?: QuoteRef;
  }
): CommunityPost {
  const post: CommunityPost = {
    id: `post-${Date.now()}`,
    poetId,
    poetName,
    poetAvatar,
    content,
    ...(extras?.images?.length ? { images: extras.images } : {}),
    ...(extras?.link ? { link: extras.link } : {}),
    ...(extras?.poll ? { poll: extras.poll } : {}),
    ...(extras?.quote ? { quote: extras.quote } : {}),
    createdAt: new Date().toISOString(),
    likesCount: 0,
    commentsCount: 0
  };

  const posts = getCommunityPosts();
  posts.unshift(post);
  localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(posts));

  return post;
}

export function votePoll(postId: string, userId: string, optionId: string): void {
  const posts = getCommunityPosts();
  const post = posts.find(p => p.id === postId);
  if (!post?.poll) return;
  
  // Check if already voted
  if (post.poll.votedUsers[userId]) return;
  
  const option = post.poll.options.find(o => o.id === optionId);
  if (!option) return;
  
  option.votes++;
  post.poll.votedUsers[userId] = optionId;
  localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(posts));
}

// Free Ink Management
import { FreeInkUsage } from "@/types";

export function getFreeInkUsage(userId: string): FreeInkUsage {
  const stored = localStorage.getItem(FREE_INK_KEY + userId);
  if (!stored) {
    const now = new Date().toISOString();
    return {
      userId,
      dailyUsed: 0,
      monthlyUsed: 0,
      lastDailyReset: now,
      lastMonthlyReset: now
    };
  }
  
  const usage: FreeInkUsage = JSON.parse(stored);
  const now = new Date();
  const lastDaily = new Date(usage.lastDailyReset);
  const lastMonthly = new Date(usage.lastMonthlyReset);
  
  // Reset daily if it's a new day
  if (now.toDateString() !== lastDaily.toDateString()) {
    usage.dailyUsed = 0;
    usage.lastDailyReset = now.toISOString();
  }
  
  // Reset monthly if it's a new month
  if (now.getMonth() !== lastMonthly.getMonth() || now.getFullYear() !== lastMonthly.getFullYear()) {
    usage.monthlyUsed = 0;
    usage.lastMonthlyReset = now.toISOString();
  }
  
  localStorage.setItem(FREE_INK_KEY + userId, JSON.stringify(usage));
  return usage;
}

export function canUseInk(userId: string): { canUse: boolean; reason?: string; timeUntilReset?: string } {
  const purchased = getUserInkBalance(userId);
  
  // If user has purchased Ink, they can always use it
  if (purchased > 0) {
    return { canUse: true };
  }
  
  // Check free Ink limits
  const usage = getFreeInkUsage(userId);
  
  if (usage.dailyUsed >= 5) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { 
      canUse: false, 
      reason: "daily",
      timeUntilReset: `${hours}h ${minutes}m`
    };
  }
  
  if (usage.monthlyUsed >= 25) {
    return { canUse: false, reason: "monthly" };
  }
  
  return { canUse: true };
}

export function useInk(userId: string): boolean {
  const check = canUseInk(userId);
  if (!check.canUse) return false;
  
  const purchased = getUserInkBalance(userId);
  
  if (purchased > 0) {
    // Use purchased Ink first
    deductInkFromUser(userId, 1);
  } else {
    // Use free Ink
    const usage = getFreeInkUsage(userId);
    usage.dailyUsed++;
    usage.monthlyUsed++;
    localStorage.setItem(FREE_INK_KEY + userId, JSON.stringify(usage));
  }
  
  return true;
}

export function clapPost(userId: string, postId: string): boolean {
  if (!useInk(userId)) return false;
  
  const clapsKey = POST_CLAPS_KEY + userId;
  const stored = localStorage.getItem(clapsKey);
  const claps = stored ? JSON.parse(stored) : {};
  
  claps[postId] = (claps[postId] || 0) + 1;
  localStorage.setItem(clapsKey, JSON.stringify(claps));
  
  // Increment clap count
  const posts = getCommunityPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.clapsCount++;
    localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(posts));
  }
  
  return true;
}

export function getPostClaps(userId: string, postId: string): number {
  const clapsKey = POST_CLAPS_KEY + userId;
  const stored = localStorage.getItem(clapsKey);
  const claps = stored ? JSON.parse(stored) : {};
  return claps[postId] || 0;
}

// Post Likes Management (no ink cost, toggle behavior)
const POST_LIKES_KEY = "ws_post_likes_";

export function togglePostLike(userId: string, postId: string): boolean {
  const likesKey = POST_LIKES_KEY + userId;
  const stored = localStorage.getItem(likesKey);
  const likes: Record<string, boolean> = stored ? JSON.parse(stored) : {};

  const isCurrentlyLiked = !!likes[postId];
  const posts = getCommunityPosts();
  const post = posts.find(p => p.id === postId);

  if (isCurrentlyLiked) {
    delete likes[postId];
    if (post) post.likesCount = Math.max(0, (post.likesCount || 0) - 1);
  } else {
    likes[postId] = true;
    if (post) post.likesCount = (post.likesCount || 0) + 1;
  }

  localStorage.setItem(likesKey, JSON.stringify(likes));
  localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(posts));

  return !isCurrentlyLiked; // returns new state: true = liked, false = unliked
}

export function getPostLiked(userId: string, postId: string): boolean {
  const likesKey = POST_LIKES_KEY + userId;
  const stored = localStorage.getItem(likesKey);
  const likes: Record<string, boolean> = stored ? JSON.parse(stored) : {};
  return !!likes[postId];
}

// Comments Management
import { Comment, Notification } from "@/types";

const COMMENTS_KEY = "ws_comments";
const NOTIFICATIONS_KEY = "ws_notifications";
const COMMENT_CLAPS_KEY = "ws_comment_claps_";

export function getComments(postId?: string): Comment[] {
  const stored = localStorage.getItem(COMMENTS_KEY);
  const all = stored ? JSON.parse(stored) : [];
  if (postId) {
    return all.filter((c: Comment) => c.postId === postId).sort((a: Comment, b: Comment) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }
  return all;
}

export function createComment(
  postId: string,
  userId: string,
  userName: string,
  userAvatar: string | undefined,
  content: string,
  parentCommentId?: string
): Comment {
  // Extract @mentions
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  const comment: Comment = {
    id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    postId,
    userId,
    userName,
    userAvatar,
    content,
    parentCommentId,
    mentions,
    createdAt: new Date().toISOString(),
    likesCount: 0
  };

  const comments = getComments();
  comments.push(comment);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));

  // Update post comment count
  const posts = getCommunityPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.commentsCount++;
    localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(posts));
  }

  // Create notifications
  if (parentCommentId) {
    // Reply notification
    const parentComment = comments.find(c => c.id === parentCommentId);
    if (parentComment && parentComment.userId !== userId) {
      createNotification(
        parentComment.userId,
        "reply",
        userId,
        userName,
        userAvatar,
        postId,
        comment.id,
        `${userName} replied to your comment`
      );
    }
  } else if (post && post.poetId !== userId) {
    // Comment on post notification
    createNotification(
      post.poetId,
      "comment",
      userId,
      userName,
      userAvatar,
      postId,
      comment.id,
      `${userName} commented on your post`
    );
  }

  // Mention notifications
  mentions.forEach(mentionName => {
    // In a real app, you'd look up user ID by username
    // For now, we'll use the mention as-is
    createNotification(
      mentionName,
      "mention",
      userId,
      userName,
      userAvatar,
      postId,
      comment.id,
      `${userName} mentioned you in a comment`
    );
  });

  return comment;
}

export function clapComment(userId: string, commentId: string): boolean {
  if (!useInk(userId)) return false;
  
  const clapsKey = COMMENT_CLAPS_KEY + userId;
  const stored = localStorage.getItem(clapsKey);
  const claps = stored ? JSON.parse(stored) : {};
  
  claps[commentId] = (claps[commentId] || 0) + 1;
  localStorage.setItem(clapsKey, JSON.stringify(claps));
  
  const comments = getComments();
  const comment = comments.find(c => c.id === commentId);
  if (comment) {
    comment.clapsCount++;
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  }
  
  return true;
}

export function getCommentClaps(userId: string, commentId: string): number {
  const clapsKey = COMMENT_CLAPS_KEY + userId;
  const stored = localStorage.getItem(clapsKey);
  const claps = stored ? JSON.parse(stored) : {};
  return claps[commentId] || 0;
}

// Notifications Management
export function getNotifications(userId: string): Notification[] {
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  const all = stored ? JSON.parse(stored) : [];
  return all
    .filter((n: Notification) => n.recipientId === userId)
    .sort((a: Notification, b: Notification) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function getUnreadNotificationsCount(userId: string): number {
  const notifications = getNotifications(userId);
  return notifications.filter(n => !n.isRead).length;
}

export function createNotification(
  recipientId: string,
  type: "comment" | "reply" | "mention" | "like",
  actorId: string,
  actorName: string,
  actorAvatar: string | undefined,
  postId: string,
  commentId: string | undefined,
  message: string
): void {
  const notification: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    recipientId,
    type,
    actorId,
    actorName,
    actorAvatar,
    postId,
    commentId,
    message,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  const notifications = stored ? JSON.parse(stored) : [];
  notifications.push(notification);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

export function markNotificationAsRead(notificationId: string): void {
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  const notifications = stored ? JSON.parse(stored) : [];
  
  const notification = notifications.find((n: Notification) => n.id === notificationId);
  if (notification) {
    notification.isRead = true;
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }
}

export function markAllNotificationsAsRead(userId: string): void {
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  const notifications = stored ? JSON.parse(stored) : [];
  
  notifications.forEach((n: Notification) => {
    if (n.recipientId === userId) {
      n.isRead = true;
    }
  });
  
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

// Poem Comments Management
const POEM_COMMENTS_KEY = "ws_poem_comments";

export function getPoemComments(poemId?: string): Comment[] {
  const stored = localStorage.getItem(POEM_COMMENTS_KEY);
  const all: Comment[] = stored ? JSON.parse(stored) : [];
  if (poemId) {
    return all.filter((c) => c.postId === poemId).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }
  return all;
}

export function createPoemComment(
  poemId: string,
  userId: string,
  userName: string,
  userAvatar: string | undefined,
  content: string,
  parentCommentId?: string
): Comment {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  const comment: Comment = {
    id: `pcomment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    postId: poemId,
    userId,
    userName,
    userAvatar,
    content,
    parentCommentId,
    mentions,
    createdAt: new Date().toISOString(),
    clapsCount: 0
  };

  const comments = getPoemComments();
  comments.push(comment);
  localStorage.setItem(POEM_COMMENTS_KEY, JSON.stringify(comments));

  // Update poem comment count in published poems
  const poems = getPublishedPoems();
  const poem = poems.find((p) => p.id === poemId);
  if (poem) {
    poem.commentsCount++;
    localStorage.setItem(POEMS_KEY, JSON.stringify(poems));
  }

  return comment;
}

export function clapPoemComment(userId: string, commentId: string): boolean {
  if (!useInk(userId)) return false;

  const clapsKey = `ws_poem_comment_claps_${userId}`;
  const stored = localStorage.getItem(clapsKey);
  const claps = stored ? JSON.parse(stored) : {};

  claps[commentId] = (claps[commentId] || 0) + 1;
  localStorage.setItem(clapsKey, JSON.stringify(claps));

  const comments = getPoemComments();
  const comment = comments.find((c) => c.id === commentId);
  if (comment) {
    comment.clapsCount++;
    localStorage.setItem(POEM_COMMENTS_KEY, JSON.stringify(comments));
  }

  return true;
}

export function getPoemCommentClaps(userId: string, commentId: string): number {
  const clapsKey = `ws_poem_comment_claps_${userId}`;
  const stored = localStorage.getItem(clapsKey);
  const claps = stored ? JSON.parse(stored) : {};
  return claps[commentId] || 0;
}

// Ink Wallet Management
export interface InkTransaction {
  id: string;
  userId: string;
  type: "earned" | "given" | "purchased" | "initial";
  amount: number;
  recipientId?: string;
  recipientName?: string;
  poemId?: string;
  poemTitle?: string;
  description: string;
  createdAt: string;
}

const INK_BALANCE_KEY = "ws_ink_balance_";
const INK_TRANSACTIONS_KEY = "ws_ink_transactions";

export function getUserInkBalance(userId: string): number {
  const stored = localStorage.getItem(INK_BALANCE_KEY + userId);
  if (stored) {
    return parseInt(stored, 10);
  }
  // Give new users 100 Ink to start
  setUserInkBalance(userId, 100);
  addInkTransaction(userId, "initial", 100, "Welcome bonus - start supporting poets!");
  return 100;
}

export function setUserInkBalance(userId: string, amount: number): void {
  localStorage.setItem(INK_BALANCE_KEY + userId, amount.toString());
}

export function addInkToUser(userId: string, amount: number): void {
  const current = getUserInkBalance(userId);
  setUserInkBalance(userId, current + amount);
}

export function deductInkFromUser(userId: string, amount: number): boolean {
  const current = getUserInkBalance(userId);
  if (current < amount) return false;
  setUserInkBalance(userId, current - amount);
  return true;
}

export function getInkTransactions(userId: string): InkTransaction[] {
  const stored = localStorage.getItem(INK_TRANSACTIONS_KEY);
  const all = stored ? JSON.parse(stored) : [];
  return all
    .filter((t: InkTransaction) => t.userId === userId)
    .sort((a: InkTransaction, b: InkTransaction) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function addInkTransaction(
  userId: string,
  type: "earned" | "given" | "purchased" | "initial",
  amount: number,
  description: string,
  recipientId?: string,
  recipientName?: string,
  poemId?: string,
  poemTitle?: string
): void {
  const transaction: InkTransaction = {
    id: `ink-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    amount,
    recipientId,
    recipientName,
    poemId,
    poemTitle,
    description,
    createdAt: new Date().toISOString()
  };

  const stored = localStorage.getItem(INK_TRANSACTIONS_KEY);
  const transactions = stored ? JSON.parse(stored) : [];
  transactions.push(transaction);
  localStorage.setItem(INK_TRANSACTIONS_KEY, JSON.stringify(transactions));
}

export function giveInkToPoem(
  userId: string,
  poetId: string,
  poetName: string,
  poemId: string,
  poemTitle: string,
  amount: number
): boolean {
  // Deduct from user
  if (!deductInkFromUser(userId, amount)) {
    return false;
  }

  // Add to poem count (existing function)
  giveInk(poemId, amount);

  // Add to poet's balance
  addInkToUser(poetId, amount);

  // Record transaction for giver
  addInkTransaction(
    userId,
    "given",
    -amount,
    `Supported "${poemTitle}"`,
    poetId,
    poetName,
    poemId,
    poemTitle
  );

  // Record transaction for receiver
  addInkTransaction(
    poetId,
    "earned",
    amount,
    `Received support for "${poemTitle}"`,
    userId,
    undefined,
    poemId,
    poemTitle
  );

  return true;
}

// Delete a published poem
export function deletePublishedPoem(poemId: string): boolean {
  const poems = getPublishedPoems();
  const filtered = poems.filter(p => p.id !== poemId);
  if (filtered.length === poems.length) return false;
  localStorage.setItem(POEMS_KEY, JSON.stringify(filtered));
  return true;
}

// Boost (Spotlight) a poem with ink
const SPOTLIGHTS_KEY = "ws_spotlights";
const BOOST_COST = 10;

export function getBoostCost(): number {
  return BOOST_COST;
}

export function boostPoem(userId: string, poemId: string): boolean {
  if (!deductInkFromUser(userId, BOOST_COST)) return false;
  const spotlights = getActiveSpotlights();
  spotlights.push({
    poemId,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });
  localStorage.setItem(SPOTLIGHTS_KEY, JSON.stringify(spotlights));
  addInkTransaction(userId, "given", -BOOST_COST, `Boosted poem to Spotlight`);
  return true;
}

export function getActiveSpotlights(): Array<{ poemId: string; userId: string; createdAt: string; expiresAt: string }> {
  const stored = localStorage.getItem(SPOTLIGHTS_KEY);
  const all = stored ? JSON.parse(stored) : [];
  return all.filter((s: { expiresAt: string }) => new Date(s.expiresAt) > new Date());
}

export function isPoemBoosted(poemId: string): boolean {
  return getActiveSpotlights().some(s => s.poemId === poemId);
}

// Blog Posts Management
import { BlogPost, AccountDeletionRequest } from "@/types";

const BLOG_POSTS_KEY = "ws_blog_posts";

export function getBlogPosts(): BlogPost[] {
  const stored = localStorage.getItem(BLOG_POSTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function createBlogPost(post: Omit<BlogPost, "id" | "createdAt" | "updatedAt">): BlogPost {
  const newPost: BlogPost = {
    ...post,
    id: `blog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const posts = getBlogPosts();
  posts.push(newPost);
  localStorage.setItem(BLOG_POSTS_KEY, JSON.stringify(posts));

  return newPost;
}

export function updateBlogPost(id: string, updates: Partial<BlogPost>): BlogPost | null {
  const posts = getBlogPosts();
  const index = posts.findIndex(p => p.id === id);

  if (index === -1) return null;

  posts[index] = {
    ...posts[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(BLOG_POSTS_KEY, JSON.stringify(posts));
  return posts[index];
}

export function deleteBlogPost(id: string): boolean {
  const posts = getBlogPosts();
  const filtered = posts.filter(p => p.id !== id);

  if (filtered.length === posts.length) return false;

  localStorage.setItem(BLOG_POSTS_KEY, JSON.stringify(filtered));
  return true;
}

// Account Deletion Requests
const DELETION_REQUESTS_KEY = "ws_deletion_requests";

export function getAccountDeletionRequests(): AccountDeletionRequest[] {
  const stored = localStorage.getItem(DELETION_REQUESTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function createDeletionRequest(
  userId: string,
  userName: string,
  reason: string
): AccountDeletionRequest {
  const request: AccountDeletionRequest = {
    id: `del-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    userName,
    reason,
    createdAt: new Date().toISOString()
  };

  const requests = getAccountDeletionRequests();
  requests.push(request);
  localStorage.setItem(DELETION_REQUESTS_KEY, JSON.stringify(requests));

  return request;
}

export function dismissDeletionRequest(id: string): boolean {
  const requests = getAccountDeletionRequests();
  const filtered = requests.filter(r => r.id !== id);

  if (filtered.length === requests.length) return false;

  localStorage.setItem(DELETION_REQUESTS_KEY, JSON.stringify(filtered));
  return true;
}
