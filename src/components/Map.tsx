import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Hydrant, WaterSource, FireStation } from "@/data/mockData";
import { FIRE_STATION_COORDS } from "@/lib/constants";

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
  onPinDragEnd?: (type: "start" | "destination", coords: [number, number]) => void;
  hydrants?: Hydrant[];
  waterSources?: WaterSource[];
  fireStations?: FireStation[];
}

export interface MapHandle {
  centerOn: (coords: [number, number]) => void;
}

const Map = forwardRef<MapHandle, MapProps>(({ 
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
}, ref) => {
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

    fireStations.forEach((station) => {
      const el = document.createElement("div");
      el.className = "flex items-center justify-center w-10 h-10 bg-red-600 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform";
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>`;
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat(station.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-2">
              <h3 class="font-bold">${station.name}</h3>
              <p class="text-sm">${station.address}</p>
            </div>`
          )
        )
        .addTo(map.current!);
      markers.push(marker);
    });

    hydrants.forEach((hydrant) => {
      const el = document.createElement("div");
      el.className = "flex items-center justify-center w-8 h-8 cursor-pointer hover:scale-110 transition-transform";
      
      const color = hydrant.status === "Operational" ? "#16A34A" : 
                   hydrant.status === "Under Maintenance" ? "#F59E0B" : "#DC2626";
      
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${color}">
        <path d="M12 2C9.24 2 7 4.24 7 7v3H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-1V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v3H9V7c0-1.66 1.34-3 3-3z"/>
      </svg>`;
      
      el.addEventListener("click", () => {
        if (onHydrantClick) onHydrantClick(hydrant.hydrantID);
      });
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat(hydrant.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-2 min-w-[200px]">
              <h3 class="font-bold text-lg mb-1">Hydrant ${hydrant.hydrantID}</h3>
              <p class="text-sm"><strong>Status:</strong> ${hydrant.status}</p>
              <p class="text-sm"><strong>Address:</strong> ${hydrant.address}</p>
              <p class="text-sm"><strong>Landmark:</strong> ${hydrant.landmark}</p>
              <p class="text-sm"><strong>Remarks:</strong> ${hydrant.remarks}</p>
            </div>`
          )
        )
        .addTo(map.current!);
      markers.push(marker);
    });

    waterSources.forEach((source) => {
      const el = document.createElement("div");
      el.className = "flex items-center justify-center w-6 h-6";
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#3B82F6">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
      </svg>`;
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat(source.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-2">
              <h3 class="font-bold">${source.name}</h3>
              <p class="text-sm">Type: ${source.type}</p>
              <p class="text-sm">Landmark: ${source.landmark}</p>
            </div>`
          )
        )
        .addTo(map.current!);
      markers.push(marker);
    });

    return () => {
      markers.forEach(m => m.remove());
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
        try { map.current.getCanvas().style.cursor = ""; } catch {}
      }
    };
  }, [mapLoaded, pinMode, onMapClick]);

  // Draw route when needed
  useEffect(() => {
    if (!mapLoaded || !map.current || !showRoute || !startPoint || !destination) return;

    const startEl = document.createElement("div");
    startEl.className = "flex items-center justify-center w-10 h-10 bg-green-600 rounded-full text-white font-bold text-lg shadow-lg";
    startEl.textContent = "A";
    new mapboxgl.Marker(startEl).setLngLat(startPoint).addTo(map.current);

    const destEl = document.createElement("div");
    destEl.className = "flex items-center justify-center w-10 h-10 bg-red-600 rounded-full text-white font-bold text-lg shadow-lg";
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
      paint: { "line-color": "#F59E0B", "line-width": 5, "line-opacity": 0.8 },
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
      el.className = "flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full shadow-lg border-2 border-white cursor-move";
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
      el.className = "flex items-center justify-center w-8 h-8 bg-red-600 rounded-full shadow-lg border-2 border-white cursor-move";
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
      markers.forEach(m => m.remove());
    };
  }, [mapLoaded, pinnedStart, pinnedDestination, showRoute, onPinDragEnd]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
    </div>
  );
});

Map.displayName = "Map";

export default Map;
