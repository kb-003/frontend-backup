import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Settings2,
  Download,
  RefreshCw,
  HardDrive,
  Clock,
  Shield,
  Users,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { type Hydrant, type WaterSource, type User } from "@/data/mockData";
import { type AppRole, type Team, USER_ROLES } from "@/lib/roles";

interface SystemControlProps {
  hydrants: Hydrant[];
  waterSources: WaterSource[];
  users: User[];
  setUsers: (users: User[]) => void;
  currentUser?: { role: AppRole; team: Team; [key: string]: any } | null;
}

const SystemControl = ({
  hydrants,
  waterSources,
  users,
  setUsers,
  currentUser,
}: SystemControlProps) => {
  // Data & Sync state
  const [autoSync, setAutoSync] = useState(
    () => localStorage.getItem("adminAutoSync") !== "false",
  );
  const [offlineCache, setOfflineCache] = useState(
    () => localStorage.getItem("adminOfflineCache") !== "false",
  );
  const [lastSync, setLastSync] = useState<string | null>(() =>
    localStorage.getItem("lastSyncTime"),
  );
  const [isSyncing, setIsSyncing] = useState(false);

  const fieldUsers = users.filter((u) => USER_ROLES.includes(u.role));

  // Data & Sync handlers
  const handleAutoSyncChange = (checked: boolean) => {
    setAutoSync(checked);
    localStorage.setItem("adminAutoSync", String(checked));
    toast.success(`Auto-sync ${checked ? "enabled" : "disabled"}`);
  };

  const handleOfflineCacheChange = (checked: boolean) => {
    setOfflineCache(checked);
    localStorage.setItem("adminOfflineCache", String(checked));
    toast.success(`Offline cache ${checked ? "enabled" : "disabled"}`);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const now = new Date().toISOString();
    setLastSync(now);
    localStorage.setItem("lastSyncTime", now);
    setIsSyncing(false);
    toast.success("Data synchronized successfully");
  };

  const exportData = (type: "hydrants" | "waterSources") => {
    const data = type === "hydrants" ? hydrants : waterSources;
    const headers =
      type === "hydrants"
        ? [
            "Hydrant ID",
            "Status",
            "Remarks",
            "Address",
            "Landmark",
            "Latitude",
            "Longitude",
          ]
        : [
            "ID",
            "Name",
            "Type",
            "Road Width",
            "Landmark",
            "Latitude",
            "Longitude",
          ];

    const csvContent = [
      headers.join(","),
      ...data.map((item) => {
        if (type === "hydrants") {
          const h = item as Hydrant;
          return [
            h.hydrantId,
            h.status,
            h.remark,
            h.address,
            h.landmark,
            h.coordinates[1],
            h.coordinates[0],
          ].join(",");
        } else {
          const w = item as WaterSource;
          return [
            w.id,
            w.name,
            w.type,
            w.roadWidth,
            w.landmark,
            w.coordinates[1],
            w.coordinates[0],
          ].join(",");
        }
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${type}_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success(
      `${type === "hydrants" ? "Hydrants" : "Water sources"} exported successfully`,
    );
  };

  const handleBackup = () => {
    const backupData = {
      hydrants,
      waterSources,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `emergency_navigator_backup_${format(new Date(), "yyyy-MM-dd")}.json`;
    link.click();
    toast.success("Backup created successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center">
          <Settings2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">System Control</h2>
          <p className="text-sm text-muted-foreground">
            Manage data synchronization, exports, and security
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sync Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Sync Settings
            </CardTitle>
            <CardDescription>
              Configure automatic data synchronization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Auto-Sync Data</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync data when connected
                </p>
              </div>
              <Switch
                checked={autoSync}
                onCheckedChange={handleAutoSyncChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Offline Map Cache</Label>
                <p className="text-sm text-muted-foreground">
                  Cache map data for offline use
                </p>
              </div>
              <Switch
                checked={offlineCache}
                onCheckedChange={handleOfflineCacheChange}
              />
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Clock className="w-4 h-4" />
                Last sync:{" "}
                {lastSync
                  ? format(new Date(lastSync), "MMM d, yyyy HH:mm")
                  : "Never"}
              </div>
              <Button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="w-full bg-primary"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
                />
                {isSyncing ? "Syncing..." : "Sync Now"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Data
            </CardTitle>
            <CardDescription>Export resource data as CSV files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => exportData("hydrants")}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Fire Hydrants ({hydrants.length} records)
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => exportData("waterSources")}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Water Sources ({waterSources.length} records)
            </Button>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Export all data in a single backup file
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleBackup}
              >
                <HardDrive className="w-4 h-4 mr-2" />
                Create Full Backup
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Storage Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Storage Information
            </CardTitle>
            <CardDescription>Local storage usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Hydrants Data</span>
              <span className="text-muted-foreground">
                {hydrants.length} records
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Water Sources Data</span>
              <span className="text-muted-foreground">
                {waterSources.length} records
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Role-Based Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Role-Based Permissions
            </CardTitle>
            <CardDescription>User roles and access levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> Chief
                </span>
                <span className="text-lg font-bold text-primary">
                  {users.filter((u) => u.role === "Chief").length}
                </span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Full access to all resources and users</li>
                <li>• Can assign tasks to Shift-in-Charge A & B</li>
                <li>• Can manage all user accounts</li>
              </ul>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" /> Shift-in-Charge A
                  / B
                </span>
                <span className="text-lg font-bold text-blue-500">
                  {
                    users.filter(
                      (u) =>
                        u.role === "Shift-in-Charge A" ||
                        u.role === "Shift-in-Charge B",
                    ).length
                  }
                </span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Admin access limited to their team</li>
                <li>• Can assign tasks to team members</li>
                <li>• Can manage team user accounts</li>
              </ul>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" /> Driver & Crew
                </span>
                <span className="text-lg font-bold text-green-500">
                  {fieldUsers.length}
                </span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• User-side only, view assigned tasks</li>
                <li>• Update own profile</li>
                <li>• Report incidents</li>
              </ul>
            </div>

            <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Note:</strong> Only Chief and Shift-in-Charge roles
                  can access the admin dashboard.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemControl;
