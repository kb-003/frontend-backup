import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Shield, LogOut, Key, Pencil, Camera, X, Check } from "lucide-react";
import { toast } from "sonner";

const ProfilePanel = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    contact: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setEditForm({
        name: parsed.name || "",
        email: parsed.email || "",
        contact: parsed.contact || ""
      });
    } else {
      const defaultUser = {
        name: "Juan Dela Cruz",
        email: "juan.delacruz@bfp.gov.ph",
        contact: "09171234567",
        rank: "Fire Officer 1",
        role: "Crew",
        firefighterID: "CR-001",
        team: "A",
        profilePicture: ""
      };
      setUser(defaultUser);
      setEditForm({
        name: defaultUser.name,
        email: defaultUser.email,
        contact: defaultUser.contact
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const handleSaveProfile = () => {
    const updatedUser = { ...user, ...editForm };
    setUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      contact: user.contact || ""
    });
    setIsEditing(false);
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const updatedUser = { ...user, profilePicture: event.target?.result as string };
        setUser(updatedUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        toast.success("Profile picture updated");
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Profile</h2>
          <p className="text-sm text-muted-foreground">Your account information</p>
        </div>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-5 h-5 text-[hsl(var(--fire-orange))]" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    {user.profilePicture ? (
                      <AvatarImage src={user.profilePicture} alt={user.name} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--fire-orange))] to-[hsl(var(--fire-red))] text-white text-xl">
                      {user.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleProfilePictureClick}
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[hsl(var(--fire-orange))] text-white flex items-center justify-center shadow-md hover:bg-[hsl(var(--fire-red))] transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <span className="text-xs text-muted-foreground">Change photo</span>
              </div>

              {/* Info Section */}
              <div className="flex-1 space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm">Name</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact" className="text-sm">Contact Number</Label>
                        <Input
                          id="contact"
                          value={editForm.contact}
                          onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={handleSaveProfile} className="bg-gradient-to-r from-[hsl(var(--fire-orange))] to-[hsl(var(--fire-red))] text-white">
                        <Check className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="grid gap-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-muted-foreground">Name</span>
                      <span className="text-sm font-medium">{user.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span className="text-sm font-medium">{user.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-muted-foreground">Contact Number</span>
                      <span className="text-sm font-medium">{user.contact || "Not set"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-muted-foreground">Rank</span>
                      <span className="text-sm font-medium text-muted-foreground">{user.rank || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-muted-foreground">Role</span>
                      <Badge variant="outline" className="bg-[hsl(var(--fire-orange))]/10 text-[hsl(var(--fire-orange))] border-[hsl(var(--fire-orange))]/20">
                        {user.role}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-muted-foreground">Firefighter ID</span>
                      <span className="text-sm font-medium text-muted-foreground">{user.firefighterID || user.id}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">Team</span>
                      {user.team ? (
                        <Badge variant="outline">Shift {user.team}</Badge>
                      ) : (
                        <span className="text-sm font-medium text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-[hsl(var(--fire-orange))]" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={handleChangePassword}>
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <LogOut className="w-5 h-5 text-destructive" />
              Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePanel;
