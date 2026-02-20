import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Search,
  User,
  Clock,
  RefreshCw,
  Activity,
} from "lucide-react";
import { format } from "date-fns";

interface ActivityLog {
  _id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  performedBy: string;
  performedAt: string;
  details?: string;
}
interface Incident {
  _id: string;
  title: string;
  status: string;
  reportedBy: string;
  reportedAt: string;
  resolvedAt?: string;
}
interface SyncLog {
  _id: string;
  syncId: string;
  status: string;
  timestamp: string;
  records: number;
  error?: string;
}
interface AuditLogsProps {
  lastSyncTime: string | null;
}

const AuditLogs = ({ lastSyncTime }: AuditLogsProps) => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [incidentLogs, setIncidentLogs] = useState<Incident[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [logTab, setLogTab] = useState<"activity" | "incidents" | "sync">(
    "activity",
  );
  const [activitySearch, setActivitySearch] = useState("");
  const [activityFilter, setActivityFilter] = useState<string>("All");

  // Fetch all logs from backend
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token"); // ✅ get token

        const [activityRes, incidentRes, syncRes] = await Promise.all([
          fetch("/api/logs", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/incidents", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/sync", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const activityData = await activityRes.json();
        const incidentData = await incidentRes.json();
        const syncData = await syncRes.json();

        if (activityData.success) setActivityLogs(activityData.logs);
        if (incidentData.success) setIncidentLogs(incidentData.incidents);
        if (syncData.success) setSyncLogs(syncData.logs);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      }
    };
    fetchLogs();
  }, []);

  // Filtering for activity logs
  const filteredActivityLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      const matchesSearch =
        log.resourceId.toLowerCase().includes(activitySearch.toLowerCase()) ||
        log.performedBy.toLowerCase().includes(activitySearch.toLowerCase()) ||
        (log.details?.toLowerCase().includes(activitySearch.toLowerCase()) ??
          false);
      const matchesFilter =
        activityFilter === "All" || log.action === activityFilter;
      return matchesSearch && matchesFilter;
    });
  }, [activityLogs, activitySearch, activityFilter]);

  const getActionColor = (action: string) => {
    switch (action) {
      case "Created":
        return "bg-green-500 hover:bg-green-600";
      case "Updated":
        return "bg-blue-500 hover:bg-blue-600";
      case "Deleted":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Audit & Logs</h2>
          <p className="text-sm text-muted-foreground">
            Track all system activities and changes
          </p>
        </div>
      </div>

      <Tabs value={logTab} onValueChange={(v) => setLogTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Activity Logs</span>
            <span className="sm:hidden">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="incidents" className="gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Incident Logs</span>
            <span className="sm:hidden">Incidents</span>
          </TabsTrigger>
          <TabsTrigger value="sync" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Sync Logs</span>
            <span className="sm:hidden">Sync</span>
          </TabsTrigger>
        </TabsList>

        {/* Activity Logs Tab */}
        <TabsContent value="activity" className="mt-6">
          <div className="bg-card rounded-xl border p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Activity Logs ({activityLogs.length})
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-initial lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={activityFilter}
                  onValueChange={setActivityFilter}
                >
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Actions</SelectItem>
                    <SelectItem value="Created">Created</SelectItem>
                    <SelectItem value="Updated">Updated</SelectItem>
                    <SelectItem value="Deleted">Deleted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Action</TableHead>
                    <TableHead className="font-semibold">Resource</TableHead>
                    <TableHead className="font-semibold">
                      Performed By
                    </TableHead>
                    <TableHead className="font-semibold">Timestamp</TableHead>
                    <TableHead className="font-semibold">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivityLogs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActivityLogs.map((log) => (
                      <TableRow key={log._id} className="hover:bg-muted/30">
                        <TableCell>
                          <Badge className={getActionColor(log.action)}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              {log.resourceType}:
                            </span>{" "}
                            <span className="font-medium">
                              {log.resourceId}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <User className="w-3 h-3 text-muted-foreground" />
                            {log.performedBy}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(
                            new Date(log.performedAt),
                            "MMM d, yyyy HH:mm",
                          )}
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] whitespace-normal break-words">
                          {log.details || "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Incident Logs Tab */}
        <TabsContent value="incidents" className="mt-6">
          <div className="bg-card rounded-xl border p-4 lg:p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Incident History ({incidentLogs.length})
              </h3>
              <p className="text-sm text-muted-foreground">
                Timeline of incident status changes
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Reported By</TableHead>
                    <TableHead className="font-semibold">Reported At</TableHead>
                    <TableHead className="font-semibold">Resolved At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidentLogs.map((log) => (
                    <TableRow key={log._id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{log._id}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {log.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            log.status === "Active"
                              ? "bg-red-500"
                              : log.status === "Resolved"
                                ? "bg-green-500"
                                : "bg-gray-500"
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.reportedBy}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(log.reportedAt), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.resolvedAt
                          ? format(
                              new Date(log.resolvedAt),
                              "MMM d, yyyy HH:mm",
                            )
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Sync Logs Tab */}
        <TabsContent value="sync" className="mt-6">
          <div className="bg-card rounded-xl border p-4 lg:p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Synchronization Logs
              </h3>
              <p className="text-sm text-muted-foreground">
                Data sync history and errors
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Sync ID</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Timestamp</TableHead>
                    <TableHead className="font-semibold">
                      Records Synced
                    </TableHead>
                    <TableHead className="font-semibold">Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncLogs.map((log) => (
                    <TableRow key={log._id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{log._id}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            log.status === "Success"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(log.timestamp), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="text-sm">{log.records}</TableCell>
                      <TableCell className="text-sm text-destructive">
                        {log.error || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditLogs;
