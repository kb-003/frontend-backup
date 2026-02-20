import { useState, useEffect, useRef, useCallback } from "react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export interface GeocodeSuggestion {
  id: string;
  placeName: string;
  coordinates: [number, number]; // [lng, lat]
}

const cache = new Map<string, GeocodeSuggestion[]>();

export function useMapboxGeocode(query: string, enabled = true) {
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }

    const cacheKey = q.toLowerCase().trim();
    if (cache.has(cacheKey)) {
      setSuggestions(cache.get(cacheKey)!);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        access_token: MAPBOX_TOKEN,
        autocomplete: "true",
        limit: "5",
        country: "PH",
        bbox: "122.5,12.0,124.5,14.0", // Bicol Region bounding box
        language: "en",
      });

      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?${params}`,
        { signal: controller.signal }
      );

      if (!res.ok) throw new Error("Geocoding failed");

      const data = await res.json();
      const results: GeocodeSuggestion[] = (data.features || []).map((f: any) => ({
        id: f.id,
        placeName: f.place_name,
        coordinates: f.center as [number, number],
      }));

      cache.set(cacheKey, results);
      setSuggestions(results);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setSuggestions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => fetchSuggestions(query), 300);
    return () => clearTimeout(timer);
  }, [query, enabled, fetchSuggestions]);

  const clearSuggestions = useCallback(() => setSuggestions([]), []);

  return { suggestions, isLoading, clearSuggestions };
}

const reverseCache = new Map<string, string>();

export async function reverseGeocode(coords: [number, number]): Promise<string> {
  const key = `${coords[0].toFixed(5)},${coords[1].toFixed(5)}`;
  if (reverseCache.has(key)) return reverseCache.get(key)!;

  try {
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      limit: "1",
      language: "en",
    });
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?${params}`
    );
    if (!res.ok) throw new Error("Reverse geocoding failed");
    const data = await res.json();
    const place = data.features?.[0]?.place_name ?? `${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}`;
    reverseCache.set(key, place);
    return place;
  } catch {
    return `${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}`;
  }
}

export { MAPBOX_TOKEN };
