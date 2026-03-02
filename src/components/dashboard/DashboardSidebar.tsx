import { cn, logout } from "@/lib/utils";
import {
  Map as MapIcon,
  Settings,
  HelpCircle,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export type DashboardTab = "map" | "settings" | "help" | "profile";

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const navItems = [
  { id: "map" as DashboardTab, label: "Map", icon: MapIcon },
  { id: "settings" as DashboardTab, label: "Settings", icon: Settings },
  { id: "help" as DashboardTab, label: "Help", icon: HelpCircle },
  { id: "profile" as DashboardTab, label: "Profile", icon: User },
];

const DashboardSidebar = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
}: DashboardSidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "bg-card border-r flex flex-col transition-all duration-300 relative flex-shrink-0",
          isCollapsed ? "w-16" : "w-56",
        )}
      >
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-4 z-10 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-muted"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            const button = (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left",
                  isActive
                    ? "bg-gradient-to-r from-[hsl(var(--fire-orange))] to-[hsl(var(--fire-red))] text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed && "justify-center px-2",
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6 flex-shrink-0",
                    isActive && "text-white",
                  )}
                />
                {!isCollapsed && (
                  <span className="text-base font-medium">{item.label}</span>
                )}
              </button>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-popover text-popover-foreground"
                  >
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return button;
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-2 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                  <LogOut className="w-6 h-6 flex-shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-popover text-popover-foreground"
              >
                Logout
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all text-left"
            >
              <LogOut className="w-6 h-6 flex-shrink-0" />
              <span className="text-base font-medium">Logout</span>
            </button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DashboardSidebar;
