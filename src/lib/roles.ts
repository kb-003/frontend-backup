// Role-Based Access Control definitions

export type AppRole = "Chief" | "Shift-in-Charge A" | "Shift-in-Charge B" | "Driver" | "Crew";
export type Team = "A" | "B" | null;

export const ALL_ROLES: AppRole[] = ["Chief", "Shift-in-Charge A", "Shift-in-Charge B", "Driver", "Crew"];
export const ADMIN_ROLES: AppRole[] = ["Chief", "Shift-in-Charge A", "Shift-in-Charge B"];
export const USER_ROLES: AppRole[] = ["Driver", "Crew"];

export const isAdminRole = (role: AppRole): boolean => ADMIN_ROLES.includes(role);
export const isUserRole = (role: AppRole): boolean => USER_ROLES.includes(role);

/** Get the team a role belongs to */
export const getTeamForRole = (role: AppRole): Team => {
  if (role === "Shift-in-Charge A") return "A";
  if (role === "Shift-in-Charge B") return "B";
  return null; // Chief, Driver, Crew get team from their assignment
};

/** Determine role from login ID prefix */
export const getRoleFromIdPrefix = (id: string): AppRole => {
  const upper = id.toUpperCase();
  if (upper.startsWith("CH-")) return "Chief";
  if (upper.startsWith("SA-")) return "Shift-in-Charge A";
  if (upper.startsWith("SB-")) return "Shift-in-Charge B";
  if (upper.startsWith("DR-")) return "Driver";
  return "Crew"; // default
};

/** Get position label from role */
export const getPositionFromRole = (role: AppRole): string => {
  switch (role) {
    case "Chief": return "Chief";
    case "Shift-in-Charge A": return "Shift-in-Charge A";
    case "Shift-in-Charge B": return "Shift-in-Charge B";
    case "Driver": return "Driver";
    case "Crew": return "Crew";
  }
};

/** Get users visible to a given role/team */
export const getVisibleUsers = <T extends { role: AppRole; team?: Team }>(
  users: T[],
  currentRole: AppRole,
  currentTeam: Team
): T[] => {
  if (currentRole === "Chief") return users;
  if (currentRole === "Shift-in-Charge A") return users.filter(u => u.team === "A");
  if (currentRole === "Shift-in-Charge B") return users.filter(u => u.team === "B");
  // Driver/Crew should not see user lists, but if called, return only self
  return users;
};

/** Get assignable users for maintenance tasks */
export const getAssignableUsers = <T extends { role: AppRole; team?: Team; id: string }>(
  users: T[],
  currentRole: AppRole
): T[] => {
  if (currentRole === "Chief") {
    // Chief can only assign to Shift-in-Charge A and B
    return users.filter(u => u.role === "Shift-in-Charge A" || u.role === "Shift-in-Charge B");
  }
  if (currentRole === "Shift-in-Charge A") {
    // SIC-A assigns to Team A members (Driver + Crew)
    return users.filter(u => u.team === "A" && (u.role === "Driver" || u.role === "Crew"));
  }
  if (currentRole === "Shift-in-Charge B") {
    // SIC-B assigns to Team B members (Driver + Crew)
    return users.filter(u => u.team === "B" && (u.role === "Driver" || u.role === "Crew"));
  }
  return [];
};

/** Get the current user from localStorage */
export const getCurrentUser = (): {
  id: string;
  name: string;
  role: AppRole;
  team: Team;
  [key: string]: any;
} | null => {
  try {
    const stored = localStorage.getItem("currentUser");
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
};
