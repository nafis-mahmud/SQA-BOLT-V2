import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dataset, updateDataset } from "@/lib/datasetService";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface DatasetItemProps {
  dataset: Dataset;
  onDelete?: (id: string) => void;
  className?: string;
}

export function DatasetItem({
  dataset,
  onDelete,
  className,
}: DatasetItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [description, setDescription] = useState(dataset.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveDescription = async () => {
    setIsSaving(true);
    try {
      await updateDataset(dataset.id, { description });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Error updating dataset description:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Function to handle file click - will be used by parent component
  const handleFileClick = (e) => {
    e.stopPropagation();
    // This will be handled by the parent component through a prop if needed
  };

  return (
    <div className={cn("rounded-md border p-2", className)}>
      <div
        className="flex items-center justify-between gap-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
            <FileText className="h-3 w-3 text-primary" />
          </div>
          <div className="flex items-center gap-1">
            {expanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
            <p className="text-xs font-medium">{dataset.name}</p>
          </div>
        </div>
        <div className="flex items-center">
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(dataset.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {!expanded && dataset.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
          {dataset.description}
        </p>
      )}

      {expanded && (
        <div className="mt-2 space-y-2">
          <div className="relative">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this dataset..."
              className="min-h-[80px] text-xs"
            />
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                className="h-7 text-xs px-2 flex items-center gap-1"
                onClick={handleSaveDescription}
                disabled={isSaving}
              >
                <Save className="h-3 w-3" />
                {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
