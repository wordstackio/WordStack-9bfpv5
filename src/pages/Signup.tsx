import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { mockSignup } from "@/lib/auth";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [asPoet, setAsPoet] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mockSignup(email, name, asPoet);
    navigate("/onboarding");
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
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <Input 
              type="text" 
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
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
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input 
              type="password" 
              placeholder="Create password"
              required
            />
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

          <Button type="submit" className="w-full">
            Create Account
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
