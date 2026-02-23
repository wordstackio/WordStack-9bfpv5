import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/storage";
import { Notification } from "@/types";
import {
  Bell,
  MessageCircle,
  Reply,
  AtSign,
  Heart,
  CheckCheck,
  Inbox,
} from "lucide-react";

type NotifTab = "all" | "comments" | "replies" | "mentions" | "claps";

const TAB_CONFIG: { key: NotifTab; label: string; icon: React.ReactNode; types: string[] }[] = [
  { key: "all", label: "All", icon: <Bell className="w-4 h-4" />, types: [] },
  { key: "comments", label: "Comments", icon: <MessageCircle className="w-4 h-4" />, types: ["comment"] },
  { key: "replies", label: "Replies", icon: <Reply className="w-4 h-4" />, types: ["reply"] },
  { key: "mentions", label: "Mentions", icon: <AtSign className="w-4 h-4" />, types: ["mention"] },
  { key: "claps", label: "Claps", icon: <Heart className="w-4 h-4" />, types: ["clap", "like"] },
];

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getNotifIcon(type: string) {
  switch (type) {
    case "comment":
      return <MessageCircle className="w-4 h-4 text-blue-600" />;
    case "reply":
      return <Reply className="w-4 h-4 text-emerald-600" />;
    case "mention":
      return <AtSign className="w-4 h-4 text-amber-600" />;
    case "clap":
    case "like":
      return <Heart className="w-4 h-4 text-rose-500" />;
    default:
      return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
}

function getNotifBg(type: string) {
  switch (type) {
    case "comment":
      return "bg-blue-100";
    case "reply":
      return "bg-emerald-100";
    case "mention":
      return "bg-amber-100";
    case "clap":
    case "like":
      return "bg-rose-100";
    default:
      return "bg-muted";
  }
}

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id);
    }
    if (notification.postId) {
      navigate(`/community`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-start gap-3 p-4 text-left transition-colors rounded-lg ${
        notification.isRead
          ? "bg-card hover:bg-accent/50"
          : "bg-primary/5 hover:bg-primary/10"
      }`}
    >
      {/* Icon */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${getNotifBg(
          notification.type
        )}`}
      >
        {getNotifIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-snug ${
              notification.isRead ? "text-muted-foreground" : "text-foreground font-medium"
            }`}
          >
            {notification.message}
          </p>
          {!notification.isRead && (
            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatTimeAgo(notification.createdAt)}
        </p>
      </div>

      {/* Actor avatar */}
      {notification.actorAvatar && (
        <img
          src={notification.actorAvatar}
          alt=""
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      )}
    </button>
  );
}

export default function Notifications() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState<NotifTab>("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    refreshNotifications();
  }, [user, navigate]);

  const refreshNotifications = () => {
    if (!user) return;
    setNotifications(getNotifications(user.id));
    setUnreadCount(getUnreadNotificationsCount(user.id));
  };

  const handleMarkRead = (notifId: string) => {
    markNotificationAsRead(notifId);
    refreshNotifications();
  };

  const handleMarkAllRead = () => {
    if (!user) return;
    markAllNotificationsAsRead(user.id);
    refreshNotifications();
  };

  if (!user) return null;

  const currentTab = TAB_CONFIG.find((t) => t.key === activeTab)!;
  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => currentTab.types.includes(n.type));

  // Group by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: { label: string; items: Notification[] }[] = [];
  const todayItems = filtered.filter((n) => new Date(n.createdAt) >= today);
  const yesterdayItems = filtered.filter((n) => {
    const d = new Date(n.createdAt);
    return d >= yesterday && d < today;
  });
  const thisWeekItems = filtered.filter((n) => {
    const d = new Date(n.createdAt);
    return d >= weekAgo && d < yesterday;
  });
  const olderItems = filtered.filter((n) => new Date(n.createdAt) < weekAgo);

  if (todayItems.length > 0) groups.push({ label: "Today", items: todayItems });
  if (yesterdayItems.length > 0) groups.push({ label: "Yesterday", items: yesterdayItems });
  if (thisWeekItems.length > 0) groups.push({ label: "This Week", items: thisWeekItems });
  if (olderItems.length > 0) groups.push({ label: "Earlier", items: olderItems });

  const tabCounts = TAB_CONFIG.map((tab) => {
    if (tab.key === "all") return { ...tab, count: notifications.filter((n) => !n.isRead).length };
    return {
      ...tab,
      count: notifications.filter((n) => !n.isRead && tab.types.includes(n.type)).length,
    };
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Page header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-1">
            <h1 className="font-serif text-2xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
                onClick={handleMarkAllRead}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              You have{" "}
              <span className="font-semibold text-foreground">{unreadCount}</span>{" "}
              unread {unreadCount === 1 ? "notification" : "notifications"}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border-b border-border sticky top-[73px] z-30">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mb-px">
            {tabCounts.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.key
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification list */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold text-foreground mb-1">
              {activeTab === "all" ? "No notifications yet" : `No ${currentTab.label.toLowerCase()}`}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {activeTab === "all"
                ? "When someone interacts with your content, you'll see it here."
                : `You don't have any ${currentTab.label.toLowerCase()} notifications yet.`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.label}>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                  {group.label}
                </h2>
                <div className="space-y-1">
                  {group.items.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={handleMarkRead}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
