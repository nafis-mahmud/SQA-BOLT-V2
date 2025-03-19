import { cn } from "@/lib/utils";
import {
  Home,
  FolderKanban,
  BarChart3,
  Settings,
  Users,
  FileText,
  HelpCircle,
  Key,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { LogoutButton } from "./LogoutButton";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({ icon, label, href, active }: SidebarItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-primary/10",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground",
      )}
    >
      <div className="flex h-5 w-5 items-center justify-center">{icon}</div>
      <span>{label}</span>
    </Link>
  );
};

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const userEmail = localStorage.getItem("userEmail") || "User";

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-14 items-center justify-between border-b border-slate-800 px-4">
        <h2 className="text-lg font-semibold">SQA-SSH</h2>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          <SidebarItem
            icon={<Home className="h-4 w-4" />}
            label="Dashboard"
            href="/projects"
            active={pathname === "/"}
          />
          <SidebarItem
            icon={<FolderKanban className="h-4 w-4" />}
            label="Projects"
            href="/projects"
            active={pathname.startsWith("/projects")}
          />
          <SidebarItem
            icon={<BarChart3 className="h-4 w-4" />}
            label="Analytics"
            href="/analytics"
            active={pathname.startsWith("/analytics")}
          />
          <SidebarItem
            icon={<Users className="h-4 w-4" />}
            label="Team"
            href="/team"
            active={pathname.startsWith("/team")}
          />
          <SidebarItem
            icon={<FileText className="h-4 w-4" />}
            label="Documentation"
            href="/docs"
            active={pathname.startsWith("/docs")}
          />
          <SidebarItem
            icon={<HelpCircle className="h-4 w-4" />}
            label="Help & Support"
            href="/help"
            active={pathname.startsWith("/help")}
          />
          <SidebarItem
            icon={<Settings className="h-4 w-4" />}
            label="Settings"
            href="/settings"
            active={pathname.startsWith("/settings")}
          />
          <SidebarItem
            icon={<Key className="h-4 w-4" />}
            label="Extension Token"
            href="/extension-token"
            active={pathname.startsWith("/extension-token")}
          />
        </nav>
      </div>
      <div className="mb-6 px-4">
          <div className="rounded-lg bg-slate-800 p-3">
            <p className="text-xs text-slate-400">Logged in as</p>
            <p className="truncate text-sm font-medium">{userEmail}</p>
          </div>
        </div>
      <div className="border-t border-slate-800 p-4">
        <LogoutButton />
      </div>
    </div>
  );
}
