"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { MapView, type MapMarker } from "@/components/admin/map-view";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LiveMapPage() {
  const { data: partners } = useQuery({ queryKey: ["partners-map"], queryFn: () => repositories.partners.getAll({ pageSize: 100 }) });
  const { data: orders } = useQuery({ queryKey: ["active-orders"], queryFn: () => repositories.orders.getAll({ pageSize: 100 }) });
  const { data: cities } = useQuery({ queryKey: ["cities"], queryFn: () => repositories.dashboard.getCities() });

  const activeOrders = (orders?.data ?? []).filter((o) =>
    ["DELIVERY_ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY"].includes(o.status)
  );

  const markers: MapMarker[] = [
    ...(partners?.data ?? []).map((p) => ({
      id: p.id, lat: p.currentLat, lng: p.currentLng, label: p.name,
      type: "partner" as const,
      popup: <div><p className="font-semibold">{p.name}</p><Badge variant={p.isOnline ? "success" : "secondary"}>{p.isOnline ? "Online" : "Offline"}</Badge></div>,
    })),
    ...activeOrders.filter((o) => o.pickupLat).map((o) => ({
      id: `pickup-${o.id}`, lat: o.pickupLat!, lng: o.pickupLng!, label: o.id,
      type: "pickup" as const,
      popup: <p>Pickup: {o.storeName ?? o.sellerName}</p>,
    })),
    ...activeOrders.filter((o) => o.deliveryLat).map((o) => ({
      id: `delivery-${o.id}`, lat: o.deliveryLat!, lng: o.deliveryLng!, label: o.id,
      type: "delivery" as const,
      popup: <p>Delivery to {o.customerName}</p>,
    })),
  ];

  const center = cities?.[0] ? { lat: cities[0].lat, lng: cities[0].lng } : { lat: 30.901, lng: 75.8573 };

  return (
    <div>
      <Breadcrumbs items={[{ label: "Live Map" }]} />
      <h1 className="mb-4 text-2xl font-bold">Live Delivery Monitoring</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge>Online Partners: {(partners?.data ?? []).filter((p) => p.isOnline).length}</Badge>
        <Badge variant="secondary">Offline: {(partners?.data ?? []).filter((p) => !p.isOnline).length}</Badge>
        <Badge variant="outline">Active Deliveries: {activeOrders.length}</Badge>
      </div>
      <MapView center={center} zoom={11} markers={markers} height="600px" />
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Legend</CardTitle></CardHeader><CardContent className="space-y-1 text-xs">
          <p><span className="inline-block h-3 w-3 rounded-full bg-amber-500" /> Partners</p>
          <p><span className="inline-block h-3 w-3 rounded-full bg-violet-500" /> Pickup</p>
          <p><span className="inline-block h-3 w-3 rounded-full bg-cyan-500" /> Delivery</p>
        </CardContent></Card>
      </div>
    </div>
  );
}
