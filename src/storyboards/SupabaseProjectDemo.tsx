import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { ProjectsPage } from "@/components/dashboard/ProjectsPage";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SupabaseProjectDemo() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true",
  );

  // Set up demo user if not logged in
  const setupDemoUser = () => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", "demo@example.com");
    setIsLoggedIn(true);
  };

  return (
    <BrowserRouter>
      {!isLoggedIn ? (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Supabase Project Demo
              </CardTitle>
              <CardDescription>
                This demo shows how projects are stored in Supabase and linked
                to the current user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  When you create a project, it will be stored in Supabase under
                  your user account. Projects include team members and other
                  metadata.
                </p>
                <Button onClick={setupDemoUser} className="w-full">
                  Start Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <ProjectsPage />
      )}
    </BrowserRouter>
  );
}
