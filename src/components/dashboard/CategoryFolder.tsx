import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CategoryFolderProps {
  name: string;
  count: number;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryFolder({
  name,
  count,
  active = false,
  onClick,
  className,
}: CategoryFolderProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all hover:bg-accent",
        active ? "border-primary bg-accent" : "border-border",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-md",
          active
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Folder className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{name}</h3>
        <p className="text-xs text-muted-foreground">{count} projects</p>
      </div>
    </div>
  );
}
