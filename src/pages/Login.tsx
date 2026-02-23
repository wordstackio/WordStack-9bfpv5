import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { login, getCurrentUser, DEV_MODE, devLogin } from "@/lib/auth";
import { Loader2, AlertCircle, ShieldCheck, PenTool, BookOpen } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      const isViewingSite = localStorage.getItem("wordstack_admin_viewing_site") === "true";
      if (user.isAdmin && isViewingSite) {
        navigate("/feed", { replace: true });
      } else {
        navigate(user.isAdmin ? "/admin/dashboard" : "/feed", { replace: true });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user, error: loginError } = await login(email, password);

      if (loginError) {
        setError(loginError);
        return;
      }

      if (user) {
        // Redirect based on user role
        if (user.isAdmin) {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/feed", { replace: true });
        }
      } else {
        setError("Login failed. Please check your credentials and try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = (role: "admin" | "poet" | "reader") => {
    const user = devLogin(role);
    if (user.isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/feed", { replace: true });
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-muted/30">
      <Card className="w-full max-w-md p-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
          Welcome back
        </h1>
        <p className="text-muted-foreground mb-6">
          Log in to continue your poetry journey
        </p>

        {DEV_MODE && (
          <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-amber-400 bg-amber-50">
            <p className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
              DEV MODE - Quick Login
            </p>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-2 border-purple-300 bg-purple-50 text-purple-800 hover:bg-purple-100 hover:text-purple-900"
                onClick={() => handleDevLogin("admin")}
              >
                <ShieldCheck className="w-4 h-4" />
                Login as Admin (full access)
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-2 border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100 hover:text-blue-900"
                onClick={() => handleDevLogin("poet")}
              >
                <PenTool className="w-4 h-4" />
                Login as Poet (write + read)
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-2 border-green-300 bg-green-50 text-green-800 hover:bg-green-100 hover:text-green-900"
                onClick={() => handleDevLogin("reader")}
              >
                <BookOpen className="w-4 h-4" />
                Login as Reader (read only)
              </Button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Login Failed</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input 
              type="email" 
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input 
              type="password" 
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging In...
              </>
            ) : (
              "Log In"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <a href="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </a>
        </p>
      </Card>
    </div>
  );
}
