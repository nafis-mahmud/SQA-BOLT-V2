import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear authentication state from localStorage
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local storage and redirect even if Supabase logout fails
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");
      navigate("/login");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </Button>
  );
}
