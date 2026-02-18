import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { type Incident } from "@/data/mockData";

export type IncidentStatus = "Active" | "Resolved" | "Cancel" | null;

export interface RouteInfo {
  start: [number, number];
  destination: [number, number];
  distance: number;
  time: number;
  startAddress: string;
  destinationAddress: string;
  nearestHydrants: any[];
  nearestWaterSources: any[];
}

interface IncidentState {
  status: IncidentStatus;
  routeInfo: RouteInfo | null;
  showRoute: boolean;
  startAddress: string;
  destinationAddress: string;
  addressMode: string | null;
  currentIncidentId: string | null;
}

interface IncidentContextType {
  incidentState: IncidentState;
  incidentHistory: Incident[];
  setRouteInfo: (info: RouteInfo | null) => void;
  setShowRoute: (show: boolean) => void;
  setStartAddress: (address: string) => void;
  setDestinationAddress: (address: string) => void;
  setAddressMode: (mode: string | null) => void;
  updateIncidentStatus: (status: IncidentStatus) => void;
  calculateRoute: (info: RouteInfo) => void;
  resetIncident: () => void;
}

const defaultState: IncidentState = {
  status: null,
  routeInfo: null,
  showRoute: false,
  startAddress: "",
  destinationAddress: "",
  addressMode: null,
  currentIncidentId: null,
};

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

const STORAGE_KEY = "incident-state";
const HISTORY_KEY = "incident-history";

const generateIncidentId = () => `INC-${Date.now().toString(36).toUpperCase()}`;

const loadHistory = (): Incident[] => {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const IncidentProvider = ({ children }: { children: ReactNode }) => {
  const [incidentState, setIncidentState] = useState<IncidentState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultState;
      }
    }
    return defaultState;
  });

  const [incidentHistory, setIncidentHistory] = useState<Incident[]>(loadHistory);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(incidentState));
  }, [incidentState]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(incidentHistory));
  }, [incidentHistory]);

  const setRouteInfo = (info: RouteInfo | null) => {
    setIncidentState((prev) => ({ ...prev, routeInfo: info }));
  };

  const setShowRoute = (show: boolean) => {
    setIncidentState((prev) => ({ ...prev, showRoute: show }));
  };

  const setStartAddress = (address: string) => {
    setIncidentState((prev) => ({ ...prev, startAddress: address }));
  };

  const setDestinationAddress = (address: string) => {
    setIncidentState((prev) => ({ ...prev, destinationAddress: address }));
  };

  const setAddressMode = (mode: string | null) => {
    setIncidentState((prev) => ({ ...prev, addressMode: mode }));
  };

  const calculateRoute = (info: RouteInfo) => {
    const incidentId = generateIncidentId();
    const currentUser = localStorage.getItem("currentUser");
    let reportedBy = "Unknown";
    try {
      if (currentUser) {
        const user = JSON.parse(currentUser);
        reportedBy = user.name || user.username || "Unknown";
      }
    } catch {}

    // Create a new incident record
    const newIncident: Incident = {
      id: incidentId,
      title: `Incident at ${info.destinationAddress || "Unknown Location"}`,
      location: info.destinationAddress || "Unknown Location",
      status: "Active",
      reportedBy,
      reportedAt: new Date().toISOString(),
      description: `Route from ${info.startAddress || "start"} to ${info.destinationAddress || "destination"}. Distance: ${info.distance}km, ETA: ${info.time}min.`,
      coordinates: info.destination,
    };

    setIncidentHistory((prev) => [newIncident, ...prev]);

    setIncidentState((prev) => ({
      ...prev,
      routeInfo: info,
      showRoute: true,
      status: "Active",
      currentIncidentId: incidentId,
    }));
  };

  const updateIncidentStatus = (status: IncidentStatus) => {
    if (status === "Resolved" || status === "Cancel") {
      // Update the history record
      if (incidentState.currentIncidentId) {
        setIncidentHistory((prev) =>
          prev.map((inc) =>
            inc.id === incidentState.currentIncidentId
              ? {
                  ...inc,
                  status: status === "Cancel" ? "Resolved" : "Resolved",
                  resolvedAt: new Date().toISOString(),
                  description: status === "Cancel"
                    ? `${inc.description} [Cancelled]`
                    : inc.description,
                }
              : inc
          )
        );
      }
      // Reset current incident
      setIncidentState({
        ...defaultState,
        status: null,
      });
    } else {
      setIncidentState((prev) => ({ ...prev, status }));
    }
  };

  const resetIncident = () => {
    setIncidentState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <IncidentContext.Provider
      value={{
        incidentState,
        incidentHistory,
        setRouteInfo,
        setShowRoute,
        setStartAddress,
        setDestinationAddress,
        setAddressMode,
        updateIncidentStatus,
        calculateRoute,
        resetIncident,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncident = () => {
  const context = useContext(IncidentContext);
  if (context === undefined) {
    throw new Error("useIncident must be used within an IncidentProvider");
  }
  return context;
};
