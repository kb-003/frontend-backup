import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Map as MapIcon, Settings, HelpCircle, User, LogOut, Mail, Phone, MapPin, Calendar, Badge as BadgeIcon, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import bfpLogo from "@/assets/bfp-logo.png";

// Validation schema
const contactSchema = z.object({
  email: z.string().email("Invalid email format").max(255, "Email must be less than 255 characters"),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, "Invalid phone format").min(10, "Phone number too short").max(20, "Phone number too long")
});

const Profile = () => {
  const navigate = useNavigate();

  // Mock user data - in real app, this would come from auth context or API
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  
  // Get saved profile or use defaults
  const savedProfile = JSON.parse(localStorage.getItem(`profile_${currentUser.username}`) || "{}");
  
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [firefighterInfo, setFirefighterInfo] = useState({
    name: currentUser.username === "admin" ? "Admin User" : "Fire Officer John Doe",
    email: savedProfile.email || (currentUser.username === "admin" ? "admin@bulanfire.gov.ph" : "john.doe@bulanfire.gov.ph"),
    phone: savedProfile.phone || "+63 912 345 6789",
    rank: currentUser.username === "admin" ? "Administrator" : "Fire Officer II",
    station: "Bulan Fire Station",
    assigned: "Zone VIII Pob. (Brgy 8- Loyo), Bulan, Sorsogon",
    joinDate: "January 15, 2020",
    badgeNumber: currentUser.username === "admin" ? "ADMIN-001" : "BFS-2020-042"
  });

  const [editedContact, setEditedContact] = useState({
    email: firefighterInfo.email,
    phone: firefighterInfo.phone
  });

  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleEditContact = () => {
    setEditedContact({
      email: firefighterInfo.email,
      phone: firefighterInfo.phone
    });
    setErrors({});
    setIsEditingContact(true);
  };

  const handleCancelEdit = () => {
    setEditedContact({
      email: firefighterInfo.email,
      phone: firefighterInfo.phone
    });
    setErrors({});
    setIsEditingContact(false);
  };

  const handleSaveContact = () => {
    try {
      // Validate input
      contactSchema.parse(editedContact);
      
      // Update local state
      const updatedInfo = {
        ...firefighterInfo,
        email: editedContact.email,
        phone: editedContact.phone
      };
      setFirefighterInfo(updatedInfo);
      
      // Save to localStorage for persistence
      localStorage.setItem(`profile_${currentUser.username}`, JSON.stringify({
        email: editedContact.email,
        phone: editedContact.phone
      }));
      
      // Update admin-side data (stored separately for admin view)
      const adminUsers = JSON.parse(localStorage.getItem("adminUsers") || "[]");
      const userIndex = adminUsers.findIndex((u: any) => u.username === currentUser.username);
      if (userIndex >= 0) {
        adminUsers[userIndex] = { ...adminUsers[userIndex], email: editedContact.email, phone: editedContact.phone };
      } else {
        adminUsers.push({ username: currentUser.username, email: editedContact.email, phone: editedContact.phone });
      }
      localStorage.setItem("adminUsers", JSON.stringify(adminUsers));
      
      setIsEditingContact(false);
      setErrors({});
      toast.success("Contact information updated successfully");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { email?: string; phone?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "email") newErrors.email = err.message;
          if (err.path[0] === "phone") newErrors.phone = err.message;
        });
        setErrors(newErrors);
        toast.error("Please fix the validation errors");
      }
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div className="bg-gradient-to-b from-[hsl(var(--fire-orange))] to-[hsl(var(--fire-red))] flex flex-col items-center py-4 gap-6 w-16">
          <img src={bfpLogo} alt="BFP" className="w-10 h-10" />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => navigate("/dashboard")}
                className="p-3 hover:bg-white/10 rounded-lg transition-colors"
              >
                <MapIcon className="w-6 h-6 text-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Map</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => navigate("/settings")}
                className="p-3 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Settings className="w-6 h-6 text-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => navigate("/help")}
                className="p-3 hover:bg-white/10 rounded-lg transition-colors"
              >
                <HelpCircle className="w-6 h-6 text-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Help</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-3 bg-white/20 rounded-lg transition-colors mt-auto">
                <User className="w-6 h-6 text-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Profile</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Firefighter Profile</h1>
              <p className="text-muted-foreground">View and manage your profile information</p>
            </div>

            {/* Profile Card */}
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-[hsl(var(--fire-orange))] to-[hsl(var(--fire-red))] text-white">
                      {firefighterInfo.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-3xl">{firefighterInfo.name}</CardTitle>
                <CardDescription className="text-lg">{firefighterInfo.rank}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Separator />
                
                {/* Contact Information */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                    {!isEditingContact && (
                      <Button
                        onClick={handleEditContact}
                        variant="outline"
                        size="sm"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                  
                  {isEditingContact ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editedContact.email}
                          onChange={(e) => setEditedContact({ ...editedContact, email: e.target.value })}
                          className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={editedContact.phone}
                          onChange={(e) => setEditedContact({ ...editedContact, phone: e.target.value })}
                          className={errors.phone ? "border-destructive" : ""}
                        />
                        {errors.phone && (
                          <p className="text-sm text-destructive">{errors.phone}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveContact}
                          className="flex-1"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Mail className="w-5 h-5" />
                        <span>{firefighterInfo.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Phone className="w-5 h-5" />
                        <span>{firefighterInfo.phone}</span>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Station Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Station Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <BadgeIcon className="w-5 h-5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Badge Number</p>
                        <p className="font-medium text-foreground">{firefighterInfo.badgeNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="w-5 h-5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Station</p>
                        <p className="font-medium text-foreground">{firefighterInfo.station}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <MapPin className="w-5 h-5 mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Assigned Area</p>
                        <p className="font-medium text-foreground">{firefighterInfo.assigned}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="w-5 h-5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Join Date</p>
                        <p className="font-medium text-foreground">{firefighterInfo.joinDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={() => navigate("/change-password")}
                    variant="outline"
                    className="w-full"
                  >
                    Change Password
                  </Button>
                  <Button
                    onClick={handleLogout}
                    className="w-full bg-[hsl(var(--fire-deep-red))] hover:bg-[hsl(var(--fire-deep-red))]/90 text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Profile;
