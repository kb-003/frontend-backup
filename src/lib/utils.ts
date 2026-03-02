import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Capitalize each word, including hyphenated parts
export function capitalizeWords(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) =>
      word
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("-"),
    )
    .join(" ");
}

export function logout() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const role = currentUser?.role;

  switch (role) {
    case "Chief":
    case "Shift-in-Charge A":
    case "Shift-in-Charge B":
      localStorage.removeItem("adminToken");
      break;
    case "Driver":
    case "Crew":
      localStorage.removeItem("crewToken");
      break;
    default:
      localStorage.removeItem("token"); // fallback
  }

  localStorage.removeItem("currentUser");

  toast.success("Logged out successfully");

  // Redirect to correct login page
  if (role === "Chief" || role?.startsWith("Shift-in-Charge")) {
    window.location.href = "/";
  } else {
    window.location.href = "/";
  }
}
