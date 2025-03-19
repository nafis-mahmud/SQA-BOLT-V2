import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProject } from "@/lib/projectService";
import { Loader2 } from "lucide-react";

export default function ProjectCreationDemo() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Ensure user is logged in for demo
  useState(() => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", "demo@example.com");
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!title.trim()) {
        throw new Error("Project title is required");
      }

      if (!category) {
        throw new Error("Category is required");
      }

      const project = await createProject({
        title,
        category,
        description: `This is a new ${category.toLowerCase()} project created for testing.`,
      });

      if (project) {
        setSuccess(true);
        setProjectId(project.id);
        setTitle("");
        setCategory("");
      } else {
        throw new Error("Failed to create project");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrowserRouter>
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Create Test Project
            </CardTitle>
            <CardDescription>
              This demo allows you to test project creation directly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter project title"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  disabled={loading}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual Testing">
                      Manual Testing
                    </SelectItem>
                    <SelectItem value="Automation Testing (AI Agent)">
                      Automation Testing (AI Agent)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
                  Project created successfully! ID: {projectId}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !title || !category}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            <p>
              This is a direct test of the project creation functionality,
              bypassing the main UI flow.
            </p>
          </CardFooter>
        </Card>
      </div>
    </BrowserRouter>
  );
}
