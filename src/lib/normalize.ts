import { GeoPoint } from "@/lib/geo";

    
export const normalizeHydrant = (h: any, index?: number) => ({
  ...h,
  _id: h._id ?? h.id ?? `temp-${index}`,
  hydrantId: h.hydrantId || "N/A",
  status: h.status?.charAt(0).toUpperCase() + h.status?.slice(1).toLowerCase(),
  remark: h.remark || "N/A",
  address: h.address || "N/A",
  landmark: h.landmark || "N/A",
  location: (h.location ?? {
    type: "Point",
    coordinates: [0, 0],
  }) as GeoPoint,
});

export const normalizeWaterSource = (w: any, index?: number) => ({
  ...w,
  _id: w._id ?? w.id ?? `temp-${index}`,
  name: w.name || "N/A",
  type: w.type || "N/A",
  roadWidth: w.roadWidth ?? 0,
  landmark: w.landmark || "N/A",
  location: (w.location ?? {
    type: "Point",
    coordinates: [parseFloat(w.longitude) || 0, parseFloat(w.latitude) || 0],
  }) as GeoPoint,
});
