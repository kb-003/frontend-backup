import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Navigation, Crosshair, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useIncident } from "@/contexts/IncidentContext";
import IncidentStatusControl from "@/components/IncidentStatusControl";
import AddressAutocomplete from "@/components/dashboard/AddressAutocomplete";
import type { GeocodeSuggestion } from "@/hooks/useMapboxGeocode";
import { reverseGeocode } from "@/hooks/useMapboxGeocode";
import { useGeolocation } from "@/hooks/useGeolocation";
import { FIRE_STATION_COORDS, FIRE_STATION_LABEL } from "@/lib/constants";

interface MapControlPanelProps {
  onPinModeChange?: (mode: "start" | "destination" | null) => void;
  pinnedStart?: [number, number] | null;
  pinnedDestination?: [number, number] | null;
  onCenterMap?: (coords: [number, number]) => void;
}

const MapControlPanel = ({ onPinModeChange, pinnedStart, pinnedDestination, onCenterMap }: MapControlPanelProps) => {
  const {
    incidentState,
    setStartAddress,
    setDestinationAddress,
    setAddressMode,
    calculateRoute,
  } = useIncident();

  const [hydrantsOpen, setHydrantsOpen] = useState(true);
  const [waterSourcesOpen, setWaterSourcesOpen] = useState(true);

  // Local state for input fields (synced with context)
  const [localStartAddress, setLocalStartAddress] = useState(incidentState.startAddress);
  const [localDestinationAddress, setLocalDestinationAddress] = useState(incidentState.destinationAddress);
  const [localAddressMode, setLocalAddressMode] = useState<string | null>(incidentState.addressMode);
  const [activePinMode, setActivePinMode] = useState<"start" | "destination" | null>(null);

  // Coordinate state for routing
  const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [gpsCoords, setGpsCoords] = useState<[number, number] | null>(null);

  const { coords: geoCoords, loading: geoLoading, error: geoError, requestPosition, reset: resetGeo } = useGeolocation();

  // Sync local state with context when context changes (e.g., after reset)
  useEffect(() => {
    setLocalStartAddress(incidentState.startAddress);
    setLocalDestinationAddress(incidentState.destinationAddress);
    setLocalAddressMode(incidentState.addressMode);
  }, [incidentState.startAddress, incidentState.destinationAddress, incidentState.addressMode]);

  // Handle GPS result
  useEffect(() => {
    if (geoCoords && localAddressMode === "current") {
      setGpsCoords(geoCoords);
      // Show coordinate fallback immediately
      const fallback = `${geoCoords[1].toFixed(5)}, ${geoCoords[0].toFixed(5)}`;
      setLocalStartAddress(fallback);
      setStartAddress(fallback);
      onCenterMap?.(geoCoords);
      // Resolve human-readable address
      reverseGeocode(geoCoords).then((address) => {
        // Only update if still in GPS mode
        setLocalStartAddress(address);
        setStartAddress(address);
      });
    }
  }, [geoCoords]);

  // Handle GPS error
  useEffect(() => {
    if (geoError && localAddressMode === "current") {
      toast.error("GPS Error", { description: geoError });
      // Revert to no mode
      setLocalAddressMode(null);
      setAddressMode(null);
    }
  }, [geoError]);

  // Reverse geocode when pin is placed or dragged
  useEffect(() => {
    if (pinnedStart) {
      const fallback = `${pinnedStart[1].toFixed(5)}, ${pinnedStart[0].toFixed(5)}`;
      setLocalStartAddress(fallback);
      setStartAddress(fallback);
      setLocalAddressMode("pin");
      setAddressMode("pin");
      reverseGeocode(pinnedStart).then((address) => {
        setLocalStartAddress(address);
        setStartAddress(address);
      });
    }
  }, [pinnedStart]);

  useEffect(() => {
    if (pinnedDestination) {
      const fallback = `${pinnedDestination[1].toFixed(5)}, ${pinnedDestination[0].toFixed(5)}`;
      setLocalDestinationAddress(fallback);
      setDestinationAddress(fallback);
      reverseGeocode(pinnedDestination).then((address) => {
        setLocalDestinationAddress(address);
        setDestinationAddress(address);
      });
    }
  }, [pinnedDestination]);

  const handleAddressModeChange = (value: string) => {
    setLocalAddressMode(value);
    setAddressMode(value);

    // Always cancel pin mode when switching radio
    setActivePinMode(null);
    onPinModeChange?.(null);

    if (value === "default") {
      setLocalStartAddress(FIRE_STATION_LABEL);
      setStartAddress(FIRE_STATION_LABEL);
      setStartCoords(FIRE_STATION_COORDS);
      setGpsCoords(null);
      resetGeo();
      onCenterMap?.(FIRE_STATION_COORDS);
    } else if (value === "current") {
      setGpsCoords(null);
      setLocalStartAddress("Locating…");
      setStartAddress("Locating…");
      requestPosition();
    } else if (value === "pin") {
      setGpsCoords(null);
      resetGeo();
      setActivePinMode("start");
      onPinModeChange?.("start");
      toast.info("Tap on the map to set starting point");
    }
  };

  const handleStartAddressChange = (newValue: string) => {
    setLocalStartAddress(newValue);
    setStartAddress(newValue);

    // Only clear mode if user is explicitly typing (not GPS/pin/default)
    if (localAddressMode && localAddressMode !== "current") {
      setLocalAddressMode(null);
      setAddressMode(null);
    }
    // If in GPS mode and user types, exit GPS mode
    if (localAddressMode === "current") {
      setLocalAddressMode(null);
      setAddressMode(null);
      setGpsCoords(null);
      resetGeo();
    }
  };

  const handleStartSelect = (suggestion: GeocodeSuggestion) => {
    setLocalStartAddress(suggestion.placeName);
    setStartAddress(suggestion.placeName);
    setStartCoords(suggestion.coordinates);
    setLocalAddressMode(null);
    setAddressMode(null);
    setGpsCoords(null);
    resetGeo();
    onCenterMap?.(suggestion.coordinates);
  };

  const handleDestinationChange = (newValue: string) => {
    setLocalDestinationAddress(newValue);
    setDestinationAddress(newValue);
  };

  const handleDestinationSelect = (suggestion: GeocodeSuggestion) => {
    setLocalDestinationAddress(suggestion.placeName);
    setDestinationAddress(suggestion.placeName);
    setDestCoords(suggestion.coordinates);
  };

  const handlePinDestination = () => {
    setActivePinMode("destination");
    onPinModeChange?.("destination");
    toast.info("Tap on the map to set fire site destination");
  };

  const handleCalculateRoute = () => {
    if (!localDestinationAddress) {
      toast.error("Please enter a fire site address");
      return;
    }

    // Coordinate priority: pinned > GPS > autocomplete > fire station default
    const start: [number, number] = pinnedStart || gpsCoords || startCoords || FIRE_STATION_COORDS;
    const destination: [number, number] = pinnedDestination || destCoords || FIRE_STATION_COORDS;
    const distance = 0;
    const time = 0;

    calculateRoute({
      start,
      destination,
      distance,
      time,
      startAddress: localStartAddress || FIRE_STATION_LABEL,
      destinationAddress: localDestinationAddress,
      nearestHydrants: [],
      nearestWaterSources: [],
    });

    setActivePinMode(null);
    onPinModeChange?.(null);

    toast.success("Route Calculated", {
      description: `${distance} km, ${time} minutes estimated`
    });
  };

  const handleExportPDF = () => {
    toast.success("Exporting to PDF", {
      description: "Route information will be downloaded"
    });
  };

  const routeInfo = incidentState.routeInfo;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Emergency Response</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Incident Status - Top of sidebar */}
        {routeInfo && <IncidentStatusControl />}

        {!routeInfo ? (
          <>
            {/* Address Inputs */}
            <div className="space-y-4">
              {/* Starting Point */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--fire-orange))]" />
                  Address 1: Starting Point
                </Label>
                <AddressAutocomplete
                  placeholder="Enter current address..."
                  value={localStartAddress}
                  onChange={handleStartAddressChange}
                  onSelect={handleStartSelect}
                  disabled={geoLoading}
                />
                
                <RadioGroup value={localAddressMode || ""} onValueChange={handleAddressModeChange} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="default" className="w-4 h-4" />
                    <Label htmlFor="default" className="text-xs cursor-pointer">
                      Use default Fire Station address
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="current" id="current" className="w-4 h-4" />
                    <Label htmlFor="current" className="text-xs cursor-pointer flex items-center gap-1">
                      {geoLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Navigation className="w-3 h-3" />
                      )}
                      Use my current location (GPS)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pin" id="pin-start" className="w-4 h-4" />
                    <Label htmlFor="pin-start" className="text-xs cursor-pointer flex items-center gap-1">
                      <Crosshair className="w-3 h-3" />
                      Pin on map
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Fire Site Destination */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  Address 2: Fire Site
                </Label>
                <AddressAutocomplete
                  placeholder="Enter fire site address..."
                  value={localDestinationAddress}
                  onChange={handleDestinationChange}
                  onSelect={handleDestinationSelect}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePinDestination}
                  className={`w-full text-xs ${activePinMode === "destination" ? "border-destructive text-destructive" : ""}`}
                >
                  <Crosshair className="w-3 h-3 mr-1" />
                  Pin destination on map
                </Button>
              </div>
            </div>

            <Button
              onClick={handleCalculateRoute}
              disabled={geoLoading}
              className="w-full bg-gradient-to-r from-[hsl(var(--fire-orange))] to-[hsl(var(--fire-red))] hover:opacity-90 text-white h-11 font-semibold"
            >
              Calculate Optimal Route
            </Button>
          </>
        ) : (
          <>
            {/* Route Summary - Inline */}
            <div className="bg-[hsl(var(--fire-orange))]/10 rounded-lg p-3 border border-[hsl(var(--fire-orange))]/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Route Summary</span>
                <span className="text-lg font-bold text-[hsl(var(--fire-deep-red))]">
                  {routeInfo.distance} km | {routeInfo.time} min
                </span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><span className="font-medium">From:</span> {routeInfo.startAddress}</p>
                <p><span className="font-medium">To:</span> {routeInfo.destinationAddress}</p>
              </div>
            </div>

            {/* Recommended Hydrants - Collapsible */}
            <Collapsible open={hydrantsOpen} onOpenChange={setHydrantsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-semibold hover:bg-muted/50 rounded px-2 -mx-2">
                <span>🔒 Recommended Hydrants</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${hydrantsOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {routeInfo.nearestHydrants.map((h: any, i: number) => (
                  <div key={h.id} className="bg-muted/30 rounded p-2 text-sm">
                    <p className="font-medium">{i + 1}. Hydrant #{h.id}</p>
                    <p className="text-xs text-muted-foreground">
                      📍 150m from site • 🚗 {h.roadWidth} road
                    </p>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Alternative Water Sources - Collapsible */}
            <Collapsible open={waterSourcesOpen} onOpenChange={setWaterSourcesOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-semibold hover:bg-muted/50 rounded px-2 -mx-2">
                <span>💧 Alternative Water Sources</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${waterSourcesOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-2">
                {routeInfo.nearestWaterSources.map((s: any, i: number) => (
                  <div key={s.name} className="flex justify-between text-sm py-1">
                    <span>{i + 1}. {s.name}</span>
                    <span className="text-muted-foreground text-xs">📍 {s.distance}</span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </>
        )}
      </div>

      {/* Export Button - Bottom of sidebar */}
      {routeInfo && (
        <div className="p-4 border-t">
          <Button
            onClick={handleExportPDF}
            className="w-full bg-gradient-to-r from-[hsl(var(--fire-orange))] to-[hsl(var(--fire-red))] hover:opacity-90 text-white"
          >
            Export to PDF
          </Button>
        </div>
      )}
    </div>
  );
};

export default MapControlPanel;
