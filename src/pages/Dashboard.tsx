import { useState, useEffect, useRef, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar, {
  type DashboardTab,
} from "@/components/dashboard/DashboardSidebar";
import MapControlPanel from "@/components/dashboard/MapControlPanel";
import SettingsPanel from "@/components/dashboard/SettingsPanel";
import HelpPanel from "@/components/dashboard/HelpPanel";
import ProfilePanel from "@/components/dashboard/ProfilePanel";
import Map from "@/components/Map";
import MapLegend from "@/components/MapLegend";
import { normalizeHydrant, normalizeWaterSource } from "@/lib/normalize";
import IncidentStatusControl from "@/components/IncidentStatusControl";
import { useIncident } from "@/contexts/IncidentContext";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>("map");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pinMode, setPinMode] = useState<"start" | "destination" | null>(null);
  const [pinnedStart, setPinnedStart] = useState<[number, number] | null>(null);
  const [pinnedDestination, setPinnedDestination] = useState<
    [number, number] | null
  >(null);

  //  hydrants + waterSources state
  const [hydrants, setHydrants] = useState<Hydrant[]>([]);
  const [waterSources, setWaterSources] = useState<WaterSource[]>([]);

  // fetch hydrants + waterSources on mount
  useEffect(() => {
    const token = localStorage.getItem("crewToken"); // assumes you store JWT after login
    if (!token) {
      console.error("No token found. Please log in first.");
      return;
    } 
    
    // Fetch hydrants
    apiRequest("/api/hydrants", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) =>
        setHydrants(data.map((h: any, i: number) => normalizeHydrant(h, i))),
      )
      .catch((err) => console.error("Hydrant fetch error:", err));

    // Fetch water sources
    apiRequest("/api/water-sources", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) =>
        setWaterSources(
          data.map((w: any, i: number) => normalizeWaterSource(w, i)),
        ),
      )
      .catch((err) => console.error("Water source fetch error:", err));
  }, []);

  const { incidentState } = useIncident();
  const routeInfo = incidentState.routeInfo;
  const showRoute = incidentState.showRoute;

  const mapRef = useRef<{
    centerOn: (coords: [number, number]) => void;
  } | null>(null);

  const handleCenterMap = useCallback((coords: [number, number]) => {
    mapRef.current?.centerOn(coords);
  }, []);

  const handleMapClick = (coords: [number, number]) => {
    if (pinMode === "start") {
      setPinnedStart(coords);
      setPinMode(null);
    } else if (pinMode === "destination") {
      setPinnedDestination(coords);
      setPinMode(null);
    }
  };

  const handlePinDragEnd = (
    type: "start" | "destination",
    coords: [number, number],
  ) => {
    if (type === "start") {
      setPinnedStart(coords);
    } else {
      setPinnedDestination(coords);
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <DashboardHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <DashboardSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Control Panel - Always visible on map tab regardless of sidebar collapse */}
          {activeTab === "map" && (
            <div className="w-80 bg-card border-r overflow-hidden flex-shrink-0">
              <MapControlPanel
                onPinModeChange={setPinMode}
                pinnedStart={pinnedStart}
                pinnedDestination={pinnedDestination}
                onCenterMap={handleCenterMap}
              />
            </div>
          )}

          {/* Map View */}
          {activeTab === "map" && (
            <div className="flex-1 relative">
              {/* Active Incident Indicator - Floating on map when sidebar collapsed */}
              {incidentState.status === "Active" && isCollapsed && (
                <div className="absolute top-4 left-4 z-10">
                  <IncidentStatusControl compact />
                </div>
              )}

              <Map
                ref={mapRef}
                startPoint={routeInfo?.start}
                destination={routeInfo?.destination}
                showRoute={showRoute}
                onMapClick={pinMode ? handleMapClick : undefined}
                pinnedStart={pinnedStart}
                pinnedDestination={pinnedDestination}
                pinMode={pinMode}
                onPinDragEnd={handlePinDragEnd}
                hydrants={hydrants}
                waterSources={waterSources}
              />

              {/* Map Legend - Anchored top-right */}
              <MapLegend />
            </div>
          )}

          {/* Settings View */}
          {activeTab === "settings" && (
            <div className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
              <SettingsPanel />
            </div>
          )}

          {/* Help View */}
          {activeTab === "help" && (
            <div className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
              <HelpPanel />
            </div>
          )}

          {/* Profile View */}
          {activeTab === "profile" && (
            <div className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
              <ProfilePanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
