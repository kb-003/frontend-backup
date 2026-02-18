import { useState, useCallback } from "react";

export interface GeolocationResult {
  coords: [number, number] | null; // [lng, lat]
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationResult>({
    coords: null,
    loading: false,
    error: null,
  });

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ coords: null, loading: false, error: "Geolocation is not supported by your browser." });
      return;
    }

    // Warn about HTTPS requirement (except localhost)
    const isSecure = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
    if (!isSecure) {
      setState({ coords: null, loading: false, error: "GPS requires a secure (HTTPS) connection. GPS may not work on this page." });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
        setState({ coords, loading: false, error: null });
      },
      (err) => {
        let message = "Unable to retrieve your location.";
        if (err.code === err.PERMISSION_DENIED) {
          message = "Location access denied. Please enable location permissions in your browser settings.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = "Location information is unavailable.";
        } else if (err.code === err.TIMEOUT) {
          message = "Location request timed out. Please try again.";
        }
        setState({ coords: null, loading: false, error: message });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const reset = useCallback(() => {
    setState({ coords: null, loading: false, error: null });
  }, []);

  return { ...state, requestPosition, reset };
}
