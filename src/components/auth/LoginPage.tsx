import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { generateAuthToken, storeAuthToken } from "@/lib/authToken";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // For demo purposes, allow direct login with demo credentials
      if (email === "demo@example.com" && password === "password123") {
        // Simulate successful login
        setTimeout(() => {
          try {
            // Set login state in localStorage
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userEmail", email);
            
            // Generate a demo token for the extension
            const demoToken = generateDemoToken(email);
            storeAuthToken(demoToken);
            
            navigate("/dashboard");
          } catch (err) {
            console.error("Error in demo login:", err);
            setError("Error during login process");
            setLoading(false);
          }
        }, 1000);
        return;
      }

      // Use Supabase auth for real login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data && data.user) {
        // Set login state in localStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userId", data.user.id);
        
        // Generate and store token for extension authentication
        const token = await generateAuthToken();
        if (token) {
          storeAuthToken(token);
        }
        
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  // Generate a demo token for the demo user
  const generateDemoToken = (email: string) => {
    // Create a simple payload
    const payload = {
      userId: 'demo-user-id',
      email: email,
      role: 'user',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
    };
    
    // Base64 encode the payload
    return btoa(JSON.stringify(payload));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="mt-2 text-center text-xs text-muted-foreground">
              <p>Demo credentials are pre-filled for you</p>
              <p>Email: demo@example.com / Password: password123</p>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
