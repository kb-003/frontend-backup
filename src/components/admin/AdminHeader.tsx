import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import bfpLogo from "@/assets/bfp-logo.png";
import type { AppRole, Team } from "@/lib/roles";

interface AdminHeaderProps {
  onLogout: () => void;
  currentUser?: { role: AppRole; team: Team; name: string } | null;
}

const AdminHeader = ({ onLogout, currentUser }: AdminHeaderProps) => {
  const roleLabel = currentUser?.role || "Admin";

  return (
    <header className="h-14 bg-gradient-to-r from-[hsl(var(--fire-orange))] to-[hsl(var(--fire-red))] flex items-center px-4 gap-3 flex-shrink-0 shadow-md">
      <img src={bfpLogo} alt="BFP Logo" className="w-10 h-10" />
      <div className="flex flex-col flex-1">
        <span className="font-bold text-sm text-white leading-tight">
          Emergency Response Navigator
        </span>
        <span className="text-xs text-white/80 leading-tight">
          {roleLabel} Dashboard
        </span>
      </div>
      <Button
        onClick={onLogout}
        variant="ghost"
        size="sm"
        className="text-white hover:bg-white/20 hover:text-white"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </header>
  );
};

export default AdminHeader;
