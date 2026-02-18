import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, X, Eye, EyeOff, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import bfpLogo from "@/assets/bfp-logo.png";

const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
  <div className="flex items-center gap-1.5 text-xs">
    {met ? (
      <Check className="w-3.5 h-3.5 text-green-600" />
    ) : (
      <X className="w-3.5 h-3.5 text-muted-foreground" />
    )}
    <span className={met ? "text-green-600 font-medium" : "text-muted-foreground"}>
      {text}
    </span>
  </div>
);

const ChangePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resetState = location.state as { email?: string; code?: string; isReset?: boolean } | null;
  const isResetFlow = resetState?.isReset === true;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasMinLength = newPassword.length >= 8;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const isPasswordStrong = hasUppercase && hasNumber && hasMinLength && hasSpecialChar;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== "";

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordStrong) {
      toast.error("Weak Password", { description: "Please meet all password requirements" });
      return;
    }

    if (!passwordsMatch) {
      toast.error("Passwords Don't Match", { description: "New password and confirmation must match" });
      return;
    }

    setIsLoading(true);

    if (isResetFlow) {
      try {
        await apiRequest("/api/auth/reset-password", {
          method: "POST",
          body: JSON.stringify({
            email: resetState?.email,
            code: resetState?.code,
            newPassword,
          }),
        });
        toast.success("Password updated successfully.");
        setTimeout(() => navigate("/"), 1000);
      } catch {
        toast.error("Failed to reset password. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Normal change password flow (logged-in user)
      const userStr = localStorage.getItem("currentUser");
      if (!userStr) {
        toast.error("Session Error", { description: "Please log in again" });
        navigate("/");
        return;
      }

      const user = JSON.parse(userStr);
      const storedPassword = localStorage.getItem(`password_${user.id}`);
      const expectedCurrentPassword = user.isFirstLogin ? user.id : (storedPassword || "password123");

      if (currentPassword !== expectedCurrentPassword) {
        toast.error("Invalid Current Password", { description: "Please enter your current password correctly" });
        setIsLoading(false);
        return;
      }

      localStorage.setItem(`password_${user.id}`, newPassword);
      user.isFirstLogin = false;
      localStorage.setItem("currentUser", JSON.stringify(user));

      toast.success("Password Updated Successfully", { description: "Please log in with your new password" });

      setTimeout(() => {
        localStorage.removeItem("currentUser");
        navigate("/");
      }, 1500);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[hsl(var(--fire-orange))] to-[hsl(var(--fire-red))] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <img src={bfpLogo} alt="BFP Logo" className="w-[5.5rem] h-[5.5rem] mx-auto mb-2" />
          <h1 className="text-lg font-bold text-foreground">Bureau of Fire Protection - BULAN</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-[2rem]">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {isResetFlow ? "Reset Password" : "Change Password"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isResetFlow ? "Enter your new password." : "Update password for enhanced security"}
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3">
            {/* Only show current password field for non-reset flow */}
            {!isResetFlow && (
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-sm font-semibold">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-10 pr-10"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-sm font-semibold">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 pr-10"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 pr-10"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {newPassword && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                <p className="text-xs font-semibold text-foreground mb-1">
                  {isPasswordStrong ? "Strong password!" : "Weak password. Must contain:"}
                </p>
                <PasswordRequirement met={hasUppercase} text="At least 1 uppercase" />
                <PasswordRequirement met={hasNumber} text="At least 1 number" />
                <PasswordRequirement met={hasMinLength} text="At least 8 characters" />
                <PasswordRequirement met={hasSpecialChar} text="At least 1 special character" />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10"
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-10 bg-[hsl(var(--fire-deep-red))] hover:bg-[hsl(var(--fire-deep-red))]/90 text-white font-semibold"
                disabled={!isPasswordStrong || !passwordsMatch || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : isResetFlow ? (
                  "Reset Password"
                ) : (
                  "Change Password"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
