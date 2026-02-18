import type { AppRole, Team } from "@/lib/roles";

export interface Hydrant {
  _id: string;
  hydrantId: string; 
  status: "Operational" | "Under Maintenance" | "Unavailable";
  remark: string; 
  address: string;
  landmark: string;
  location: {
    type: "Point";
    coordinates: [number | null, number | null];
  };
}

export interface WaterSource {
  id: string;
  name: string;
  type: "River" | "Well" | "Sea";
  roadWidth: string;
  landmark: string;
  coordinates: [number, number];
}

export interface FireStation {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
}

export interface User {
  _id?: string;
  id?:string;
  firefighterID: string;
  name: string;
  rank: string;
  email: string;
  contact: string;
  profilePicture?: string;
  role: AppRole;
  team: Team;
  password: string;
  isFirstLogin: boolean;
}

export interface Incident {
  id: string;
  title: string;
  location: string;
  status: "Active" | "Resolved";
  reportedBy: string;
  reportedAt: string;
  resolvedAt?: string;
  description: string;
  coordinates?: [number, number];
}

export interface MaintenanceTask {
  _id: string;
  resourceType: "Hydrant" | "Water Source";
  resourceId: string;
  taskType: "Inspection" | "Repair" | "Replacement";
  status: "Pending" | "In Progress" | "Completed";
  scheduledDate: string;
  completedDate?: string;
  assignedTo?: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  action: "Created" | "Updated" | "Deleted";
  resourceType: "Hydrant" | "Water Source" | "User" | "Incident";
  resourceId: string;
  performedBy: string;
  performedAt: string;
  details?: string;
}
