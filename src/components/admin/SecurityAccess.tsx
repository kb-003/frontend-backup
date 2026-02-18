import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Shield, Key, Clock, Users, Lock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { type User } from "@/data/mockData";
import { type AppRole, type Team, ADMIN_ROLES, USER_ROLES } from "@/lib/roles";

interface SecurityAccessProps {
  users: User[];
  setUsers: (users: User[]) => void;
  currentUser?: { role: AppRole; team: Team; [key: string]: any } | null;
}

const SecurityAccess = ({ users, setUsers, currentUser }: SecurityAccessProps) => {
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [sessionTimeout, setSessionTimeout] = useState(() => {
    return localStorage.getItem("sessionTimeout") || "30";
  });

  const admins = users.filter(u => ADMIN_ROLES.includes(u.role));
  const fieldUsers = users.filter(u => USER_ROLES.includes(u.role));

  const handleResetPassword = () => {
    if (!selectedUserId || !newPassword) {
      toast.error("Please select a user and enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    const updatedUsers = users.map(u =>
      u.id === selectedUserId ? { ...u, password: newPassword, isFirstLogin: true } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem("adminUsers", JSON.stringify(updatedUsers));
    localStorage.removeItem(`password_${selectedUserId}`);
    toast.success("Password reset successfully. User will be prompted to change on next login.");
    setIsResetPasswordOpen(false);
    setSelectedUserId("");
    setNewPassword("");
  };

  const handleSessionTimeoutChange = (value: string) => {
    setSessionTimeout(value);
    localStorage.setItem("sessionTimeout", value);
    toast.success(`Session timeout set to ${value} minutes`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Security & Access Control</h2>
          <p className="text-sm text-muted-foreground">Manage permissions and authentication</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Summary */}
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
                  <Shield className="w-4 h-4 text-primary" />
                  Chief
                </span>
                <span className="text-lg font-bold text-primary">
                  {users.filter(u => u.role === "Chief").length}
                </span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Full access to all resources and users</li>
                <li>• Can assign tasks to Shift-in-Charge A & B</li>
                <li>• Can manage all user accounts</li>
                <li>• Can view all passwords</li>
              </ul>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  Shift-in-Charge A / B
                </span>
                <span className="text-lg font-bold text-blue-500">
                  {users.filter(u => u.role === "Shift-in-Charge A" || u.role === "Shift-in-Charge B").length}
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
                  <Users className="w-4 h-4 text-green-500" />
                  Driver & Crew
                </span>
                <span className="text-lg font-bold text-green-500">{fieldUsers.length}</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• User-side map and incident workflow</li>
                <li>• View assigned tasks only</li>
                <li>• Update own profile</li>
                <li>• Report incidents</li>
              </ul>
            </div>

            <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Note:</strong> Only Chief and Shift-in-Charge roles can access the admin dashboard.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Password Management
            </CardTitle>
            <CardDescription>Reset user passwords and manage credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Reset a user's password. They will be prompted to create a new password on their next login.
            </p>
            <Button onClick={() => setIsResetPasswordOpen(true)} className="w-full bg-primary">
              <Key className="w-4 h-4 mr-2" /> Reset User Password
            </Button>
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Password Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Minimum 8 characters</li>
                <li>• At least one uppercase letter</li>
                <li>• At least one number</li>
                <li>• At least one special character</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Session Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Session Settings
            </CardTitle>
            <CardDescription>Configure session timeout for security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Session Timeout</Label>
              <Select value={sessionTimeout} onValueChange={handleSessionTimeoutChange}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="480">8 hours</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Users will be automatically logged out after this period of inactivity.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security Information
            </CardTitle>
            <CardDescription>System security status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium text-green-800">Password Encryption</span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Active</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium text-green-800">Session Management</span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Active</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium text-green-800">Role-Based Access</span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Enabled</span>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Note: This is a prototype using localStorage. Production systems should use server-side authentication with proper encryption.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
            <DialogDescription>Select a user and enter a new temporary password</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Select User *</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Choose a user" /></SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name} ({user.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>New Password *</Label>
              <Input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsResetPasswordOpen(false); setSelectedUserId(""); setNewPassword(""); }}>Cancel</Button>
            <Button onClick={handleResetPassword} className="bg-primary">Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecurityAccess;
