import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { signup } from "@/lib/auth";
import { Loader2, AlertCircle } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [asPoet, setAsPoet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { user, error: signupError } = await signup(email, password, name, asPoet);

    if (signupError) {
      setError(signupError);
      setLoading(false);
      return;
    }

    if (user) {
      // Check if user is admin (first signup)
      if (user.isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/onboarding");
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-muted/30">
      <Card className="w-full max-w-md p-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
          Join WordStack
        </h1>
        <p className="text-muted-foreground mb-6">
          Create your account and start exploring poetry
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Signup Failed</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <Input 
              type="text" 
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

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
              placeholder="Create password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">Must be at least 6 characters long</p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-md border border-accent">
            <Checkbox 
              id="asPoet"
              checked={asPoet}
              onCheckedChange={(checked) => setAsPoet(checked as boolean)}
            />
            <label 
              htmlFor="asPoet" 
              className="text-sm leading-relaxed cursor-pointer"
            >
              <span className="font-semibold">I'm joining as a poet</span>
              <br />
              <span className="text-muted-foreground">
                Get your own page to publish poems and build an audience
              </span>
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:underline font-medium">
            Log in
          </a>
        </p>
      </Card>
    </div>
  );
}
