"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { GeoLocation } from "@/lib/types";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type: "store" | "seller" | "partner" | "order" | "pickup" | "delivery";
  popup?: React.ReactNode;
}

interface MapViewProps {
  center: GeoLocation;
  zoom?: number;
  markers?: MapMarker[];
  height?: string;
  onMarkerClick?: (marker: MapMarker) => void;
}

const markerColors: Record<MapMarker["type"], string> = {
  store: "#15803d",
  seller: "#059669",
  partner: "#d97706",
  order: "#dc2626",
  pickup: "#7c3aed",
  delivery: "#0891b2",
};

function createIcon(color: string) {
  if (typeof window === "undefined") return undefined;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require("leaflet");
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

export function MapView({ center, zoom = 12, markers = [], height = "400px" }: MapViewProps) {
  const icons = useMemo(() => {
    const map: Partial<Record<MapMarker["type"], ReturnType<typeof createIcon>>> = {};
    (Object.keys(markerColors) as MapMarker["type"][]).forEach((type) => {
      map[type] = createIcon(markerColors[type]);
    });
    return map;
  }, []);

  return (
    <div style={{ height }} className="w-full overflow-hidden rounded-lg border">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <MapContainer center={[center.lat, center.lng]} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={icons[m.type]}>
            {m.popup && <Popup>{m.popup}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
