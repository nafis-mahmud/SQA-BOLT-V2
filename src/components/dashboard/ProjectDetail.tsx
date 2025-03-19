import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Editor } from "@monaco-editor/react";
import {
  ChevronLeft,
  Play,
  RotateCcw,
  MoreHorizontal,
  Clock,
  Database,
  BarChart3,
  FileText,
  Plus,
  Search,
  Loader2,
  Save,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectCardProps } from "./ProjectCard";
import { getProjectById } from "@/lib/projectService";
import {
  Dataset,
  getProjectDatasets,
  createDataset,
  deleteDataset,
  updateDataset,
} from "@/lib/datasetService";
import { CreateDatasetDialog } from "./CreateDatasetDialog";
import { DatasetItem } from "./DatasetItem";

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const projectFromState = location.state?.project as
    | ProjectCardProps
    | undefined;

  const [project, setProject] = useState<ProjectCardProps | undefined>(
    projectFromState,
  );
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedFile, setSelectedFile] = useState<Dataset | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(!projectFromState);
  const [datasetsLoading, setDatasetsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDatasetDialogOpen, setIsCreateDatasetDialogOpen] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // If we don't have the project from state, fetch it from Supabase
    if (!projectFromState && projectId) {
      const fetchProject = async () => {
        try {
          setLoading(true);
          const projectData = await getProjectById(projectId);
          if (projectData) {
            setProject(projectData);
          } else {
            setError("Project not found");
          }
        } catch (err) {
          console.error("Error fetching project:", err);
          setError("Failed to load project details");
        } finally {
          setLoading(false);
        }
      };

      fetchProject();
    }
  }, [projectId, projectFromState]);

  // Fetch datasets for the project
  useEffect(() => {
    if (projectId) {
      const fetchDatasets = async () => {
        try {
          setDatasetsLoading(true);
          const datasetsData = await getProjectDatasets(projectId);
          setDatasets(datasetsData);
        } catch (err) {
          console.error("Error fetching datasets:", err);
        } finally {
          setDatasetsLoading(false);
        }
      };

      fetchDatasets();
    }
  }, [projectId]);

  const handleCreateDataset = async (data: {
    name: string;
    description: string;
  }) => {
    if (!projectId) return;

    try {
      const newDataset = await createDataset({
        ...data,
        project_id: projectId,
      });

      if (newDataset) {
        setDatasets([newDataset, ...datasets]);

        // Update project datasets count
        if (project) {
          setProject({
            ...project,
            datasets: (project.datasets || 0) + 1,
          });
        }

        // If this is the first file, select it automatically
        if (datasets.length === 0 && project?.category === "Manual Testing") {
          setSelectedFile(newDataset);
          setFileContent(newDataset.description || "");
        }
      }
    } catch (err) {
      console.error("Error creating dataset:", err);
    }
  };

  // Refresh datasets after update
  const refreshDatasets = async () => {
    if (!projectId) return;

    try {
      setDatasetsLoading(true);
      const datasetsData = await getProjectDatasets(projectId);
      setDatasets(datasetsData);
    } catch (err) {
      console.error("Error refreshing datasets:", err);
    } finally {
      setDatasetsLoading(false);
    }
  };

  const handleDeleteDataset = async (datasetId: string) => {
    try {
      const success = await deleteDataset(datasetId);
      if (success) {
        // If the deleted dataset is the selected one, clear the selection
        if (selectedFile?.id === datasetId) {
          setSelectedFile(null);
          setFileContent("");
        }

        setDatasets(datasets.filter((d) => d.id !== datasetId));

        // Update project datasets count
        if (project && project.datasets > 0) {
          setProject({
            ...project,
            datasets: project.datasets - 1,
          });
        }
      }
    } catch (err) {
      console.error("Error deleting dataset:", err);
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFile) return;

    setIsSaving(true);
    try {
      await updateDataset(selectedFile.id, { description: fileContent });
      // Update the local dataset list
      setDatasets(
        datasets.map((d) =>
          d.id === selectedFile.id ? { ...d, description: fileContent } : d,
        ),
      );
    } catch (err) {
      console.error("Error saving file:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">
            Loading project details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Project not found</h2>
          <p className="mt-2 text-muted-foreground">
            {error || "The project you're looking for doesn't exist."}
          </p>
          <Button asChild className="mt-4">
            <Link to="/projects">Back to Projects</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/projects">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{project.title}</h1>
                <Badge variant="outline">{project.category}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {project.category === "Automation Testing (AI Agent)" && (
                <div className="flex items-center gap-2 mr-2">
                  <Button variant="outline" size="sm">
                    AI Assistant
                  </Button>
                  <Button variant="ghost" size="sm">
                    Charts
                  </Button>
                  <Button variant="ghost" size="sm">
                    Actions
                  </Button>
                </div>
              )}
              <Button variant="outline" size="sm">
                <RotateCcw className="mr-2 h-4 w-4" /> Refresh
              </Button>
              <Button size="sm">
                <Play className="mr-2 h-4 w-4" /> Run
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Last updated */}
          <div className="mb-6 flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>Last updated {project.lastUpdated}</span>
            <span className="mx-2">•</span>
            <div className="flex -space-x-2">
              {project.teamMembers.slice(0, 3).map((member) => (
                <Avatar
                  key={member.id}
                  className="h-6 w-6 border-2 border-background"
                >
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xs">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.teamMembers.length > 3 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                  +{project.teamMembers.length - 3}
                </div>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Left sidebar */}
            <div className="space-y-6">
              <div className="rounded-lg border bg-card p-4">
                <h3 className="mb-3 font-medium">Inputs</h3>
                <div className="relative">
                  <Input placeholder="Search..." className="pl-8" />
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>

                {project.category === "Automation Testing (AI Agent)" ? (
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Chat History</h4>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="mt-2 rounded-md border border-dashed p-4 text-center">
                      <p className="text-xs text-muted-foreground">
                        No chat history yet
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-1 h-auto p-0 text-xs"
                      >
                        Start a new conversation
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">
                          {project.category === "Manual Testing"
                            ? "Files"
                            : "Datasets"}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => setIsCreateDatasetDialogOpen(true)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="mt-2 space-y-2">
                        {datasetsLoading ? (
                          <div className="flex justify-center p-4">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          </div>
                        ) : datasets.length > 0 ? (
                          datasets.map((dataset) => (
                            <div
                              key={dataset.id}
                              onClick={
                                project.category === "Manual Testing"
                                  ? () => {
                                      setSelectedFile(dataset);
                                      setFileContent(dataset.description || "");
                                    }
                                  : undefined
                              }
                              className={
                                project.category === "Manual Testing"
                                  ? "cursor-pointer"
                                  : ""
                              }
                            >
                              <DatasetItem
                                dataset={dataset}
                                onDelete={handleDeleteDataset}
                                className={
                                  selectedFile?.id === dataset.id
                                    ? "border-primary"
                                    : ""
                                }
                              />
                            </div>
                          ))
                        ) : (
                          <div className="rounded-md border border-dashed p-4 text-center">
                            <p className="text-xs text-muted-foreground">
                              {project.category === "Manual Testing"
                                ? "No files added yet"
                                : "No datasets added yet"}
                            </p>
                            <Button
                              variant="link"
                              size="sm"
                              className="mt-1 h-auto p-0 text-xs"
                              onClick={() => setIsCreateDatasetDialogOpen(true)}
                            >
                              {project.category === "Manual Testing"
                                ? "Add your first file"
                                : "Add your first dataset"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Connectors</h4>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="mt-2 space-y-2">
                        <div className="rounded-md border p-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-100">
                              <svg
                                className="h-3 w-3 text-amber-600"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M13.833 2.5H15.5c.69 0 1.25.56 1.25 1.25V4h2.75c.69 0 1.25.56 1.25 1.25v15.5c0 .69-.56 1.25-1.25 1.25H4.5c-.69 0-1.25-.56-1.25-1.25V5.25C3.25 4.56 3.81 4 4.5 4h2.75V3.75c0-.69.56-1.25 1.25-1.25h1.667c.69 0 1.25.56 1.25 1.25v.5h1.666v-.5c0-.69.56-1.25 1.25-1.25z" />
                              </svg>
                            </div>
                            <p className="text-xs font-medium">
                              AWS Asset Inventory
                            </p>
                          </div>
                        </div>
                        <div className="rounded-md border p-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-red-100">
                              <svg
                                className="h-3 w-3 text-red-600"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                              </svg>
                            </div>
                            <p className="text-xs font-medium">Adobe</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Main content area */}
            <div className="lg:col-span-3">
              {project.category === "Automation Testing (AI Agent)" ? (
                <div className="flex flex-col space-y-4">
                  {/* Chat display area */}
                  <div className="rounded-lg border p-4 h-[300px] overflow-y-auto">
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-start">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src="/ai-avatar.png" alt="AI" />
                          <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                          <p className="text-sm">
                            Hello! I'm your AI assistant. You can ask me questions about your supply chain data, 
                            upload PDF or Excel files for analysis, or request specific insights.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* File upload area */}
                  <div className="rounded-lg border p-3 bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Button variant="outline" size="sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload Excel
                      </Button>
                      <div className="text-xs text-muted-foreground ml-2">
                        Supported formats: .pdf, .xlsx, .csv
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Input
                        className="flex-1"
                        placeholder="Type your prompt here..."
                      />
                      <Button>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Tabs defaultValue="dashboards">
                  <TabsList className="mb-4">
                    <TabsTrigger value="dashboards">
                      {project.category === "Manual Testing"
                        ? "Code Editor"
                        : "Dashboards"}
                    </TabsTrigger>
                    <TabsTrigger value="charts">Charts</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="dashboards" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        {project.category === "Manual Testing"
                          ? "Code Editor"
                          : "Dashboards"}
                      </h3>
                      {project.category === "Manual Testing" ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSaveFile}
                            disabled={!selectedFile || isSaving}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? "Saving..." : "Save"}
                          </Button>
                          <Button size="sm">
                            <Play className="mr-2 h-4 w-4" /> Run
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" /> Add Dashboard
                        </Button>
                      )}
                    </div>

                    {project.category === "Manual Testing" ? (
                      <div className="rounded-lg border p-4">
                        {selectedFile ? (
                          <Editor
                            height="400px"
                            defaultLanguage="javascript"
                            value={fileContent}
                            onChange={(value) => setFileContent(value || "")}
                            theme="vs-dark"
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              scrollBeyondLastLine: false,
                              automaticLayout: true,
                            }}
                          />
                        ) : (
                          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <FileText className="mx-auto h-10 w-10 opacity-20" />
                              <p className="mt-2">
                                Select a file from the sidebar or create a new one
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed p-8 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <BarChart3 className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="mt-4 font-medium">
                          No dashboards added yet
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Create your first dashboard to visualize your data.
                        </p>
                        <Button className="mt-4">
                          <Plus className="mr-2 h-4 w-4" /> Create Dashboard
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="charts" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Charts</h3>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Chart
                      </Button>
                    </div>

                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <BarChart3 className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mt-4 font-medium">No charts added yet</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Create your first chart to visualize your data.
                      </p>
                      <Button className="mt-4">
                        <Plus className="mr-2 h-4 w-4" /> Create Chart
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="actions" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Actions</h3>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Action
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">Use Template</h4>
                            <p className="text-xs text-muted-foreground">
                              Some text can go here explaining what a template
                              does
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">Convert Excel</h4>
                            <p className="text-xs text-muted-foreground">
                              Text explaining how a user can convert an excel
                              sheet
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateDatasetDialog
        open={isCreateDatasetDialogOpen}
        onOpenChange={setIsCreateDatasetDialogOpen}
        onCreateDataset={handleCreateDataset}
        projectId={projectId || ""}
      />
    </div>
  );
}
