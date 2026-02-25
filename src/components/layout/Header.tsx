import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Feather, User, Settings, Edit, PenLine, BookOpen, Bell, LogOut, X, Menu, Wallet, Shield } from "lucide-react";
import { getCurrentUser, logout } from "@/lib/auth";
import { getUnreadNotificationsCount, getUserInkBalance } from "@/lib/storage";

export default function Header() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [inkBalance, setInkBalance] = useState(0);
  const isAdminViewingSite = user?.isAdmin && localStorage.getItem("wordstack_admin_viewing_site") === "true";

  useEffect(() => {
    if (user) {
      setUnreadCount(getUnreadNotificationsCount(user.id));
      setInkBalance(getUserInkBalance(user.id));
      
      // Poll for new notifications and balance every 10 seconds
      const interval = setInterval(() => {
        setUnreadCount(getUnreadNotificationsCount(user.id));
        setInkBalance(getUserInkBalance(user.id));
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    const wasAdmin = user?.isAdmin;
    localStorage.removeItem("wordstack_admin_viewing_site");
    await logout();
    setMenuOpen(false);
    navigate(wasAdmin ? "/wsadmin" : "/", { replace: true });
    window.location.reload();
  };

  const handleBackToAdmin = () => {
    localStorage.removeItem("wordstack_admin_viewing_site");
    navigate("/admin/dashboard");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {isAdminViewingSite && (
        <div className="bg-gray-900 text-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between max-w-7xl">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Admin Preview Mode</span>
            </div>
            <button
              onClick={handleBackToAdmin}
              className="text-sm font-medium px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
      <header className={`border-b border-border bg-card ${isAdminViewingSite ? 'sticky top-[40px]' : 'sticky top-0'} z-40`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          {/* Left: Profile Icon (or Login) */}
          <div className="flex items-center">
            {user ? (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
              </button>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Log In
                </Button>
              </Link>
            )}
          </div>

          {/* Center: WordStack */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="font-serif text-xl md:text-2xl font-bold text-foreground">WordStack</span>
          </Link>

          {/* Right: Notifications (or Sign Up) */}
          <div className="flex items-center">
            {user ? (
              <button 
                onClick={() => navigate("/notifications")}
                className="relative p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            ) : (
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Side Menu Overlay */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50 transition-opacity"
            onClick={closeMenu}
          />
          
          {/* Side Menu */}
          <div className="fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 shadow-2xl transform transition-transform">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.isPoet ? 'Poet' : 'Reader'}</p>
                  </div>
                </div>
                <button
                  onClick={closeMenu}
                  className="p-1 hover:bg-accent rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 overflow-y-auto py-2">
                <Link
                  to="/ink-wallet"
                  onClick={closeMenu}
                  className="flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Ink Wallet</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{inkBalance}</span>
                </Link>
                
                <div className="h-px bg-border my-2" />
                
                {user?.isPoet ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                    >
                      <User className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">Poet Dashboard</span>
                    </Link>

                    <Link
                      to="/analytics"
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                    >
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="font-medium">Analytics</span>
                    </Link>

                    <Link
                      to="/write"
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                    >
                      <PenLine className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">Write</span>
                    </Link>
                    
                    <Link
                      to="/collections"
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                    >
                      <BookOpen className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">Collections</span>
                    </Link>
                    
                    <Link
                      to="/profile/edit"
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                    >
                      <Edit className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">Edit Profile</span>
                    </Link>
                    
                    <div className="h-px bg-border my-2" />
                  </>
                ) : (
                  <>
                    <Link
                      to="/become-poet"
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                    >
                      <Feather className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">Become a Poet</span>
                    </Link>
                    
                    <div className="h-px bg-border my-2" />
                  </>
                )}
                
                <Link
                  to="/settings"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                >
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Settings</span>
                </Link>
              </nav>

              {/* Logout Button */}
              <div className="p-4 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
