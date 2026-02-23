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
import { CommunityPost } from "@/types";

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
  content: string
): CommunityPost {
  const post: CommunityPost = {
    id: `post-${Date.now()}`,
    poetId,
    poetName,
    poetAvatar,
    content,
    createdAt: new Date().toISOString(),
    likesCount: 0,
    commentsCount: 0
  };

  const posts = getCommunityPosts();
  posts.unshift(post);
  localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(posts));

  return post;
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

// Hidden Profiles
const HIDDEN_PROFILES_KEY = "ws_hidden_profiles";

export function getHiddenProfiles(): string[] {
  const stored = localStorage.getItem(HIDDEN_PROFILES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function setProfileHidden(poetId: string, hidden: boolean): void {
  const hiddenList = getHiddenProfiles();
  if (hidden && !hiddenList.includes(poetId)) {
    hiddenList.push(poetId);
  } else if (!hidden) {
    const index = hiddenList.indexOf(poetId);
    if (index > -1) hiddenList.splice(index, 1);
  }
  localStorage.setItem(HIDDEN_PROFILES_KEY, JSON.stringify(hiddenList));

  // Also update the stored user object
  const currentUser = JSON.parse(localStorage.getItem("wordstack_user") || "{}");
  if (currentUser.id === poetId) {
    currentUser.profileHidden = hidden;
    localStorage.setItem("wordstack_user", JSON.stringify(currentUser));
  }
}

export function isProfileHidden(poetId: string): boolean {
  return getHiddenProfiles().includes(poetId);
}

// Account Deletion Requests
import { AccountDeletionRequest } from "@/types";

const DELETION_REQUESTS_KEY = "ws_deletion_requests";

export function getAccountDeletionRequests(): AccountDeletionRequest[] {
  const stored = localStorage.getItem(DELETION_REQUESTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function createAccountDeletionRequest(userId: string, userName: string, reason: string, userEmail?: string): AccountDeletionRequest {
  const request: AccountDeletionRequest = {
    id: `del-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    userId,
    userName,
    userEmail,
    reason,
    createdAt: new Date().toISOString(),
  };
  const requests = getAccountDeletionRequests();
  requests.unshift(request);
  localStorage.setItem(DELETION_REQUESTS_KEY, JSON.stringify(requests));
  return request;
}

export function dismissDeletionRequest(id: string): void {
  const requests = getAccountDeletionRequests().filter(r => r.id !== id);
  localStorage.setItem(DELETION_REQUESTS_KEY, JSON.stringify(requests));
}

// Export Poet Data
export function exportPoetData(poetId: string, poetName: string): string {
  const poems = getPublishedPoems().filter(p => p.poetId === poetId);
  const drafts = getDrafts(poetId);
  const collections = getCollections(poetId);

  const exportData = {
    exportedAt: new Date().toISOString(),
    poet: { id: poetId, name: poetName },
    publishedPoems: poems.map(p => ({
      title: p.title,
      content: p.content,
      createdAt: p.createdAt,
      clapsCount: p.clapsCount,
      commentsCount: p.commentsCount,
    })),
    drafts: drafts.map(d => ({
      title: d.title,
      content: d.content,
      lastSaved: d.lastSaved,
    })),
    collections: collections.map(c => ({
      name: c.name,
      description: c.description,
      poemCount: c.poemIds.length,
    })),
    totalPublished: poems.length,
    totalDrafts: drafts.length,
    totalCollections: collections.length,
  };

  return JSON.stringify(exportData, null, 2);
}

// Blog Post Management
import { BlogPost } from "@/types";

const BLOG_POSTS_KEY = "ws_blog_posts";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function seedBlogPosts(): BlogPost[] {
  const seeds: BlogPost[] = [
    {
      id: "blog-1",
      title: "Introducing Collections: Organize Your Poetry Journey",
      slug: "introducing-collections",
      excerpt: "We're excited to announce Collections, a powerful new way to organize and showcase your poetry on WordStack.",
      content: `We're thrilled to introduce Collections — a feature that many of you have been asking for. Collections allow you to group your poems thematically, chronologically, or however you see fit.

## Why Collections Matter

As a poet, your work evolves. You explore different themes, styles, and voices. Collections give you the power to organize your poetry in meaningful ways that help readers discover the full depth of your creative journey.

### What You Can Do With Collections

- **Thematic Groupings**: Create collections around specific themes like "Nature Poems," "Love & Loss," or "Urban Reflections"
- **Project-Based Organization**: Group poems from specific writing projects or chapbooks
- **Chronological Archives**: Organize work by year or creative period
- **Curated Showcases**: Build collections that tell a story or guide readers through your work

## How to Get Started

Creating a collection is simple:

1. Navigate to your Collections page from your poet dashboard
2. Click "Create New Collection"
3. Give it a name and description
4. Add poems from your library
5. Reorder them to create the perfect flow

Collections appear on your poet page, giving visitors an organized way to explore your work. Each collection has its own dedicated page with an introduction and the poems you've selected.

## The Vision Behind Collections

WordStack is about giving poets ownership over how their work is presented. Collections are another step toward making your poet page feel like a true creative home — not just a profile, but a carefully curated space that reflects your artistic vision.

We can't wait to see how you use Collections to showcase your poetry. As always, we're listening to your feedback and constantly improving the platform.

Happy organizing!

— The WordStack Team`,
      category: "Platform Updates",
      coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=600&fit=crop",
      author: "WordStack Team",
      publishedAt: "2024-11-20T00:00:00.000Z",
      updatedAt: "2024-11-20T00:00:00.000Z",
      createdAt: "2024-11-20T00:00:00.000Z",
      status: "published",
      showInCarousel: true,
      readTime: "4m read",
      metaTitle: "Introducing Collections | WordStack Blog",
      metaDescription: "Discover how WordStack's new Collections feature helps poets organize, curate, and showcase their poetry in meaningful ways.",
      metaKeywords: "poetry, collections, organize, wordstack",
      ogImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=600&fit=crop"
    },
    {
      id: "blog-2",
      title: "Finding Your Voice: A Guide for New Poets",
      slug: "finding-your-voice",
      excerpt: "Every poet's journey begins with a question: What do I have to say? Here's how to discover and develop your unique poetic voice.",
      content: `Every poet starts somewhere. And that starting point is often marked by uncertainty: *What do I write about? How do I sound like myself?*

The truth is, finding your voice isn't about forcing originality. It's about learning to listen — to yourself, to the world, and to the silence between words.

## Start With What Moves You

Your voice emerges from genuine emotion and curiosity. Don't write about what you think poetry "should" be about. Write about what keeps you up at night, what makes you stop mid-step, what you can't stop thinking about.

### Questions to Ask Yourself

- What images or memories keep returning to you?
- What emotions feel most urgent to express?
- What experiences have shaped how you see the world?
- What questions don't have easy answers?

## Read Widely, But Don't Imitate

Reading other poets is essential. It teaches you rhythm, form, technique, and possibility. But the goal isn't to write like Mary Oliver or Ocean Vuong — it's to learn from them while discovering what only you can say.

## Experiment Without Judgment

Your voice develops through practice, not perfection. Write poems that fail. Try forms that feel awkward. Use words that seem too simple or too strange. Every experiment teaches you something about your natural rhythms and obsessions.

## Trust Your Obsessions

We all have recurring themes, images, and questions that show up in our work. Don't fight them. These obsessions are often where your most powerful voice lives.

## Your Voice Will Evolve

Here's the liberating truth: your voice isn't a fixed thing you "find" once and keep forever. It evolves as you grow, read, experience life, and practice your craft.

Start where you are. Write what matters. Trust the process.

— Sarah Chen, Contributing Poet`,
      category: "Writing Tips",
      coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=600&fit=crop",
      author: "Sarah Chen",
      publishedAt: "2024-11-18T00:00:00.000Z",
      updatedAt: "2024-11-18T00:00:00.000Z",
      createdAt: "2024-11-18T00:00:00.000Z",
      status: "published",
      showInCarousel: true,
      readTime: "6m read",
      metaTitle: "Finding Your Voice: A Guide for New Poets | WordStack Blog",
      metaDescription: "A practical guide for new poets on discovering and developing their unique poetic voice through honest writing, wide reading, and fearless experimentation.",
      metaKeywords: "poetry, writing tips, voice, new poets",
      ogImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=600&fit=crop"
    },
    {
      id: "blog-3",
      title: "November's Most Inked Poems: A Celebration",
      slug: "november-most-inked-poems",
      excerpt: "This month, our community came together to support incredible poetry. Here are the poems that resonated most deeply.",
      content: `November has been an extraordinary month on WordStack. We've seen an outpouring of support for poets across the platform, with readers using Ink to celebrate work that moved them.

## The Power of Community Support

When we launched WordStack, we wanted to create a space where poets could be supported directly by their readers. No intermediaries, no algorithms deciding what deserves attention — just genuine appreciation flowing from reader to creator.

This month proved that vision is working. Thousands of Ink were given to poets, enabling them to continue their craft.

## November's Top Supported Poems

Here are the poems that received the most Ink this month:

### 1. "Silence in the Library" by Maya Rivers
A haunting meditation on memory and loss that captured hearts across the platform.

### 2. "City of Rain" by James Morrison
An urban love letter that transforms concrete and downpours into something transcendent.

### 3. "My Grandmother's Hands" by Lucia Santos
A tender, specific portrait that somehow feels universal.

### 4. "November Storm" by David Park
Raw emotion meets formal control in this villanelle about climate change and hope.

### 5. "What the Desert Taught Me" by Aisha Rahman
Sparse, powerful, and deeply personal.

## Why This Matters

These aren't just poems that got attention — they're poems that built genuine connections between poets and readers. That's what WordStack is about.

Thank you for making WordStack a place where poetry thrives.

— The WordStack Team`,
      category: "Community",
      coverImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1200&h=600&fit=crop",
      author: "WordStack Team",
      publishedAt: "2024-11-15T00:00:00.000Z",
      updatedAt: "2024-11-15T00:00:00.000Z",
      createdAt: "2024-11-15T00:00:00.000Z",
      status: "published",
      showInCarousel: true,
      readTime: "3m read",
      metaTitle: "November's Most Inked Poems | WordStack Blog",
      metaDescription: "Celebrating November's most supported poems on WordStack and the poets whose work resonated deeply with our community.",
      metaKeywords: "poetry, community, ink, wordstack",
      ogImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1200&h=600&fit=crop"
    }
  ];
  localStorage.setItem(BLOG_POSTS_KEY, JSON.stringify(seeds));
  return seeds;
}

export function getBlogPosts(): BlogPost[] {
  const stored = localStorage.getItem(BLOG_POSTS_KEY);
  if (!stored) return seedBlogPosts();
  const posts: BlogPost[] = JSON.parse(stored);
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getPublishedBlogPosts(): BlogPost[] {
  return getBlogPosts().filter(p => p.status === "published");
}

export function getCarouselPosts(): BlogPost[] {
  return getPublishedBlogPosts().filter(p => p.showInCarousel);
}

export function getBlogPost(idOrSlug: string): BlogPost | null {
  const posts = getBlogPosts();
  return posts.find(p => p.id === idOrSlug || p.slug === idOrSlug) || null;
}

export function createBlogPost(data: Omit<BlogPost, "id" | "createdAt" | "updatedAt" | "slug"> & { slug?: string }): BlogPost {
  const now = new Date().toISOString();
  const post: BlogPost = {
    ...data,
    id: `blog-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    slug: data.slug || generateSlug(data.title),
    createdAt: now,
    updatedAt: now,
  };
  const posts = getBlogPosts();
  posts.unshift(post);
  localStorage.setItem(BLOG_POSTS_KEY, JSON.stringify(posts));
  return post;
}

export function updateBlogPost(id: string, updates: Partial<BlogPost>): BlogPost | null {
  const posts = getBlogPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) return null;
  posts[index] = { ...posts[index], ...updates, updatedAt: new Date().toISOString() };
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
