import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/community" element={<Community />} />
          <Route path="/poet/:id" element={<PoetPage />} />
          <Route path="/poem/:id" element={<PoemPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/write" element={<WritePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collection/:id" element={<CollectionPage />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/become-poet" element={<BecomePoet />} />
          <Route path="/ink-wallet" element={<InkWallet />} />
          <Route path="/ink-store" element={<InkStore />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
        <BottomNav />
        <FAB />
      </div>
    </BrowserRouter>
  );
}

export default App;
