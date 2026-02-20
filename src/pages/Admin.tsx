import { useState } from "react";
import { useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useIncident } from "@/contexts/IncidentContext";
import { getCurrentUser } from "@/lib/roles";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar, { type AdminTab } from "@/components/admin/AdminSidebar";
import ResourceManagement from "@/components/admin/ResourceManagement";
import IncidentTracking from "@/components/admin/IncidentTracking";
import MaintenanceScheduling from "@/components/admin/MaintenanceScheduling";
import AuditLogs from "@/components/admin/AuditLogs";
import SystemControl from "@/components/admin/SystemControl";
import {
  type Hydrant,
  type WaterSource,
  type User,
  type MaintenanceTask,
} from "@/data/mockData";

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("resources");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { incidentHistory } = useIncident();
  const currentUser = getCurrentUser();

  // Data states - empty until backend is integrated
  const [hydrants, setHydrants] = useState<Hydrant[]>([]);
  const [waterSources, setWaterSources] = useState<WaterSource[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(
    [],
  );
  const [activityLogs] = useState<any[]>([]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const lastSyncTime = localStorage.getItem("lastSyncTime");

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchHydrants = async () => {
      try {
        const data = await apiRequest("/api/hydrants", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const transformed = data.map((h: any, i: number) => ({
          ...h,
          _id: h._id ?? `hydrant-${i}`,
          hydrantId: h.hydrantId || "N/A",
          status:
            h.status === "operational"
              ? "Operational"
              : h.status === "under maintenance"
                ? "Under Maintenance"
                : h.status === "Unavailable" || h.status === "unavailable"
                  ? "Unavailable"
                  : h.status || "Unavailable",
          remark: h.remark || "N/A",
          address: h.address || "N/A",
          landmark: h.landmark || "N/A",
          location: h.location || { type: "Point", coordinates: [] },
        }));
        
        setHydrants(transformed);
      } catch (err) {
        console.error("Failed to fetch hydrants", err);
        toast.error("Could not load hydrants");
      }
    };

    const fetchWaterSources = async () => {
      try {
        const data = await apiRequest("/api/water-sources", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const transformed = data.map((w: any) => ({
          id: w._id,
          sourceId: w.sourceId,
          name: w.name || "",
          type: w.type || "River",
          roadWidth: w.roadWidth?.toString() || "",
          landmark: w.landmark || "",
          coordinates: [
            w.longitude ?? w.location?.coordinates?.[0] ?? 0,
            w.latitude ?? w.location?.coordinates?.[1] ?? 0,
          ] as [number, number],
        }));

        setWaterSources(transformed);
      } catch (err) {
        console.error("Failed to fetch water sources", err);
        toast.error("Could not load water sources");
      }
    };

    const fetchUsers = async () => {
      try {
        const data = await apiRequest("/api/users", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const transformed = data.map((u: any) => ({
          id: u.Firefighterid,
          name: u.name,
          rank: u.rank,
          email: u.email,
          contact: u.contact,
          role: u.role,
          team: u.team || null,
          shift: u.AssignToShift || u.shift || "—",
          isActive: u.isActive,
          profilePicture: u.profilePicture || "",
        }));

        setUsers(transformed);
      } catch (err) {
        console.error("Failed to fetch users", err);
        toast.error("Could not load users");
      }
    };

    fetchHydrants();
    fetchWaterSources();
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <AdminHeader onLogout={handleLogout} currentUser={currentUser} />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeTab === "resources" && (
            <ResourceManagement
              hydrants={hydrants}
              setHydrants={setHydrants}
              waterSources={waterSources}
              setWaterSources={setWaterSources}
              users={users}
              setUsers={setUsers}
              currentUser={currentUser}
            />
          )}

          {activeTab === "incidents" && (
            <IncidentTracking incidents={incidentHistory} />
          )}

          {activeTab === "maintenance" && (
            <MaintenanceScheduling
              tasks={maintenanceTasks}
              setTasks={setMaintenanceTasks}
              hydrants={hydrants}
              waterSources={waterSources}
              users={users}
              currentUser={currentUser}
            />
          )}

          {activeTab === "system-control" && (
            <SystemControl
              hydrants={hydrants}
              waterSources={waterSources}
              users={users}
              setUsers={setUsers}
              currentUser={currentUser}
            />
          )}

          {activeTab === "audit-logs" && (
            <AuditLogs
              incidents={incidentHistory}
              lastSyncTime={lastSyncTime}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
