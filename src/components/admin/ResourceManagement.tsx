import React, { useCallback, useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  MapPin,
  Droplets,
  Users,
  Flame,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { type Hydrant, type WaterSource, type User } from "@/data/mockData";
import {
  type AppRole,
  type Team,
  ALL_ROLES,
  getVisibleUsers,
} from "@/lib/roles";

interface ResourceManagementProps {
  hydrants: Hydrant[];
  setHydrants: (hydrants: Hydrant[]) => void;
  waterSources: WaterSource[];
  setWaterSources: (sources: WaterSource[]) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  currentUser?: {
    role: AppRole;
    team: Team;
    id: string;
    [key: string]: any;
  } | null;
}

const ResourceManagement = ({
  hydrants,
  setHydrants,
  waterSources,
  setWaterSources,
  users,
  setUsers,
  currentUser,
}: ResourceManagementProps) => {
  const [resourceTab, setResourceTab] = useState<
    "hydrants" | "water" | "users"
  >("hydrants");

  // Hydrant states
  const [hydrantSearch, setHydrantSearch] = useState("");
  const [isAddHydrantOpen, setIsAddHydrantOpen] = useState(false);
  const [isEditHydrantOpen, setIsEditHydrantOpen] = useState(false);
  const [isDeleteHydrantOpen, setIsDeleteHydrantOpen] = useState(false);
  const [selectedHydrant, setSelectedHydrant] = useState<Hydrant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hydrantFormData, setHydrantFormData] = useState({
    hydrantId: "",
    status: "Operational" as
      | "Operational"
      | "Unavailable"
      | "Under Maintenance",
    remark: "Hydrant",
    address: "",
    landmark: "",
    latitude: "",
    longitude: "",
  });

  // Water Source states
  const [waterSourceSearch, setWaterSourceSearch] = useState("");
  const [isAddWaterSourceOpen, setIsAddWaterSourceOpen] = useState(false);
  const [isEditWaterSourceOpen, setIsEditWaterSourceOpen] = useState(false);
  const [isDeleteWaterSourceOpen, setIsDeleteWaterSourceOpen] = useState(false);
  const [selectedWaterSource, setSelectedWaterSource] =
    useState<WaterSource | null>(null);
  const [waterSourceFormData, setWaterSourceFormData] = useState({
    id: "",
    name: "",
    type: "River" as "River" | "Well" | "Sea",
    roadWidth: "",
    landmark: "",
    latitude: "",
    longitude: "",
  });

  // User states
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(
    null,
  );
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState({
    id: "",
    firefighterID: "",
    name: "",
    rank: "",
    email: "",
    contact: "",
    profilePicture: "",
    role: "Crew" as AppRole,
    team: null as Team,
    password: "",
  });

  // Filter users based on current user's role
  const visibleUsers = useMemo(() => {
    if (!currentUser) return users;
    return getVisibleUsers(users, currentUser.role, currentUser.team);
  }, [users, currentUser]);

  // Filtered data
  const filteredHydrants = useMemo(() => {
    return hydrants.filter(
      (h) =>
        (h.hydrantId?.toLowerCase() || "").includes(
          hydrantSearch.toLowerCase(),
        ) ||
        (h.address?.toLowerCase() || "").includes(
          hydrantSearch.toLowerCase(),
        ) ||
        (h.landmark?.toLowerCase() || "").includes(hydrantSearch.toLowerCase()),
    );
  }, [hydrants, hydrantSearch]);

  const filteredWaterSources = useMemo(() => {
    return waterSources.filter(
      (w) =>
        (w.name?.toLowerCase() || "").includes(
          waterSourceSearch.toLowerCase(),
        ) ||
        (w.type?.toLowerCase() || "").includes(
          waterSourceSearch.toLowerCase(),
        ) ||
        (w.landmark?.toLowerCase() || "").includes(
          waterSourceSearch.toLowerCase(),
        ),
    );
  }, [waterSources, waterSourceSearch]);

  const filteredUsers = useMemo(() => {
    return visibleUsers.filter((user) => {
      const matchesSearch =
        (user.id?.toLowerCase() || "").includes(userSearch.toLowerCase()) ||
        (user.name?.toLowerCase() || "").includes(userSearch.toLowerCase()) ||
        (user.email?.toLowerCase() || "").includes(userSearch.toLowerCase());

      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [visibleUsers, userSearch, roleFilter]);

  // Hydrant handlers
  const resetHydrantForm = () => {
    setHydrantFormData({
      hydrantId: "",
      status: "Operational",
      remark: "Hydrant",
      address: "",
      landmark: "",
      latitude: "",
      longitude: "",
    });
  };

  // Normalize hydrants
  const normalizeHydrant = (h: any, index?: number) => ({
    ...h,
    _id: h._id ?? h.id ?? `temp-${index}`, // <-- FIXED
    hydrantId: h.hydrantId || "N/A",
    status:
      h.status?.charAt(0).toUpperCase() + h.status?.slice(1).toLowerCase(),
    remark: h.remark || "N/A",
    address: h.address || "N/A",
    landmark: h.landmark || "N/A",
    location: h.location || { type: "Point", coordinates: [] },
  });

  const fetchHydrants = useCallback(async () => {
    setIsLoading(true); // START loading

    try {
      const token = localStorage.getItem("token");

      const data = await apiRequest("/api/hydrants", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const normalized = data.map((h: any, i: number) => {
        const hydrant = normalizeHydrant(h, i);
        return { ...hydrant, _id: h._id ?? `hydrant-${i}` };
      });

      setHydrants(normalized);
    } catch (err) {
      console.error("Failed to fetch hydrants", err);
    } finally {
      setIsLoading(false); // STOP loading
    }
  }, []);

  // Add new hydrant
  const handleAddHydrant = async () => {
    if (
      !hydrantFormData.hydrantId ||
      !hydrantFormData.address ||
      !hydrantFormData.landmark ||
      !hydrantFormData.latitude ||
      !hydrantFormData.longitude
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newHydrant = {
      hydrantId: hydrantFormData.hydrantId,
      status: hydrantFormData.status,
      remark: hydrantFormData.remark,
      address: hydrantFormData.address,
      landmark: hydrantFormData.landmark,
      location: {
        type: "Point",
        coordinates: [
          parseFloat(hydrantFormData.longitude),
          parseFloat(hydrantFormData.latitude),
        ],
      },
    };

    try {
      const token = localStorage.getItem("token");
      await apiRequest("/api/hydrants", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newHydrant),
      });

      toast.success("Hydrant added successfully");
      setIsAddHydrantOpen(false);
      resetHydrantForm();
      fetchHydrants(); // Refresh list from backend
    } catch (err) {
      console.error("Failed to add hydrant", err);
      toast.error("Could not add hydrant");
    }
  };

  // Fetch hydrants on component mount
  useEffect(() => {
    fetchHydrants();
  }, [fetchHydrants]);

  const openEditHydrantDialog = (hydrant: Hydrant) => {
    setSelectedHydrant(hydrant);
    setHydrantFormData({
      hydrantId: hydrant.hydrantId,
      status: hydrant.status,
      remark: hydrant.remark,
      address: hydrant.address,
      landmark: hydrant.landmark,
      latitude:
        hydrant.location?.coordinates?.[1] != null
          ? hydrant.location.coordinates[1].toString()
          : "",
      longitude:
        hydrant.location?.coordinates?.[0] != null
          ? hydrant.location.coordinates[0].toString()
          : "",
    });
    setIsEditHydrantOpen(true);
  };

  const handleEditHydrant = async () => {
    if (!selectedHydrant) return;

    const updatedHydrant = {
      status: hydrantFormData.status,
      remark: hydrantFormData.remark,
      address: hydrantFormData.address,
      landmark: hydrantFormData.landmark,
      location: {
        type: "Point",
        coordinates: [
          parseFloat(hydrantFormData.longitude),
          parseFloat(hydrantFormData.latitude),
        ] as [number, number],
      },
    };

    try {
      const token = localStorage.getItem("token");
      const updatedHydrantFromServer = await apiRequest(
        `/api/hydrants/${selectedHydrant._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedHydrant),
        },
      );

      const updatedHydrants = hydrants.map((h) =>
        h._id === selectedHydrant._id ? updatedHydrantFromServer : h,
      );

      setHydrants(updatedHydrants);
      localStorage.setItem("adminHydrants", JSON.stringify(updatedHydrants)); // optional
      toast.success("Hydrant updated successfully");
      setIsEditHydrantOpen(false);
      setSelectedHydrant(null);
      resetHydrantForm();
    } catch (err) {
      console.error("Error updating hydrant:", err);
      toast.error("Failed to update hydrant");
    }
  };

  const handleDeleteHydrant = async () => {
    if (!selectedHydrant) return;

    try {
      const token = localStorage.getItem("token");

      await apiRequest(`/api/hydrants/${selectedHydrant._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setHydrants((prev) => prev.filter((h) => h._id !== selectedHydrant._id));

      toast.success("Hydrant deleted successfully");
    } catch (err) {
      console.error("Failed to delete hydrant", err);
      toast.error("Could not delete hydrant");
    }

    setIsDeleteHydrantOpen(false);
    setSelectedHydrant(null);
  };

  // Water Source handlers
  const resetWaterSourceForm = () => {
    setWaterSourceFormData({
      id: "",
      name: "",
      type: "River",
      roadWidth: "",
      landmark: "",
      latitude: "",
      longitude: "",
    });
  };

  const handleAddWaterSource = async () => {
    if (
      !waterSourceFormData.id ||
      !waterSourceFormData.name ||
      !waterSourceFormData.roadWidth ||
      !waterSourceFormData.landmark ||
      !waterSourceFormData.latitude ||
      !waterSourceFormData.longitude
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    const newWaterSource = {
      sourceId: waterSourceFormData.id,
      name: waterSourceFormData.name,
      type: waterSourceFormData.type,
      roadWidth: parseFloat(waterSourceFormData.roadWidth), // convert to number
      landmark: waterSourceFormData.landmark,
      latitude: parseFloat(waterSourceFormData.latitude),
      longitude: parseFloat(waterSourceFormData.longitude),
      location: {
        type: "Point",
        coordinates: [
          parseFloat(waterSourceFormData.longitude),
          parseFloat(waterSourceFormData.latitude),
        ],
      },
    };

    try {
      const token = localStorage.getItem("token");
      const created = await apiRequest("/api/water-sources", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(newWaterSource),
      });
      setWaterSources([
        ...waterSources,
        {
          id: created._id,
          sourceId: created.sourceId,
          name: created.name,
          type: created.type,
          roadWidth: created.roadWidth,
          landmark: created.landmark,
          coordinates: created.location?.coordinates || [0, 0],
        },
      ]);
      toast.success("Water source added successfully");
      setIsAddWaterSourceOpen(false);
      resetWaterSourceForm();
    } catch (err) {
      console.error("Failed to add water source", err);
      toast.error("Could not add water source");
    }
  };

  const openEditWaterSourceDialog = (waterSource: WaterSource) => {
    setSelectedWaterSource(waterSource);
    setWaterSourceFormData({
      id: waterSource.id,
      name: waterSource.name,
      type: waterSource.type,
      roadWidth: waterSource.roadWidth,
      landmark: waterSource.landmark,
      latitude: waterSource.coordinates[1].toString(),
      longitude: waterSource.coordinates[0].toString(),
    });
    setIsEditWaterSourceOpen(true);
  };

  const handleEditWaterSource = async () => {
    if (!selectedWaterSource) return;

    const updatedData = {
      name: waterSourceFormData.name,
      type: waterSourceFormData.type,
      roadWidth: waterSourceFormData.roadWidth,
      landmark: waterSourceFormData.landmark,
      location: {
        type: "Point",
        coordinates: [
          parseFloat(waterSourceFormData.longitude),
          parseFloat(waterSourceFormData.latitude),
        ],
      },
    };

    try {
      const token = localStorage.getItem("token");
      await apiRequest(`/api/water-sources/${selectedWaterSource.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedData),
      });

      const updatedWaterSources = waterSources.map((w) =>
        w.id === selectedWaterSource.id
          ? {
              ...w,
              name: waterSourceFormData.name,
              type: waterSourceFormData.type,
              roadWidth: waterSourceFormData.roadWidth,
              landmark: waterSourceFormData.landmark,
              coordinates: [
                parseFloat(waterSourceFormData.longitude),
                parseFloat(waterSourceFormData.latitude),
              ] as [number, number],
            }
          : w,
      );

      setWaterSources(updatedWaterSources);
      toast.success("Water source updated successfully");
      setIsEditWaterSourceOpen(false);
      setSelectedWaterSource(null);
      resetWaterSourceForm();
    } catch (err) {
      console.error("Failed to update water source", err);
      toast.error("Could not update water source");
    }
  };

  const handleDeleteWaterSource = async () => {
    if (!selectedWaterSource) return;

    try {
      const token = localStorage.getItem("token");
      await apiRequest(`/api/water-sources/${selectedWaterSource.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setWaterSources(
        waterSources.filter((w) => w.id !== selectedWaterSource.id),
      );
      toast.success("Water source deleted successfully");
    } catch (err) {
      console.error("Failed to delete water source", err);
      toast.error("Could not delete water source");
    }

    setIsDeleteWaterSourceOpen(false);
    setSelectedWaterSource(null);
  };

  // User handlers
  const resetUserForm = () => {
    setUserFormData({
      id: "",
      firefighterID: "",
      name: "",
      rank: "",
      email: "",
      contact: "",
      profilePicture: "",
      role: "Crew",
      team: null,
      password: "",
    });
    setPreviewImage(null);
  };

  // Determine default team when adding user based on current admin's role
  const getDefaultTeam = (): Team => {
    if (!currentUser) return null;
    if (currentUser.role === "Shift-in-Charge A") return "A";
    if (currentUser.role === "Shift-in-Charge B") return "B";
    return null;
  };

  const handleAddUser = async () => {
    if (
      !userFormData.id ||
      !userFormData.name ||
      !userFormData.email ||
      !userFormData.password
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    // Determine team
    let team = userFormData.team;
    if (userFormData.role === "Driver" || userFormData.role === "Crew") {
      if (!team) {
        team = getDefaultTeam();
      }
      if (!team) {
        toast.error("Please assign this user to a Shift (A or B)");
        return;
      }
    } else if (userFormData.role === "Shift-in-Charge A") {
      team = "A";
    } else if (userFormData.role === "Shift-in-Charge B") {
      team = "B";
    } else {
      team = null; // Chief
    }

    const newUser = {
      Firefighterid: userFormData.id,
      name: userFormData.name,
      rank: userFormData.rank || userFormData.role,
      email: userFormData.email,
      contact: userFormData.contact,
      profilePicture: userFormData.profilePicture || "",
      role: userFormData.role,
      AssignToShift:
        team === "A" ? "Shift A" : team === "B" ? "Shift B" : "None",
      password: userFormData.password,
    };

    try {
      const token = localStorage.getItem("token");
      const createdUser = await apiRequest("/api/users", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(newUser),
      });
      setUsers((prev) => [...prev, createdUser]);
      toast.success("User added successfully");
      setIsAddUserOpen(false);
      resetUserForm();
    } catch (err) {
      console.error("Failed to add user", err);
      toast.error("Could not add user");
    }
  };

  const openEditUserDialog = (user: User) => {
    setSelectedUser(user);
    setUserFormData({
      id: user.id,
      firefighterID: user.firefighterID,
      name: user.name,
      rank: user.rank,
      email: user.email,
      contact: user.contact,
      profilePicture: user.profilePicture || "",
      role: user.role,
      shift: user.shift,
      password: user.password,
    });
    setPreviewImage(user.profilePicture || null);
    setIsEditUserOpen(true);
  };

  const handleEditUser = async () => {
    if (!selectedUser || !userFormData.name || !userFormData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Determine team
    let team = userFormData.team;
    if (userFormData.role === "Shift-in-Charge A") team = "A";
    else if (userFormData.role === "Shift-in-Charge B") team = "B";
    else if (userFormData.role === "Chief") team = null;

    const updatedUser = {
      Firefighterid: selectedUser.id,
      name: userFormData.name,
      rank: userFormData.rank || userFormData.role,
      email: userFormData.email,
      contact: userFormData.contact,
      profilePicture: userFormData.profilePicture || "",
      role: userFormData.role,
      AssignToShift:
        team === "A" ? "Shift A" : team === "B" ? "Shift B" : "None",

      password: userFormData.password, // optional
    };

    try {
      const token = localStorage.getItem("token");
      const res = await apiRequest(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedUser),
      });

      // Update UI state only — no localStorage
      const updatedUsers = users.map((u) =>
        u.id === selectedUser.id ? { ...u, ...res } : u,
      );
      setUsers(updatedUsers);

      // Optional: update currentUser if needed
      const cu = JSON.parse(localStorage.getItem("currentUser") || "{}");
      if (cu.id === selectedUser.id) {
        localStorage.setItem("currentUser", JSON.stringify({ ...cu, ...res }));
      }

      toast.success("User updated successfully");
      setIsEditUserOpen(false);
      setSelectedUser(null);
      resetUserForm();
    } catch (err) {
      console.error("Failed to update user", err);
      toast.error("Could not update user");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem("token");
      await apiRequest(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUsers = users.filter((u) => u.id !== selectedUser.id);
      setUsers(updatedUsers);
      toast.success("User deleted successfully");
    } catch (err) {
      console.error("Failed to delete user", err);
      toast.error("Could not delete user");
    }

    setIsDeleteUserOpen(false);
    setSelectedUser(null);
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUserId) return;
    setIsResettingPassword(true);
    try {
      const token = localStorage.getItem("token");
      await apiRequest("/api/users/send-reset-code", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: resetPasswordUserId,
          adminId: currentUser?.id,
        }),
      });
      toast("Reset code sent to user's email.", {
        style: {
          backgroundColor: "hsl(48, 96%, 53%)",
          color: "hsl(0, 72%, 51%)",
        },
      });
    } catch (error) {
      toast.error(
        error.message || "Failed to send reset code. Please try again.",
      );
    } finally {
      setIsResettingPassword(false);
      setIsResetPasswordOpen(false);
      setResetPasswordUserId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    let newTeam: Team = null;

    if (newRole === "Shift-in-Charge A") newTeam = "A";
    else if (newRole === "Shift-in-Charge B") newTeam = "B";
    else {
      const existingUser = users.find((u) => u.id === userId);
      if (existingUser && (newRole === "Driver" || newRole === "Crew")) {
        newTeam = existingUser.shift;
      }
    }

    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, role: newRole, shift: newTeam } : u,
    );
    setUsers(updatedUsers);

    try {
      const token = localStorage.getItem("token");
      await apiRequest(`/api/users/${userId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          role: newRole,
          AssignToShift:
            newTeam === "A" ? "Shift A" : newTeam === "B" ? "Shift B" : "None",
        }),
      });
      toast.success("Role updated successfully");
    } catch (err) {
      console.error("Failed to update role", err);
      toast.error("Could not update role");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setUserFormData({ ...userFormData, profilePicture: result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Determine which roles the current admin can assign
  const getAvailableRoles = (): AppRole[] => {
    if (!currentUser) return ALL_ROLES;
    if (currentUser.role === "Chief") return ALL_ROLES;
    // Shift-in-Charge can only add Driver/Crew to their team
    return ["Driver", "Crew"];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--fire-orange))] to-[hsl(var(--fire-red))] flex items-center justify-center">
          <Droplets className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Resource Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage hydrants, water sources, and users
          </p>
        </div>
      </div>

      <Tabs value={resourceTab} onValueChange={(v) => setResourceTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="hydrants" className="gap-2">
            <Flame className="w-4 h-4" />
            <span className="hidden sm:inline">Fire Hydrants</span>
            <span className="sm:hidden">Hydrants</span>
          </TabsTrigger>
          <TabsTrigger value="water" className="gap-2">
            <Droplets className="w-4 h-4" />
            <span className="hidden sm:inline">Water Sources</span>
            <span className="sm:hidden">Water</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            <span>Users</span>
          </TabsTrigger>
        </TabsList>

        {/* Hydrants Tab */}
        <TabsContent value="hydrants" className="mt-6">
          <div className="bg-card rounded-xl border p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Fire Hydrants ({hydrants.length})
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-initial lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search hydrants..."
                    value={hydrantSearch}
                    onChange={(e) => setHydrantSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => setIsAddHydrantOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Hydrant
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              {isLoading ? (
                <div className="py-8 text-center text-muted-foreground">
                  Loading hydrants...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Address</TableHead>
                      <TableHead className="font-semibold">Remark</TableHead>
                      <TableHead className="font-semibold">Landmark</TableHead>
                      <TableHead className="font-semibold">
                        Coordinates
                      </TableHead>
                      <TableHead className="font-semibold text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHydrants.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground py-8"
                        >
                          No hydrants found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredHydrants.map((hydrant, i) => (
                        <TableRow
                          key={hydrant._id}
                          className="hover:bg-muted/30"
                        >
                          <TableCell className="font-medium">
                            {hydrant.hydrantId}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                hydrant.status === "Operational"
                                  ? "bg-green-500 hover:bg-green-600"
                                  : hydrant.status === "Under Maintenance"
                                    ? "bg-yellow-500 hover:bg-yellow-600"
                                    : "bg-red-500 hover:bg-red-600"
                              }
                            >
                              {hydrant.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate">
                            {hydrant.address}
                          </TableCell>
                          <TableCell className="max-w-[120px] truncate">
                            {hydrant.remark}
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate">
                            {hydrant.landmark}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {hydrant.location?.coordinates?.[1] != null &&
                              hydrant.location?.coordinates?.[0] != null ? (
                                <>
                                  {hydrant.location.coordinates[1].toFixed(4)},{" "}
                                  {hydrant.location.coordinates[0].toFixed(4)}
                                </>
                              ) : (
                                "N/A"
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditHydrantDialog(hydrant)}
                                className="hover:bg-primary/10"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedHydrant(hydrant);
                                  setIsDeleteHydrantOpen(true);
                                }}
                                className="hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Water Sources Tab */}
        <TabsContent value="water" className="mt-6">
          <div className="bg-card rounded-xl border p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Water Sources ({waterSources.length})
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-initial lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search water sources..."
                    value={waterSourceSearch}
                    onChange={(e) => setWaterSourceSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => setIsAddWaterSourceOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Water Source
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">
                      Road Width (m)
                    </TableHead>
                    <TableHead className="font-semibold">Landmark</TableHead>
                    <TableHead className="font-semibold">Coordinates</TableHead>
                    <TableHead className="font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWaterSources.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        No water sources found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWaterSources.map((source) => (
                      <TableRow key={source.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          {source.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{source.type}</Badge>
                        </TableCell>
                        <TableCell>{source.roadWidth}</TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {source.landmark}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {source.coordinates[1].toFixed(4)},{" "}
                            {source.coordinates[0].toFixed(4)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditWaterSourceDialog(source)}
                              className="hover:bg-primary/10"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedWaterSource(source);
                                setIsDeleteWaterSourceOpen(true);
                              }}
                              className="hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-6">
          <div className="bg-card rounded-xl border p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Users ({visibleUsers.length})
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-initial lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10"
                    autoComplete="off"
                    name="user-search-field"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Roles</SelectItem>
                    {getAvailableRoles().map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    resetUserForm();
                    setUserFormData((prev) => ({
                      ...prev,
                      team: getDefaultTeam(),
                    }));
                    setIsAddUserOpen(true);
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add User
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Profile</TableHead>
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Shift</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Password</TableHead>
                    <TableHead className="font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center text-muted-foreground py-8"
                      >
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/30">
                        <TableCell>
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={user.profilePicture}
                              alt={user.name}
                            />
                            <AvatarFallback>
                              {user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value: AppRole) =>
                              handleRoleChange(user.id, value)
                            }
                          >
                            <SelectTrigger className="w-[170px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableRoles().map((r) => (
                                <SelectItem key={r} value={r}>
                                  {r}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {user.shift && user.shift !== "None" ? (
                            <Badge variant="outline">{user.shift}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell className="text-sm">{user.email}</TableCell>
                        <TableCell className="text-sm">
                          {user.contact}
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setResetPasswordUserId(user.id);
                                    setIsResetPasswordOpen(true);
                                  }}
                                  className="bg-primary"
                                >
                                  Reset Password
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Send reset code to user's email</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditUserDialog(user)}
                              className="hover:bg-primary/10"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteUserOpen(true);
                              }}
                              className="hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Hydrant Dialog */}
      <Dialog open={isAddHydrantOpen} onOpenChange={setIsAddHydrantOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Hydrant</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new fire hydrant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="hydrant-id">Hydrant ID *</Label>
              <Input
                id="hydrant-id"
                placeholder="e.g., F-30"
                value={hydrantFormData.hydrantId}
                onChange={(e) =>
                  setHydrantFormData({
                    ...hydrantFormData,
                    hydrantId: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="hydrant-status">Status *</Label>
              <Select
                value={hydrantFormData.status}
                onValueChange={(value: any) =>
                  setHydrantFormData({ ...hydrantFormData, status: value })
                }
              >
                <SelectTrigger id="hydrant-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operational">Operational</SelectItem>
                  <SelectItem value="Under Maintenance">
                    Under Maintenance
                  </SelectItem>
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hydrant-address">Address *</Label>
              <Input
                id="hydrant-address"
                placeholder="e.g., Zone 5, Bulan"
                value={hydrantFormData.address}
                onChange={(e) =>
                  setHydrantFormData({
                    ...hydrantFormData,
                    address: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="hydrant-remark">Remark</Label>
              <Input
                id="hydrant-remark"
                value={hydrantFormData.remark}
                onChange={(e) =>
                  setHydrantFormData({
                    ...hydrantFormData,
                    remark: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="hydrant-landmark">Landmark *</Label>
              <Input
                id="hydrant-landmark"
                placeholder="e.g., Near plaza"
                value={hydrantFormData.landmark}
                onChange={(e) =>
                  setHydrantFormData({
                    ...hydrantFormData,
                    landmark: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Latitude *</Label>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="12.6707"
                  value={hydrantFormData.latitude}
                  onChange={(e) =>
                    setHydrantFormData({
                      ...hydrantFormData,
                      latitude: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Longitude *</Label>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="123.5233"
                  value={hydrantFormData.longitude}
                  onChange={(e) =>
                    setHydrantFormData({
                      ...hydrantFormData,
                      longitude: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddHydrantOpen(false);
                resetHydrantForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddHydrant} className="bg-primary">
              Add Hydrant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Hydrant Dialog */}
      <Dialog open={isEditHydrantOpen} onOpenChange={setIsEditHydrantOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Hydrant</DialogTitle>
            <DialogDescription>Update the hydrant details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Hydrant ID</Label>
              <Input
                value={hydrantFormData.hydrantId}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label>Status *</Label>
              <Select
                value={hydrantFormData.status}
                onValueChange={(value: any) =>
                  setHydrantFormData({ ...hydrantFormData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operational">Operational</SelectItem>
                  <SelectItem value="Under Maintenance">
                    Under Maintenance
                  </SelectItem>
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Address *</Label>
              <Input
                value={hydrantFormData.address}
                onChange={(e) =>
                  setHydrantFormData({
                    ...hydrantFormData,
                    address: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Remark</Label>
              <Input
                value={hydrantFormData.remark}
                onChange={(e) =>
                  setHydrantFormData({
                    ...hydrantFormData,
                    remark: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Landmark *</Label>
              <Input
                value={hydrantFormData.landmark}
                onChange={(e) =>
                  setHydrantFormData({
                    ...hydrantFormData,
                    landmark: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Latitude *</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={hydrantFormData.latitude}
                  onChange={(e) =>
                    setHydrantFormData({
                      ...hydrantFormData,
                      latitude: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Longitude *</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={hydrantFormData.longitude}
                  onChange={(e) =>
                    setHydrantFormData({
                      ...hydrantFormData,
                      longitude: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditHydrantOpen(false);
                setSelectedHydrant(null);
                resetHydrantForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditHydrant} className="bg-primary">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Hydrant Dialog */}
      <AlertDialog
        open={isDeleteHydrantOpen}
        onOpenChange={setIsDeleteHydrantOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hydrant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete hydrant{" "}
              {selectedHydrant?.hydrantId}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteHydrantOpen(false);
                setSelectedHydrant(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHydrant}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Water Source Dialog */}
      <Dialog
        open={isAddWaterSourceOpen}
        onOpenChange={setIsAddWaterSourceOpen}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Water Source</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new water source
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="ws-name">Name *</Label>
              <Input
                id="ws-name"
                placeholder="e.g., Bulan River"
                value={waterSourceFormData.name}
                onChange={(e) =>
                  setWaterSourceFormData({
                    ...waterSourceFormData,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="ws-type">Type *</Label>
              <Select
                value={waterSourceFormData.type}
                onValueChange={(value: any) =>
                  setWaterSourceFormData({
                    ...waterSourceFormData,
                    type: value,
                  })
                }
              >
                <SelectTrigger id="ws-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="River">River</SelectItem>
                  <SelectItem value="Well">Well</SelectItem>
                  <SelectItem value="Sea">Sea</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ws-width">Road Width (in meters) *</Label>
              <Input
                id="ws-width"
                placeholder="e.g., 8"
                value={waterSourceFormData.roadWidth}
                onChange={(e) =>
                  setWaterSourceFormData({
                    ...waterSourceFormData,
                    roadWidth: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="ws-landmark">Landmark *</Label>
              <Input
                id="ws-landmark"
                placeholder="e.g., Behind municipal hall"
                value={waterSourceFormData.landmark}
                onChange={(e) =>
                  setWaterSourceFormData({
                    ...waterSourceFormData,
                    landmark: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Latitude *</Label>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="12.6707"
                  value={waterSourceFormData.latitude}
                  onChange={(e) =>
                    setWaterSourceFormData({
                      ...waterSourceFormData,
                      latitude: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Longitude *</Label>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="123.5233"
                  value={waterSourceFormData.longitude}
                  onChange={(e) =>
                    setWaterSourceFormData({
                      ...waterSourceFormData,
                      longitude: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddWaterSourceOpen(false);
                resetWaterSourceForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddWaterSource} className="bg-primary">
              Add Water Source
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Water Source Dialog */}
      <Dialog
        open={isEditWaterSourceOpen}
        onOpenChange={setIsEditWaterSourceOpen}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Water Source</DialogTitle>
            <DialogDescription>
              Update the water source details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={waterSourceFormData.name}
                onChange={(e) =>
                  setWaterSourceFormData({
                    ...waterSourceFormData,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Type *</Label>
              <Select
                value={waterSourceFormData.type}
                onValueChange={(value: any) =>
                  setWaterSourceFormData({
                    ...waterSourceFormData,
                    type: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="River">River</SelectItem>
                  <SelectItem value="Well">Well</SelectItem>
                  <SelectItem value="Sea">Sea</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Road Width (in meters) *</Label>
              <Input
                value={waterSourceFormData.roadWidth}
                onChange={(e) =>
                  setWaterSourceFormData({
                    ...waterSourceFormData,
                    roadWidth: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Landmark *</Label>
              <Input
                value={waterSourceFormData.landmark}
                onChange={(e) =>
                  setWaterSourceFormData({
                    ...waterSourceFormData,
                    landmark: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Latitude *</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={waterSourceFormData.latitude}
                  onChange={(e) =>
                    setWaterSourceFormData({
                      ...waterSourceFormData,
                      latitude: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Longitude *</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={waterSourceFormData.longitude}
                  onChange={(e) =>
                    setWaterSourceFormData({
                      ...waterSourceFormData,
                      longitude: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditWaterSourceOpen(false);
                setSelectedWaterSource(null);
                resetWaterSourceForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditWaterSource} className="bg-primary">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Water Source Dialog */}
      <AlertDialog
        open={isDeleteWaterSourceOpen}
        onOpenChange={setIsDeleteWaterSourceOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Water Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedWaterSource?.name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteWaterSourceOpen(false);
                setSelectedWaterSource(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWaterSource}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
                {previewImage && (
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={previewImage} alt="Preview" />
                  </Avatar>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="user-id">Firefighter ID *</Label>
              <Input
                id="user-id"
                placeholder="e.g., FF-006"
                value={userFormData.id}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, id: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="user-rank">Rank</Label>
              <Input
                id="user-rank"
                placeholder="e.g., Fire Officer 1"
                value={userFormData.rank}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, rank: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="user-name">Name *</Label>
              <Input
                id="user-name"
                placeholder="e.g., John Doe"
                value={userFormData.name}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="user-role">Role *</Label>
              <Select
                value={userFormData.role}
                onValueChange={(value: AppRole) =>
                  setUserFormData({ ...userFormData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableRoles().map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Shift *</Label>
              <Select
                value={userFormData.team || ""}
                onValueChange={(value: string) =>
                  setUserFormData({ ...userFormData, team: value as Team })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Shift A</SelectItem>
                  <SelectItem value="B">Shift B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="user-email">Email *</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="e.g., john@bfp.gov.ph"
                value={userFormData.email}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="user-contact">Contact Number</Label>
              <Input
                id="user-contact"
                placeholder="e.g., +63 917 123 4567"
                value={userFormData.contact}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, contact: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="user-password">Password *</Label>
              <Input
                id="user-password"
                type="password"
                placeholder="Enter password"
                value={userFormData.password}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, password: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddUserOpen(false);
                resetUserForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddUser} className="bg-primary">
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update the user details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Firefighter ID</Label>
              <Input value={userFormData.id} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Name *</Label>
              <Input
                value={userFormData.name}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Rank</Label>
              <Input
                value={userFormData.rank}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, rank: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={userFormData.email}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Contact Number</Label>
              <Input
                value={userFormData.contact}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, contact: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Role *</Label>
              <Select
                value={userFormData.role}
                onValueChange={(value: AppRole) =>
                  setUserFormData({ ...userFormData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableRoles().map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(userFormData.role === "Driver" ||
              userFormData.role === "Crew") && (
              <div>
                <Label>Shift Assignment *</Label>
                <Select
                  value={userFormData.team || ""}
                  onValueChange={(value: string) =>
                    setUserFormData({ ...userFormData, team: value as Team })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Shift A</SelectItem>
                    <SelectItem value="B">Shift B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
                {previewImage && (
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={previewImage} alt="Preview" />
                  </Avatar>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditUserOpen(false);
                setSelectedUser(null);
                resetUserForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditUser} className="bg-primary">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteUserOpen(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Confirmation Dialog */}
      <AlertDialog
        open={isResetPasswordOpen}
        onOpenChange={setIsResetPasswordOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to send a reset code to this user's registered email?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsResetPasswordOpen(false);
                setResetPasswordUserId(null);
              }}
              className="border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetPassword}
              disabled={isResettingPassword}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResettingPassword && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ResourceManagement;
