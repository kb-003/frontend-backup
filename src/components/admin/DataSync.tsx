import { useState, useEffect } from "react";
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
import { Database, Download, RefreshCw, HardDrive, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { type Hydrant, type WaterSource } from "@/data/mockData";

interface DataSyncProps {
  hydrants: Hydrant[];
  waterSources: WaterSource[];
}

const DataSync = ({ hydrants, waterSources }: DataSyncProps) => {
  const [autoSync, setAutoSync] = useState(false);
  const [offlineCache, setOfflineCache] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load preferences from backend on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const res = await fetch("/api/users/preferences", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const prefs = await res.json();
        setAutoSync(prefs.autoSync);
        setOfflineCache(prefs.offlineCache);
        setLastSync(prefs.lastSync);
      } catch (err) {
        console.error("Failed to load preferences", err);
      }
    };
    fetchPreferences();
  }, []);

  // Update preferences in backend
  const handleAutoSyncChange = async (checked: boolean) => {
    setAutoSync(checked);
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/users/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ autoSync: checked }),
      });
      toast.success(`Auto-sync ${checked ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Failed to update Auto-sync");
    }
  };

  const handleOfflineCacheChange = async (checked: boolean) => {
    setOfflineCache(checked);
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/users/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ offlineCache: checked }),
      });
      toast.success(`Offline cache ${checked ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Failed to update Offline cache");
    }
  };

  // Sync Now calls backend
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/sync/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      setLastSync(data.log.timestamp); // also persist lastSync in user preferences
      await fetch("/api/users/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lastSync: data.log.timestamp }),
      });
      toast.success("Data synchronized successfully");
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
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
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
          <Database className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Data & Sync</h2>
          <p className="text-sm text-muted-foreground">
            Manage data synchronization and exports
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
                className="data-[state=checked]:bg-primary"
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
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Last sync:{" "}
                  {lastSync
                    ? format(new Date(lastSync), "MMM d, yyyy HH:mm")
                    : "Never"}
                </div>
              </div>
              <Button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="w-full bg-primary"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </>
                )}
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

        {/* Storage Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Storage Information
            </CardTitle>
            <CardDescription>Local storage usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
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
              <div className="flex justify-between text-sm">
                <span>Cached Map Tiles</span>
                <span className="text-muted-foreground">
                  {offlineCache ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataSync;
