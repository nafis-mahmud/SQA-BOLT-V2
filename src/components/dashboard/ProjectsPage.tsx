import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { CategoryFolder } from "./CategoryFolder";
import { ProjectList } from "./ProjectList";
import { ViewMode } from "./ViewToggle";
import { ProjectCardProps } from "./ProjectCard";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { EditProjectDialog } from "./EditProjectDialog";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { categories } from "./mockData";
import {
  getUserProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/projectService";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectCardProps | null>(null);
  const [projects, setProjects] = useState<ProjectCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch projects from Supabase on component mount
  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const projectsData = await getUserProjects();
        console.log("Fetched projects:", projectsData);
        setProjects(projectsData);

        // Update category counts based on fetched projects
        updateCategoryCounts(projectsData);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // Update category counts based on projects
  const updateCategoryCounts = (projectsData: ProjectCardProps[]) => {
    // Reset all counts
    categories.forEach((category) => {
      if (category.id === "all") {
        category.count = projectsData.length;
      } else {
        category.count = projectsData.filter(
          (project) =>
            project.category.toLowerCase() === category.name.toLowerCase(),
        ).length;
      }
    });
  };

  // Filter projects based on search query and selected category
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      project.category.toLowerCase() ===
        categories.find((c) => c.id === selectedCategory)?.name.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleCreateProject = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setIsEditDialogOpen(true);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleSaveEditedProject = async (data: {
    title: string;
    category: string;
    description: string;
  }) => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      const updatedProject = await updateProject(selectedProject.id, data);

      if (updatedProject) {
        // Update the project in the local state
        setProjects(
          projects.map((p) =>
            p.id === selectedProject.id
              ? {
                  ...p,
                  title: data.title,
                  category: data.category,
                  description: data.description,
                  lastUpdated: "Just now",
                }
              : p,
          ),
        );

        toast({
          title: "Project updated",
          description: "The project has been updated successfully.",
        });
      }
    } catch (err) {
      console.error("Error updating project:", err);
      toast({
        title: "Update failed",
        description: "Failed to update the project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      const success = await deleteProject(selectedProject.id);

      if (success) {
        // Remove the project from the local state
        setProjects(projects.filter((p) => p.id !== selectedProject.id));

        // Update category counts
        const categoryId = categories.find(
          (c) => c.name === selectedProject.category,
        )?.id;

        if (categoryId && categoryId !== "all") {
          const categoryIndex = categories.findIndex(
            (c) => c.id === categoryId,
          );
          if (categoryIndex !== -1 && categories[categoryIndex].count > 0) {
            categories[categoryIndex].count -= 1;
            categories[0].count -= 1; // Update 'All Projects' count
          }
        }

        toast({
          title: "Project deleted",
          description: "The project has been deleted successfully.",
        });
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      toast({
        title: "Delete failed",
        description: "Failed to delete the project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleProjectCreation = async (projectData: {
    title: string;
    category: string;
  }) => {
    try {
      setLoading(true);
      console.log("Creating project:", projectData);

      // Create project in Supabase
      const newProject = await createProject({
        title: projectData.title,
        category: projectData.category,
        description: `This is a new ${projectData.category.toLowerCase()} project.`,
      });

      console.log("Created project:", newProject);

      if (newProject) {
        // Add the new project to the projects array
        setProjects([newProject, ...projects]);

        // Update the category count
        const categoryId = categories.find(
          (c) => c.name === projectData.category,
        )?.id;
        if (categoryId && categoryId !== "all") {
          const categoryIndex = categories.findIndex(
            (c) => c.id === categoryId,
          );
          if (categoryIndex !== -1) {
            categories[categoryIndex].count += 1;
            categories[0].count += 1; // Update 'All Projects' count
          }
        }

        // Select the category of the new project
        const newCategoryId = categories.find(
          (c) => c.name === projectData.category,
        )?.id;
        if (newCategoryId) {
          setSelectedCategory(newCategoryId);
        }
      } else {
        // If project creation failed, show error
        setError("Failed to create project. Please try again.");
      }
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6">
          <h1 className="mb-6 text-3xl font-bold">Projects</h1>

          <DashboardHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreateProject={handleCreateProject}
          />

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="space-y-3">
              <h2 className="font-semibold">Categories</h2>
              {categories.map((category) => (
                <CategoryFolder
                  key={category.id}
                  name={category.name}
                  count={category.count}
                  active={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id)}
                />
              ))}
            </div>

            <div className="lg:col-span-3">
              <h2 className="mb-4 font-semibold">
                {selectedCategory === "all"
                  ? "All Projects"
                  : categories.find((c) => c.id === selectedCategory)?.name}
                <span className="ml-2 text-sm text-muted-foreground">
                  ({filteredProjects.length})
                </span>
              </h2>

              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredProjects.length > 0 ? (
                <ProjectList
                  projects={filteredProjects}
                  viewMode={viewMode}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                />
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                  <p className="text-muted-foreground">No projects found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateProject={handleProjectCreation}
        categories={categories}
      />

      {selectedProject && (
        <>
          <EditProjectDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSave={handleSaveEditedProject}
            project={selectedProject}
            categories={categories}
          />

          <DeleteProjectDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleConfirmDelete}
            projectTitle={selectedProject.title}
          />
        </>
      )}
    </div>
  );
}
