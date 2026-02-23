import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEV_MODE, devLogin, getCurrentUser, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ShieldCheck, PenTool, BookOpen, ChevronUp, ChevronDown, LogOut } from "lucide-react";

export default function DevModeBanner() {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  if (!DEV_MODE) return null;

  const currentRole = user?.isAdmin ? "Admin" : user?.isPoet ? "Poet" : user ? "Reader" : "Not logged in";

  const handleSwitch = async (role: "admin" | "poet" | "reader") => {
    await logout();
    const newUser = devLogin(role);
    setExpanded(false);
    if (newUser.isAdmin) {
      localStorage.removeItem("wordstack_admin_viewing_site");
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/feed", { replace: true });
    }
    // Force re-render by reloading — simplest way to refresh all components reading getCurrentUser()
    window.location.reload();
  };

  const handleLogout = async () => {
    await logout();
    setExpanded(false);
    navigate("/login", { replace: true });
    window.location.reload();
  };

  return (
    <div className="fixed bottom-20 right-4 z-[9999] flex flex-col items-end gap-2">
      {expanded && (
        <div className="bg-gray-900 border border-amber-500/40 rounded-lg p-3 shadow-2xl w-56 animate-in slide-in-from-bottom-2">
          <p className="text-xs text-amber-300 font-semibold mb-2">Switch Role</p>
          <div className="flex flex-col gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              className={`w-full justify-start gap-2 text-xs ${user?.isAdmin ? "bg-purple-500/20 text-purple-300" : "text-gray-300 hover:text-purple-300"}`}
              onClick={() => handleSwitch("admin")}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`w-full justify-start gap-2 text-xs ${user?.isPoet && !user?.isAdmin ? "bg-blue-500/20 text-blue-300" : "text-gray-300 hover:text-blue-300"}`}
              onClick={() => handleSwitch("poet")}
            >
              <PenTool className="w-3.5 h-3.5" />
              Poet
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`w-full justify-start gap-2 text-xs ${!user?.isPoet && !user?.isAdmin && user ? "bg-green-500/20 text-green-300" : "text-gray-300 hover:text-green-300"}`}
              onClick={() => handleSwitch("reader")}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Reader
            </Button>
            <div className="border-t border-gray-700 my-1" />
            <Button
              size="sm"
              variant="ghost"
              className="w-full justify-start gap-2 text-xs text-red-400 hover:text-red-300"
              onClick={handleLogout}
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </div>
        </div>
      )}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500 text-gray-900 text-xs font-bold shadow-lg hover:bg-amber-400 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-gray-900 animate-pulse" />
        DEV: {currentRole}
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </button>
    </div>
  );
}
