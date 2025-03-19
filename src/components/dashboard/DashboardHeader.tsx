import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { ViewToggle, ViewMode } from "./ViewToggle";

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onCreateProject: () => void;
}

export function DashboardHeader({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onCreateProject,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 sm:max-w-md">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
      </div>
      <div className="flex items-center gap-2">
        <ViewToggle value={viewMode} onChange={onViewModeChange} />
        <Button onClick={onCreateProject}>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>
    </div>
  );
}
