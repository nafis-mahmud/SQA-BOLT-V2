import { ProjectCard, ProjectCardProps } from "./ProjectCard";
import { cn } from "@/lib/utils";
import { ViewMode } from "./ViewToggle";

interface ProjectListProps {
  projects: ProjectCardProps[];
  viewMode: ViewMode;
  className?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ProjectList({
  projects,
  viewMode,
  className,
  onEdit,
  onDelete,
}: ProjectListProps) {
  return (
    <div
      className={cn(
        viewMode === "grid"
          ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "space-y-2",
        className,
      )}
    >
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          {...project}
          className={
            viewMode === "list" ? "flex flex-col md:flex-row" : undefined
          }
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
