
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { restoreSession, getCurrentUser } from "@/lib/auth";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import FAB from "@/components/layout/FAB";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Onboarding from "@/pages/Onboarding";
import Explore from "@/pages/Explore";
import Feed from "@/pages/Feed";
import Community from "@/pages/Community";
import ComposePage from "@/pages/ComposePage";
import PoetPage from "@/pages/PoetPage";
import PoemPage from "@/pages/PoemPage";
import Settings from "@/pages/Settings";
import ProfileEdit from "@/pages/ProfileEdit";
import WritePage from "@/pages/WritePage";
import CollectionsPage from "@/pages/CollectionsPage";
import CollectionPage from "@/pages/CollectionPage";
import BlogPost from "@/pages/BlogPost";
import BecomePoet from "@/pages/BecomePoet";
import InkWallet from "@/pages/InkWallet";
import InkStore from "@/pages/InkStore";
import Analytics from "@/pages/Analytics";
import Notifications from "@/pages/Notifications";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import DevModeBanner from "@/components/features/DevModeBanner";
import PoetDashboard from "@/pages/PoetDashboard";
import Challenges from "@/pages/Challenges";
import ChallengeDetail from "@/pages/ChallengeDetail";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionReady, setSessionReady] = useState(false);

  const isAdminRoute = location.pathname.startsWith("/admin") || location.pathname === "/wsadmin";
  const isWriteRoute = location.pathname === "/write" || location.pathname === "/community/compose";

  useEffect(() => {
    restoreSession().then((user) => {
      setSessionReady(true);
      const isViewingSite = localStorage.getItem("wordstack_admin_viewing_site") === "true";
      if (user?.isAdmin && !isViewingSite && !location.pathname.startsWith("/admin") && location.pathname !== "/wsadmin") {
        navigate("/admin/dashboard", { replace: true });
      }
    });
  }, []); 

  // Show nothing until session is resolved to prevent flash
  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-background">
        <ScrollToTop />
        {!isAdminRoute && !isWriteRoute && <Header />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/compose" element={<ComposePage />} />
          <Route path="/poet/:id" element={<PoetPage />} />
          <Route path="/poem/:id" element={<PoemPage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/write" element={<WritePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collection/:id" element={<CollectionPage />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/become-poet" element={<BecomePoet />} />
          <Route path="/ink-wallet" element={<InkWallet />} />
          <Route path="/ink-store" element={<InkStore />} />
          <Route path="/dashboard" element={<PoetDashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/challenge/:id" element={<ChallengeDetail />} />
          <Route path="/wsadmin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
        {!isAdminRoute && !isWriteRoute && <BottomNav />}
        {!isAdminRoute && !isWriteRoute && <FAB />}
        <DevModeBanner />
      </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
