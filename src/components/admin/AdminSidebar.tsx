import { cn } from "@/lib/utils";
import { 
  Droplets, 
  AlertTriangle, 
  Wrench, 
  FileText, 
  Shield,
  ChevronLeft,
  ChevronRight,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type AdminTab = 
  | "resources" 
  | "incidents" 
  | "maintenance" 
  | "system-control" 
  | "audit-logs";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const navItems = [
  { id: "resources" as AdminTab, label: "Resource Management", icon: Droplets },
  { id: "incidents" as AdminTab, label: "Incident Tracking", icon: AlertTriangle },
  { id: "maintenance" as AdminTab, label: "Maintenance", icon: Wrench },
  { id: "system-control" as AdminTab, label: "System Control", icon: Shield },
  { id: "audit-logs" as AdminTab, label: "Audit & Logs", icon: FileText },
];

const AdminSidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }: AdminSidebarProps) => {
  return (
    <TooltipProvider delayDuration={0}>
      <div 
        className={cn(
          "bg-card border-r flex flex-col transition-all duration-300 relative",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-muted"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        {/* Logo Section */}
        <div className={cn(
          "p-4 border-b flex items-center gap-3",
          isCollapsed && "justify-center"
        )}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--fire-orange))] to-[hsl(var(--fire-red))] flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-foreground">Admin Panel</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            const button = (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary-foreground")} />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover text-popover-foreground">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return button;
          })}
        </nav>

      </div>
    </TooltipProvider>
  );
};

export default AdminSidebar;
