import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { AlertTriangle, Search, MapPin, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { type Incident } from "@/data/mockData";

interface IncidentTrackingProps {
  incidents: Incident[];
}

const IncidentTracking = ({ incidents }: IncidentTrackingProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const matchesSearch =
        incident.title.toLowerCase().includes(search.toLowerCase()) ||
        incident.location.toLowerCase().includes(search.toLowerCase()) ||
        incident.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || incident.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [incidents, search, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-red-500 hover:bg-red-600";
      case "Resolved": return "bg-green-500 hover:bg-green-600";
      default: return "bg-gray-500";
    }
  };

  const stats = useMemo(() => ({
    active: incidents.filter(i => i.status === "Active").length,
    resolved: incidents.filter(i => i.status === "Resolved").length,
  }), [incidents]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Incident Tracking</h2>
          <p className="text-sm text-muted-foreground">Monitor incident statuses (updates made by users)</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Incidents</p>
              <p className="text-2xl font-bold text-red-500">{stats.active}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold text-green-500">{stats.resolved}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-foreground">Incident History ({incidents.length})</h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-initial lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search incidents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Reported By</TableHead>
                <TableHead className="font-semibold">Reported At</TableHead>
                <TableHead className="font-semibold">Resolved At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No incidents found
                  </TableCell>
                </TableRow>
              ) : (
                filteredIncidents.map((incident) => (
                  <TableRow key={incident.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{incident.id}</TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="font-medium">{incident.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{incident.description}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="max-w-[150px] truncate">{incident.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <User className="w-3 h-3 text-muted-foreground" />
                        {incident.reportedBy}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(incident.reportedAt), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {incident.resolvedAt
                        ? format(new Date(incident.resolvedAt), "MMM d, yyyy HH:mm")
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Note: Incident status updates are made by field users. This view is for monitoring purposes only.
        </p>
      </div>
    </div>
  );
};

export default IncidentTracking;
