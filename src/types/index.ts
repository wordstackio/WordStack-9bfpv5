export interface User {
  id: string;
  name: string;
  bio: string;
  isPoet: boolean;
  isAdmin?: boolean;
  avatar?: string;
  followersCount: number;
  createdAt: string;
  bannerImage?: string;
  customUrl?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

export interface Poet extends User {
  isPoet: true;
  totalPoems: number;
  totalInk: number;
  aboutText?: string;
}

export interface Poem {
  id: string;
  poetId: string;
  poetName: string;
  poetAvatar?: string;
  title: string;
  content: string;
  createdAt: string;
  clapsCount: number;
  commentsCount: number;
  isPinned?: boolean;
  collectionIds?: string[];
}

export interface Collection {
  id: string;
  poetId: string;
  name: string;
  description?: string;
  coverImage?: string;
  poemIds: string[];
  createdAt: string;
  order: number;
}

export interface Update {
  id: string;
  poetId: string;
  poetName: string;
  poetAvatar?: string;
  content: string;
  createdAt: string;
}

export interface InkSupport {
  id: string;
  fromUserId: string;
  toPoetId: string;
  poemId: string;
  amount: number;
  createdAt: string;
}

export interface Spotlight {
  poemId: string;
  poetId: string;
  createdAt: string;
  expiresAt: string;
}

export type Typography = "serif" | "sans" | "typewriter";
export type ColorScheme = "minimal-white" | "dark-literary" | "warm-paper" | "modern-clean";

export interface ThemePreferences {
  typography: Typography;
  colorScheme: ColorScheme;
  sections: {
    showUpdates: boolean;
    showCollections: boolean;
    showSupport: boolean;
  };
}

export const DEFAULT_THEME: ThemePreferences = {
  typography: "serif",
  colorScheme: "minimal-white",
  sections: {
    showUpdates: true,
    showCollections: true,
    showSupport: true
  }
};

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface PostPoll {
  question: string;
  options: PollOption[];
  endsAt: string;
  votedUsers: Record<string, string>; // userId -> optionId
}

export interface QuoteRef {
  poemId: string;
  poemTitle: string;
  poetName: string;
  excerpt: string;
}

export interface CommunityPost {
  id: string;
  poetId: string;
  poetName: string;
  poetAvatar?: string;
  content: string;
  images?: string[];
  link?: { url: string; title?: string; description?: string; image?: string; domain?: string };
  poll?: PostPoll;
  quote?: QuoteRef;
  replyPermission?: "everyone" | "followers";
  createdAt: string;
  clapsCount: number;
  likesCount: number;
  commentsCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  parentCommentId?: string; // For nested replies
  mentions: string[]; // User IDs mentioned in the comment
  createdAt: string;
  clapsCount: number;
  isPoetReply?: boolean; // Marks poet responses to top-level comments
}

export interface Notification {
  id: string;
  recipientId: string;
  type: "comment" | "reply" | "mention" | "clap";
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  postId: string;
  commentId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface FreeInkUsage {
  userId: string;
  dailyUsed: number;
  monthlyUsed: number;
  lastDailyReset: string;
  lastMonthlyReset: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string;
  author: string;
  authorAvatar?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "published";
  showInCarousel: boolean;
  readTime: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
}

export interface AccountDeletionRequest {
  id: string;
  userId: string;
  userName: string;
  reason: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  theme: string;
  themeImage: string; // Featured image URL for the challenge
  deadlineDate: string;
  inkCost: number;
  status: "active" | "closed" | "past";
  entries: ChallengeEntry[];
  createdAt: string;
  winners?: string[]; // poemIds of winning entries
  prizePool?: number;
}

export interface ChallengeEntry {
  id: string;
  challengeId: string;
  poemId: string;
  poetId: string;
  poetName: string;
  poetAvatar?: string;
  poemTitle: string;
  poemPreview: string; // first 3-5 lines
  submittedAt: string;
  inkReceived: number;
  isShortlisted?: boolean;
  isWinner?: boolean;
}
