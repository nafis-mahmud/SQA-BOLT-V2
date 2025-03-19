import { useEffect, useState, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check localStorage for demo login
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        if (isLoggedIn) {
          setAuthenticated(true);
          setLoading(false);
          return;
        }

        // Then check Supabase session
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          // Set localStorage for compatibility with existing code
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userEmail", data.session.user.email || "");
          localStorage.setItem("userId", data.session.user.id);
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userEmail", session.user.email || "");
          localStorage.setItem("userId", session.user.id);
          setAuthenticated(true);
        } else if (event === "SIGNED_OUT") {
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userId");
          setAuthenticated(false);
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
