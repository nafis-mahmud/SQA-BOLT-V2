import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart3,
  Database,
  FileText,
  GitBranch,
  Users,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  resources: number;
  flows: number;
  datasets: number;
  dashboards: number;
  teamMembers: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  lastUpdated: string;
  className?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ProjectCard(props: ProjectCardProps) {
  const {
    id,
    title,
    description,
    category,
    resources,
    flows,
    datasets,
    dashboards,
    teamMembers,
    lastUpdated,
    className,
    onEdit,
    onDelete,
  } = props;
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Create a simplified version of the project without functions
    const projectData = {
      id,
      title,
      description,
      category,
      resources,
      flows,
      datasets,
      dashboards,
      teamMembers,
      lastUpdated,
    };
    navigate(`/project/${id}`, { state: { project: projectData } });
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) onEdit(id);
    setIsMenuOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(id);
    setIsMenuOpen(false);
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        className,
      )}
      onClick={handleClick}
    >
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <div className="cursor-pointer">
            <h3 className="font-semibold">{title}</h3>
            <Badge variant="outline" className="mt-1">
              {category}
            </Badge>
          </div>
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditClick}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2" onClick={handleClick}>
        <p className="text-sm text-muted-foreground line-clamp-2 cursor-pointer">
          {description}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs cursor-pointer">
          <div className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            <span>{resources} Resources</span>
          </div>
          <div className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            <span>{flows} Flows</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{datasets} Datasets</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            <span>{dashboards} Dashboards</span>
          </div>
        </div>
      </CardContent>
      <CardFooter
        className="flex items-center justify-between border-t p-4 pt-2"
        onClick={handleClick}
      >
        <div className="flex -space-x-2 cursor-pointer">
          {teamMembers.slice(0, 3).map((member) => (
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
          {teamMembers.length > 3 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
              +{teamMembers.length - 3}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
          <Users className="h-3 w-3" />
          <span>Updated {lastUpdated}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
