import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import bfpLogo from "@/assets/bfp-logo.png";
import { getRoleFromIdPrefix, isAdminRole, getTeamForRole } from "@/lib/roles";
import type { Team } from "@/lib/roles";
import { apiRequest } from "@/lib/api";

const Login = () => {
  const navigate = useNavigate();
  const [firefighterId, setFirefighterId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!firefighterId || !password) {
        toast.error("Invalid Login", {
          description: "Please enter your ID and password",
        });
        setIsLoading(false);
        return;
      }

      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          Firefighterid: firefighterId.trim().toUpperCase(),
          password,
        }),
      });

      // ✅ Store token under role-specific key
      const role = data.user.role;
      switch (role) {
        case "Chief":
        case "Shift-in-Charge A":
        case "Shift-in-Charge B":
          localStorage.setItem("adminToken", data.token);
          break;
        case "Driver":
        case "Crew":
          localStorage.setItem("crewToken", data.token);
          break;
        default:
          localStorage.setItem("token", data.token); // fallback
      }

      // Build user object
      const isFirstLogin = data.isFirstLogin ?? false;
      const user = {
        id: firefighterId,
        firefighterID: firefighterId,
        name: data.user.name,
        rank: data.user.rank,
        email: data.user.email,
        contact: data.user.contact,
        role,
        assignToShift: data.user.AssignToShift, // ✅ use backend field
        isFirstLogin,
      };

      localStorage.setItem("currentUser", JSON.stringify(user));

      // ✅ Navigate based on role
      if (isFirstLogin) {
        toast.info("First-Time Login", {
          description: "Please change your default password to continue.",
        });
        navigate("/change-password");
      } else {
        toast.success("Login Successful");
        navigate(
          role === "Chief" || role.startsWith("Shift-in-Charge")
            ? "/admin"
            : "/dashboard",
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error("Invalid Login", { description: err.message });
      } else {
        toast.error("Invalid Login", { description: "Incorrect credentials." });
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[hsl(var(--fire-orange))] to-[hsl(var(--fire-red))] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <img
            src={bfpLogo}
            alt="BFP Logo"
            className="w-[5.5rem] h-[5.5rem] mx-auto mb-2"
          />
          <h1 className="text-lg font-bold text-foreground">
            Bureau of Fire Protection - BULAN
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-[2rem]">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Log in to your account
            </h2>
            <p className="text-sm text-muted-foreground">Welcome back!</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="firefighterId" className="text-sm font-semibold">
                Firefighter Identification Number
              </Label>
              <Input
                id="firefighterId"
                type="text"
                value={firefighterId}
                onChange={(e) => setFirefighterId(e.target.value)}
                className="h-10"
                placeholder="Enter your ID"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                  />
                  <label htmlFor="remember" className="cursor-pointer">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 mt-[22px] bg-[hsl(var(--fire-deep-red))] hover:bg-[hsl(var(--fire-deep-red))]/90 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
