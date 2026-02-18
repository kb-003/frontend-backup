import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Phone } from "lucide-react";
import { apiRequest } from "@/lib/api";
import bfpLogo from "@/assets/bfp-logo.png";

const CODE_EXPIRY_MINUTES = 5;

const VerifyResetCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || "";

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingSms, setIsResendingSms] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(CODE_EXPIRY_MINUTES * 60);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const formatTime = useCallback((secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Please enter the response code.");
      return;
    }

    if (secondsLeft <= 0) {
      toast.error("Code has expired. Please request a new one.");
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("/api/auth/verify-code", {
        method: "POST",
        body: JSON.stringify({ email, code: code.trim() }),
      });
      toast.success("Code verified successfully.");
      navigate("/change-password", { state: { email, code: code.trim(), isReset: true } });
    } catch {
      toast.error("Invalid or expired code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendSms = async () => {
    setIsResendingSms(true);
    try {
      await apiRequest("/resend-code-sms", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      toast.success("Response code resent via SMS.");
      setSecondsLeft(CODE_EXPIRY_MINUTES * 60);
    } catch {
      toast.error("Failed to resend code via SMS.");
    } finally {
      setIsResendingSms(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResendingEmail(true);
    try {
      await apiRequest("/resend-code-email", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      toast.success("Response code resent via email.");
      setSecondsLeft(CODE_EXPIRY_MINUTES * 60);
    } catch {
      toast.error("Failed to resend code via email.");
    } finally {
      setIsResendingEmail(false);
    }
  };

  const isExpired = secondsLeft <= 0;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[hsl(var(--fire-orange))] to-[hsl(var(--fire-red))] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <img src={bfpLogo} alt="BFP Logo" className="w-[5.5rem] h-[5.5rem] mx-auto mb-2" />
          <h1 className="text-lg font-bold text-foreground">Bureau of Fire Protection - BULAN</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-[2rem]">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-foreground mb-1">Verify Response Code</h2>
            <p className="text-sm text-muted-foreground">Enter the response code sent to your email.</p>
          </div>

          {/* Countdown Timer */}
          <div className={`text-center mb-4 p-2 rounded-lg ${isExpired ? "bg-destructive/10" : "bg-accent/20"}`}>
            <p className={`text-sm font-semibold ${isExpired ? "text-destructive" : "text-foreground"}`}>
              {isExpired
                ? "Code has expired. Please request a new one."
                : `Code expires in ${formatTime(secondsLeft)}`}
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-sm font-semibold">
                Response Code
              </Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-10 text-center tracking-widest text-lg font-mono"
                placeholder="Enter code"
                maxLength={8}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-[hsl(var(--fire-deep-red))] hover:bg-[hsl(var(--fire-deep-red))]/90 text-white font-semibold"
              disabled={isLoading || isExpired}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>
          </form>

          {/* Resend Options */}
          <div className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground text-center font-medium">Didn't receive the code?</p>
            <div className="flex gap-2">
              <Button
                type="button"
                className="flex-1 h-9 bg-[hsl(var(--fire-orange))] hover:bg-[hsl(var(--accent))] hover:text-foreground text-white text-xs font-semibold"
                onClick={handleResendSms}
                disabled={isResendingSms}
              >
                {isResendingSms ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Phone className="w-3 h-3" />
                )}
                Resend via SMS
              </Button>
              <Button
                type="button"
                className="flex-1 h-9 bg-[hsl(var(--fire-orange))] hover:bg-[hsl(var(--accent))] hover:text-foreground text-white text-xs font-semibold"
                onClick={handleResendEmail}
                disabled={isResendingEmail}
              >
                {isResendingEmail ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Mail className="w-3 h-3" />
                )}
                Resend via Email
              </Button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="link"
              className="text-xs text-muted-foreground"
              onClick={() => navigate("/forgot-password")}
            >
              ← Back to Forgot Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetCode;
