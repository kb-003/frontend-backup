import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Hydrant, WaterSource, FireStation } from "@/data/mockData";
import {
  FIRE_STATION_COORDS,
  FIRE_STATION_LABEL,
  FIRE_STATION_ADDRESS,
} from "@/lib/constants";

import { MAPBOX_TOKEN } from "@/hooks/useMapboxGeocode";

mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapProps {
  startPoint?: [number, number];
  destination?: [number, number];
  showRoute?: boolean;
  onHydrantClick?: (hydrantId: string) => void;
  onMapClick?: (coords: [number, number]) => void;
  pinnedStart?: [number, number] | null;
  pinnedDestination?: [number, number] | null;
  pinMode?: "start" | "destination" | null;
  onPinDragEnd?: (
    type: "start" | "destination",
    coords: [number, number],
  ) => void;
  hydrants?: Hydrant[];
  waterSources?: WaterSource[];
  fireStations?: FireStation[];
}

export interface MapHandle {
  centerOn: (coords: [number, number]) => void;
}

const Map = forwardRef<MapHandle, MapProps>(
  (
    {
      startPoint,
      destination,
      showRoute,
      onHydrantClick,
      onMapClick,
      pinnedStart,
      pinnedDestination,
      pinMode,
      onPinDragEnd,
      hydrants = [],
      waterSources = [],
      fireStations = [],
    },
    ref,
  ) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    useImperativeHandle(ref, () => ({
      centerOn: (coords: [number, number]) => {
        map.current?.flyTo({ center: coords, zoom: 15 });
      },
    }));

    useEffect(() => {
      if (!mapContainer.current || map.current) return;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: FIRE_STATION_COORDS,
        zoom: 14,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");

      map.current.on("load", () => {
        setMapLoaded(true);
      });

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    }, []);

    // Add data markers when map is loaded or data changes
    useEffect(() => {
      if (!mapLoaded || !map.current) return;

      const markers: mapboxgl.Marker[] = [];

      const el = document.createElement("div");
      el.className =
        "flex items-center justify-center w-10 h-10 cursor-pointer hover:scale-110 transition-transform";

      // ✅ Use PNG as background image
      el.style.backgroundImage = "url('/fire-station.png')"; // adjust path
      el.style.backgroundSize = "contain";
      el.style.backgroundRepeat = "no-repeat";
      el.style.width = "40px";
      el.style.height = "40px";

      const marker = new mapboxgl.Marker(el)
        .setLngLat(FIRE_STATION_COORDS)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `
    <div class="relative rounded-xl shadow-lg p-4 w-[85vw] max-w-[260px] bg-white">
      
      <div class="mb-2">
        <h2 class="text-sm font-bold text-gray-800">
          ${FIRE_STATION_LABEL}
        </h2>
      </div>

      <div class="text-xs text-gray-600">
        <p class="font-medium text-gray-800">Address:</p>
        <p>${FIRE_STATION_ADDRESS}</p>
      </div>

    </div>
    `,
          ),
        )
        .addTo(map.current!);

      hydrants.forEach((hydrant) => {
        const el = document.createElement("div");
        el.className =
          "flex items-center justify-center w-8 h-8 cursor-pointer hover:scale-110 transition-transform";

        const color =
          hydrant.status === "Operational"
            ? "#16A34A"
            : hydrant.status === "Under Maintenance"
              ? "#F59E0B"
              : "#DC2626";

        // ✅ Use PNG instead of inline SVG
        el.style.backgroundImage = "url('/fire-hydrant.png')"; // adjust path
        el.style.backgroundSize = "contain";
        el.style.backgroundRepeat = "no-repeat";
        el.style.width = "32px";
        el.style.height = "32px";

        el.addEventListener("click", () => {
          if (onHydrantClick) onHydrantClick(hydrant.hydrantId);
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat(hydrant.location.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `
    <div class="rounded-xl shadow-lg p-4 min-w-[240px] bg-white">
      
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-lg font-bold text-gray-800">
          Hydrant ${hydrant.hydrantId}
        </h3>
        <span class="text-xs px-2 py-1 rounded-full font-semibold
          ${
            hydrant.status === "Operational"
              ? "bg-green-100 text-green-700"
              : hydrant.status === "Under Maintenance"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
          }">
          ${hydrant.status}
        </span>
      </div>

      <div class="space-y-1 text-sm text-gray-600">
        <p><span class="font-medium text-gray-800">Address:</span> ${hydrant.address}</p>
        <p><span class="font-medium text-gray-800">Landmark:</span> ${hydrant.landmark}</p>
        <p><span class="font-medium text-gray-800">Remarks:</span> ${hydrant.remark}</p>
      </div>

    </div>
    `,
            ),
          )
          .addTo(map.current!);
        markers.push(marker);
      });

      waterSources.forEach((source) => {
        const coords = source.location?.coordinates;

        // ✅ Only proceed if coords is a valid [lng, lat] array
        if (
          Array.isArray(coords) &&
          coords.length === 2 &&
          typeof coords[0] === "number" &&
          typeof coords[1] === "number"
        ) {
          const el = document.createElement("div");
          //el.className = "flex items-center justify-center w-6 h-6";
          el.className =
            "flex items-center justify-center w-8 h-8 cursor-pointer hover:scale-110 transition-transform";

          el.style.backgroundImage = "url('/river.png')"; // adjust path
          el.style.backgroundSize = "contain";
          el.style.backgroundRepeat = "no-repeat";
          el.style.width = "32px";
          el.style.height = "32px";

          const marker = new mapboxgl.Marker(el)
            .setLngLat([coords[0], coords[1]]) // [lng, lat]
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `
              <div class="relative rounded-xl shadow-lg p-4 min-w-[240px] bg-white">
                
                <div class="mb-2">
                  <h3 class="text-lg font-bold text-gray-800">
                    ${source.name}
                  </h3>
                </div>

                <div class="space-y-1 text-sm text-gray-600">
                  <p>
                    <span class="font-medium text-gray-800">Type:</span> 
                    ${source.type}
                  </p>
                  <p>
                    <span class="font-medium text-gray-800">Landmark:</span> 
                    ${source.landmark}
                  </p>
                </div>

              </div>
              `,
              ),
            )
            .addTo(map.current!);

          markers.push(marker);
        }
      });

      return () => {
        markers.forEach((m) => m.remove());
      };
    }, [mapLoaded, hydrants, waterSources, fireStations, onHydrantClick]);

    // Handle map click for pinning
    useEffect(() => {
      if (!map.current || !mapLoaded) return;

      const handleClick = (e: mapboxgl.MapMouseEvent) => {
        if (onMapClick) {
          onMapClick([e.lngLat.lng, e.lngLat.lat]);
        }
      };

      const canvas = map.current.getCanvas?.();
      if (pinMode) {
        if (canvas) canvas.style.cursor = "crosshair";
        map.current.on("click", handleClick);
      } else {
        if (canvas) canvas.style.cursor = "";
      }

      return () => {
        if (map.current) {
          map.current.off("click", handleClick);
          try {
            map.current.getCanvas().style.cursor = "";
          } catch {}
        }
      };
    }, [mapLoaded, pinMode, onMapClick]);

    // Draw route when needed
    useEffect(() => {
      if (
        !mapLoaded ||
        !map.current ||
        !showRoute ||
        !startPoint ||
        !destination
      )
        return;

      const startEl = document.createElement("div");
      startEl.className =
        "flex items-center justify-center w-10 h-10 bg-green-600 rounded-full text-white font-bold text-lg shadow-lg";
      startEl.textContent = "A";
      new mapboxgl.Marker(startEl).setLngLat(startPoint).addTo(map.current);

      const destEl = document.createElement("div");
      destEl.className =
        "flex items-center justify-center w-10 h-10 bg-red-600 rounded-full text-white font-bold text-lg shadow-lg";
      destEl.textContent = "B";
      new mapboxgl.Marker(destEl).setLngLat(destination).addTo(map.current);

      if (map.current.getSource("route")) {
        map.current.removeLayer("route");
        map.current.removeSource("route");
      }

      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [startPoint, destination],
          },
        },
      });

      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#F59E0B",
          "line-width": 5,
          "line-opacity": 0.8,
        },
      });

      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend(startPoint);
      bounds.extend(destination);
      map.current.fitBounds(bounds, { padding: 100 });
    }, [mapLoaded, showRoute, startPoint, destination]);

    // Add pinned markers
    useEffect(() => {
      if (!mapLoaded || !map.current) return;
      const markers: mapboxgl.Marker[] = [];

      if (pinnedStart && !showRoute) {
        const el = document.createElement("div");
        el.className =
          "flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full shadow-lg border-2 border-white cursor-move";
        el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>`;

        const marker = new mapboxgl.Marker({ element: el, draggable: true })
          .setLngLat(pinnedStart)
          .addTo(map.current!);
        marker.on("dragend", () => {
          const lngLat = marker.getLngLat();
          onPinDragEnd?.("start", [lngLat.lng, lngLat.lat]);
        });
        markers.push(marker);
      }

      if (pinnedDestination && !showRoute) {
        const el = document.createElement("div");
        el.className =
          "flex items-center justify-center w-8 h-8 bg-red-600 rounded-full shadow-lg border-2 border-white cursor-move";
        el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>`;

        const marker = new mapboxgl.Marker({ element: el, draggable: true })
          .setLngLat(pinnedDestination)
          .addTo(map.current!);
        marker.on("dragend", () => {
          const lngLat = marker.getLngLat();
          onPinDragEnd?.("destination", [lngLat.lng, lngLat.lat]);
        });
        markers.push(marker);
      }

      return () => {
        markers.forEach((m) => m.remove());
      };
    }, [mapLoaded, pinnedStart, pinnedDestination, showRoute, onPinDragEnd]);

    return (
      <div className="relative w-full h-full">
        <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      </div>
    );
  },
);

Map.displayName = "Map";

export default Map;
