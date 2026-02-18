import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import bfpLogo from "@/assets/bfp-logo.png";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const KNOWN_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "aol.com",
  "mail.com",
  "protonmail.com",
  "proton.me",
  "zoho.com",
  "yandex.com",
  "gmx.com",
  "fastmail.com",
  "yahoo.co.uk",
  "yahoo.com.ph",
  "outlook.ph",
  "gov.ph",
]);

const isKnownDomain = (email: string): boolean => {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return (
    KNOWN_DOMAINS.has(domain) ||
    /\.(gov|edu|mil|org)(\.[a-z]{2,})?$/.test(domain)
  );
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isKnownDomain(trimmedEmail)) {
      setError("Email domain is not valid.");
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: trimmedEmail }),
      });
    } catch {
      // Always show the same message for security (don't reveal if email exists)
    } finally {
      setIsLoading(false);
    }

    toast.success(
      "A response code has been sent to your email if it exists in our system.",
    );
    navigate("/reset/verify", { state: { email: trimmedEmail } });
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
              Forgot Password
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your registered email address to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                className={`h-10 ${error ? "border-destructive" : ""}`}
                placeholder="Enter your email"
                required
              />
              {error && (
                <p className="text-xs text-destructive font-medium">{error}</p>
              )}
            </div>

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
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
