import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, CheckCircle, XCircle, Flame } from "lucide-react";
import { useState } from "react";
import { useIncident, IncidentStatus } from "@/contexts/IncidentContext";
import { toast } from "sonner";

const statusConfig = {
  Active: {
    icon: Flame,
    color: "bg-[hsl(var(--fire-orange))] hover:bg-[hsl(var(--fire-orange))]/90 text-white border-[hsl(var(--fire-orange))]",
    activeColor: "bg-[hsl(var(--fire-orange))] text-white",
  },
  Resolved: {
    icon: CheckCircle,
    color: "bg-green-500 hover:bg-green-600 text-white border-green-500",
    activeColor: "bg-green-500 text-white",
  },
  Cancel: {
    icon: XCircle,
    color: "bg-destructive hover:bg-destructive/90 text-white border-destructive",
    activeColor: "bg-destructive text-white",
  },
};

interface IncidentStatusControlProps {
  compact?: boolean;
}

const IncidentStatusControl = ({ compact = false }: IncidentStatusControlProps) => {
  const { incidentState, updateIncidentStatus } = useIncident();
  const [confirmDialog, setConfirmDialog] = useState<IncidentStatus>(null);

  const currentStatus = incidentState.status;

  const handleStatusChange = (newStatus: IncidentStatus) => {
    if (newStatus === "Resolved" || newStatus === "Cancel") {
      setConfirmDialog(newStatus);
    } else {
      updateIncidentStatus(newStatus);
      toast.success(`Incident status updated to ${newStatus}`);
    }
  };

  const confirmStatusChange = () => {
    if (confirmDialog) {
      updateIncidentStatus(confirmDialog);
      toast.success(`Incident ${confirmDialog.toLowerCase()}. Route cleared.`, {
        description: "Interface reset to default inputs",
      });
      setConfirmDialog(null);
    }
  };

  if (!currentStatus) {
    return null;
  }

  const statuses: IncidentStatus[] = ["Active", "Resolved", "Cancel"];

  // Compact version for floating on map
  if (compact) {
    const StatusIcon = statusConfig[currentStatus].icon;
    return (
      <div className={`px-3 py-2 rounded-lg shadow-lg ${statusConfig[currentStatus].activeColor} flex items-center gap-2`}>
        <StatusIcon className="w-4 h-4" />
        <span className="text-sm font-medium">{currentStatus}</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[hsl(var(--fire-orange))]" />
          Incident Status
        </h3>
        
        {/* Horizontal Segmented Control */}
        <div className="flex gap-1">
          {statuses.map((status) => {
            if (!status) return null;
            const config = statusConfig[status];
            const Icon = config.icon;
            const isActive = status === currentStatus;

            return (
              <Button
                key={status}
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(status)}
                className={`flex-1 gap-1 px-2 text-xs ${
                  isActive
                    ? config.activeColor + " border-0"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground border-muted"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{status}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <AlertDialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[hsl(var(--fire-orange))]" />
              Confirm Status Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              Changing the incident status to <strong>{confirmDialog}</strong> will clear the
              current route and reset the interface. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Active</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              className="bg-[hsl(var(--fire-deep-red))] hover:bg-[hsl(var(--fire-deep-red))]/90"
            >
              Confirm {confirmDialog}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default IncidentStatusControl;
