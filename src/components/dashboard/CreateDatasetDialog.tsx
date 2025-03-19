import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateDatasetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateDataset: (data: { name: string; description: string }) => void;
  projectId: string;
}

export function CreateDatasetDialog({
  open,
  onOpenChange,
  onCreateDataset,
  projectId,
}: CreateDatasetDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Dataset name is required");
      return;
    }

    setIsSubmitting(true);
    onCreateDataset({ name, description });
    setIsSubmitting(false);
    setName("");
    setDescription("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {projectId && projectId.startsWith("manual-")
              ? "Add New File"
              : "Add New Dataset"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              {projectId && projectId.startsWith("manual-")
                ? "File Name"
                : "Dataset Name"}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                projectId && projectId.startsWith("manual-")
                  ? "Enter file name (e.g. test.js)"
                  : "Enter dataset name"
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              {projectId && projectId.startsWith("manual-")
                ? "File Content"
                : "Description"}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                projectId && projectId.startsWith("manual-")
                  ? "Enter file content here"
                  : "Enter dataset description"
              }
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name || isSubmitting}>
              {isSubmitting
                ? "Adding..."
                : projectId && projectId.startsWith("manual-")
                  ? "Add File"
                  : "Add Dataset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
