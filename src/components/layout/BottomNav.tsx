import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Users, Bookmark } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { useCommentsOverlay } from "@/contexts/CommentsOverlayContext";

export default function BottomNav() {
  const location = useLocation();
  const user = getCurrentUser();
  const { isOpen: isCommentsOpen } = useCommentsOverlay();

  if (!user || isCommentsOpen) return null;

  const navItems = [
    {
      id: "feed",
      path: "/feed",
      icon: Home,
      label: "Feed"
    },
    {
      id: "explore",
      path: "/explore",
      icon: Compass,
      label: "Explore"
    },
    {
      id: "community",
      path: "/community",
      icon: Users,
      label: "Community"
    },
    {
      id: "saved",
      path: "/saved",
      icon: Bookmark,
      label: "Saved"
    }
  ];

  const isActive = (path: string) => {
    if (path === "/feed") {
      return location.pathname === "/" || location.pathname === "/feed";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
      <div className="container mx-auto px-2 max-w-7xl">
        <div className="flex items-center justify-around h-16">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "fill-primary/20" : ""}`} />
                <span className="text-xs font-medium">{item.label}</span>
                {active && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
