import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Wrench,
  Plus,
  Search,
  CalendarIcon,
  Pencil,
  CheckCircle,
  Trash,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  type MaintenanceTask,
  type Hydrant,
  type WaterSource,
  type User,
} from "@/data/mockData";
import { type AppRole, type Team, getAssignableUsers } from "@/lib/roles";

interface MaintenanceSchedulingProps {
  tasks: MaintenanceTask[];
  setTasks: (tasks: MaintenanceTask[]) => void;
  hydrants: Hydrant[];
  waterSources: WaterSource[];
  users: User[];
  currentUser?: {
    role: AppRole;
    team: Team;
    id: string;
    [key: string]: any;
  } | null;
}

const MaintenanceScheduling = ({
  tasks,
  setTasks,
  hydrants,
  waterSources,
  users,
  currentUser,
}: MaintenanceSchedulingProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<MaintenanceTask | null>(
    null,
  );
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(
    null,
  );
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [formData, setFormData] = useState({
    resourceType: "Hydrant" as "Hydrant" | "Water Source",
    resourceId: "",
    taskType: "Inspection" as "Inspection" | "Repair" | "Replacement",
    status: "Pending" as "Pending" | "In Progress" | "Completed",
    scheduledDate: "",
    assignedTo: "",
    notes: "",

  });

  const getUserName = (assignedTo: any) => {
    if (!assignedTo) return null;

    // If it's a populated object from Mongo
    if (typeof assignedTo === "object") {
      return assignedTo.Firefighterid || assignedTo.name || "Unassigned";
    }

    // If it's still just a string ID
    return assignedTo;
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.resourceId.toLowerCase().includes(search.toLowerCase()) ||
        task._id.toLowerCase().includes(search.toLowerCase()) ||
        (task.notes?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, statusFilter]);

  const stats = useMemo(
    () => ({
      pending: tasks.filter((t) => t.status === "Pending").length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      completed: tasks.filter((t) => t.status === "Completed").length,
    }),
    [tasks],
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "In Progress":
        return "bg-blue-500 hover:bg-blue-600";
      case "Completed":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "bg-gray-500";
    }
  };

  const resetForm = () => {
    setFormData({
      resourceType: "Hydrant",
      resourceId: "",
      taskType: "Inspection",
      status: "Pending",
      assignedTo: "",
      notes: "",
    });
    setScheduledDate(undefined);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await apiRequest("/api/tasks");
        setTasks(res.tasks);
      } catch {
        toast.error("Failed to load tasks");
      }
    };
    fetchTasks();
  }, [setTasks]);

  const sendSMS = async (to: string, message: string) => {
    try {
      const token = localStorage.getItem("token"); // or however you're storing the JWT

      await apiRequest("/api/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, //
        },
        body: JSON.stringify({ to, message }),
      });

      toast.success("SMS sent successfully");
    } catch (err) {
      console.error("SMS failed:", err);
      toast.error("Failed to send SMS");
    }
  };

  const handleAddTask = async () => {
    if (!formData.resourceId || !scheduledDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newTask = {
      ...formData,
      scheduledDate: tasks.scheduledDate
        ? new Date(tasks.scheduledDate)
        : undefined,
    };

    try {
      const res = await apiRequest("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      setTasks([...tasks, res.task]);
      toast.success("Maintenance task scheduled successfully");

      // Send SMS to assigned user (if any)
      const assignedUser = users.find(
        (u) => u._id === res.task.assignedTo?._id,
      );
      if (assignedUser?.contact) {
        await sendSMS(
          assignedUser.contact,
          `Hi ${assignedUser.name}, you've been assigned a ${res.task.taskType} task for ${res.task.resourceType} ${res.task.resourceId} on ${res.task.scheduledDate}.`,
        );
      }

      setIsAddTaskOpen(false);
      resetForm();
    } catch {
      toast.error("Failed to schedule task");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await apiRequest(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      setTasks(tasks.filter((t) => t._id !== taskId));
      toast.success("Task deleted successfully");
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const openEditDialog = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setFormData({
      resourceType: task.resourceType,
      resourceId: task.resourceId,
      taskType: task.taskType,
      status: task.status,
      assignedTo: task.assignedTo || "",
      notes: task.notes || "",
      scheduledDate: task.scheduledDate
        ? new Date(task.scheduledDate)
        : undefined,
    });
    setIsEditTaskOpen(true);
  };

  const handleEditTask = async () => {
    if (!selectedTask || !formData.scheduledDate) return;

    const updatedData = {
      ...formData,
      scheduledDate: format(scheduledDate, "yyyy-MM-dd"),
      completedDate:
        formData.status === "Completed" && selectedTask.status !== "Completed"
          ? format(new Date(), "yyyy-MM-dd")
          : undefined,
    };
    try {
      const res = await apiRequest(`/api/tasks/${selectedTask._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      setTasks(tasks.map((t) => (t._id === selectedTask._id ? res.task : t)));
      toast.success("Task updated successfully");
      setIsEditTaskOpen(false);
      setSelectedTask(null);
      resetForm();
    } catch (err) {
      console.error("Failed to update task", err);
      toast.error("Could not update task");
    }
  };

  const markAsCompleted = async (taskId: string) => {
    try {
      const updatedTask = await apiRequest(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Completed",
          completedDate: format(new Date(), "yyyy-MM-dd"),
        }),
      });

      setTasks(
        tasks.map((t) =>
          t._id === updatedTask.task._id ? updatedTask.task : t,
        ),
      );
      toast.success("Task marked as completed");
    } catch (err) {
      toast.error("Failed to mark task as completed");
    }
  };

  const resourceOptions =
    formData.resourceType === "Hydrant"
      ? hydrants.map((h) => ({ id: h.hydrantId, label: h.hydrantId }))
      : waterSources.map((w) => ({ id: w.id, label: w.name }));

  // Use role-based filtering for assignable users
  const assignableUsers = useMemo(() => {
    if (!currentUser) return users;
    return getAssignableUsers(users as any, currentUser.role);
  }, [users, currentUser]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500
 flex items-center justify-center"
        >
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Maintenance & Scheduling
          </h2>
          <p className="text-sm text-muted-foreground">
            Schedule inspections and track maintenance tasks
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-500">
                {stats.pending}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-blue-500">
                {stats.inProgress}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-500">
                {stats.completed}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-card rounded-xl border p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Maintenance Tasks ({tasks.length})
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-initial lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
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
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setIsAddTaskOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" /> Schedule Task
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Resource</TableHead>
                <TableHead className="font-semibold">Task Type</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Scheduled</TableHead>
                <TableHead className="font-semibold">Assigned To</TableHead>
                <TableHead className="font-semibold">Notes</TableHead>
                <TableHead className="font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-8"
                  >
                    No maintenance tasks found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow key={task._id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{task._id}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          {task.resourceType}:
                        </span>{" "}
                        <span className="font-medium">{task.resourceId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{task.taskType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(task.scheduledDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {getUserName(task.assignedTo) || "—"}
                    </TableCell>
                    <TableCell className="text-sm max-w-[150px] truncate">
                      {task.notes || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(task)}
                          className="hover:bg-primary/10"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {task.status !== "Completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsCompleted(task._id)}
                            className="hover:bg-green-100"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setTaskToDelete(task);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="hover:bg-red-100"
                        >
                          <Trash className="w-4 h-4 text-red-600" />
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

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Maintenance Task</DialogTitle>
            <DialogDescription>
              Create a new inspection or maintenance task
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Resource Type *</Label>
              <Select
                value={formData.resourceType}
                onValueChange={(v: any) =>
                  setFormData({ ...formData, resourceType: v, resourceId: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hydrant">Hydrant</SelectItem>
                  <SelectItem value="Water Source">Water Source</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Resource *</Label>
              <Select
                value={formData.resourceId}
                onValueChange={(v) =>
                  setFormData({ ...formData, resourceId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select resource" />
                </SelectTrigger>
                <SelectContent>
                  {resourceOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Task Type *</Label>
              <Select
                value={formData.taskType}
                onValueChange={(v: any) =>
                  setFormData({ ...formData, taskType: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inspection">Inspection</SelectItem>
                  <SelectItem value="Repair">Repair</SelectItem>
                  <SelectItem value="Replacement">Replacement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Scheduled Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? (
                      format(scheduledDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={(date) => {
                      if (
                        scheduledDate &&
                        date?.getTime() === scheduledDate.getTime()
                      ) {
                        // clicked the same date again → unselect
                        setScheduledDate(undefined);
                      } else {
                        setScheduledDate(date);
                      }
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Assign To</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(v) =>
                  setFormData({ ...formData, assignedTo: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {assignableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddTaskOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddTask} className="bg-primary">
              Schedule Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Maintenance Task</DialogTitle>
            <DialogDescription>Update task details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(v: any) =>
                  setFormData({ ...formData, status: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Scheduled Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? (
                      format(scheduledDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={(date) => {
                      if (
                        scheduledDate &&
                        date?.getTime() === scheduledDate.getTime()
                      ) {
                        // clicked the same date again → unselect
                        setScheduledDate(undefined);
                      } else {
                        setScheduledDate(date);
                      }
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Assign To</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(v) =>
                  setFormData({ ...formData, assignedTo: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {assignableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditTaskOpen(false);
                setSelectedTask(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditTask} className="bg-primary">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (taskToDelete) {
                  deleteTask(taskToDelete._id);
                }
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceScheduling;
